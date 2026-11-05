import sys
import urllib.request
import urllib.error

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4174"
paths = ["/", "/blog", "/robots.txt", "/sitemap.xml", "/esto-no-existe", "/blog/esto-no-existe",
         "/#agendar"]
for p in paths:
    url = BASE + p
    try:
        req = urllib.request.Request(url, method="GET", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=20) as r:
            body = r.read(400000)
            print(f"{p:26} {r.status}  len={len(body)}  ct={r.headers.get('Content-Type')}")
            if p in ("/", "/blog"):
                text = body.decode("utf-8", "replace")
                for probe in ['<link rel="canonical"', 'rel="canonical"', 'og:title', 'name="description"',
                              'application/ld+json', 'name="robots"', 'fetchpriority']:
                    print(f"    {'YES' if probe in text else 'no ':4} {probe}")
    except urllib.error.HTTPError as e:
        print(f"{p:26} {e.code}  HTTPError")
    except Exception as e:
        print(f"{p:26} ERR {type(e).__name__}: {e}")
