---
title: "BioFlow: after the download"
date: "2026-10-09"
updated: "2026-10-10"
language: en
project: single-cell-agent-pipeline
excerpt: "Collecting data for virtual-cell research led me through autonomous agents, constrained workflows, and an unexpectedly important problem: connecting files to samples."
tags: [Data Engineering, Bioinformatics, LLM, Agents]
draft: false
---

A paper lists a dataset accession. Follow it, download the files, and the analysis can begin. Or can it?

Someone still has to identify the expression matrices, distinguish them from sample tables, and work out how the files belong together. Two matrices might represent different samples or parts of the same sample. The identifiers in their filenames still need to connect to tissue, age, and treatment information. A reader can load a matrix successfully without resolving any of this.

I worked on BioFlow at Guangzhou National Laboratory to organize public omics data for a virtual-cell modeling corpus. Much of the work was repetitive: find papers, trace their data sources, download and unpack the files, choose readers, and assemble sample information. Each operation seems manageable in isolation. A new dataset often breaks an assumption that worked for the previous one.

I initially tried giving an agent freedom to write and modify loaders. Later, I narrowed its execution role and arranged the work into fixed stages. This post follows the problems behind that decision: what the model needs to see, how files become samples, and what remains to be done after a matrix has been written.

## Connecting the stages

BioFlow starts with a PubMed search, downloads PDFs, extracts accessions, retrieves the data, and builds datasets with their metadata.

