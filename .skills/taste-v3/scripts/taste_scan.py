#!/usr/bin/env python3
"""Taste v3 static scan: fast regex checks for Taste-specific bans that complement
`npx impeccable detect`. Heuristic, not a parser: confirm each finding in context.

Usage: python3 taste_scan.py <file-or-dir> [...] [--json]
Exit codes: 0 clean, 2 bans found, 1 nothing scanned.
"""
import json
import os
import re
import sys

EXTS = {".html", ".htm", ".css", ".scss", ".jsx", ".tsx", ".js", ".ts", ".vue", ".svelte", ".astro", ".mdx"}
SKIP_DIRS = {"node_modules", ".git", "dist", "build", ".next", ".impeccable", "coverage"}

# (id, severity, regex, message)
RULES = [
    ("em-dash", "ban", re.compile(r"[\u2014]|(?<=\s)\u2013(?=\s)"),
     "Em-dash or separator en-dash in source; banned in visible copy (use '-', ':' or rewrite)."),
    ("transition-all", "ban", re.compile(r"transition\s*:\s*all\b|\btransition-all\b"),
     "transition: all / transition-all; name the properties."),
    ("will-change-all", "ban", re.compile(r"will-change\s*:\s*all"), "will-change: all."),
    ("gradient-text", "ban", re.compile(r"bg-clip-text[^\"'`]*text-transparent|text-transparent[^\"'`]*bg-clip-text|background-clip\s*:\s*text"),
     "Gradient text; use weight or size for emphasis."),
    ("side-stripe", "ban", re.compile(r"\bborder-[lr]-(?:[2-8]|\[[2-9]px\])\b|border-(?:left|right)\s*:\s*(?:[2-9]|\d{2,})px"),
     "Colored side stripe > 1px (side-tab tell)."),
    ("scroll-listener", "ban", re.compile(r"addEventListener\(\s*['\"]scroll['\"]"),
     "window scroll listener; use ScrollTrigger, IntersectionObserver, useScroll or CSS scroll timelines."),
    ("placeholder-identity", "ban", re.compile(r"\b(John Doe|Jane Doe|Acme(?: Corp)?|SmartFlow|Cloudly|Lorem ipsum)\b", re.I),
     "Placeholder person/brand or lorem ipsum."),
    ("fake-perfect-number", "ban", re.compile(r"\b99\.99%|\b1234567\b|\b123,456,789\b"), "Fake-perfect number."),
    ("press-scale-too-small", "ban", re.compile(r"active:(?:[\w-]+:)*scale-(?:\[0?\.(?:[0-8]\d|9[0-4])\]|90|75|50)\b|whileTap=\{\{\s*scale:\s*0?\.(?:[0-8]\d?|9[0-4])\b"),
     "Press scale below 0.95; use 0.96."),
    ("h-screen", "check", re.compile(r"\bh-screen\b|height\s*:\s*100vh"),
     "h-screen / 100vh; prefer min-h-[100dvh] (fine for fixed shells sized deliberately)."),
    ("ai-gradient", "check", re.compile(r"from-(?:purple|violet|indigo|fuchsia)-\d+[^\"'`]*to-(?:blue|cyan|pink|purple|indigo)-\d+"),
     "AI purple/blue gradient; justify from the brand or remove."),
    ("eyebrow-candidate", "check", re.compile(r"class(?:Name)?=[\"'][^\"']*\buppercase\b[^\"']*\btracking-(?:wide|wider|widest|\[)"),
     "Tracked uppercase label; banned as a kicker above a heading (fine for table headers, badges)."),
    ("reflex-font", "check", re.compile(r"\b(Fraunces|Instrument[ _]Serif|Playfair[ _]Display|Cormorant|Space[ _]Grotesk|Space[ _]Mono|Plus[ _]Jakarta[ _]Sans|Outfit|DM[ _]Sans|DM[ _]Serif|Syne|Instrument[ _]Sans)\b"),
     "Reflex face; on Persuade/Experience it needs a reason no other face could satisfy."),
    ("glow-shadow", "check", re.compile(r"shadow-\[0_0_\d+px|box-shadow\s*:\s*0\s+0\s+\d+px\s+[^;]*(?:rgba?\(|#|oklch)"),
     "Zero-offset glow shadow; shadows carry an offset and soft blur."),
    ("bounce-ease", "check", re.compile(r"\b(?:elastic|bounce)\.(?:out|in|inOut)\b|animate-bounce"),
     "Bounce/elastic easing; overshoot only for small-control entrances."),
    ("pure-black-white-surface", "check", re.compile(r"(?:background(?:-color)?\s*:\s*|bg-\[)#(?:000000|000|ffffff|fff)\b"),
     "Pure #000/#fff surface; use off-black / off-white."),
]

COMMENT_LINE = re.compile(r"^\s*(//|/\*|\*|<!--|#)")


def files(paths):
    for p in paths:
        if os.path.isfile(p):
            yield p
        elif os.path.isdir(p):
            for root, dirs, fs in os.walk(p):
                dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
                for f in fs:
                    if os.path.splitext(f)[1].lower() in EXTS:
                        yield os.path.join(root, f)


def scan(path):
    out = []
    try:
        lines = open(path, encoding="utf-8", errors="replace").read().splitlines()
    except OSError:
        return out
    for n, line in enumerate(lines, 1):
        if len(line) > 2000:  # minified bundles
            continue
        is_comment = bool(COMMENT_LINE.match(line))
        for rid, sev, rx, msg in RULES:
            if is_comment and rid in ("em-dash", "placeholder-identity", "reflex-font"):
                continue
            if rx.search(line):
                out.append({"file": path, "line": n, "rule": rid, "severity": sev, "message": msg,
                            "snippet": line.strip()[:140]})
    return out


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    as_json = "--json" in sys.argv
    if not args:
        print(__doc__)
        sys.exit(1)
    fl = list(files(args))
    if not fl:
        print("No scannable files found.")
        sys.exit(1)
    findings = [f for p in fl for f in scan(p)]
    if as_json:
        print(json.dumps(findings, indent=2, ensure_ascii=False))
    else:
        for f in findings:
            print(f"[{f['severity'].upper()}] {f['rule']}  {f['file']}:{f['line']}\n    {f['message']}\n    > {f['snippet']}")
        bans = sum(f["severity"] == "ban" for f in findings)
        checks = len(findings) - bans
        print(f"\nScanned {len(fl)} file(s): {bans} ban finding(s), {checks} check(s) to confirm in context.")
    sys.exit(2 if any(f["severity"] == "ban" for f in findings) else 0)


if __name__ == "__main__":
    main()
