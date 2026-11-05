import sys
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4174"

JS = """() => {
  const vw = document.documentElement.clientWidth;
  const out = [];
  document.querySelectorAll('body *').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0 || (r.right <= vw + 2 && r.left >= -2)) return;
    let scroller = null;
    let node = el.parentElement;
    while (node && node !== document.body) {
      const ox = getComputedStyle(node).overflowX;
      if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') { scroller = node; break; }
      node = node.parentElement;
    }
    const cls = typeof el.className === 'string' ? el.className.split(' ')[0] : '';
    out.push({
      el: el.tagName.toLowerCase() + (cls ? '.' + cls : ''),
      inScroller: !!scroller,
      scrollerCls: scroller ? (typeof scroller.className === 'string' ? scroller.className.split(' ')[0] : '') : null,
      overflowX: scroller ? getComputedStyle(scroller).overflowX : null,
    });
  });
  return out.slice(0, 12);
}"""

with sync_playwright() as p:
    b = p.chromium.launch()
    for w, h, mobile in [(1440, 900, False), (390, 844, True)]:
        ctx = b.new_context(viewport={"width": w, "height": h}, is_mobile=mobile, has_touch=mobile)
        page = ctx.new_page()
        page.goto(BASE + "/", wait_until="load", timeout=45000)
        page.wait_for_timeout(600)
        rows = page.evaluate(JS)
        outside = [r for r in rows if not r["inScroller"]]
        print(f"\n== viewport {w}x{h} ==")
        print(f"  overflowing elements: {len(rows)}")
        for r in rows[:6]:
            print(f"    {r['el']} -> scroller={r['scrollerCls']} overflowX={r['overflowX']}")
        print(f"  [PASS] todos dentro de un scroller horizontal" if not outside else f"  [FAIL] fuera de scroller: {outside}")
        ctx.close()
    b.close()
