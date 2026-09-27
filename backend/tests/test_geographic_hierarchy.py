"""
Unit tests for NER-Wide Geographic Hierarchy Architecture.
SIH26002 | MDoNER | INNOVEXA
"""
import unittest
import sys
import os

# Ensure backend directory is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.gis.geographic_hierarchy import (
    get_ner_hierarchy,
    get_state,
    get_district,
    get_corridor,
    get_segments_by_filter,
    get_all_ner_segments
)
from app.api.endpoints import (
    get_geographic_hierarchy,
    get_all_states,
    get_state_details,
    get_district_details,
    get_corridor_details,
    get_segments
)

class TestGeographicHierarchy(unittest.TestCase):
    def setUp(self):
        self.hierarchy = get_ner_hierarchy()

    def test_all_8_ner_states_present(self):
        state_ids = [s["id"] for s in self.hierarchy]
        expected_states = [
            "sikkim",
            "arunachal_pradesh",
            "assam",
            "manipur",
            "meghalaya",
            "mizoram",
            "nagaland",
            "tripura"
        ]
        self.assertEqual(len(state_ids), 8)
        for expected in expected_states:
            self.assertIn(expected, state_ids, f"State {expected} must be present in NER hierarchy")

    def test_coverage_type_classifications(self):
        sikkim = get_state("sikkim")
        self.assertIsNotNone(sikkim)
        self.assertEqual(sikkim["coverage_type"], "ACTIVE_PILOT")
        self.assertTrue(sikkim["is_prototype_pilot"])

        other_states = ["arunachal_pradesh", "assam", "manipur", "meghalaya", "mizoram", "nagaland", "tripura"]
        for st_id in other_states:
            st = get_state(st_id)
            self.assertIsNotNone(st, f"State {st_id} must exist")
            self.assertEqual(st["coverage_type"], "REPRESENTATIVE_PROTOTYPE")
            self.assertFalse(st["is_prototype_pilot"])

    def test_representative_districts_per_state(self):
        expected_districts = {
            "sikkim": ["gangtok", "mangan"],
            "arunachal_pradesh": ["tawang", "west_kameng"],
            "assam": ["dima_hasao", "karbi_anglong"],
            "manipur": ["senapati", "kangpokpi"],
            "meghalaya": ["east_khasi_hills", "ri_bhoi"],
            "mizoram": ["aizawl", "lunglei"],
            "nagaland": ["kohima", "peren"],
            "tripura": ["dhalai", "unakoti"]
        }
        for st_id, dist_list in expected_districts.items():
            st = get_state(st_id)
            actual_dist_ids = [d["id"] for d in st["districts"]]
            for expected_dist in dist_list:
                self.assertIn(expected_dist, actual_dist_ids, f"District {expected_dist} missing in state {st_id}")

    def test_road_segment_schema_compliance(self):
        required_fields = [
            "segment_id", "name", "corridor", "corridor_id", "district_id", "state_id",
            "length_km", "road_type", "avg_slope_deg", "elevation_m", "gsi_susceptibility",
            "historical_disruption_count", "coordinates", "current_rain_24h_mm",
            "disruption_probability", "accessibility_status", "coverage_type", "data_status"
        ]
        for st in self.hierarchy:
            for dist in st["districts"]:
                for corr in dist["corridors"]:
                    self.assertGreater(len(corr["road_segments"]), 0, f"Corridor {corr['id']} must have segments")
                    for seg in corr["road_segments"]:
                        for field in required_fields:
                            self.assertIn(field, seg, f"Segment {seg.get('segment_id')} missing required field: {field}")
                        self.assertIsInstance(seg["coordinates"], list)
                        self.assertGreaterEqual(len(seg["coordinates"]), 2)

    def test_api_geo_hierarchy_function(self):
        res = get_geographic_hierarchy()
        self.assertTrue(res["success"])
        self.assertEqual(res["total_states"], 8)
        self.assertEqual(len(res["hierarchy"]), 8)

    def test_api_geo_states_list_function(self):
        res = get_all_states()
        self.assertTrue(res["success"])
        self.assertEqual(len(res["states"]), 8)

    def test_api_geo_state_and_district_lookup_functions(self):
        res_state = get_state_details("arunachal_pradesh")
        self.assertTrue(res_state["success"])
        self.assertEqual(res_state["state"]["name"], "Arunachal Pradesh")

        res_dist = get_district_details("tawang")
        self.assertTrue(res_dist["success"])
        self.assertEqual(res_dist["district"]["name"], "Tawang")

        res_corr = get_corridor_details("ar_bomdila_tawang")
        self.assertTrue(res_corr["success"])
        self.assertEqual(res_corr["corridor"]["id"], "ar_bomdila_tawang")

    def test_api_network_segments_filtering_function(self):
        # Default returns active pilot segments
        res_default = get_segments()
        self.assertTrue(res_default["success"])
        self.assertGreater(res_default["count"], 0)

        # Filter by state
        res_ar = get_segments(state_id="arunachal_pradesh")
        self.assertTrue(res_ar["success"])
        self.assertGreater(res_ar["count"], 0)
        for seg in res_ar["segments"]:
            self.assertEqual(seg["state_id"], "arunachal_pradesh")

        # Filter by corridor
        res_corr = get_segments(corridor_id="ar_bomdila_tawang")
        self.assertTrue(res_corr["success"])
        self.assertGreater(res_corr["count"], 0)
        for seg in res_corr["segments"]:
            self.assertEqual(seg["corridor_id"], "ar_bomdila_tawang")

if __name__ == "__main__":
    unittest.main()
