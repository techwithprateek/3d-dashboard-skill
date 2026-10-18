---
name: data-world-3d
description: |
  Turns any dataset (CSV, Excel, JSON, Kaggle download) into an interactive 3D world dressed for the data's domain: a store for retail data, a hospital for patient data, a data center for SaaS metrics, a factory for operations, a city for finance, a restaurant, a campus, or a wind farm. Every shelf, vehicle, person and desk is a real data point you can click to see its numbers. Output is one HTML file (three.js, no build step).
  Triggers on: 3d dashboard, 3d world from data, interactive 3d visualization, turn my data into a 3d world, replace powerbi dashboard, clickable data world, three.js dashboard, data city, 3d store dashboard
allowed-tools: Read, Write, Edit, Bash
license: MIT
version: 1.0.0
author: "@techwithprateek"
---

# Data World 3D

Give Claude a dataset. Get back a single-file interactive 3D world where the business is a place and every object is a data point.

## What the user needs to do

Pass a data file (or a Kaggle dataset name) and say what it is about. Everything else is this skill's job.

## Workflow

1. **Get the data.** A local file, a URL, or a Kaggle dataset (`kaggle datasets download -d owner/name -p DIR --unzip`). Put downloads in their own new folder. If the user gave nothing, ask for a file or offer a public sample.
2. **Profile it.** `python3 scripts/profile_data.py DATA` prints columns, measures, dimensions and a domain guess.
3. **Pick the domain kit.** Read `references/domains.md`. Retail, datacenter, healthcare, factory, city, hospitality, education, energy. Logistics and supply chain use `factory`. Finance, real estate and anything unclear use `city`. Say which kit you chose and why in one line.
4. **Map the data to the world.** Four slots, each needs one categorical column:
   - `fixtures` (up to 8): the main things the business holds. Products, wards, services, machines, funds.
   - `movers` (up to 6): flows or places. Regions, channels, routes, sources.
   - `terminals` (up to 4): process steps or methods. Ship mode, payment type, triage level.
   - `actors` (up to 4 groups, 17 people): the people. Customer segments, patient types, user tiers.
   Plus one **health metric**: the single number that says good or bad (margin, readmission rate, churn, defect rate). It colors the world red to blue. Set `good` to `high` or `low` correctly.
5. **Find the story.** Use pandas to find one or two real findings (where health is negative, what correlates with it). Put them in `story` and `notes`. State only what the data shows.
6. **Write `spec.json`.** Format and a full example are in `references/spec-schema.md` and `examples/superstore.spec.json`.
7. **Build.** `python3 scripts/build_world.py --data DATA --spec spec.json --out NAME-3d.html`
8. **Verify.** `node scripts/smoke_test.mjs NAME-3d.html` must print `OK`. If a headless browser is available, take a screenshot and look at it, then fix overlaps or odd colors. If you cannot see it, say so.
9. **Hand over.** Open the file. Tell the user what each object stands for, the story, and anything truncated (top N only, people count is proportional).

## Rules that keep it honest

- Never invent numbers. Every value on a card comes from the data through the spec's metrics.
- Color encodes the health metric only, on a red to grey to blue scale that works for colorblind viewers. Labels also carry an arrow and the value, so color is never the only signal.
- Pick `good: "low"` for metrics where lower is better (churn, defects, wait time, cost).
- Use the user's currency in `currency`. Name metrics in the user's own terms.
- The page needs internet to load three.js and fonts from a CDN. Mention this.
- Top N means other groups are left out. Say how many were dropped.

## Files

- `assets/engine.js`: the world engine (camera, cards, legend, picking, motion)
- `assets/kits.js`: the 8 domain kits. To add a domain, add a kit with `sky, ground, ring, words, env, fixture, mover, terminal, landmark`
- `assets/template.html`: page shell and styles
- `scripts/build_world.py`: aggregates the data and writes the HTML
- `scripts/profile_data.py`, `scripts/smoke_test.mjs`: profiling and a browserless runtime check
- `references/spec-schema.md`, `references/domains.md`: the spec format and domain mapping guide
