---
title: "A sneaker site: scraping, database design, and a simulated purchase"
date: "2026-10-10"
updated: "2026-10-10"
language: en
project: sneaker-trading-platform
excerpt: "A database course project built around my interest in sneakers: collecting a catalog, separating products from inventory, and connecting orders to a Django interface."
cover: /images/sneaker/catalog-reconstruction.webp
coverAlt: "Sneaker catalog reconstructed with the original project templates and stored product records"
tags: [Django, SQL, Data Engineering, Web]
draft: false
---

For a database course project in 2021, I chose something I was interested in: sneakers. The idea was easy to describe. Buyers find shoes, sellers list them, and a purchase becomes an order. Building it meant deciding how each action mapped to stored data.

I used Python to collect product information, MySQL to store it, and Django for search, brand filters, buyer and seller accounts, inventory, and order pages. This was a coursework trading prototype. Purchasing simulated changes to inventory and orders; it did not process payments.

The useful parts of this retrospective are how a scraped catalog became searchable data, and why a shoe model needed to be separate from an item offered by a seller. The purchase handler then shows what I would change if I built it again.

*The cover is a reconstruction using the repository’s Django templates, Bootstrap styles, and stored catalog. It is not a screenshot from 2021. Product photographs are source-site assets retained in the project.*

## Turning a product page into a searchable catalog

The crawler targeted the Sneaker Con catalog. Its page loaded more products through a `Load More` button. Selenium handled that interaction; BeautifulSoup parsed the resulting HTML into names, prices, brands, product codes, and image links. The output was a CSV file.

```text
Source catalog page
  → Selenium loads more products
  → BeautifulSoup extracts fields
  → CSV and image files
  → MySQL product table
  → Django search and display
```

The browser dealt with page interaction, while the parser extracted data from the content it received. An import script inserted records, downloaded available photographs, and assigned a placeholder where an image was unavailable. The website could then read its own catalog without contacting the source on every page request.

Several details were rough. The saved crawler left missing prices and brands empty, and its image selector depended on a particular `alt` value. A price-filling expression in the import script did not retain its returned result. Producing a table was only the start: each missing field could affect what the site displayed. If I repeated the collection today, I would inspect a few pages and measure missingness before scaling it up.

My résumé described 20,000+ collected listings. The product CSV retained in this repository contains **7,084 records with distinct names**. The available files do not establish how the cumulative collection relates to this saved selection. This post uses the preserved version rather than treating those counts as interchangeable.

### Keeping the same search when changing pages

Once the catalog was stored, pagination had to preserve what the user was looking for. Searching a name, selecting a brand, and clicking next should continue through the same result set.

The directory view applies a case-insensitive name query and a brand filter, then uses Django’s paginator to show 12 records per page. The template carries those conditions into subsequent links. An illustrative URL is:

```text
/sneaker/library?searchkey=Jordan&brand=Jordan&page=2
```

Changing `page` moves within the selected results. Dropping the other parameters would send the reader back to the full catalog. This small interaction connects a database query to the user’s ongoing task.

The layout came from an existing Bootstrap shop template. I connected products, brands, and pagination to it; the template’s visual design was not my original work.

## Separating a shoe model from an item for sale

A product row describes the shoe. It does not tell us who can sell one. Multiple sellers can offer the same model, and each can have several inventory items. Putting a seller directly on the product row would make those relationships awkward.

I separated them into tables. The original names were straightforward:

| Table | Purpose |
| --- | --- |
| `sneaker` | Product name, brand, price, and image |
| `seller` / `buyer` | Seller and buyer accounts |
| `inventory` | An available item linked to a shoe and seller |
| `sold` | A sold record retaining the original inventory ID and shoe relationship |
| `order` | Buyer, seller, sold record, date, and optional customization |
| `customization` | Demonstration color options |

As a simplified example, two sellers offering the same model can share its product description while holding separate inventory rows. Selling one row should neither remove the model from the catalog nor affect the other seller’s stock. This illustrates the schema; it is not a claim about a real transaction.

The detail view counts inventory rows for that model. Listing an item adds an inventory row linked to an existing product instead of copying the product description.

![Reconstructed original detail template showing product information and inventory separately](/images/sneaker/detail-reconstruction.webp "Rendered from the original template and a stored product record. Inventory: 3 is an illustrative value and Buy is disabled; this does not verify stock or a purchase.")

The schema also reveals what the prototype left out. Inventory had no size, condition, or seller-specific asking price; price belonged to the product table. It demonstrated the links among products, sellers, and stock, but could not fully describe a secondhand sneaker marketplace. In a new design, those attributes would belong to the individual listing.

## Keeping an order after inventory changes

Purchasing removes an available item. An order must still explain what was bought, from whom, when, and with which customization.

The old implementation used `sold` to preserve that relationship. An order connects the buyer and seller and points to a sold record, which identifies the shoe. The available inventory row is subsequently deleted. Order queries follow these links to recover the product name and customization color for display.

Removing an item from sale and retaining its history serve different purposes. Deleting inventory without preserving its relationships leaves an order unable to identify the purchased shoe. Leaving it available would keep showing it for sale.

**Looking at the purchase handler today, I would first fix the write order and consistency.** It creates an order before creating the sold record that the order references, then deletes inventory. Those writes are not grouped in a database transaction. The model’s foreign key points to `sold`, so insertion order must respect that dependency. This review inspected the source; it did not validate the old purchase flow end to end.

A hypothetical case makes the next issue easier to see. Two buyers both see the last available item. Both requests read “in stock.” What prevents them from purchasing the same inventory row? The number on the page cannot decide that. The backend needs to verify availability, create the sale and order, and update inventory within a single transaction. A repeated request must not produce a second order either.

If I rebuilt the prototype, I would retain the listing and mark it sold, then store the product description and agreed price on the order. Later edits to a listing should not rewrite what an earlier buyer purchased. Authentication, seller authorization, and the representation of prices would also need revision; hiding a button does not enforce a backend rule.

The project connected a crawler, a database, and a web interface. The part I would reuse is starting with the objects involved in each action: browsing reads products, selling creates available inventory, purchasing changes state, and orders preserve past information. I would check those actions against the data model before adding more interface features.

Source: [dbws-project](https://gitee.com/LaoWangB/dbws-project). Its commits are concentrated in late May and early June 2021. The coursework context comes from my recollection; the illustrations reconstruct the surviving templates.
