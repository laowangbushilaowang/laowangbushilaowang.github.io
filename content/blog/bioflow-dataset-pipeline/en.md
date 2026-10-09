---
title: "BioFlow: collecting and standardizing heterogeneous omics data"
date: "2026-10-09"
updated: "2026-10-09"
language: en
project: single-cell-agent-pipeline
excerpt: "Connecting accessions, downloaded matrices, and sample metadata—with language models for selected judgments and explicit state for long-running work."
tags: [Data Engineering, Bioinformatics, LLM, Agents]
draft: false
---

Loading an expression matrix into Python leaves several questions unanswered. Are the rows cells or genes? Which sample does each barcode belong to? Are tissue, time point, and treatment recorded in filenames, database annotations, or the paper's supplements? Get one of those mappings wrong and the code may run perfectly well while analyzing something different from what you intended.

BioFlow is an omics collection and standardization project I worked on at Guangzhou National Laboratory, initially to prepare a data corpus for virtual-cell modeling. It connects literature search, paper downloads, accession extraction, dataset construction, and metadata processing. Much of the work concerns keeping those sources and mappings connected while reducing the amount of manual format inspection.

Language models help with selected text and format judgments. Python tools perform the downloads, read files, and write outputs. I arrived at this division after trying a more autonomous agent that could write and modify loaders. Hallucinations and incorrect edits made the results unreliable, so I moved toward fixed stages and a choice among existing tools. This post covers accession extraction, format handling, metadata, and the later work on task recovery.

