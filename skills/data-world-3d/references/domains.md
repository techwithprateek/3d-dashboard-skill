# Choosing a domain kit

Pick by what the data is about. The same spec works in every kit, so switching is cheap (`--domain`).

Every kit is a line of three places along one road: a source site on the left, the main site in the middle (shelves, racks, beds and the walking people), and a destination on the right. The movers drive back and forth along the road between the source and the destination, or between the main site and the destination.

| domain | use for | source, main site, destination | fixtures | movers | terminals | people |
| --- | --- | --- | --- | --- | --- | --- |
| `retail` | stores, ecommerce, FMCG, marketplaces | warehouse, store, customers' homes | shelves (fuller = more units) | vans | dock bays at the warehouse | shoppers |
| `datacenter` | SaaS, product analytics, IT ops, API metrics | offices, data center, edge sites | server racks (taller = bigger) | cargo drones | consoles | engineers |
| `healthcare` | hospitals, clinics, pharma, public health | homes, hospital, clinics | ward bays (more beds = bigger) | ambulances | triage desks | patients |
| `factory` | manufacturing, supply chain, logistics, operations | suppliers, plant, port | machines with moving arms | trucks | conveyor lines | workers in hard hats |
| `city` | finance, real estate, telecom, anything unclear | suburbs, towers, harbor | office towers (taller = bigger) | cars | kiosks | clients |
| `hospitality` | restaurants, cafes, hotels, food delivery | farms, restaurant, customers (scooters leave the restaurant) | dining tables (more plates) | delivery scooters | service stations | guests |
| `education` | schools, universities, edtech, training | homes, school, sports field (buses run homes to school) | classrooms (more desks) | school buses | admin desks | students |
| `energy` | utilities, climate, agriculture, outdoor sites | solar field, wind farm, town, with a power line behind | wind turbines (taller, faster) | service trucks | transformers | technicians |

## Mapping examples

| data | domain | fixtures | movers | terminals | actors | health |
| --- | --- | --- | --- | --- | --- | --- |
| Superstore orders | retail | Sub-Category | State | Ship Mode | Segment | margin |
| Hospital admissions | healthcare | Department | Admission source | Triage level | Insurance type | readmission rate (low is good) |
| SaaS subscriptions | datacenter | Feature or plan | Acquisition channel | Support tier | Company size | net revenue retention |
| Production log | factory | Machine or line | Destination | Shift | Supplier | defect rate (low is good) |
| Fund holdings | city | Sector | Region | Asset class | Client type | return |
| Restaurant orders | hospitality | Menu category | Delivery zone | Order channel | Customer type | tip or margin |
| Course results | education | Course | Campus | Exam type | Cohort | pass rate |
| Wind and solar output | energy | Site | Region | Equipment type | Crew | capacity factor |

## Picking slot columns

- The best `fixtures` column has 5 to 8 meaningful values and a clear size metric.
- `movers` fit places, channels or routes. They drive around, so a count of orders makes a good `speed`.
- `terminals` fit process steps or methods with 2 to 4 values.
- `actors` fit people categories with 2 to 4 values.
- Skip a slot if no column fits. The world simply leaves that part out.
