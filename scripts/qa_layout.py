import sys
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4174"
fails = 0
total = 0

JS = """() => {
  const doc = document.documentElement;
  const vw = doc.clientWidth;
  const over = [];
  document.querySelectorAll('body *').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && (r.right > vw + 2 || r.left < -2)) {
      let scroll = false;
      let n = el.parentElement;
      while (n && n !== document.body) {
        const ox = getComputedStyle(n).overflowX;
        if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') { scroll = true; break; }
        n = n.parentElement;
      }
      if (!scroll) {
        const cls = typeof el.className === 'string' ? el.className.split(' ')[0] : '';
        over.push(el.tagName.toLowerCase() + (cls ? '.' + cls : ''));
      }
    }
  });
  const vis = sel => {
    const e = document.querySelector(sel);
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return {w: Math.round(r.width), h: Math.round(r.height)};
  };
  const root = document.getElementById('root');
  const broken = [...document.querySelectorAll('img')]
    .filter(i => i.complete && i.naturalWidth === 0)
    .map(i => i.getAttribute('src')).slice(0, 5);
  return {
    scrollW: doc.scrollWidth,
    clientW: doc.clientWidth,
    overflow: [...new Set(over)].slice(0, 8),
    rootChars: root.innerText.trim().length,
    h1: document.querySelector('h1') ? document.querySelector('h1').innerText.slice(0, 60) : null,
    sections: document.querySelectorAll('section').length,
    header: vis('header.navbar'),
    broken,
  };
}"""


def add(label, ok, detail=""):
    global fails, total
    total += 1
    if not ok:
        fails += 1
    tag = "PASS" if ok else "FAIL"
    print(f"  [{tag}] {label}" + (f" :: {detail}" if detail else ""))


def check(page, label, route, min_sections=4):
    try:
        page.goto(BASE + route, wait_until="domcontentloaded", timeout=30000)
    except Exception as exc:
        print(f"\n== {label} ==\n  [WARN] goto: {type(exc).__name__}")
    page.wait_for_timeout(1200)
    r = page.evaluate(JS)
    print(f"\n== {label} ==")
    add("sin scroll horizontal", r["scrollW"] <= r["clientW"] + 1,
        f"scrollW={r['scrollW']} clientW={r['clientW']}")
    add("sin elementos fuera de viewport", not r["overflow"], str(r["overflow"]))
    add("root con contenido", r["rootChars"] > 500, f"{r['rootChars']} chars")
    add("h1 presente", bool(r["h1"]), str(r["h1"]))
    add(f"secciones >= {min_sections}", r["sections"] >= min_sections, str(r["sections"]))
    add("navbar con tamano", bool(r["header"]) and r["header"]["h"] > 40, str(r["header"]))
    add("sin imagenes rotas", not r["broken"], str(r["broken"]))


with sync_playwright() as p:
    browser = p.chromium.launch()
    for w, h, tag, mobile in [(1440, 900, "desktop", False), (390, 844, "mobile", True)]:
        ctx = browser.new_context(viewport={"width": w, "height": h}, is_mobile=mobile, has_touch=mobile)
        page = ctx.new_page()
        check(page, f"{tag} home", "/")
        check(page, f"{tag} blog", "/blog", min_sections=2)
        ctx.close()

    print("\n== blog structure (desktop) ==")
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()
    page.goto(BASE + "/blog", wait_until="domcontentloaded", timeout=30000)
    page.wait_for_timeout(1200)
    add("featured card", page.locator(".blog-featured-card").count() == 1)
    add("blog grid cards", page.locator(".blog-card").count() >= 3, str(page.locator(".blog-card").count()))
    add("blog cta block", page.locator(".blog-cta").count() == 1)
    add("blog back link", page.locator(".blog-back").count() == 1)
    add("blog hero h1", page.locator(".blog-hero h1").count() == 1)
    ctx.close()
    browser.close()

print(f"\n{total - fails}/{total} checks passed")
sys.exit(1 if fails else 0)
