---
title: "BioFlow: turning public omics files into usable datasets"
date: "2026-10-09"
updated: "2026-10-16"
language: "en"
project: "single-cell-agent-pipeline"
excerpt: "A three-month brief to build a data-curation agent. The difficult parts were interpreting heterogeneous attachments, linking cells to samples, and recovering experimental conditions."
cover: "/images/bioflow/workflow-original.webp"
coverAlt: "Five-stage workflow table from the BioFlow project presentation"
tags: [Data Engineering, Bioinformatics, LLM, Agents]
draft: false
---

The paper is found. The files are downloaded. How much work remains? With public omics data, that can still mean unpacking attachments, determining how to read the matrix, identifying samples, and checking webpages and supplementary tables for age, tissue, and treatment.

At Guangzhou Laboratory, my brief was to build an agent within three months, with the goal of replacing manual collection and curation for a virtual-cell data corpus. That was the assignment, rather than an achieved level of automation. Heterogeneous files and metadata remained the difficult parts.

The earlier [sample-time and pseudotime work](/blog/niche-time-pseudotime/) had already exposed this dependency. To compare cells across developmental stages, I first needed reliable sample identities and conditions. A model can train perfectly well on incorrectly assembled data and answer the wrong question.

BioFlow became a five-stage workflow: find papers, obtain full texts, extract accessions, construct datasets, and fill metadata. Most of my effort went into the last two stages and deciding where the agent should make judgments.

![The five stages of BioFlow](/images/bioflow/workflow-original.webp)

*The five stages and their responsibilities. Each stage saves intermediate outputs for the next one.*

## From an autonomous agent to an explicit workflow

I considered LangChain and more autonomous agent approaches, deployed a local model, and tried letting the agent write or modify loaders when it encountered an unfamiliar format.

The attraction was obvious. A CSV could contain expression values or sample descriptions. MTX files could be separated into sample directories or mixed together under filename prefixes. Maintaining a rule for every packaging choice was tedious.

Generating code introduced another moving part. The agent could choose the wrong file or change the reading logic incorrectly. Even after an h5ad appeared, I still had to check matrix orientation, gene names, and sample grouping. Debugging became harder when both the data interpretation and the program were changing.

I moved toward an explicit workflow with fixed tools and a few model-assisted decisions. “LangChain-style” describes that orchestration approach here; it does not establish a particular historical dependency version.

| Model judgment | Context supplied | Program responsibility |
| --- | --- | --- |
| Locate data accessions | Paper text and availability statements | Extract and record accessions; use regex first for obvious matches |
| Choose a reader | File tree, candidate matrices, small text excerpts | Invoke a registered loader, construct matrices, write outputs |
| Normalize metadata | Current sample information and controlled vocabulary | Fill missing fields and save results and status |

An unfamiliar dataset no longer required the model to rewrite its reader. The model proposed a plan for existing tools. If that route failed, an outer builder could attempt a deterministic fallback.

I still wanted an agent. I had become more specific about which decisions benefited from one and which operations already had dependable implementations.

## Let the model inspect file relationships

Stage four receives a directory, not a clean table. Archives may be nested; raw matrices, processed matrices, and metadata may sit together. Their relationships matter before any loader runs.

For example, an early download directory in the project contained the following files. Other samples are omitted:

```text
GSE119562_RAW/
├── GSM3377673_sample1h.csv.gz
├── GSM3377674_sample2h.csv.gz
├── GSM3377675_sample3h.csv.gz
├── ...
├── GSM3377679_sample1m.csv.gz
└── GSM3377680_sample2m.csv.gz
```

The names provide sample clues. They do not justify guessing experimental conditions from their suffixes. Headers, orientation, and sample descriptions still need checking.

MTX has a different relationship: matrix, features, and barcodes form a unit. Treating them as separate inputs misidentifies the data unit. With several prefixed triplets in one directory, pairing becomes part of the task.

I built a probe that collects relative paths, suffixes, sizes, candidate files, and selected text headers. The model uses those clues to return a short JSON plan specifying a loader and its inputs. The expression matrix itself stays out of the prompt.

Reading files and identifying samples are separate operations:

1. **Read a valid group.** For MTX, load the matching matrix, features, and barcodes into a cell-by-feature object.
2. **Resolve sample identity.** Prefer mappings from SDRF or GEO series matrices, retaining source-file and directory information; use model-assisted identifier mapping where needed.
3. **Preserve the mapping after concatenation.** Cells need their sample identifiers to inherit age, tissue, and treatment correctly.

Path-derived identifiers preserve provenance when stronger mappings are absent. They do not verify biological sample identity. A syntactically valid mapping can still merge two samples incorrectly.

Over time I added handling for multi-column features files, multiple 10X sets in one directory, multi-sample concatenation, damaged MTX inputs, and download integrity. These changes addressed different packaging of the same underlying data relationships.

## Metadata: choose the right level and the right context

A readable matrix still leaves questions: which tissue, which control or treatment, which donor age, and which assay?

One paper can describe several donors; a donor can contribute several samples; a sample contains many cells. Copying a paper-level description onto every cell can get those conditions wrong.

