---
title: "Building a sneaker trading site on my own"
date: "2026-10-10"
updated: "2026-10-10"
language: en
project: sneaker-trading-platform
excerpt: "A database course project: writing a browser-driven scraper, designing MySQL tables, using Django’s ORM, and adapting shop templates one page at a time."
cover: /images/sneaker/catalog-reconstruction.webp
coverAlt: "Sneaker catalog reconstructed with the original project templates and stored product records"
tags: [Django, SQL, Data Engineering, Web]
draft: false
---

For a database course project in 2021, I built a sneaker trading site. I chose sneakers because I liked them. The website gave the database a purpose: people could find shoes, list stock, and look up an order after purchasing.

I worked on it alone. I wrote the scraper and designed the database, then used Django for the backend. I did not know how to build a frontend from scratch, so I started with an existing shop template and changed it a little at a time. As I remember it, most of the application was in place by the end; payment integration was the remaining piece.

The difficulty was connecting the parts. Scraped products had to become database records. Those records had to appear on pages. A button had to change the right inventory and leave an order behind. This post follows that path.

*The illustrations reconstruct the original templates and styles with stored product records. They are not screenshots from 2021. Product photographs come from source-site assets retained in the project.*

## Writing a scraper that operated a browser

The catalog came from Sneaker Con. I extracted product names, prices, brands, product codes, and image links.

I used Selenium to simulate browser interaction. The saved script opens Edge, waits for a `Load More` button, and clicks it to load additional products. It then takes the browser’s HTML and uses BeautifulSoup to locate product cards and extract their fields into a CSV.

The division of work was straightforward: let the browser load the content, then parse the resulting page. The collection path was:

```text
Sneaker Con catalog
  → Selenium opens the browser and clicks Load More
  → BeautifulSoup reads product cards
  → CSV and downloaded photographs
  → Import into MySQL
  → Query and display on my own site
```

Writing the scraper meant identifying the page structure myself: where each card began, which tags held its name and price, and what happened when a field was missing. The saved version leaves missing prices and brands empty and has a fairly rough image selector. Today I would compare a sample of extracted rows against the page before expanding the collection.

Collection and display were separate. The scraper produced files, an import script populated the database, and the site queried its own product table. Opening the catalog did not require contacting the source site again. The retained repository contains 7,084 product records.

## Designing products, inventory, and orders separately

This was the central database problem. Several pages showed “shoes,” but the word referred to different things depending on the action.

Suppose two sellers offered the same Jordan model. Its name, brand, and photograph could be shared. Their inventory needed separate records. Selling one item should leave the other seller’s stock available and keep the shoe model in the catalog.

I split those responsibilities across tables:

| Table | Role in the application |
| --- | --- |
| `sneaker` | Product name, brand, price, and image |
| `seller` / `buyer` | Seller and buyer accounts |
| `inventory` | An available item linked to a product and seller |
| `sold` | A sold record retaining the inventory ID and product relationship |
| `order` | Buyer, seller, sold record, date, and optional customization |
| `customization` | Demonstration color options |

Listing an item illustrates the design. A seller selects an existing product, and the application creates an inventory row connected to that seller. It does not duplicate the name and photograph. The detail page counts inventory rows linked to the product to display availability.

```text
Product sneaker ← Available inventory → Seller

Buyer → Order → Sold record → Product sneaker
           ├──→ Seller
           └──→ Customization (optional)
```

*Relationship sketch based on the saved models. Available inventory and sold records occupy separate tables.*

![Reconstructed original detail template showing product information and inventory separately](/images/sneaker/detail-reconstruction.webp "Original-template reconstruction. Inventory: 3 is illustrative and Buy is disabled; the image explains the distinction between a product and its stock.")

The purchase handler moves an available item into a sold record and connects an order to it. Removing inventory from sale therefore does not remove the information needed to find the purchased shoe, buyer, and seller later. That was the purpose of the `sold` table.

The coursework model simplified several things. Inventory had no size, condition, or seller-specific asking price; price belonged to the product table. In a new version, I would attach those attributes to the individual listing. Separating a shoe model from an item for sale makes room for that distinction.

### Why split the tables: normal forms and keys

