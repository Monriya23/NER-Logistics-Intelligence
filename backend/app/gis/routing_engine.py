"""
Risk-Aware Routing Engine for Mountain Logistics.
Implements Dijkstra/A* path optimization using:
Cost(e) = TravelTime(e) * (1 + lambda * RiskScore(e)^2) + BlockedPenalty(e)
Provides side-by-side route trade-off analysis (Route A vs Route B).
"""
from typing import List, Dict, Any, Tuple, Optional
import networkx as nx
from .road_network import network_graph

class RoutingEngine:
    def __init__(self, risk_lambda: float = 3.5):
        self.risk_lambda = risk_lambda

    def calculate_edge_weight(self, u: str, v: str, edge_data: dict, risk_aware: bool = True) -> float:
        base_time = edge_data.get("base_travel_time_hrs", 1.0)
        risk = edge_data.get("risk_score", 0.0)
        status = edge_data.get("accessibility_status", "OPEN")
        
        # If physically blocked, apply massive penalty
        if status == "BLOCKED":
            return base_time + 999.0
            
        if not risk_aware:
            # Baseline fastest route without risk penalty
            if status == "RESTRICTED":
                return base_time * 1.5
            return base_time
            
        # Risk-aware cost formula: BaseTime * (1 + lambda * Risk^2)
        risk_multiplier = 1.0 + self.risk_lambda * (risk ** 2)
        
        # Additional operational status weighting
        if status == "RESTRICTED":
            status_penalty = 1.8
        elif status == "AT RISK":
            status_penalty = 1.3
        else:
            status_penalty = 1.0
            
        return base_time * risk_multiplier * status_penalty

    def find_route(self, origin_node: str, destination_node: str, risk_aware: bool = True) -> Optional[Dict[str, Any]]:
        g = network_graph.graph
        if origin_node not in g or destination_node not in g:
            return None

        # Build custom weight function
        weight_func = lambda u, v, d: self.calculate_edge_weight(u, v, d, risk_aware=risk_aware)

        try:
            path_nodes = nx.shortest_path(g, source=origin_node, target=destination_node, weight=weight_func)
        except nx.NetworkXNoPath:
            return None

        # Aggregate path metrics
        total_distance_km = 0.0
        total_travel_time_hrs = 0.0
        risk_scores = []
        segments_traversed = []
        is_blocked = False
        restricted_segments_count = 0
        all_coordinates = []

        for i in range(len(path_nodes) - 1):
            u = path_nodes[i]
            v = path_nodes[i+1]
            edge = g[u][v]
            seg = edge.get("segment_data", {})
            seg_id = seg.get("segment_id", f"{u}-{v}")
            
            total_distance_km += seg.get("length_km", 0.0)
            base_time = seg.get("length_km", 1.0) / max(seg.get("speed_limit_kmh", 30.0), 10.0)
            
            # Adjust estimated time if segment is degraded
            seg_risk = seg.get("risk_score", 0.0)
            seg_status = seg.get("accessibility_status", "OPEN")
            
            if seg_status == "BLOCKED":
                is_blocked = True
                base_time += 5.0 # Major delay if forced to cross
            elif seg_status == "RESTRICTED":
                restricted_segments_count += 1
                base_time *= 1.6
            elif seg_status == "AT RISK":
                base_time *= 1.25

            total_travel_time_hrs += base_time
            risk_scores.append(seg_risk)
            segments_traversed.append(seg)
            
            # Concatenate coordinates
            coords = seg.get("coordinates", [])
            if coords:
                # Handle directionality
                if all_coordinates and all_coordinates[-1] == coords[-1]:
                    all_coordinates.extend(reversed(coords[:-1]))
                else:
                    all_coordinates.extend(coords)

        avg_risk = sum(risk_scores) / max(len(risk_scores), 1)
        max_risk = max(risk_scores) if risk_scores else 0.0

        hours = int(total_travel_time_hrs)
        minutes = int((total_travel_time_hrs - hours) * 60)
        formatted_eta = f"{hours}h {minutes:02d}m" if hours > 0 else f"{minutes}m"

        return {
            "origin": origin_node,
            "destination": destination_node,
            "path_nodes": path_nodes,
            "total_distance_km": round(total_distance_km, 1),
            "estimated_time_hours": round(total_travel_time_hrs, 2),
            "formatted_eta": formatted_eta,
            "average_risk_score": round(avg_risk, 3),
            "max_risk_score": round(max_risk, 3),
            "is_blocked": is_blocked,
            "restricted_segments_count": restricted_segments_count,
            "segments": segments_traversed,
            "route_coordinates": all_coordinates,
            "mode": "RISK_AWARE" if risk_aware else "SHORTEST_FASTEST"
        }

    def compare_routes(self, origin_node: str, destination_node: str) -> Dict[str, Any]:
        """Calculates Primary (Standard/Fastest) vs Recommended (Risk-Aware) routes."""
        primary_route = self.find_route(origin_node, destination_node, risk_aware=False)
        safe_route = self.find_route(origin_node, destination_node, risk_aware=True)

        if not primary_route or not safe_route:
            return {
                "success": False,
                "error": "No viable path between specified facilities."
            }

        # Determine recommendation logic
        trade_off_analysis = ""
        recommended_route = "ROUTE_A"

        if primary_route["is_blocked"] and not safe_route["is_blocked"]:
            recommended_route = "ROUTE_B"
            trade_off_analysis = (
                f"Route A is compromised by BLOCKED segment ({primary_route['segments'][-1]['name']}). "
                f"Route B detour adds +{round(safe_route['total_distance_km'] - primary_route['total_distance_km'], 1)} km "
                f"but guarantees operational safety and passes through active monitored bypasses."
            )
        elif safe_route["average_risk_score"] < primary_route["average_risk_score"] - 0.15:
            recommended_route = "ROUTE_B"
            delay_mins = int((safe_route["estimated_time_hours"] - primary_route["estimated_time_hours"]) * 60)
            trade_off_analysis = (
                f"Route B is recommended: Reduces corridor disruption probability from "
                f"{int(primary_route['average_risk_score']*100)}% down to {int(safe_route['average_risk_score']*100)}%. "
                f"Trade-off: +{max(delay_mins, 0)} min travel time."
            )
        else:
            recommended_route = "ROUTE_A"
            trade_off_analysis = "Route A is clear and maintains optimal transit time."

        return {
            "success": True,
            "origin": origin_node,
            "destination": destination_node,
            "route_a_primary": primary_route,
            "route_b_safe": safe_route,
            "recommended_choice": recommended_route,
            "recommendation_rationale": trade_off_analysis,
            "time_delta_minutes": int((safe_route["estimated_time_hours"] - primary_route["estimated_time_hours"]) * 60),
            "distance_delta_km": round(safe_route["total_distance_km"] - primary_route["total_distance_km"], 1),
            "risk_reduction_pct": round((primary_route["average_risk_score"] - safe_route["average_risk_score"]) * 100, 1)
        }

routing_engine = RoutingEngine()
