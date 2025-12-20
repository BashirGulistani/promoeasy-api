# PromoStandards Simplifier API (Unified Catalog + Product Search)

A single REST API that hides PromoStandards SOAP complexity behind one clean endpoint.

This project is built for **distributors with little or no IT support** who still need fast, reliable access to supplier catalogs, product details, pricing, and inventory—without building/maintaining SOAP clients, envelopes, WSDL quirks, or vendor-specific logic.

---

## Why this exists

PromoStandards is powerful, but in practice it’s painful:

- Every supplier has slightly different SOAP behavior
- WSDL versions differ (`v1`, `v2`, sometimes mixed)
- Fields aren’t consistent (colors, categories, pricing tiers, FOB, etc.)
- Building/hosting SOAP integrations takes time and constant maintenance

**This API turns all that into one simple call.**

You send filters like `brand`, `keyword`, `category`, `minPrice`, `maxPrice`, `minQty`, `shipFrom`, etc.  
We handle:
- supplier selection
- SOAP calls + retries
- schema normalization
- dedupe + ranking
- paging
- consistent output

---

## What you get

### One endpoint for product discovery
Search across one supplier or many, using common filters.

### Normalized product schema
Same field names across suppliers:
- images
- pricing tiers
- colors
- sizes
- categories
- shipping / FOB
- supplier codes
- availability/inventory (when supported)

### Distributor-friendly integration
- No SOAP code
- No WSDL parsing
- No XML envelopes
- No vendor-specific edge cases

---

## Core endpoint

### `POST /v1/products/search`

Search products using filters instead of writing supplier-specific integrations.

#### Example request

```json
{
  "q": "vacuum insulated bottle",
  "suppliers": ["PCNA", "GEM", "HIT"],
  "brand": "CamelBak",
  "limit": 24,
  "page": 1,

  "filters": {
    "category": ["Drinkware"],
    "color": ["Black", "Navy"],
    "min_price": 5.00,
    "max_price": 25.00,
    "min_qty": 50,
    "max_qty": 500,
    "imprint_methods": ["Laser Engraved", "Screen Print"],
    "ship_from": ["CA", "TX"],
    "eco": true,
    "rush": true
  },

  "sort": {
    "by": "relevance",
    "order": "desc"
  }
}