![Dataset, sample, cell, and donor relationships](/images/bioflow/sample-relations-original.webp)

*Relationship diagram from the project design document. Information belongs at different levels; a dataset description cannot substitute for each sample's conditions.*

I used rules for fields that could be resolved directly, then model assistance for missing values. Sources included GEO SOFT and series matrices, ArrayExpress SDRF/IDF, sample webpages, and available supplementary tables.

![Metadata collection, rules, and model-assisted filling](/images/bioflow/metadata-flow-original.webp)

*Metadata workflow: distinguish dataset and sample information, align sample-level fields by sample_id, apply rules, then use model-assisted enrichment. Cropped from the project presentation.*

### An ATAC classification problem changed the prompt input

Colleagues using the workflow reported errors in omics type and reference-genome classification. Both affect the processing route: the first can select the wrong reader; the second can affect interpretation of fragment coordinates.

I suspected that mixed context was contributing to the problem. A GSE describes a study collection, while GSM records provide more specific sample information. I changed classification to use a GSM metadata summary, instructed the model to ignore dataset-level context, and skipped model classification when that summary was unavailable.

| Change | Purpose |
| --- | --- |
| Resolve GSM records from the series matrix or GSE page, then collect sample information | Ground classification in sample descriptions |
| Prefer an explicit Genome_build or Assembly | Avoid relying only on organism-based inference; this is a prompt instruction, not a measured accuracy guarantee |
| Cap GSM fetching and reuse cached pages | Control the cost of retrieving many sample pages |
| Skip the model when GSM summaries are missing | Leave an unresolved case instead of requesting a guess |

This narrowed the evidence used for the decision. Measuring its accuracy gain would require a paired comparison on the same datasets.

Stage-five metadata enrichment had a related constraint: the current sample's row and matching supplementary records should take priority over broad study descriptions. I arranged context blocks by priority and length budgets so long background text would not displace relevant sample fields.

Later, I worked with colleagues collecting data, using their feedback to improve the workflow. I tried to turn a reported failure into support for a recurring format or condition, rather than a patch for one file.

## Checking whether curation was correct

At first, the appearance of `raw.h5ad` or `meta.h5ad` made completion look straightforward. Comparison with manually curated data showed how much lay between producing an object and matching the intended dataset.

I wrote a notebook that intersected GSE accessions between the workflow and a curated reference, then compared the sets of distinct values in each field. For example, did both sides contain the same status labels, rather than merely a column with the same name?

| Saved comparison | Result |
| --- | --- |
| Datasets with comparison results | 15; one additional dataset had a missing result |
| Exact agreement of field-value sets, aggregated by reference-field count | 39.31% |
| Mean of per-dataset agreement rates | 40.75% |

These are **neither per-cell accuracy nor end-to-end success rates**. Where a GSE had multiple reference files, the script selected the one with the highest exact-set agreement. This was exploratory comparison.

Two empty sets also count as agreement. Matching value sets can hide labels assigned to the wrong cells. Different sets can reflect identifier suffixes, vocabulary, or different curation scope. In one inspected pair, both sides contained 34,966 cell identifiers but their identifier sets differed. Matching `sample_ID` sets likewise did not establish correct assignment for every cell.

The comparison was useful for locating discrepancies: missing sources, naming differences, or incorrect relationships. Each needed examination. A more complete-looking table was not necessarily a better dataset.

A separate early accession-extraction run processed 43 rows, found accessions in 31, found none in 12, and recorded no runtime errors. It describes that stage only and is not the same experiment as the metadata comparison.

## Extending omics and recovering long-running tasks

As the RNA path developed, I added ATAC and spatial routes. The shared interface covered tasks, sources, and status; the data still required modality-specific treatment.

| Data | Distinction to preserve |
| --- | --- |
| RNA | Cell/gene correspondence; raw counts versus processed expression |
| ATAC | Peaks or fragments, genome assembly, and barcodes; RNA cleaning cannot simply be reused |
| Spatial transcriptomics | Expression-to-spot coordinate mapping, with missing coordinates recorded |
| Protein, metabolomics, imaging | File collections, sample information, and asset inventories first; quantitative analysis needs specialized tools |

The last group used a collection-first approach. Saving files and their provenance was useful without pretending that renaming an output to h5ad completed the analysis.

Long-running execution became part of the later Nova / Sentinel work: Skills describe stage inputs and outputs, durable state records progress, and retry categories distinguish temporary download failures from unsuitable data. Nova remained a design; Sentinel implemented parts of the queue, workers, retries, and heartbeats. A historical tiny run stopped after stage two failed, so complete unattended operation was not validated.

BioFlow was later used for team data collection and produced a software-copyright outcome. Looking back, the work that required the most judgment was deciding which attachment was a matrix, which files belonged together, which sample owned a metadata row, and when the evidence was insufficient. Making those relationships explicit gave both models and programs a clearer job.

Early scripts are available in [Bio_dataflow](https://github.com/laowangbushilaowang/Bio_dataflow). That repository does not contain all later omics extensions or the Sentinel prototype.
