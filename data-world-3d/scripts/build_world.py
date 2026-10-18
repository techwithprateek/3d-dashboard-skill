#!/usr/bin/env python3
"""Build a single-file interactive 3D world from a data file and a spec.

usage: python3 build_world.py --data data.csv --spec spec.json --out world.html [--domain retail]
See references/spec-schema.md for the spec format.
"""
import argparse, html, json, math, re, sys
from pathlib import Path
import pandas as pd

ASSETS = Path(__file__).resolve().parent.parent / "assets"
DOMAINS = ["retail", "datacenter", "healthcare", "factory", "city", "hospitality", "education", "energy"]


def load(path):
    p = Path(path); ext = p.suffix.lower()
    if ext in (".xlsx", ".xls"): return pd.read_excel(p)
    if ext == ".json": return pd.read_json(p)
    if ext == ".parquet": return pd.read_parquet(p)
    sep = "\t" if ext == ".tsv" else ","
    for enc in ("utf-8", "latin1"):
        try: return pd.read_csv(p, sep=sep, encoding=enc)
        except UnicodeDecodeError: continue
    raise SystemExit(f"Could not read {path}")


def numeric(series):
    if series.dtype == object:
        cleaned = series.astype(str).str.replace(r"[$€£,%\s]", "", regex=True)
        return pd.to_numeric(cleaned, errors="coerce")
    return pd.to_numeric(series, errors="coerce")


SAFE_EXPR = re.compile(r"^[\w\s\.\+\-\*/\(\),%]+$")


def compute(frame, defs):
    vals = {}
    for d in defs:
        key = d["key"]
        if "expr" in d:
            if not SAFE_EXPR.match(d["expr"]): raise SystemExit(f"Unsafe expr for {key}: {d['expr']}")
            try:
                v = eval(compile(d["expr"], "<expr>", "eval"), {"__builtins__": {}}, {**vals, "min": min, "max": max, "abs": abs})
            except ZeroDivisionError: v = None
            except NameError as e: raise SystemExit(f"Metric '{key}' uses an unknown metric ({e}). Define it earlier in 'metrics'.")
        else:
            agg = d.get("agg", "sum"); col = d.get("col")
            if agg == "rows": v = len(frame)
            else:
                if col not in frame.columns: raise SystemExit(f"Metric '{key}': column '{col}' not found. Columns: {list(frame.columns)}")
                s = frame[col]
                if agg == "nunique": v = s.nunique()
                elif agg == "count": v = s.count()
                else:
                    s = numeric(s)
                    v = {"sum": s.sum, "mean": s.mean, "median": s.median, "min": s.min, "max": s.max}[agg]()
        if v is not None and not (isinstance(v, float) and math.isnan(v)):
            v = float(v) * d.get("mult", 1)
            v = int(v) if v == int(v) and abs(v) > 100 else round(v, 2)
        else: v = None
        vals[key] = v
    return vals


def allocate(weights, total):
    """Largest-remainder split of `total` people, at least 1 per group."""
    n = len(weights); s = sum(weights) or 1
    raw = [max(1, w / s * total) for w in weights]
    out = [int(r) for r in raw]
    rem = sorted(range(n), key=lambda i: raw[i] - out[i], reverse=True)
    i = 0
    while sum(out) < total and n: out[rem[i % n]] += 1; i += 1
    while sum(out) > total:
        j = max(range(n), key=lambda k: out[k])
        if out[j] <= 1: break
        out[j] -= 1
    return out


