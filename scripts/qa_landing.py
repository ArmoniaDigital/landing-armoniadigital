import sys
import json
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4174"
SHOT_DIR = "qa-shots"
results = []


def record(name, ok, extra=""):
    results.append({"name": name, "ok": ok, "extra": str(extra)})


def check_page(page, label, route, expect_title, expect_path, shot):
    errors = []
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(str(e)))

    resp = page.goto(BASE + route, wait_until="networkidle", timeout=30000)
    record(f"{label}: HTTP", resp.status == 200, resp.status)
    record(f"{label}: title", expect_title in page.title(), page.title())
    record(f"{label}: path", page.url.split("?")[0].rstrip("/") == (BASE + expect_path).rstrip("/") or page.url.split("?")[0] == BASE + expect_path, page.url)
    body_len = len(page.inner_text("body"))
    record(f"{label}: body content", body_len > 400, f"{body_len} chars")
    page.screenshot(path=f"{SHOT_DIR}/{shot}", full_page=False)
    severe = [e for e in errors if "favicon" not in e and "net::" not in e]
    record(f"{label}: no console errors", not severe, "; ".join(severe[:3]))
    return errors


def main():
    import os

    os.makedirs(SHOT_DIR, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()

        desktop = browser.new_context(viewport={"width": 1440, "height": 900})
        page = desktop.new_page()
        check_page(page, "home desktop", "/", "Armonía Digital", "/", "home-desktop.png")

        nav_errors = []
        page.on("pageerror", lambda e: nav_errors.append(str(e)))
        page.get_by_role("link", name="Blog", exact=True).first.click()
        page.wait_for_timeout(900)
        record("nav: Blog -> /blog", page.url.rstrip("/") == BASE + "/blog", page.url)
        record("nav: blog title", "Blog de" in page.title(), page.title())
        record("nav: blog content", page.locator(".blog-featured-card").count() > 0)
        page.screenshot(path=f"{SHOT_DIR}/blog-desktop.png")
        record("nav: no page errors", not nav_errors, "; ".join(nav_errors[:2]))

        page.get_by_role("link", name="Inicio", exact=True).first.click()
        page.wait_for_timeout(900)
        record("nav: Inicio -> /", page.url.rstrip("/") == BASE, page.url)

        page.goto(BASE + "/#agendar", wait_until="networkidle")
        page.wait_for_timeout(600)
        robots = page.locator('meta[name="robots"]').get_attribute("content")
        record("hash: #agendar renders", "Agenda una llamada" in page.title(), page.title())
        record("hash: #agendar noindex", robots.startswith("noindex"), robots)

        page.goto(BASE + "/#checkout?plan=Business", wait_until="networkidle")
        page.wait_for_timeout(600)
        robots = page.locator('meta[name="robots"]').get_attribute("content")
        record("hash: checkout renders", "Checkout" in page.title(), page.title())
        record("hash: checkout noindex", robots.startswith("noindex"), robots)

        desktop.close()

        mobile = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        m = mobile.new_page()
        check_page(m, "home mobile", "/", "Armonía Digital", "/", "home-mobile.png")
        m.goto(BASE + "/blog", wait_until="networkidle")
        m.screenshot(path=f"{SHOT_DIR}/blog-mobile.png")
        record("mobile: blog cards", m.locator(".blog-card").count() > 0, f"{m.locator('.blog-card').count()} cards")
        mobile.close()

        browser.close()

    passed = sum(1 for r in results if r["ok"])
    print(f"\n{passed}/{len(results)} checks passed")
    for r in results:
        print(f"  [{'PASS' if r['ok'] else 'FAIL'}] {r['name']}" + (f" :: {r['extra']}" if r["extra"] else ""))
    print("RESULT " + json.dumps({"passed": passed, "total": len(results)}))
    sys.exit(0 if passed == len(results) else 1)


main()
