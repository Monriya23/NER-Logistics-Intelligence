import urllib.request
import json
import urllib.parse

queries = [
    ("Arunachal", "Sela Pass road"),
    ("Assam", "Haflong Assam road"),
    ("Manipur", "National Highway Manipur"),
    ("Meghalaya", "Shillong road highway"),
    ("Mizoram", "Aizawl Mizoram road"),
    ("Nagaland", "Kohima Nagaland road"),
    ("Sikkim", "North Sikkim road"),
    ("Tripura", "Tripura highway"),
    ("Field", "landslide road mountain"),
    ("Bridge", "bailey bridge mountain")
]

for tag, q in queries:
    params = {
        "action": "query",
        "generator": "search",
        "gsrsearch": q,
        "gsrnamespace": "6",  # File namespace
        "gsrlimit": "3",
        "prop": "imageinfo",
        "iiprop": "url|size",
        "iiurlwidth": "800",
        "format": "json"
    }
    url = f"https://commons.wikimedia.org/w/api.php?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": "NERLogisticsApp/1.0 (contact@innovexa.in)"})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())
            pages = data.get("query", {}).get("pages", {})
            print(f"=== {tag} ({q}) ===")
            for pid, pdata in pages.items():
                title = pdata.get("title")
                info = pdata.get("imageinfo", [{}])[0]
                thumb = info.get("thumburl") or info.get("url")
                print(f"  {title} => {thumb}")
    except Exception as e:
        print(f"ERR {tag}: {e}")