def build(df, spec, domain_override=None):
    if spec.get("filter"): df = df.query(spec["filter"])
    defs = spec["metrics"]; keys = {d["key"] for d in defs}
    mdefs = {d["key"]: {"label": d.get("label", d["key"]), "fmt": d.get("fmt", "num")} for d in defs}
    overall = compute(df, defs)
    for k in spec.get("kpis", []) + spec.get("card", []):
        if k not in keys: raise SystemExit(f"'{k}' used in kpis/card but not defined in metrics")

    hs = spec.get("health"); hkey = hs["metric"] if hs else None
    if hkey and hkey not in keys: raise SystemExit(f"health.metric '{hkey}' is not defined in metrics")

    slots_out = {}; healths = []
    for name, sc in spec.get("slots", {}).items():
        dim = sc["dimension"]
        if dim not in df.columns: raise SystemExit(f"Slot {name}: dimension '{dim}' not found. Columns: {list(df.columns)}")
        size = sc["size"]
        rows = []
        for gval, g in df.groupby(dim, dropna=True):
            m = compute(g, defs)
            rows.append((str(gval), m))
        if "order" in sc:
            order = {n: i for i, n in enumerate(sc["order"])}
            rows = [r for r in rows if r[0] in order]; rows.sort(key=lambda r: order[r[0]])
        else:
            rank = sc.get("rank_by", size)
            rows.sort(key=lambda r: -(r[1].get(rank) or 0))
        rows = rows[: sc.get("top", 8 if name == "fixtures" else 6 if name == "movers" else 4)]
        alias = sc.get("alias", {})
        items = []
        for n, m in rows:
            short = alias.get(n, n if len(n) <= 18 else n[:17] + "…")
            it = {"name": n, "short": short, "size": m.get(size) or 0, "metrics": m}
            if sc.get("speed"): it["speed"] = m.get(sc["speed"]) or 0
            if hkey:
                it["health"] = m.get(hkey)
                if name != "actors" and it["health"] is not None: healths.append(it["health"])
            items.append(it)
        slots_out[name] = {"label": sc.get("label", dim), "sizeLabel": sc.get("sizeLabel", mdefs[size]["label"].lower()),
                           "sizeFmt": mdefs[size]["fmt"], "items": items}
        if "card" in sc: slots_out[name]["card"] = sc["card"]
        if name == "actors":
            groups = items[: sc.get("max_groups", 4)]
            counts = allocate([g["size"] for g in groups], sc.get("people", 17))
            for g, c in zip(groups, counts): g["people"] = c
            slots_out[name]["items"] = groups

    health = None
    if hs:
        mode = hs.get("mode", "diverging")
        ov = overall.get(hkey)
        pool = [h for h in healths if h is not None]
        if "range" in hs: rng = hs["range"]
        elif mode == "sequential": rng = [min(pool), max(pool)] if pool else [0, 1]
        else:
            lo, hi = (min(pool), max(pool)) if pool else (0, 1)
            mid = hs.get("mid", 0 if lo < 0 < hi else (ov if ov is not None else (lo + hi) / 2))
            rng = [min(lo, mid), mid, max(hi, mid)]
            if rng[0] == rng[1]: rng[0] = rng[1] - 1
            if rng[2] == rng[1]: rng[2] = rng[1] + 1
        health = {"key": hkey, "label": hs.get("label", mdefs[hkey]["label"]), "fmt": mdefs[hkey]["fmt"], "good": hs.get("good", "high"),
                  "mode": mode, "range": [round(float(x), 2) for x in rng], "goodText": hs.get("goodText"), "badText": hs.get("badText")}

    watch = None
    if spec.get("watch"):
        wk = spec["watch"]
        watch = {"key": wk, "label": mdefs[wk]["label"]}

    domain = domain_override or spec.get("domain", "city")
    if domain not in DOMAINS: raise SystemExit(f"Unknown domain '{domain}'. Choose one of {DOMAINS}")
    card = spec.get("card") or (spec.get("kpis", [])[:4])
    return {
        "title": spec.get("title", "Data World"), "subtitle": spec.get("subtitle", ""), "domain": domain,
        "currency": spec.get("currency", "$"),
        "kpis": [{"label": mdefs[k]["label"], "value": overall[k], "fmt": mdefs[k]["fmt"]} for k in spec.get("kpis", [])[:4]],
        "metricDefs": mdefs, "overall": overall, "health": health, "watch": watch, "card": card,
        "story": spec.get("story"), "notes": spec.get("notes", {}), "slots": slots_out,
    }


def render(data):
    engine = (ASSETS / "engine.js").read_text()
    kits = (ASSETS / "kits.js").read_text()
    engine = engine.replace("/*__KITS__*/", kits)
    payload = json.dumps(data, separators=(",", ":")).replace("</", "<\\/")
    engine = engine.replace("__DATA__", payload, 1)
    tpl = (ASSETS / "template.html").read_text()
    return tpl.replace("__TITLE__", html.escape(data["title"])).replace("__ENGINE__", engine)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True); ap.add_argument("--spec", required=True)
    ap.add_argument("--out", required=True); ap.add_argument("--domain")
    a = ap.parse_args()
    spec = json.loads(Path(a.spec).read_text())
    data = build(load(a.data), spec, a.domain)
    Path(a.out).write_text(render(data))
    c = {k: len(v["items"]) for k, v in data["slots"].items()}
    print(f"wrote {a.out}  domain={data['domain']}  slots={c}  health={data['health']['key'] if data['health'] else None}")


if __name__ == "__main__":
    main()
