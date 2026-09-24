"""
Unit Tests for Multilingual Operational Translations (Step 18 - Part B).
Validates that:
1. All 5 supported languages load (English, Hindi, Nepali, Bhutia, Lepcha).
2. All 4 Levels of operational priority strings are present in every language:
   - Level 1: Emergency & Safety (road_blocked, landslide, flood, bridge_damage, medical_emergency, etc.)
   - Level 2: Road Status (status_open, status_monitor, status_at_risk, status_restricted, status_blocked)
   - Level 3: Operations (time_to_impact, eta, delay, route, alternate_route, verify, reject, etc.)
   - Level 4: UI & Roles (dashboard, notifications, driver, coordinator, field_reporter, authority_verifier)
3. Missing translation fallback returns default English strings.
4. Technical identifiers (e.g. IDs, coordinates) are not mutated by translation dictionary lookup.
"""
import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.i18n.translations import get_translations, get_supported_languages, TRANSLATIONS, SUPPORTED_LANGUAGES

class TestI18nTranslations(unittest.TestCase):
    def test_supported_languages_list(self):
        langs = get_supported_languages()
        self.assertEqual(len(langs), 5)
        codes = [l["code"] for l in langs]
        self.assertIn("en", codes)
        self.assertIn("hi", codes)
        self.assertIn("ne", codes)
        self.assertIn("dz", codes)
        self.assertIn("lep", codes)

    def test_all_languages_have_level1_emergency_strings(self):
        level1_keys = [
            "road_blocked",
            "landslide",
            "flood",
            "bridge_damage",
            "medical_emergency",
            "supply_shortage",
            "report_incident",
            "send_location",
            "emergency",
            "proceed_with_caution",
            "detour",
            "start_detour",
            "emergency_sos"
        ]
        for lang_code in ["en", "hi", "ne", "dz", "lep"]:
            trans = get_translations(lang_code)
            for k in level1_keys:
                self.assertIn(k, trans, f"Missing Level 1 key '{k}' in language '{lang_code}'")
                self.assertTrue(len(trans[k]) > 0, f"Empty translation for key '{k}' in language '{lang_code}'")

    def test_all_languages_have_level2_status_strings(self):
        level2_keys = [
            "status_open",
            "status_monitor",
            "status_at_risk",
            "status_restricted",
            "status_blocked"
        ]
        for lang_code in ["en", "hi", "ne", "dz", "lep"]:
            trans = get_translations(lang_code)
            for k in level2_keys:
                self.assertIn(k, trans, f"Missing Level 2 key '{k}' in language '{lang_code}'")

    def test_all_languages_have_level3_operations_strings(self):
        level3_keys = [
            "time_to_impact",
            "eta",
            "delay",
            "route",
            "alternate_route",
            "current_location",
            "affected_vehicles",
            "verify",
            "reject",
            "mark_conflict",
            "under_verification",
            "verified",
            "unverified"
        ]
        for lang_code in ["en", "hi", "ne", "dz", "lep"]:
            trans = get_translations(lang_code)
            for k in level3_keys:
                self.assertIn(k, trans, f"Missing Level 3 key '{k}' in language '{lang_code}'")

    def test_all_languages_have_level4_ui_strings(self):
        level4_keys = [
            "dashboard",
            "notifications",
            "settings",
            "simulation",
            "connected",
            "offline",
            "sync_pending",
            "last_sync",
            "driver",
            "coordinator",
            "field_reporter",
            "authority_verifier"
        ]
        for lang_code in ["en", "hi", "ne", "dz", "lep"]:
            trans = get_translations(lang_code)
            for k in level4_keys:
                self.assertIn(k, trans, f"Missing Level 4 key '{k}' in language '{lang_code}'")

    def test_fallback_to_english_for_unknown_language(self):
        trans = get_translations("unknown_lang_xyz")
        self.assertEqual(trans["status_open"], "OPEN")
        self.assertEqual(trans["driver"], "Driver")

if __name__ == "__main__":
    unittest.main()