![BioFlow stages and the model's role](/images/bioflow/data-journey-en.svg "Schematic redrawn from the project design and current source. It describes responsibilities, not guaranteed completion for every dataset.")

I kept the outputs of individual stages: paper lists, download status, accession tables, and the resulting data files. That makes it possible to investigate one section without starting over. A failed download belongs with download handling; an unreadable matrix belongs with the files and their loader.

An accession is still only an entry point. A paper may cite several studies, and a matching identifier does not establish that the dataset belongs in this collection. Extraction tries regex first and asks an LLM when no valid match is found. Relevance still needs interpretation.

The harder part begins with the files behind that identifier.

## A dataset is usually more than one file

A common 10X matrix comes as a group: `matrix.mtx.gz` holds values, `features.tsv.gz` identifies the features, and `barcodes.tsv.gz` identifies the barcodes. The reader needs all three. [10x format documentation](https://www.10xgenomics.com/support/software/cell-ranger/latest/analysis/outputs/cr-outputs-mex-matrices)

Here is a simplified teaching example, rather than a directory captured from a particular run:

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

Extensions can locate the two matrices, but they do not tell us how to combine them. The metadata table is also tabular data; it is not another expression matrix. Actual downloads may use filename prefixes for samples, nest files in archives, or supply an existing h5ad instead. Choosing a reader requires these relationships.

My approach was to extract the directory structure, candidate files, and short text excerpts, then give that context to the model. It does not need all the matrix values in its prompt. It needs to choose a reader and identify the files that reader should receive.

![File context, loader selection, and sample mapping](/images/bioflow/file-to-sample-en.svg "Redrawn from the project's probe, planner, sample resolver, and ID mapping code. sample_A/B are teaching examples; selecting files and reconciling sample IDs are separate operations.")

For MTX input, one planned item must contain its matrix, features, and barcodes. Three independent items would lose the grouping required by the reader. I made that relationship explicit in the prompt.

The directory therefore serves two purposes. It gives the model useful context, and it gives me something concrete to inspect if the choice is wrong: which file was omitted, or which metadata table was mistaken for expression data?

## Let the agent write a loader, or let it choose one?

Early on, I tried a broader approach. An agent that can write code should be able to add a reader when an unfamiliar format appears. That would avoid implementing every format in advance.

In practice, hallucinations and unstable edits on heterogeneous inputs made this unsuitable for handling the whole process. A newly written loader might run, but I would still have to check its file selection, matrix orientation, and sample grouping. More freedom also meant more places to investigate a failure.

I moved toward an explicitly orchestrated workflow, in the sense of a LangChain-style arrangement: defined stages, inputs, outputs, and tool responsibilities. The model can interpret file structure and select an existing loader. Programs perform the actual reading, conversion, and writing. If the model-planned route fails to produce the expected output, the outer builder can try deterministic construction.

There is still interpretation to do. Filenames are inconsistent, descriptions are scattered, and useful clues can sit in supplementary files. I narrowed the execution scope so that a judgment leads to a particular tool, with a particular place to investigate it.

This did not solve every format problem. It did make debugging more specific: did the model select the wrong files, or did the existing reader mishandle this input?

## A readable matrix still needs sample identities

After building an h5ad, I need to know which sample each cell belongs to. Comparisons by tissue, time, or treatment depend on that relationship.

The original design document separates datasets, samples, cells, and donors. Keeping only a dataset accession would lose relationships needed later.

![Data relationships in the original BioFlow design](/images/bioflow/sample-relations-original.webp "Original figure extracted from the BioFlow v0.2 design document and compressed as WebP. Chinese labels describe the planned relationships; this is not an accuracy result or proof of a deployed relational database.")

File structure provides clues, but those clues must connect to sample records. BioFlow reads available SDRF or GEO series-matrix mappings and can derive identifiers from source files and directories. A separate LLM operation receives existing sample IDs, cell counts, and source file or directory hints, then returns an old-to-new ID mapping.

This is distinct from choosing a loader. One operation identifies what to read; the other reconciles identifiers after reading. Separating them makes it easier to find where a wrong association entered the data.

The program checks the returned format and parts of the mapping's completeness, falling back to path-derived identifiers on failure. A path-derived ID preserves a source reference, but it is not necessarily a correct biological sample identity. Even an ID shaped like a GSM accession does not establish its donor or condition.

A useful check therefore goes beyond whether an ID was produced. I still need to compare it with source sample tables and check for accidentally merged or split samples. That deserves more attention than polishing the prompt.

## Giving a sample its context

Once samples are identified, the next questions concern age, tissue, disease status, and sequencing method. Some information is in database records; some is in papers, supplementary tables, or filenames. The same concept may appear under several names.

I use the model to extract and match descriptions against a field dictionary. Rules handle what they can first. The LLM fills gaps, and the current write-back logic preserves nonempty values, updating missing values or `Unclassified`. Existing noncanonical descriptions can therefore remain and still need checking.

Text interpretation is useful here, but a plausible value can lack support. A missing age prompts further investigation. An incorrect age might quietly enter a grouping analysis while the plotting code continues to work.

I consequently treat metadata completion and analysis readiness as separate questions. If a field affects the analysis, I want to trace it back to the material supporting it.

Different modalities also reach different stopping points. RNA, ATAC, and spatial data continue along matrix-building paths. Protein, metabolomics, and imaging extensions first collect assets, manifests, and sample information. Their modality-specific quantitative processing remains unfinished; I do not treat every collected file as a ready-to-analyze matrix.

## From a single run to a long-running workflow

After fixing the five stages, I still wanted the agent to handle more scheduling and recovery. Poor success in the early search, download, and extraction stages was also part of why I considered a redesign around Skills.

A Skill can describe how to perform an operation. It does not, by itself, manage that operation's lifecycle. A timed-out download may warrant a retry; an unsuitable dataset should not be retried indefinitely. After a restart, the system must also know what already completed.

The Nova design keeps the existing execution tools and adds a queue, state, and recovery layer. It distinguishes a complete run, an individual task, and each attempt. The later Sentinel prototype implements part of this through SQLite state, workers, retry classification, and heartbeats.

I started by exploring greater autonomy, narrowed execution permissions, and then considered a larger role for the agent in planning and exceptions. The appropriate freedom depends on the operation. Interpreting file relationships needs flexibility; writing outputs, saving state, and deciding retries need explicit rules.

Unattended execution remains incompletely validated. Sentinel's historical small end-to-end sample completed the first stage, failed at the second, and blocked the remaining stages. State and blocking are part of the flow, but this is not yet a complete system I can leave unattended with confidence.

My next step would be a fixed small dataset collection, checking file relationships, sample identities, and metadata sources individually. Before merging two matrices, I want to verify their samples; before filling an age, I want to find its supporting source. I would work through these relationships before expanding the collection further.

The [Bio_dataflow repository](https://github.com/laowangbushilaowang/Bio_dataflow) contains early scripts. It does not include all the later omics extensions or the Sentinel prototype.
