"""
Multilingual Translation Engine for North Eastern Region (SIH26002).
Provides comprehensive localizations for:
- English (en)
- Hindi (hi) - हिन्दी
- Nepali (ne) - नेपाली
- Bhutia / Sikkimese (dz) - ལྷོ་སྐད
- Lepcha (lep) - རོང་རིང
"""
from typing import Dict, Any

SUPPORTED_LANGUAGES = [
    {"code": "en", "name": "English", "nativeName": "English"},
    {"code": "hi", "name": "Hindi", "nativeName": "हिन्दी"},
    {"code": "ne", "name": "Nepali", "nativeName": "नेपाली"},
    {"code": "dz", "name": "Bhutia", "nativeName": "ལྷོ་སྐད"},
    {"code": "lep", "name": "Lepcha", "nativeName": "རོང་རིང"},
]

TRANSLATIONS: Dict[str, Dict[str, str]] = {
    "en": {
        # App & Nav
        "app_title": "NER Smart Logistics & Road Accessibility Intelligence Platform",
        "command_center": "Logistics Command Center",
        "road_intelligence": "Road Intelligence & Accessibility",
        "deliveries": "Deliveries & Routes",
        "fleet_goods": "Essential Goods & Fleet",
        "field_portal": "Field Officer Portal",
        "driver_hud": "Driver Companion HUD",
        "admin_verification": "Admin & Verification",
        "analytics": "Operational Analytics",
        "dashboard": "Operations",
        "notifications": "Notifications",
        "settings": "Settings",
        "simulation": "Simulation",
        "switch_role": "Switch Role",
        "select_language": "Language",

        # Roles
        "driver": "Driver",
        "coordinator": "Logistics Coordinator",
        "field_reporter": "Field Reporter",
        "authority_verifier": "Authority / Verifier",

        # Level 1: Emergency & Safety
        "road_blocked": "Road Blocked",
        "landslide": "Landslide",
        "flood": "Flood",
        "bridge_damage": "Bridge Damage",
        "medical_emergency": "Medical Emergency",
        "supply_shortage": "Supply Shortage",
        "report_incident": "Report Incident",
        "send_location": "Send GPS Location",
        "emergency": "Emergency",
        "proceed_with_caution": "Proceed with Caution",
        "detour": "Detour",
        "start_detour": "START DETOUR",
        "emergency_sos": "EMERGENCY SOS",
        "one_tap_actions": "1-Tap Driver Emergency Actions",
        "call_dispatch": "Call Dispatch (VHF/Phone)",

        # Level 2: Road Status
        "status_open": "OPEN",
        "status_monitor": "MONITOR",
        "status_at_risk": "AT RISK",
        "status_restricted": "RESTRICTED",
        "status_blocked": "BLOCKED",

        # Level 3: Operations
        "time_to_impact": "Time to Impact",
        "eta": "Estimated Arrival",
        "delay": "Delay Impact",
        "route": "Route",
        "alternate_route": "Alternate Route",
        "current_location": "Current Location",
        "affected_vehicles": "Affected Vehicles",
        "verify": "Verify",
        "reject": "Reject",
        "mark_conflict": "Mark Conflict",
        "under_verification": "Under Verification",
        "verified": "Verified",
        "unverified": "Unverified Incident",
        "destination_facility": "Destination Facility",
        "cargo": "Cargo",
        "remaining_distance": "Remaining Distance",
        "location": "Location",
        "updated_eta": "Updated ETA",
        "detour_active": "DETOUR ACTIVE",

        # Level 4: UI & Connectivity
        "connected": "Online",
        "offline": "Offline",
        "sync_pending": "reports pending sync",
        "last_sync": "Last Sync",
        "conn_good": "🟢 Online (High-Speed)",
        "conn_intermittent": "🟡 Intermittent Network",
        "conn_weak": "🟠 Very Weak Signal",
        "conn_offline": "🔴 Offline (Store & Forward)",
        "active_deliveries": "Active Deliveries",
        "critical_alerts": "Critical Alerts",
        "high_risk_corridors": "High-Risk Corridors",
        "disruption_probability": "Predicted Disruption Risk",
        "network_operational": "Network Operational",

        # Driver HUD specific
        "driver_route_affected": "⚠️ Road conditions changed ahead. High disruption probability detected.",
        "driver_view_alternate": "View Alternate Safe Route",
        "driver_accept_reroute": "Accept Alternate Route Detour",
        "driver_destination_eta": "Destination ETA"
    },

    "hi": {
        # App & Nav
        "app_title": "पूर्वोत्तर क्षेत्र स्मार्ट लॉजिस्टिक्स और सड़क पहुंच इंटेलिजेंस प्लेटफॉर्म",
        "command_center": "लॉजिस्टिक्स नियंत्रण केंद्र",
        "road_intelligence": "सड़क इंटेलिजेंस और पहुंच स्थिति",
        "deliveries": "सक्रिय डिलीवरी और मार्ग",
        "fleet_goods": "आवश्यक सामग्री और वाहन बेड़ा",
        "field_portal": "फील्ड अधिकारी पोर्टल",
        "driver_hud": "चालक साथी (HUD)",
        "admin_verification": "प्रशासक एवं सत्यापन",
        "analytics": "परिचालन विश्लेषण",
        "dashboard": "परिचालन",
        "notifications": "सूचनाएं",
        "settings": "सेटिंग्स",
        "simulation": "सिमुलेशन",
        "switch_role": "रोल बदलें",
        "select_language": "भाषा",

        # Roles
        "driver": "चालक",
        "coordinator": "लॉजिस्टिक्स समन्वयक",
        "field_reporter": "फील्ड रिपोर्टर",
        "authority_verifier": "प्रशासक / सत्यापनकर्ता",

        # Level 1: Emergency & Safety
        "road_blocked": "सड़क अवरुद्ध",
        "landslide": "भूस्खलन",
        "flood": "बाढ़ / जलभराव",
        "bridge_damage": "पुल क्षति",
        "medical_emergency": "चिकित्सा आपातकाल",
        "supply_shortage": "सामग्री की कमी",
        "report_incident": "घटना की सूचना दें",
        "send_location": "जीपीएस स्थान भेजें",
        "emergency": "आपातकाल",
        "proceed_with_caution": "सावधानी से आगे बढ़ें",
        "detour": "वैकल्पिक मार्ग",
        "start_detour": "वैकल्पिक मार्ग शुरू करें",
        "emergency_sos": "आपातकालीन SOS",
        "one_tap_actions": "1-टैप आपातकालीन टेलीमेट्री क्रियाएं",
        "call_dispatch": "कंट्रोल रूम कॉल करें (VHF/फोन)",

        # Level 2: Road Status
        "status_open": "खुला (सुरक्षित)",
        "status_monitor": "निगरानी आवश्यक",
        "status_at_risk": "जोखिम में",
        "status_restricted": "प्रतिबंधित",
        "status_blocked": "अवरुद्ध (बंद)",

        # Level 3: Operations
        "time_to_impact": "प्रभाव तक का समय",
        "eta": "अनुमानित आगमन समय (ETA)",
        "delay": "विलंब प्रभाव",
        "route": "मार्ग",
        "alternate_route": "वैकल्पिक मार्ग",
        "current_location": "वर्तमान स्थान",
        "affected_vehicles": "प्रभावित वाहन",
        "verify": "सत्यापित करें",
        "reject": "अस्वीकार करें",
        "mark_conflict": "विवाद चिह्नित करें",
        "under_verification": "सत्यापनाधीन",
        "verified": "सत्यापित",
        "unverified": "असत्यापित घटना",
        "destination_facility": "गंतव्य केंद्र",
        "cargo": "सामग्री",
        "remaining_distance": "शेष दूरी",
        "location": "स्थान",
        "updated_eta": "संशोधित ETA",
        "detour_active": "वैकल्पिक मार्ग सक्रिय",

        # Level 4: UI & Connectivity
        "connected": "ऑनलाइन",
        "offline": "ऑफलाइन",
        "sync_pending": "रिपोर्ट सिंक होने की प्रतीक्षा में",
        "last_sync": "अंतिम सिंक",
        "conn_good": "🟢 ऑनलाइन (पूर्ण कनेक्टिविटी)",
        "conn_intermittent": "🟡 रुक-रुक कर चलने वाला नेटवर्क",
        "conn_weak": "🟠 बहुत कमजोर सिग्नल",
        "conn_offline": "🔴 ऑफलाइन (लोकल स्टोर एवं फॉरवर्ड)",
        "active_deliveries": "सक्रिय डिलीवरी",
        "critical_alerts": "गंभीर चेतावनी",
        "high_risk_corridors": "उच्च जोखिम वाले गलियारे",
        "disruption_probability": "व्यवधान की अनुमानित संभावना",
        "network_operational": "नेटवर्क संचालन स्थिति",

        # Driver HUD specific
        "driver_route_affected": "⚠️ आगे सड़क की स्थिति बदल गई है। उच्च व्यवधान जोखिम।",
        "driver_view_alternate": "वैकल्पिक सुरक्षित मार्ग देखें",
        "driver_accept_reroute": "वैकल्पिक मार्ग स्वीकार करें",
        "driver_destination_eta": "गंतव्य आगमन समय (ETA)"
    },

    "ne": {
        # App & Nav
        "app_title": "उत्तर पूर्वी क्षेत्र स्मार्ट ढुवानी र सडक पहुँच बौद्धिक प्रणाली",
        "command_center": "ढुवानी नियन्त्रण कक्ष",
        "road_intelligence": "सडक अवस्था र जोखिम विश्लेषण",
        "deliveries": "सक्रिय डेलिभरी र मार्ग",
        "fleet_goods": "अत्यावश्यक सामग्री र सवारी साधन",
        "field_portal": "फिल्ड अधिकृत पोर्टल",
        "driver_hud": "चालक सहयोगी (HUD)",
        "admin_verification": "प्रशासक र प्रमाणिकरण",
        "analytics": "सञ्चालन तथ्याङ्क",
        "dashboard": "सञ्चालन",
        "notifications": "सूचनाहरू",
        "settings": "सेटिङहरू",
        "simulation": "सिमुलेशन",
        "switch_role": "भूमिका बदल्नुहोस्",
        "select_language": "भाषा",

        # Roles
        "driver": "चालक",
        "coordinator": "ढुवानी संयोजक",
        "field_reporter": "फिल्ड अधिकृत",
        "authority_verifier": "प्रशासक / प्रमाणिकर्ता",

        # Level 1: Emergency & Safety
        "road_blocked": "सडक बन्द",
        "landslide": "पहिरो",
        "flood": "बाढी / जलमग्न",
        "bridge_damage": "पुल क्षति",
        "medical_emergency": "आपतकालीन औषधि",
        "supply_shortage": "सामग्री अभाव",
        "report_incident": "घटना दर्ता गर्नुहोस्",
        "send_location": "GPS स्थान पठाउनुहोस्",
        "emergency": "आपतकालीन",
        "proceed_with_caution": "सावधानीपूर्वक अगाडि बढ्नुहोस्",
        "detour": "वैकल्पिक बाटो",
        "start_detour": "वैकल्पिक बाटो सुरु गर्नुहोस्",
        "emergency_sos": "आपतकालीन SOS",
        "one_tap_actions": "१-ट्याप आपतकालीन कार्यहरू",
        "call_dispatch": "कन्ट्रोल रुम सम्पर्क (VHF/फोन)",

        # Level 2: Road Status
        "status_open": "सञ्चालनमा (खुला)",
        "status_monitor": "निगरानी आवश्यक",
        "status_at_risk": "जोखिमपूर्ण",
        "status_restricted": "सीमित आवागमन",
        "status_blocked": "पूर्ण अवरुद्ध (बन्द)",

        # Level 3: Operations
        "time_to_impact": "प्रभाव पर्ने समय",
        "eta": "पुग्ने समय (ETA)",
        "delay": "ढिलाइ असर",
        "route": "बाटो",
        "alternate_route": "वैकल्पिक बाटो",
        "current_location": "हालको स्थान",
        "affected_vehicles": "प्रभावित सवारीहरू",
        "verify": "प्रमाणित गर्नुहोस्",
        "reject": "अस्वीकार गर्नुहोस्",
        "mark_conflict": "विवाद चिन्ह लगाउनुहोस्",
        "under_verification": "प्रमाणिकरणको क्रममा",
        "verified": "प्रमाणित",
        "unverified": "अप्रमाणित घटना",
        "destination_facility": "गन्तव्य केन्द्र",
        "cargo": "सामग्री",
        "remaining_distance": "बाँकी दूरी",
        "location": "स्थान",
        "updated_eta": "संशोधित ETA",
        "detour_active": "वैकल्पिक बाटो सक्रिय",

        # Level 4: UI & Connectivity
        "connected": "अनलाइन",
        "offline": "अफलाइन",
        "sync_pending": "रिपोर्ट सिंक हुन बाँकी",
        "last_sync": "अन्तिम सिंक",
        "conn_good": "🟢 अनलाइन",
        "conn_intermittent": "🟡 अस्थिर नेटवर्क",
        "conn_weak": "🟠 कमजोर सिग्नल",
        "conn_offline": "🔴 अफलाइन (पछि सिंक हुनेछ)",
        "active_deliveries": "चालु डेलिभरीहरू",
        "critical_alerts": "गम्भीर सूचनाहरू",
        "high_risk_corridors": "उच्च जोखिमयुक्त सडक खण्ड",
        "disruption_probability": "अवरोधको अनुमानित सम्भावना",
        "network_operational": "सडक सञ्जाल सञ्चालन",

        # Driver HUD specific
        "driver_route_affected": "⚠️ अगाडि बाटो बिग्रिएको छ। उच्च अवरोध जोखिम।",
        "driver_view_alternate": "वैकल्पिक सुरक्षित बाटो हेर्नुहोस्",
        "driver_accept_reroute": "वैकल्पिक बाटो रोज्नुहोस्",
        "driver_destination_eta": "पुग्ने समय (ETA)"
    },

    "dz": {
        # App & Nav (Bhutia / Sikkimese)
        "app_title": "བྱང་ཤར་ས་ཁུལ་གྱི་ལམ་སྟོན་དང་སྐྱེལ་འདྲེན་རིག་ནུས་མ་ལག",
        "command_center": "སྐྱེལ་འདྲེན་བཀོད་འདོམས་ལྟེ་གནས།",
        "road_intelligence": "ལམ་གྱི་ཉེན་ཁ་དང་གནས་བབ།",
        "deliveries": "སྐྱེལ་འདྲེན་ལས་དོན།",
        "fleet_goods": "མཁོ་ཆས་དང་སྣུམ་འཁོར།",
        "field_portal": "ས་གནས་ལས་བྱེད་སྒོ་འབྱེད།",
        "driver_hud": "ཁ་ལོ་པའི་ལམ་སྟོན།",
        "admin_verification": "བདག་སྐྱོང་དང་བདེན་དཔང་།",
        "analytics": "གནས་སྡུད་དབྱེ་ཞིབ།",
        "dashboard": "བཀོད་འདོམས།",
        "notifications": "བརྡ་ཐོ།",
        "settings": "སྒྲིག་བཀོད།",
        "simulation": "ཚོད་ལྟའི་ལམ་སྟོན།",
        "switch_role": "ལས་འགན་བརྗེ་བ།",
        "select_language": "སྐད་ཡིག",

        # Roles
        "driver": "ཁ་ལོ་པ།",
        "coordinator": "སྐྱེལ་འདྲེན་འབྲེལ་མཐུད་པ།",
        "field_reporter": "ས་གནས་སྙན་ཞུ་པ།",
        "authority_verifier": "བདག་སྐྱོང་ / བདེན་དཔང་པ།",

        # Level 1: Emergency & Safety
        "road_blocked": "ལམ་བཀག་པ།",
        "landslide": "ས་རུད།",
        "flood": "ཆུ་རུད།",
        "bridge_damage": "ཟམ་པ་ཉམས་ཆག",
        "medical_emergency": "སྨན་བཅོས་ཛ་དྲག",
        "supply_shortage": "མཁོ་ཆས་མ་ལྡང་བ།",
        "report_incident": "གནས་ཚུལ་སྙན་ཞུ།",
        "send_location": "ས་གནས་གཏོང་བ།",
        "emergency": "ཛ་དྲག",
        "proceed_with_caution": "ཉེན་ཟོན་གྱིས་འགྲོ་བ།",
        "detour": "ལམ་གཞན།",
        "start_detour": "ལམ་གཞན་འགོ་འཛུགས།",
        "emergency_sos": "ཛ་དྲག་རོགས་རམ།",
        "one_tap_actions": "ཛ་དྲག་བྱེད་སྒོ།",
        "call_dispatch": "བཀོད་འདོམས་ཁ་པར།",

        # Level 2: Road Status
        "status_open": "སྒོ་ཕྱེ། (བདེ་འཇགས)",
        "status_monitor": "ལྟ་རྟོག",
        "status_at_risk": "ཉེན་ཁ་ཅན།",
        "status_restricted": "དམ་བསྒྲགས།",
        "status_blocked": "ལམ་བཀག (འགྲོ་མི་རུང་)",

        # Level 3: Operations
        "time_to_impact": "ཉེན་ཁ་སླེབས་ཡུན།",
        "eta": "སླེབས་ཡུན། (ETA)",
        "delay": "འགྱངས་ཡུན།",
        "route": "ལམ།",
        "alternate_route": "ལམ་གཞན།",
        "current_location": "ད་ལྟའི་གནས་ས།",
        "affected_vehicles": "གནོད་ཕོག་སྣུམ་འཁོར།",
        "verify": "བདེན་དཔང་བྱེད་པ།",
        "reject": "ཕྱིར་འཐེན།",
        "mark_conflict": "རྩོད་རྟགས་རྒྱག་པ།",
        "under_verification": "བདེན་དཔང་བྱེད་བཞིན་པ།",
        "verified": "བདེན་དཔང་ཟིན་པ།",
        "unverified": "བདེན་དཔང་མ་བྱས་པ།",
        "destination_facility": "སླེབས་ཡུལ་ལྟེ་གནས།",
        "cargo": "དངོས་ཟོག",
        "remaining_distance": "ལྷག་ལུས་རྒྱང་ཐག",
        "location": "གནས་ས།",
        "updated_eta": "བཅོས་ཟིན་པའི་སླེབས་ཡུན།",
        "detour_active": "ལམ་གཞན་སྤྱོད་བཞིན་པ།",

        # Level 4: UI & Connectivity
        "connected": "དྲ་ཐོག",
        "offline": "དྲ་མེད།",
        "sync_pending": "སྙན་ཞུ་བསྡད་ཡོད།",
        "last_sync": "མཐའ་མའི་སྦྲེལ་མཐུད།",
        "conn_good": "🟢 དྲ་ཐོག",
        "conn_intermittent": "🟡 དྲ་རྒྱ་བརྟན་པོ་མེད་པ།",
        "conn_weak": "🟠 བརྡ་རྟགས་སྐྱོ་བ།",
        "conn_offline": "🔴 དྲ་མེད། (རྗེས་སུ་སྦྲེལ་རྒྱུ)",
        "active_deliveries": "སྐྱེལ་འདྲེན་བྱེད་བཞིན་པ།",
        "critical_alerts": "ཛ་དྲག་ཉེན་བརྡ།",
        "high_risk_corridors": "ཉེན་ཁ་ཆེ་བའི་ལམ་དུམ།",
        "disruption_probability": "ཆད་སྐྱོན་འབྱུང་ཉེན།",
        "network_operational": "ལམ་གྱི་འགྲོ་སྐྱོད་གནས་བབ།",

        # Driver HUD specific
        "driver_route_affected": "⚠️ མདུན་ཕྱོགས་ཀྱི་ལམ་ཉེན་ཁ་ཅན་དུ་གྱུར་འདུག",
        "driver_view_alternate": "ལམ་གཞན་བལྟ་བ།",
        "driver_accept_reroute": "ལམ་གཞན་གདམ་པ།",
        "driver_destination_eta": "སླེབས་ཡུན། (ETA)"
    },

    "lep": {
        # App & Nav (Lepcha / Róng)
        "app_title": "NER Smart Logistics & Lóng Hlap Sa Akyet Engine",
        "command_center": "Logistics Control Hub",
        "road_intelligence": "Lóng Akyet & Risk Monitor",
        "deliveries": "Active Deliveries",
        "fleet_goods": "Essential Goods & Fleet",
        "field_portal": "Field Officer Portal",
        "driver_hud": "Driver Companion HUD",
        "admin_verification": "Admin Verification",
        "analytics": "Operations Analytics",
        "dashboard": "Operations",
        "notifications": "Notifications",
        "settings": "Settings",
        "simulation": "Simulation",
        "switch_role": "Switch Role",
        "select_language": "Language",

        # Roles
        "driver": "Driver",
        "coordinator": "Logistics Coordinator",
        "field_reporter": "Field Reporter",
        "authority_verifier": "Authority / Verifier",

        # Level 1: Emergency & Safety
        "road_blocked": "Lóng Dam (Road Blocked)",
        "landslide": "Fá Ryak (Landslide)",
        "flood": "Ún Rung (Flood)",
        "bridge_damage": "Sám Dam (Bridge Damage)",
        "medical_emergency": "Menh Akyet (Medical SOS)",
        "supply_shortage": "Zon Kat (Supply Shortage)",
        "report_incident": "Report Field Incident",
        "send_location": "Send GPS Location",
        "emergency": "Akyet (Emergency)",
        "proceed_with_caution": "Proceed with Caution",
        "detour": "Alternative Route",
        "start_detour": "START DETOUR",
        "emergency_sos": "EMERGENCY SOS",
        "one_tap_actions": "1-Tap Emergency Actions",
        "call_dispatch": "Call Dispatch (VHF/Radio)",

        # Level 2: Road Status
        "status_open": "OPEN (Lóng Ring)",
        "status_monitor": "MONITOR",
        "status_at_risk": "AT RISK (Ryak)",
        "status_restricted": "RESTRICTED",
        "status_blocked": "BLOCKED (Lóng Dam)",

        # Level 3: Operations
        "time_to_impact": "Time to Impact",
        "eta": "Destination ETA",
        "delay": "Delay Impact",
        "route": "Route (Lóng)",
        "alternate_route": "Alternative Route",
        "current_location": "Current Location",
        "affected_vehicles": "Affected Vehicles",
        "verify": "Verify",
        "reject": "Reject",
        "mark_conflict": "Mark Conflict",
        "under_verification": "Under Verification",
        "verified": "Verified",
        "unverified": "Unverified Incident",
        "destination_facility": "Destination Facility",
        "cargo": "Cargo",
        "remaining_distance": "Remaining Distance",
        "location": "Location",
        "updated_eta": "Updated ETA",
        "detour_active": "DETOUR ACTIVE",

        # Level 4: UI & Connectivity
        "connected": "Online",
        "offline": "Offline",
        "sync_pending": "reports pending sync",
        "last_sync": "Last Sync",
        "conn_good": "🟢 Online",
        "conn_intermittent": "🟡 Intermittent",
        "conn_weak": "🟠 Weak Signal",
        "conn_offline": "🔴 Offline (Queued)",
        "active_deliveries": "Active Deliveries",
        "critical_alerts": "Critical Alerts",
        "high_risk_corridors": "High-Risk Corridors",
        "disruption_probability": "Predicted Disruption Risk",
        "network_operational": "Network Health",

        # Driver HUD specific
        "driver_route_affected": "⚠️ Lóng akyet ahead. Alternative path recommended.",
        "driver_view_alternate": "View Alternative Route",
        "driver_accept_reroute": "Accept Alternate Route",
        "driver_destination_eta": "Destination ETA"
    }
}

def get_translations(lang: str = "en") -> Dict[str, str]:
    return TRANSLATIONS.get(lang, TRANSLATIONS["en"])

def get_supported_languages():
    return SUPPORTED_LANGUAGES
