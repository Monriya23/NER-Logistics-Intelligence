"""
Essential Goods Inventory & Logistics Layer.
Tracks critical commodities: Medicines, Food, Agricultural Produce, Construction Materials, and Disaster Supplies.
"""
from typing import List, Dict, Any, Optional

INVENTORY_ITEMS: List[Dict[str, Any]] = [
    # --- Essential Medicines ---
    {
        "item_id": "MED-001",
        "name": "Polyvalent Snake Anti-Venom Serum (Lyophilized)",
        "category": "ESSENTIAL_MEDICINES",
        "stock_quantity": 240,
        "unit": "Vials",
        "storage_location_node": "Gangtok_Central",
        "urgency_tier": "CRITICAL",
        "min_required_threshold": 50,
        "cold_chain_required": True,
        "last_verified_source": "State Central Medical Depot STNM"
    },
    {
        "item_id": "MED-002",
        "name": "Human Insulin 100 IU/ml (Cold Chain Storage)",
        "category": "ESSENTIAL_MEDICINES",
        "stock_quantity": 480,
        "unit": "Vials",
        "storage_location_node": "Gangtok_Central",
        "urgency_tier": "HIGH",
        "min_required_threshold": 100,
        "cold_chain_required": True,
        "last_verified_source": "State Central Medical Depot STNM"
    },
    {
        "item_id": "MED-003",
        "name": "Mountain Trauma & Emergency Resuscitation Kits",
        "category": "ESSENTIAL_MEDICINES",
        "stock_quantity": 85,
        "unit": "Kits",
        "storage_location_node": "Mangan_HQ",
        "urgency_tier": "CRITICAL",
        "min_required_threshold": 20,
        "cold_chain_required": False,
        "last_verified_source": "Mangan District Hospital Pharmacy"
    },
    {
        "item_id": "MED-004",
        "name": "Intravenous Normal Saline (0.9% NaCl 500ml)",
        "category": "ESSENTIAL_MEDICINES",
        "stock_quantity": 1200,
        "unit": "Bottles",
        "storage_location_node": "Singtam",
        "urgency_tier": "MEDIUM",
        "min_required_threshold": 300,
        "cold_chain_required": False,
        "last_verified_source": "Singtam Sub-Divisional Supply Point"
    },

    # --- Food Supplies ---
    {
        "item_id": "FOOD-001",
        "name": "Fortified Mountain Ration Rice (50kg Moisture-Proof Bags)",
        "category": "FOOD_SUPPLIES",
        "stock_quantity": 650,
        "unit": "Bags (32.5 Tons)",
        "storage_location_node": "Tadong",
        "urgency_tier": "HIGH",
        "min_required_threshold": 150,
        "cold_chain_required": False,
        "last_verified_source": "Food Corporation of India (FCI) Tadong Hub"
    },
    {
        "item_id": "FOOD-002",
        "name": "High-Protein Ready-to-Eat Emergency Nutritional Kits",
        "category": "FOOD_SUPPLIES",
        "stock_quantity": 950,
        "unit": "Packs",
        "storage_location_node": "Gangtok_Central",
        "urgency_tier": "CRITICAL",
        "min_required_threshold": 200,
        "cold_chain_required": False,
        "last_verified_source": "SSDMA Emergency Reserve Warehouse"
    },

    # --- Construction & Road Repair ---
    {
        "item_id": "CONST-001",
        "name": "Hydro-Resistant Rapid Setting Cement (PPC Grade)",
        "category": "CONSTRUCTION_MATERIALS",
        "stock_quantity": 400,
        "unit": "Bags",
        "storage_location_node": "Singtam",
        "urgency_tier": "MEDIUM",
        "min_required_threshold": 80,
        "cold_chain_required": False,
        "last_verified_source": "BRO Maintenance Yard Singtam"
    },
    {
        "item_id": "CONST-002",
        "name": "Geotextile Gabion Wire Mesh & Anchors",
        "category": "CONSTRUCTION_MATERIALS",
        "stock_quantity": 160,
        "unit": "Rolls",
        "storage_location_node": "Dikchu",
        "urgency_tier": "HIGH",
        "min_required_threshold": 30,
        "cold_chain_required": False,
        "last_verified_source": "Sikkim Roads & Bridges Dikchu Depot"
    },

    # --- Agricultural Produce ---
    {
        "item_id": "AGRI-001",
        "name": "Organic Large Cardamom (Dzongu Export Grade)",
        "category": "AGRICULTURAL_PRODUCE",
        "stock_quantity": 85,
        "unit": "Quintals",
        "storage_location_node": "Mangan_HQ",
        "urgency_tier": "LOW",
        "min_required_threshold": 10,
        "cold_chain_required": False,
        "last_verified_source": "Sikkim State Organic Farmers Cooperative"
    }
]

def get_all_inventory() -> List[Dict[str, Any]]:
    return INVENTORY_ITEMS

def get_inventory_item(item_id: str) -> Optional[Dict[str, Any]]:
    for item in INVENTORY_ITEMS:
        if item["item_id"] == item_id:
            return item
    return None
