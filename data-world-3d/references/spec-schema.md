# Spec schema

`build_world.py` reads a JSON spec and the data file. The spec says what to measure and which column feeds which part of the world.

```json
{
  "title": "Superstore 3D",
  "subtitle": "Kaggle Sample Superstore, US, 2014 to 2017",
  "domain": "retail",
  "currency": "$",
  "filter": "Region == 'West'",
  "metrics": [ ... ],
  "kpis": ["sales", "profit", "orders", "margin"],
  "health": { ... },
  "watch": "discount",
  "card": ["sales", "profit", "margin", "discount"],
  "story": { "kind": "bad", "title": "Discount problem", "text": "..." },
  "notes": { "Tables": "Custom sentence for the Tables card." },
  "slots": { ... }
}
```

## metrics (required)

A list, evaluated top to bottom. Each has a `key`, a `label` and a `fmt`.

- Aggregate metric: `{"key":"sales","label":"Sales","agg":"sum","col":"Sales","fmt":"money"}`
  - `agg`: `sum`, `mean`, `median`, `min`, `max`, `count`, `nunique`, `rows`
  - `mult`: optional multiplier, for example `100` to turn a 0 to 1 rate into percent
- Derived metric: `{"key":"margin","label":"Margin","expr":"profit/sales*100","fmt":"pct"}`. It can use any metric defined above it. Allowed: numbers, names, `+ - * / ( ) ,` and `min`, `max`, `abs`.
- `fmt`: `money`, `int`, `pct`, `num` (compact 1.2K, 3.4M), `dec` (2 decimals), `days`, `text`

Currency strings in the data ("$1,234") are cleaned automatically.

## kpis

Up to 4 metric keys shown as chips at the top right and on the landmark card.

## health

The one metric that colors the world.

- `metric`: a metric key
- `good`: `"high"` (more is better) or `"low"` (less is better)
- `range`: `[worst, midpoint, best]` in the metric's units. Midpoint is the grey point, usually 0 or a target. Optional. Without it the midpoint is 0 when values cross zero, else the overall value.
- `mode`: `"diverging"` (default, red to blue) or `"sequential"` (light to dark blue, no good or bad)
- `goodText`, `badText`: pill text on cards, for example "Profitable" and "Losing money"

## watch

Optional second metric mentioned in every auto-written insight, for example the discount rate.

## card

Four metric keys shown on every card. A slot can override it with its own `card`.

## story and notes

`story` is the landmark sign's insight: `kind` is `bad` or `good`, plus `title` and `text`. `notes` maps an item name to a sentence that replaces the auto-written insight on that card. Use both for real findings only.

## slots

Each slot needs `dimension` (a column) and `size` (a metric key). All are optional, include only what the data supports.

| slot | object | max | extra options |
| --- | --- | --- | --- |
| `fixtures` | shelves, racks, beds, machines, towers | 8 | `top`, `rank_by`, `alias` |
| `movers` | vans, drones, ambulances, trucks, cars | 6 | `top`, `speed` (metric key, faster = bigger value), `alias` |
| `terminals` | desks, consoles, lines, kiosks | 4 | `order` (list of values, sets the order and filters) |
| `actors` | people | 4 groups | `people` (total figures, default 17), `max_groups` |

Common options: `label` (what the column is called), `sizeLabel` (text after the size value, for example "units sold"), `card`.

- `size` sets shelf fullness, tower height, bed count, vehicle size and so on.
- `rank_by` picks the top N by a different metric than `size`.
- `alias` shortens long names for 3D labels: `{"California": "CA"}`.

## Output

`--domain X` on the command line overrides `domain` in the spec, handy for trying a different kit on the same data.
