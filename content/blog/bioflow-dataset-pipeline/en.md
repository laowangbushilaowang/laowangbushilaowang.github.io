---
title: "BioFlow: from papers to usable datasets"
date: "2026-10-09"
updated: "2026-10-10"
language: en
project: single-cell-agent-pipeline
excerpt: "Finding an accession is the beginning. BioFlow connects paper search, downloads, file readers, and sample metadata—with a smaller role for the language model than I first tried."
tags: [Data Engineering, Bioinformatics, LLM, Agents]
draft: false
---

Some rows in a BioFlow extraction CSV contain `Not found`. The field is called `accession_code`.

That is clearly not an accession. But count nonempty cells and those rows become successes. The CSV has been written, the program has not crashed, and the step can look finished. What is the next stage supposed to download?

I worked on BioFlow at Guangzhou National Laboratory to collect public omics data for virtual-cell modeling. Doing this manually means following a paper to its files, figuring out how to read them, and assembling the sample information. I initially tried giving an agent more freedom to write and modify data loaders. Hallucinations and unreliable edits made that approach unstable. I eventually settled on fixed stages, with the model helping at a few points that require interpretation.

This post follows the data: finding its identifier, reading the downloaded files, and working out what the samples represent. The [Bio_dataflow repository](https://github.com/laowangbushilaowang/Bio_dataflow) contains early scripts. It does not contain all the later omics extensions or the Sentinel prototype discussed here.

## After downloading the paper

A paper can use several public datasets. A database identifier may lead to an entire study rather than an individual sample. GEO, for example, uses `GSE` for series records and `GSM` for sample records. [GEO query guide](https://www.ncbi.nlm.nih.gov/geo/info/qqtutorial.html)

I split the work into five stages: search for papers, download PDFs, extract accessions, download and build datasets, and organize metadata. This is the workflow table from the original project report.

![The five-stage table from the original BioFlow report](/images/bioflow/workflow-original.webp "Slide 2 of the original report: stages and their outputs. Exported, cropped, and compressed. Click to enlarge; the original labels are Chinese.")

Each stage saves its own output. If extraction finds nothing, I can check whether the PDF was downloaded and whether its text could be read. If matrix construction fails, I can inspect the files and the loader. Fixing stage four should not mean searching for all the papers again.

That also requires more than a success/failure flag. Having no PDF and finding no accession in a readable PDF need different responses. One sends me back to the download; the other sends me to the paper or its supplements. The next action depends on what actually happened.

## Try regex before asking a model

Accessions such as `GSE` and `E-MTAB` have recognizable patterns. BioFlow searches the extracted text with regex first, checks that candidates occur in the source and match the expected forms, and filters some obvious placeholders. It asks the LLM only if that produces no valid result.

The two methods do not run independently and merge their answers. A regex match returns immediately, so the model cannot add another set of accessions. That is a tradeoff for making fewer model calls.

A batch from November 25, 2025 makes this concrete. It had 200 input rows: 43 were processed, 31 produced accessions, 12 did not, and 157 were skipped. The report's success rate was `31/43`, or 72.1%.

In the paired CSV, every successful row came from regex. Nine rows used the LLM branch without finding an accession; another three had no accession and were labeled `failed`. This batch provides no evidence of an extraction improvement from the model. The 72.1% also stops at extraction, before downloading or building anything.

An identifier in the paper still needs interpretation. It might refer to comparison data or to another study the authors cite. Checking the source text catches some invented identifiers, but it does not establish whether the dataset belongs in this collection.

## Show the model how the files fit together

Consider an attachment containing a matrix, a feature table, and a barcode table. This is an example of the reading problem: the matrix provides values, the feature table identifies genes or peaks, and the barcodes identify observations. The matrix alone leaves much of its meaning unspecified.

Actual downloads also contain nested archives, per-sample directories, and HDF5 files. Choosing a reader may require the filenames, their relationships, and a little accompanying text. This is where I found a useful role for the model.

BioFlow's `probe` collects a directory summary, candidate files, and short text excerpts. The model returns JSON choosing an existing loader and the files it should read. Python dispatches to that loader through a registry and performs the conversion. The model needs to see how the files relate; it does not need every number in the matrix in its context.

Compared with asking the agent to edit loaders on the fly, this gives me a more specific place to investigate. I can inspect the directory summary, the selected reader, and its inputs. A format problem can be fixed in that reader. If the model-selected path does not create the expected output, the outer builder can also try deterministic construction.

There are still ways to get it wrong. The directory summary can omit an important attachment when its depth or file-count limit is reached. A written `raw.h5ad` still needs checks for orientation, duplicate features, and sample mapping before I would use it in an analysis.

## Different omics need different stopping points

[AnnData](https://anndata.readthedocs.io/en/stable/generated/anndata.AnnData.html) stores an observations-by-features matrix with its annotations. Features can be genes for RNA or peaks for ATAC. Spatial transcriptomics also needs a mapping from observations to coordinates.

Downloaded mass-spectrometry files and microscopy images may need substantial processing before they have that form. Giving them the same extension would not do the work.

When extending BioFlow, I asked to preserve the existing RNA and ATAC paths. RNA, ATAC, and spatial transcriptomics continue through matrix construction. Protein, metabolomics, and imaging first go through file collection, manifests, and dataset/sample metadata. `OmicsProfile` selects the processing mode, and the outputs are separated by omics type.

![The two output modes in the original BioFlow report](/images/bioflow/output-modes-original.webp "Slide 3 of the original report: matrix construction and file collection. Collection organizes files and metadata; quantitative conversion remains unfinished. Click to enlarge.")

This lets me collect the material and record what it contains before adding the relevant analysis tools. The collection mode does not yet perform protein or metabolomics quantitative standardization, image segmentation, or feature extraction. Spatial support currently covers basic matrices and spot coordinates.

## A plausible metadata value can be worse than a missing one

Once the files can be read, I still need to know where the samples came from: tissue, time point, and sequencing method. Those descriptions can be scattered across database fields, filenames, papers, and supplementary tables. Different phrases may describe the same thing, which makes text matching a useful task for the model.

BioFlow applies rules and vocabularies first, then supplies raw metadata and related text to the LLM to fill gaps. The write-back step fills only missing values or `Unclassified`; nonempty fields remain. That reduces overwriting, though an existing noncanonical value may also survive unchanged.

For this pass, I would rather leave `Unclassified`. A gap reminds me to find more material. A plausible time point can quietly become a grouping variable. Imagine comparing stages using a time point filled by the model: even if that value is wrong, the plotting code can still produce a figure. This is an example of the risk, not a reported experimental failure.

The fill rate therefore tells me only part of what I need to know. For strict cross-dataset analysis, I would also want the source behind each filled field and manual spot checks. That source tracking and verification still need more work.

## What happens when the job stops?

Being able to rerun each stage does not make a long job unattended. Should a stalled download be retried? Can another worker claim an accession that is already being processed? Which files can be kept after a crash?

The Nova design separates the overall run, each task, and each attempt. The later Sentinel prototype implements part of this with SQLite state, workers, retry classifications, and heartbeats. A failed attempt can keep its record while another is scheduled. Skills describe how a stage should be handled; programs still execute it and save its state.

The historical `tiny_e2e` sample did not complete the five stages. Stage one succeeded, stage two failed permanently, and stages three through five were blocked. That is the prototype's demonstrated limit here; I cannot describe it as a completed unattended system.

Recovery also needs further work. Heartbeats run in a separate thread, which can remain alive while the actual subprocess is stuck. An old worker can finish late after a task has been requeued. Execution timeouts and checks that a result belongs to the right attempt are still needed.

If I continue this work, I would start with a fixed small set of datasets and check matrix orientation, sample mapping, and metadata sources. For each failed check, I would keep the reason and the relevant files, then decide whether to fix a loader, retry a download, or return to the paper for missing information.
