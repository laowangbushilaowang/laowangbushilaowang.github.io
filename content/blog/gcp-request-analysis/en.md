---
title: From HTTP requests to training data on GCP
date: '2026-10-16'
publishedAt: '2026-10-16T12:00:10Z'
updated: '2026-10-16'
language: en
translationKey: gcp-request-analysis
project: cloud-request-coursework
excerpt: Connecting Flask, Cloud Storage, Pub/Sub, and Cloud SQL in a course project—and explaining why two models scored 100% and roughly 12%.
tags: [Python, Google Cloud, Data engineering]
---

In a 2023 cloud computing course, I worked through a series of assignments that grew from a file server into a request-analysis pipeline. First, the server returned files from cloud storage. Later versions recorded requests in a database, and the final modeling assignment used those records as training data.

Two results stood out. A random forest predicting country from IP addresses scored **100%**. A classifier predicting income from country, gender, and age managed **roughly 12%**. Understanding that difference meant tracing the data back to the request generator.

The course supplied the HTTP client; my coursework covered the server integration, database, and models. The attributes were generated for the exercise, not collected from real users.

## Start with a file request

The first service accepted a path, fetched the corresponding HTML object from Cloud Storage, and returned its contents. Flask handled the route. Keeping the files in an object store meant the Web server did not need its own copy of them.

Later assignments added request-method checks, rules based on request headers, messages, and logs. The resulting flow looked like this:

```text
Course-supplied HTTP client
       │  file path + generated attributes
       ▼
Flask service ──fetch object──► Cloud Storage
       │
       ├─ runtime information ──► Cloud Logging
       ├─ rule events ──► Pub/Sub ──► subscriber
       └─ request records ──► Cloud SQL ──► model analysis
```

These outputs served different purposes. Logging retained runtime and error information. Pub/Sub passed events to a separate subscriber. SQL stored individual requests as fields I could query later. The subscriber printed each received message and acknowledged it, independently of the file-serving request path.

Once these pieces were connected, displaying an HTML file was only one check. Did a missing file leave a useful record? What happened when a request omitted an attribute? Those details determined what the eventual table actually meant.

## Turn requests into queryable records

The database assignment required at least second normal form. I separated country rules, successful requests, and failed requests:

```text
Country
  country_name  primary key
  is_banned     the course rule for that country
       │
       └── Request.country_name  foreign key

Request
  request_id    primary key
  country_name, client_ip, gender, age, income
  time_of_day, requested_file

Request_fail
  request_id    primary key
  time_of_day, requested_file, fail_code
```

A country's rule was stored once, in `Country`, and referenced by the request table. Repeating it in every request would create copies that all needed updating when the rule changed.

That separation addresses redundancy and dependencies. An auto-incrementing primary key is useful, but it does not replace checking the relationships between fields or establish that the entire schema is well designed.

Failed requests retained just the time, file, and error code. These two 404 records show which file requests failed:

![Two 404 records in the failed-request table](/images/cloud-requests/failed-requests.webp)

*An actual table from the course run, cropped to the relevant content. These are generated file requests.*

The table supports questions about error codes. It cannot answer how failures were distributed by country, because it does not retain that field. Having country in the successful-request table does not recover it for failures. A field left out during collection can become a question I cannot ask later.

The server also filled missing attributes with defaults. That let a simple request reach the database, but a fallback country or IP address means something different from a value supplied by the client. Without that distinction, the model treats values inserted by the program as observations.

## Why one model scored 100% and the other about 12%

I loaded the request table into a DataFrame and prepared two classification tasks. The code uses an 80/20 random row split. This run contained 100,000 rows:

| Task and implementation | Accuracy |
|---|---|
| IP → country, Random Forest | 100.00% |
| Income classification; saved version uses SVC | 12.23%, 12.60% |

These are results on the course's generated data. They do not measure real IP geolocation or real income prediction.

For the first task, the client assigned each country a set of distinct IP prefixes. To generate a request, it selected a country and then generated an IP from one of that country's prefixes. Within one generation run, the prefix-to-country relationship was fixed.

A random row split can put addresses sharing a prefix in both training and test sets. Learning that finite mapping was enough for the random forest to perform very well.

![The country classifier's 100% accuracy output](/images/cloud-requests/country-result.webp)

*The actual country-classification output. The score applies to this generated mapping and random row split; it does not demonstrate generalization to unseen prefixes.*

Income was generated differently. An abbreviated version of the client logic makes the distinction visible:

```python
country = select_country()
ip = make_ip(select_cidr(country))

gender = get_list_item(gender_levels)
age = get_list_item(age_levels)
income = get_list_item(income_levels)
```

*This excerpt simplifies the generator and omits request assembly. The last three attributes are sampled separately.*

Income was drawn independently from eight categories. The generator did not relate it to country, gender, or age. With those inputs, the expected uninformed accuracy is therefore about `1 / 8 = 12.5%`. The observed 12.23% and 12.60% sit close to that level.

![The income classifier's data shape and 12.60% accuracy output](/images/cloud-requests/income-result.webp)

*One actual income-classification output; the other was 12.23%. These are not presented as a controlled before-and-after model improvement.*

A more complicated classifier cannot create a relationship that the inputs do not contain. The country task was easy because the generator supplied a learnable mapping. The income task lacked that relationship. Both scores needed an explanation of how the data was made.

Looking back at the code also exposes a data-lifecycle problem: schema initialization and querying share a module whose import path recreates tables. A model script should read the collected dataset without also initializing it. That course version still differs from the historical execution environment, so the repository is not a one-command reproduction of the saved results.

The assignments connected storage, messaging, SQL, and model evaluation. Following the model results back to the generator was the useful final step: after a service produces a table, I still need to understand what each field represents and which relationships the data actually contains.

The code is split across [file serving (hw4)](https://github.com/laowangbushilaowang/hw4), [request storage (hw5)](https://github.com/laowangbushilaowang/hw5), and [model analysis (hw6)](https://github.com/laowangbushilaowang/hw6).