The early scripts are public in [Bio_dataflow](https://github.com/laowangbushilaowang/Bio_dataflow). The post also discusses later omics extensions and the Sentinel prototype; that public repository does not contain every implementation discussed here.

## Intermediate outputs make the five stages inspectable

A paper can refer to several public datasets, and a study can contain many samples. GEO distinguishes `GSE` series records from `GSM` sample records; they identify different levels of the data. [GEO query guide](https://www.ncbi.nlm.nih.gov/geo/info/qqtutorial.html)

BioFlow begins with a PubMed paper list, including titles and DOIs. The downloader records a status for each paper. The extractor reads available PDFs and writes data accessions; the builder uses those accessions to retrieve attachments and construct datasets. Metadata processing follows. Each stage consumes an earlier output and leaves its own files behind.

![The five-stage table from the original BioFlow project report](/images/bioflow/workflow-original.webp "Original table from slide 2 of the project report, exported, cropped, and compressed. It describes stages, classes, and outputs, not results from a new run. Click to enlarge; labels remain in the original Chinese.")

Those files give debugging a starting point. If extraction produces no accession, first check whether the PDF exists and contains extractable text. If construction fails, inspect the downloaded directory and build record. A loader fix does not require repeating the literature search.

They also preserve distinctions between work that never started and work that found nothing. A missing PDF, empty extracted text, and a paper without a usable accession call for different responses. A single final output would hide much of that information from the next run.

## Finding an accession does not establish relevance

GEO and ArrayExpress accessions have recognizable patterns, so regex makes a reasonable first pass. The current extractor checks candidates against the extracted text and known patterns, with additional heuristics for obvious placeholders. If that produces a valid result, it returns immediately. The LLM is called only when that branch finds nothing usable.

This avoids some model calls, but it also means the model does not search for additional accessions once regex has found a set. The implementation does not run two independent extractors and merge their results.

Checking the original text rejects some invented identifiers. It says little about relevance, however. A paper can mention data used for comparison or cite another study. An identifier appearing in the text still needs to be linked to the task and target omics. The current check does not establish that relationship, and there is no labeled evaluation here from which to report precision or recall.

A Step 3 report from November 25, 2025 records 200 input rows: 43 processed, 31 with extracted accessions, 12 without, and 157 skipped. The runtime error count is zero. Its reported 72.1% “success rate” is `31/43`, meaning that processed rows produced accessions. It covers this extraction step alone.

The paired CSV makes the result more specific. All 31 successful rows are labeled `regex`. Nine rows went through the `llm` branch and produced no accession; three are labeled `failed`, also without an accession. This batch does not show that the LLM improved extraction, nor does it establish a 72.1% success rate for the whole pipeline.

There is a small reporting trap in that CSV: an unsuccessful `accession_code` can contain the string `Not found`. Counting nonempty cells would count some failures as successes. The return values, status fields, and metric definition have to agree. A filled spreadsheet is a surprisingly poor substitute for that check.

## The model chooses a loader; code runs it

Downloaded attachments come in several arrangements: a sparse matrix with feature and barcode files, an HDF5 container, or separate archives for individual samples. Choosing a reader often requires filenames, directory relationships, and a little accompanying text.

BioFlow's `probe` collects relative paths, candidate files, and text excerpts. The planner receives those summaries and returns a JSON plan selecting a registered loader and its `items`. The runner dispatches to that implementation. Existing Python code performs the actual reading and conversion; libraries such as AnnData and Scanpy supply their own data structures and analysis functions.

Directory context matters here. A file called `matrix.mtx` gets its meaning from neighboring files, the sample directory, and the accompanying description. The model needs those relationships, not every number in the matrix. Directory enumeration has file-count and depth limits and marks truncation; a relevant attachment can still fall outside the summary.

The planner parses JSON, and the runner only calls loader names it recognizes. That limits the model's tool choices. It does not amount to full plan-schema validation or an operating-system sandbox: the process running the loaders still holds the file-access permissions.

When the selected loader fails to produce the expected file, the outer builder can fall back to deterministic construction if fallback is allowed. The distinction between layers matters. The main path disables the runner's internal fallback-loader chain; the fallback happens in the outer builder. A `fallback` list in a plan is therefore not proof that those loaders were tried.

This arrangement lets format adapters be repaired individually while retaining another construction path. A `raw.h5ad` file on disk still needs checks for matrix orientation, feature duplication, and barcode-to-sample mapping before it can support an analysis.

## Different omics need different outputs

[AnnData](https://anndata.readthedocs.io/en/stable/generated/anndata.AnnData.html) combines an observations-by-features matrix with annotations such as `obs` and `var`. RNA can use genes as features; ATAC commonly uses peaks. Spatial transcriptomics also needs a connection between observations and locations.

Protein, metabolomics, and imaging attachments may not yet have a suitable matrix representation. Raw mass-spectrometry files and microscopy images need their own processing before they become comparable measurements. Changing the extension to `.h5ad` would not do that work.

When adding these omics, I asked to preserve the existing RNA and ATAC paths and let new types enter at an appropriate level. `OmicsProfile` now selects the output root, build mode, and metadata mode. RNA, ATAC, and spatial transcriptomics have separate matrix-building paths. Protein, metabolomics, and imaging use `collection_only`: collect assets, write a manifest, and organize dataset and sample metadata. Their directories are separated as well.

![The two output modes in the original BioFlow project report](/images/bioflow/output-modes-original.webp "Original output-mode table from slide 3 of the project report, exported, cropped, and compressed. H5AD and Collection describe different processing scopes, not universal format support or completed validation.")

The collection path leaves discoverable assets without pretending that quantitative conversion is finished. It does not perform protein or metabolomics quantitative standardization, image segmentation, or image-feature analysis. Spatial support focuses on basic matrices and spot coordinates; that scope should not be expanded into a claim of a complete spatial-image processing system.

## A missing metadata value can be useful

After loading the files, tissue, species, time point, and sequencing method may still be scattered across annotations. Multiple phrases can refer to the same concept. This is a useful place for a model to help interpret text.

The workflow first applies rules and vocabularies to existing fields, then supplies raw metadata and related text to the LLM for missing values. The sample-level write-back function preserves nonempty fields:

```python
for key in LLM_FIELDS:
    if key not in parsed:
        continue
    if row.get(key, "Unclassified") not in [None, "", "Unclassified"]:
        continue
    updated.at[sid, key] = _normalize_field(key, parsed[key])
```

This reduces the opportunities for a model to overwrite existing information. It also means an existing, noncanonical value may survive this pass. If the model call or parsing fails, the code logs the error and retains the missing state.

`Unclassified` tells downstream work that more information is needed. A plausible but unsupported tissue or time point can silently become a grouping variable. Parsing a response and normalizing a term do not establish that the value is true. Before using these filled fields in strict cross-dataset analysis, I would add field-level source tracking and manual sampling rather than optimize the fill rate alone.

## Recovery requires execution state

Once individual stages can be rerun, longer jobs bring another set of questions. Which paper is stuck? Which download deserves another attempt? Who owns the task for an accession? After an interruption, which attempt should resume?

The Nova design separates Run, Task, and Attempt. The later Sentinel prototype implements a SQLite state store, workers, retry classifications, and heartbeats. A Run represents the overall job, a Task a work unit, and an Attempt an individual try. A worker uses a `BEGIN IMMEDIATE` transaction to choose a task whose dependencies have succeeded and mark it as running before invoking its executor. Retries retain their own records.

During this work, I asked to split stages into Skills and have the agent drive a small job from beginning to end. The runtime makes the division clearer: a Skill describes inputs, outputs, and handling instructions. Workers, Python executors, the database, and dependencies still have to perform the work. Five Skill files do not resolve download timeouts, concurrent claims, or interruption recovery by themselves.

Sentinel has not implemented the entire design. The watchdog requeues tasks with stale heartbeats, but heartbeat updates run in a separate thread. A live thread can keep sending them while a subprocess makes no progress. After a requeue, an old worker may also finish late. Completion currently does not verify the new claim identity; attempt or lease checks and safely repeatable output writes are still needed to reject stale results.

Stages four and five currently call the legacy CLI and interpret its exit code. They do not apply a per-accession artifact-quality gate. The reconciler returns queue-status counts rather than comparing database records with files. A `succeeded` status has to be read at the level that wrote it.

The historical `tiny_e2e` run is concrete: stage one succeeded, stage two failed permanently, and stages three through five were blocked for intervention. It did not complete the real-data pipeline. The eight existing unit tests passed during this review, covering some state transitions, error classification, retries, and the circuit breaker. They do not turn that run into an end-to-end success.

I would next use a fixed small dataset to make matrix orientation, sample mapping, and metadata sources explicit acceptance conditions, then add execution timeouts and protection against stale worker completion. When a job stops, that would help distinguish a download retry from a format fix or a return to the source material. Processing more papers automatically is appealing. First, I want “successfully constructed a dataset” to mean something sufficiently specific.
