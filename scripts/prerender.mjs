import { readFile, writeFile, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const distDir = path.resolve("dist");
const ssrDir = path.resolve("dist-server");
const ssrEntry = path.join(ssrDir, "entry-server.js");

const routes = [
  { path: "/", page: "home", outs: [path.join(distDir, "index.html")] },
  {
    path: "/blog",
    page: "blog",
    outs: [path.join(distDir, "blog", "index.html"), path.join(distDir, "blog.html")],
  },
];

const rootTemplate = path.join(distDir, "index.html");

async function fileExists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function replaceTag(html, matcher, replacement) {
  if (!matcher.test(html)) return html;
  return html.replace(matcher, replacement);
}

function applyHead(html, meta, url) {
  let output = html;
  output = replaceTag(output, /<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`);
  output = replaceTag(
    output,
    /<meta name="description" content="[\s\S]*?"\s*\/?>/,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
  );
  output = replaceTag(
    output,
    /<meta name="robots" content="[\s\S]*?"\s*\/?>/,
    `<meta name="robots" content="${escapeHtml(meta.robots)}" />`,
  );
  output = replaceTag(
    output,
    /<link rel="canonical" href="[\s\S]*?"\s*\/?>/,
    `<link rel="canonical" href="${url}" />`,
  );
  output = replaceTag(
    output,
    /<meta property="og:title" content="[\s\S]*?"\s*\/?>/,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
  );
  output = replaceTag(
    output,
    /<meta property="og:description" content="[\s\S]*?"\s*\/?>/,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
  );
  output = replaceTag(
    output,
    /<meta property="og:url" content="[\s\S]*?"\s*\/?>/,
    `<meta property="og:url" content="${url}" />`,
  );
  output = replaceTag(
    output,
    /<meta name="twitter:title" content="[\s\S]*?"\s*\/?>/,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
  );
  output = replaceTag(
    output,
    /<meta name="twitter:description" content="[\s\S]*?"\s*\/?>/,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
  );
  return output;
}

function applyJsonLd(html, page) {
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (match, body) => {
    let data;
    try {
      data = JSON.parse(body);
    } catch {
      return match;
    }
    const graph = Array.isArray(data["@graph"]) ? data["@graph"] : null;
    if (!graph) return match;
    const filtered = page === "home" ? graph : graph.filter((node) => node["@type"] !== "FAQPage");
    if (filtered.length === graph.length) return match;
    const payload = { "@context": data["@context"], "@graph": filtered };
    return `<script type="application/ld+json">\n${JSON.stringify(payload, null, 2)}\n    </script>`;
  });
}

async function main() {
  if (!(await fileExists(ssrEntry))) {
    throw new Error(`Missing SSR bundle at ${ssrEntry}. Run the SSR build first.`);
  }
  if (!(await fileExists(rootTemplate))) {
    throw new Error(`Missing client build at ${rootTemplate}. Run the client build first.`);
  }

  const template = await readFile(rootTemplate, "utf8");

  if (!template.includes('<div id="root"></div>')) {
    throw new Error('Client template is missing the <div id="root"></div> placeholder.');
  }

  const { render, getPageMeta, pageCanonical } = await import(pathToFileURL(ssrEntry).href);

  for (const route of routes) {
    const appHtml = render(route.path);
    const url = pageCanonical(route.page);
    const meta = getPageMeta(route.page);

    let html = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
    html = applyHead(html, meta, url);
    html = applyJsonLd(html, route.page);
    html = html
      .replace(/Armon[^\w]*a Digital/g, "Armonía Digital")
      .replace(/dise[^\w]*o/g, "diseño")
      .replace(/p[^\w]*gina/g, "página")
      .replace(/r[^\w]*pidas?/g, "rápidas")
      .replace(/h[^\w]*biles/g, "hábiles")
      .replace(/Latinoam[^\w]*rica/g, "Latinoamérica");

    for (const out of route.outs) {
      await mkdir(path.dirname(out), { recursive: true });
      await writeFile(out, html, "utf8");
      console.log(`Prerendered ${route.path} -> ${path.relative(distDir, out)} (${Buffer.byteLength(html, "utf8")} bytes)`);
    }
  }

  await rm(ssrDir, { recursive: true, force: true });
}

main().catch((error) => {
  console.error(`Prerender failed: ${error.message}`);
  process.exitCode = 1;
});
