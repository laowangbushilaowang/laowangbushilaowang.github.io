---
title: "BioFlow: organizing research data with an agent"
date: "2026-10-09"
updated: "2026-10-10"
language: en
project: single-cell-agent-pipeline
excerpt: "Three decisions behind BioFlow: how much freedom to give the agent, how downloaded files connect to samples, and how different omics can share a workflow."
tags: [Data Engineering, Bioinformatics, LLM, Agents]
draft: false
---

I worked on BioFlow at Guangzhou National Laboratory to organize public omics data for a virtual-cell modeling corpus. Doing this manually involves finding papers, tracing their data sources, downloading and unpacking files, choosing readers, reconciling samples, and assembling metadata.

I wanted an agent to take over repeated reading and interpretation while keeping data processing dependable. I first tried a more autonomous agent, then moved to a five-stage workflow. Later, Nova and Sentinel explored scheduling and recovery.

This post focuses on three choices:

- **Give the agent freedom to interpret.** The model chooses a reading approach; existing tools perform the reads and writes. Each part can be checked separately.
- **Show the model how files relate.** File trees, sample tables, and source paths are more useful for this task than placing an entire matrix in the context.
- **Choose outputs by data type.** Matrix-ready inputs follow matrix-building paths; assets needing specialized processing first become organized file collections with sample information.

![BioFlow stages and model responsibilities](/images/bioflow/data-journey-en.svg "Redrawn from the project design and source: paper search, PDF download, accession extraction, data construction, and metadata organization.")

## Agent autonomy and workflow design

Early on, I deployed a local model and tried letting the agent write and modify loaders—the programs that read datasets. With so many attachment formats, could it handle an unfamiliar one as it appeared?

Those attempts ran into hallucinations and unstable edits. A program that ran still needed checks: correct files, correct matrix orientation, and correct sample grouping. Debugging meant investigating both the input and newly generated code.

I moved toward explicit orchestration, in the sense of a LangChain-style workflow: defined stages, inputs, outputs, and available tools, with the model handling judgments that are difficult to encode as fixed rules.

| Approach | What the model can do | What I need to inspect |
| --- | --- | --- |
| Earlier autonomous agent | Write or modify a loader for the input | File selection, generated code behavior, and outputs |
| Constrained workflow | Select an existing reader and return a structured plan | The selection and the corresponding tool's output |

I concentrated the model's role at three points:

| Judgment | Context supplied | Program responsibility |
| --- | --- | --- |
| Find data sources | Paper text and accession clues | Check extraction and save identifiers; valid regex matches return first |
| Choose a reader | File tree, candidates, short descriptions | Run an existing loader, convert data, and write outputs |
| Organize metadata | Original fields, source text, controlled vocabulary | Standardize deterministic fields, fill gaps, and save results |

What helped me was being able to inspect interpretation and execution separately. Wrong file selection sends me to the directory summary and plan. A format-specific reading error belongs with its loader. If the model-planned route fails to produce the expected output, the outer builder can try deterministic construction.

### Adding autonomy after fixing the stages

I still wanted longer runs with less manual intervention. Nova and Sentinel explore that direction: keep the processing tools, and add planning, exception handling, and recovery above them.

Skills describe operations. Task state records what completed. Retry rules distinguish a transient download failure from unsuitable data. A failed task should not require repeating every completed stage. These pieces serve the same goal: reduce the work of watching a run and repeatedly handling exceptions.

Nova is a design; Sentinel implements part of the queue, state, worker, and retry logic. Its historical small sample completed stage one, failed at stage two, and blocked later stages. Fully unattended execution remains incompletely validated.

## Using file structure to interpret data and identify samples

Even with the workflow defined, data construction needs interpretation: how should the downloaded files become a dataset?