Normalization gives a name to the reasoning behind these splits: put each fact in an appropriate table and avoid repeated data that becomes difficult to update or delete consistently. The first three normal forms ask different questions:

| Principle | Example in this application |
| --- | --- |
| 1NF: single values, no repeating groups | An inventory row references one seller; several sellers are represented by several rows. |
| 2NF: after 1NF, non-key attributes depend on the whole candidate key | With a hypothetical product-plus-seller key, brand depends only on the product. Keep it in the product table. The actual inventory model uses its own ID. |
| 3NF: after 2NF, avoid transitive dependencies among non-key attributes | A seller’s address belongs to the seller. Inventory references that seller instead of copying the address. |

Copying a shoe name into every inventory row would require many updates when it changed. A separate product row avoids that update anomaly and survives the sale of the last available item. See [Database design basics](https://support.microsoft.com/en-us/access/database-design-basics) for the general rules.

The saved models also define keys and relationships. Most tables use Django’s default `id`; `sold` explicitly uses `soldid` as its primary key. Usernames and product names have uniqueness constraints. Foreign keys connect inventory to products and sellers, and orders to sold records, buyers, sellers, and optional customization.

These choices explain the separation. Certifying the entire schema as 3NF would require checking its candidate keys and business dependencies. Having foreign keys alone does not establish that.

## Using Django’s ORM to connect tables and pages

I mainly used Django’s built-in ORM: its interface for working with database records as Python objects. Models lived in `models.py`, request handling in `views.py`, and the results were passed to templates.

I used `get()` for a single product, `filter()` for matching products or inventory, `create()` for new records, and `count()` for quantities. These two lines come from the original search and detail handlers:

```python
s = sneaker.objects.filter(name__icontains=key)
inv = inventory.objects.filter(sneakerid=id).count()
```

The first searches product names; the second counts inventory for a product. Django translates those calls into database queries. The view handles the search term or product ID and decides which results the page needs. The [Django query documentation](https://docs.djangoproject.com/en/5.2/topics/db/queries/) explains these interfaces.

The ORM saved me from assembling SQL in every view. I still had to design the relationships. Product details needed products and inventory. Order pages began with a buyer’s or seller’s orders and followed their links to product names and customization colors. A Python API cannot resolve a confused data model on its own.

Search and pagination used the same connection. The backend filtered names and brands and displayed 12 records per page. The template rendered cards and navigation links. Those links carried the current filters forward so that changing pages would continue through the same results.

## Adapting a template when I did not know frontend development

I started with an existing Bootstrap shop template. It supplied navigation, product cards, and page layouts. I gradually replaced its content with my data and application actions.

The card loop became a loop over products passed in by Django. Names filled the headings, image fields supplied photographs, and each card linked to the corresponding product detail. The sidebar listed brands. Pagination links carried page numbers and query parameters. Expressions such as `{{ obj.name }}` and `{{ obj.price }}` were where backend records appeared in the page.

The detail page also needed inventory. Sellers needed a way to list items and inspect their stock. Buyers and sellers needed their own order views. Each new interface action needed a corresponding query or write in the backend and somewhere to store its result.

Having a visible template made that work concrete. I could take one part of the page and determine which fields to pass in, which button should submit a form, and which link needed a product ID. The visual layout came from the template; connecting it to my data model and application was my work.

## The payment integration I left unfinished

My recollection is that accounts, the catalog, inventory, buying and selling actions, and orders were mostly assembled. I had not connected payments. Purchasing in the application simulated inventory and order changes; no money was collected.

Reviewing the saved source also reveals work to do in the purchase handler. It inserts an order before the sold record it references, and the writes are not grouped in a database transaction. This is a finding from the current source review, not a newly reproduced failure in the old application. Before extending it with payments, I would fix that consistency and distinguish pending payment, successful payment, and cancellation.

What I remember most is putting the pieces together myself. I adapted templates because frontend development was unfamiliar, collected the product data, designed the tables, and connected them to search, listings, and orders through Django. The tables from a database assignment became an application I could interact with. Payment remained unfinished.

Source: [dbws-project](https://gitee.com/LaoWangB/dbws-project).
