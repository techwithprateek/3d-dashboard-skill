#!/usr/bin/env python3
"""Profile a data file so a spec can be written: columns, measures, dimensions, likely domain.
usage: python3 profile_data.py data.csv
"""
import sys
from pathlib import Path
import pandas as pd
sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_world import load

KEYWORDS = {
    "retail": "sales order product category customer discount store shop sku cart price revenue profit segment ship",
    "datacenter": "server latency uptime cpu request api user session churn mrr arr subscription plan feature release deploy error incident",
    "healthcare": "patient hospital ward diagnosis admission discharge doctor nurse clinic readmission drug treatment length of stay bed",
    "factory": "machine plant production defect yield downtime shift supplier shipment warehouse inventory freight carrier delivery route unit",
    "city": "portfolio fund stock equity return asset loan bank account branch risk property tenant rent region sector client",
    "hospitality": "restaurant menu dish table guest booking hotel room cuisine delivery rider tip reservation cafe",
    "education": "student course school class grade teacher exam enrollment attendance campus score cohort",
    "energy": "energy power wind solar turbine grid kwh mwh emissions carbon crop farm yield rainfall water plant utility",
}

def main():
    df = load(sys.argv[1])
    print(f"rows={len(df):,} cols={len(df.columns)}\n")
    names = " ".join(c.lower() for c in df.columns)
    scores = {d: sum(w in names for w in ws.split()) for d, ws in KEYWORDS.items()}
    print("domain guess (column-name matches):", sorted(scores.items(), key=lambda x: -x[1])[:3], "\n")
    meas, dims, dates = [], [], []
    for c in df.columns:
        s = df[c]; n = s.nunique(dropna=True)
        kind = "date?" if "date" in c.lower() or "time" in c.lower() else None
        num = pd.to_numeric(s, errors="coerce").notna().mean() > 0.9 and s.dtype != bool
        if kind: dates.append(c)
        elif num and n > 12: meas.append(c)
        elif 2 <= n <= 60: dims.append((c, n))
        print(f"- {c!r:32} {str(s.dtype):10} unique={n:<7} sample={list(s.dropna().unique()[:3])}")
    print("\nmeasures (sum/mean candidates):", meas)
    print("dimensions (slot candidates, unique count):", dims)
    print("dates:", dates)
    print("\nnext: pick domain, health metric (what is good or bad), then one dimension per slot. See references/spec-schema.md")

if __name__ == "__main__":
    main()