In a common 10X representation, a matrix, feature table, and barcode table must be read together. Here is a simplified teaching example, not a directory captured from a particular run. [10x format documentation](https://www.10xgenomics.com/support/software/cell-ranger/latest/analysis/outputs/cr-outputs-mex-matrices)

```text
downloaded_dataset/
├── sample_A/
│   ├── matrix.mtx.gz
│   ├── features.tsv.gz
│   └── barcodes.tsv.gz
├── sample_B/
│   ├── matrix.mtx.gz
│   ├── features.tsv.gz
│   └── barcodes.tsv.gz
└── sample_metadata.tsv
```

**The directories reveal two groups of related files.** The three files under sample_A belong together, as do those under sample_B. The metadata table supplies descriptions; it is not a third expression matrix.

Real downloads may use filename prefixes instead of directories, contain nested archives, or mix raw and processed tables. Extensions alone miss some of these relationships. I first extract file structure and text hints, then ask the model for a reading plan: which loader, which files, and how to group them.

![File context, reading plans, and sample identifiers](/images/bioflow/file-to-sample-en.svg "Redrawn from probe, planner, sample-resolution, and ID-mapping code. sample_A/B are teaching examples.")

There are three distinct operations:

1. **Identify the files to read.** For MTX input, each planned item specifies its matrix, features, and barcodes together; a program executes the plan.
2. **Associate the loaded data with samples.** Use available SDRF or GEO series-matrix mappings and source paths. A separate LLM operation receives existing IDs, cell counts, and file hints to propose an old-to-new ID mapping.
3. **Associate samples with study conditions.** Collect tissue, age, treatment, and other fields from database records, papers, and supplements.

The file tree explains how the material is organized. Sample mapping explains what the data belongs to. Both relationships matter before using a combined matrix.

![Data relationships in the original BioFlow design](/images/bioflow/sample-relations-original.webp "Original figure from the BioFlow v0.2 design document, compressed as WebP. Chinese labels separate Dataset, Sample, Cell, and Donor information; this is a relationship design.")

### Checking the model's proposed relationships

The program checks mapping format and parts of its completeness, falling back to path-derived IDs when necessary. Those IDs preserve source hints; even an identifier shaped like a GSM accession does not establish biological sample identity. Source sample tables still need checking for accidental merging or splitting.

Metadata needs similar care. A model can match terminology to a vocabulary and fill missing descriptions. Fields used to group an analysis need supporting source material. Current write-back fills missing values or `Unclassified` while preserving nonempty values, so existing noncanonical values also need inspection.

The useful lesson for me is to **supply concrete context, then check the relationships the model establishes**. Successful file creation or a full metadata table does not establish analysis readiness.

## Extending across omics while preserving their data forms

The initial matrix path handled a portion of the single-cell inputs. Extending to other modalities raised another decision: which steps can be reused, and which outputs need to differ?

RNA can use a cell-by-gene matrix; ATAC can use cells by peaks. Spatial data also needs observations connected to coordinates. Raw protein, metabolomics, and imaging assets often require specialized processing before they yield suitable quantitative measurements. Changing an extension does not perform that processing.

I asked to preserve the existing RNA and ATAC paths while routing by modality:

| Data type | Current processing scope |
| --- | --- |
| RNA / ATAC | Matrix construction, sample organization, and metadata |
| Spatial transcriptomics | Basic matrices and spot coordinates; missing coordinates are recorded |
| Protein / metabolomics / imaging | Asset collection, manifests, and dataset/sample information; quantitative processing remains to be integrated |

Paper discovery, provenance, and task management can be shared while the representations retain their own requirements. Organized files and sample relationships provide a starting point for the appropriate downstream tools.

BioFlow was later used in the team's data collection work. My next priority would be checking a fixed small dataset collection thoroughly: whether the files are grouped correctly, which samples the cells belong to, where grouping fields came from, and whether the flow can recover from failure. I would check those relationships before expanding the collection further.

The [Bio_dataflow repository](https://github.com/laowangbushilaowang/Bio_dataflow) contains early scripts; it does not include all later omics extensions or the Sentinel prototype.
