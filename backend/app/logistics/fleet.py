"""
Fleet Management & Vehicle Suitability Matching Module.
Supports 4x4 Mountain Ambulances, Heavy Logistics 6x6 Haulers, Light Commercial Vehicles, and Emergency Utility Drones.
"""
from typing import List, Dict, Any, Optional

FLEET_VEHICLES: List[Dict[str, Any]] = [
    {
        "vehicle_id": "VEH-AMB-01",
        "vehicle_type": "4x4_MOUNTAIN_AMBULANCE",
        "name": "Force Gurkha 4x4 Advanced Life Support Ambulance",
        "registration_no": "SK-01-E-4421",
        "capacity_kg": 750.0,
        "is_4wd": True,
        "current_location_node": "Gangtok_Central",
        "status": "AVAILABLE",
        "driver_name": "Tenzing Norbu Lepcha",
        "driver_contact": "+91 98320 44122",
        "equipped_with": ["Cold-Chain Refrigerator", "Oxygen Concentrator", "High-Torque Winch", "SAT-GPS Transceiver"],
        "max_gradient_deg": 45.0,
        "suitable_categories": ["ESSENTIAL_MEDICINES", "DISASTER_RELIEF"]
    },
    {
        "vehicle_id": "VEH-LCV-02",
        "vehicle_type": "LIGHT_COMMERCIAL_VEHICLE_4WD",
        "name": "Mahindra Bolero Maxi Truck HD 4WD",
        "registration_no": "SK-03-L-8890",
        "capacity_kg": 1500.0,
        "is_4wd": True,
        "current_location_node": "Gangtok_Central",
        "status": "AVAILABLE",
        "driver_name": "Rajesh Kumar Rai",
        "driver_contact": "+91 97341 55678",
        "equipped_with": ["Waterproof Tarpaulin", "GPS Tracker", "Traction Chains"],
        "max_gradient_deg": 38.0,
        "suitable_categories": ["ESSENTIAL_MEDICINES", "FOOD_SUPPLIES", "AGRICULTURAL_PRODUCE", "CONSTRUCTION_MATERIALS"]
    },
    {
        "vehicle_id": "VEH-HVY-03",
        "vehicle_type": "HEAVY_6x6_LOGISTICS_TRUCK",
        "name": "Ashok Leyland Stallion 6x6 High-Capacity Hauler",
        "registration_no": "SK-04-H-1102",
        "capacity_kg": 7500.0,
        "is_4wd": True,
        "current_location_node": "Singtam",
        "status": "AVAILABLE",
        "driver_name": "Bikash Gurung",
        "driver_contact": "+91 98002 11984",
        "equipped_with": ["Heavy Winch", "Auxiliary Fuel Tank", "Dual Differential Locks"],
        "max_gradient_deg": 32.0,
        "suitable_categories": ["FOOD_SUPPLIES", "CONSTRUCTION_MATERIALS"]
    },
    {
        "vehicle_id": "VEH-DRN-04",
        "vehicle_type": "EMERGENCY_MEDICAL_DRONE",
        "name": "NER-SkyLifter VTOL Autonomous Cargo Drone",
        "registration_no": "UIN-SKM-DRN-09",
        "capacity_kg": 15.0,
        "is_4wd": False,
        "current_location_node": "Burtuk",
        "status": "STANDBY",
        "driver_name": "Drone Pilot: Sonam Bhutia",
        "driver_contact": "+91 94340 99812",
        "equipped_with": ["Thermo-Insulated Biological Pod", "Fail-Safe Parachute", "Satellite Link"],
        "max_gradient_deg": 90.0,
        "suitable_categories": ["ESSENTIAL_MEDICINES"]
    }
]

def get_all_fleet() -> List[Dict[str, Any]]:
    return FLEET_VEHICLES

def match_vehicle_for_delivery(
    category: str,
    weight_kg: float,
    origin_node: str,
    destination_node: str,
    is_emergency: bool = True
) -> Dict[str, Any]:
    """Intelligently matches the best available vehicle based on terrain, cargo, and readiness."""
    available_vehicles = [v for v in FLEET_VEHICLES if v["status"] in ["AVAILABLE", "STANDBY"]]
    
    # Priority matching
    best_vehicle = None
    selection_rationale = ""

    # Emergency Medicine to remote mountain destination (e.g. Chungthang PHC)
    if is_emergency and category == "ESSENTIAL_MEDICINES":
        # Check if high-clearance 4x4 ambulance is available at origin
        amb = next((v for v in available_vehicles if v["vehicle_type"] == "4x4_MOUNTAIN_AMBULANCE" and v["current_location_node"] == origin_node), None)
        if amb:
            best_vehicle = amb
            selection_rationale = (
                f"Selected {amb['name']} (4WD, ALS equipped) at {origin_node}. "
                f"Equipped with cold-chain storage and high-gradient mountain navigation capability."
            )
        else:
            # Fallback to 4WD LCV
            lcv = next((v for v in available_vehicles if v["is_4wd"] and v["capacity_kg"] >= weight_kg), None)
            if lcv:
                best_vehicle = lcv
                selection_rationale = f"Matched {lcv['name']} based on 4WD all-terrain suitability."
    elif weight_kg > 2000.0:
        hvy = next((v for v in available_vehicles if v["capacity_kg"] >= weight_kg), None)
        if hvy:
            best_vehicle = hvy
            selection_rationale = f"Matched heavy hauler {hvy['name']} for payload of {weight_kg} kg."
    else:
        lcv = next((v for v in available_vehicles if v["capacity_kg"] >= weight_kg), None)
        if lcv:
            best_vehicle = lcv
            selection_rationale = f"Matched versatile commercial carrier {lcv['name']}."

    if not best_vehicle and available_vehicles:
        best_vehicle = available_vehicles[0]
        selection_rationale = f"Assigned available fleet asset: {best_vehicle['name']}."

    return {
        "matched": best_vehicle is not None,
        "vehicle": best_vehicle,
        "selection_rationale": selection_rationale
    }
