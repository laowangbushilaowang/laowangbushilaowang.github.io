---
title: "Building a PhD advisor screening agent"
date: "2026-10-16"
updated: "2026-10-16"
language: "en"
project: "phd-advisor-screening"
excerpt: "A personal tool that grew from a notebook into a directory-based research workflow. Finding relevant professors was only part of the problem; I also needed to know who was missing."
tags: [Agents, Python, Web Research, Skills]
draft: false
---

After finding a few promising PhD supervisors, I kept running into a harder question: who had I missed?

My interests span machine learning, robotics, medical imaging, and algorithms for single-cell and spatial data. Relevant researchers can sit in computer science, mechanical engineering, biomedical engineering, or a separate data science institute. A search for a university name and “machine learning professor” returns names, but gives little indication of which parts of the university it skipped.

In February 2026, I started building PhDInfo with Codex. The initial brief was straightforward: take a university, research interests, my CV and website; find professors; read their pages; assess research fit and recruitment information; export a table and prepare email drafts.

The questions that drove the revisions were more awkward. Why were there only nine professors? Had the tool actually opened their personal pages? Why did an obviously relevant researcher receive a weak score?

The project gradually became a workflow for working through university directories, keeping information together by person, and continuing across sessions.

## Start with the university’s structure

The first version was a Python package with a Jupyter Notebook as its entry point. I supplied the parameters in a cell. Separate modules discovered faculty pages, parsed profile links, called a local Ollama model, and produced a DataFrame, HTML, and JSON.

That was a convenient way to experiment. I could change schools, interests, or thresholds and inspect the results immediately. A finished notebook run, however, said very little about coverage.

I initially supplied default department names: CS, ECE, mechanical engineering, biomedical engineering, and so on. These work as search terms, but universities do not share a single organizational chart. Computing and data science might form a separate faculty; robotics might belong to mechanical engineering or a cross-disciplinary institute.

I therefore asked for a university-specific unit plan before looking for individual professors.

One fallback turned out to be misleading. When discovery failed, the program could populate the plan with the default subject keywords. Rows such as `artificial intelligence` and `bioinformatics` looked reassuringly broad, yet sometimes had no unit URL. They were search seeds, rather than evidence that the corresponding university units had been found.

I began treating the following as separate tasks:

| Question | Main source | Where the model helps |
|---|---|---|
| Which units actually exist? | Official academic navigation and directories | Organize the hierarchy and recognize unfamiliar names |
| Which deserve further inspection? | Unit descriptions and research areas | Explain their connection to my interests |
| Who belongs to each unit? | Official faculty or people lists | Parse pages and investigate missing links |

Search engines remained useful for locating entry points and personal sites. The university’s own directory provided a more concrete boundary for the roster.

## Recognize the same person across departments

Cross-disciplinary coverage creates duplicates.

In one BU run, Mark Crovella appeared through computer science, bioinformatics, systems engineering, and other units. Name order and title suffixes varied. Those affiliations were useful to retain, but research assessment needed to refer to the same person.

The saved results did not handle this consistently:

| Unit attached to the record | Match score | Homepage note |
|---|---:|---|
| Computer Science | 0.85 | Homepage verified |
| Systems Engineering | 0.56 | Verifiable personal homepage missing |
| Bioinformatics, Intercollegiate Program | 0.85 | Homepage verified |

These are excerpts from the same saved batch. The scores reflected inconsistent information across records: one entry had a fuller description, while another still received a missing-homepage penalty. I had also challenged the evaluation directly, pointing out the relevance of his data-mining and network research.

Changing the threshold would not fix this. The useful change was to consolidate identity while preserving multiple affiliations, and associate the research summary and homepage information with that identity. Otherwise, a larger table could contain more contradictions.

In the later HKUST(GZ) workflow, an official-directory identity field served as the internal deduplication key. Target units and titles were preserved when merging cross-appointments. A person listed in both units counted once in the final roster.

## What I need from a personal page

The faculty list finds the person. Their personal or lab page helps answer more specific questions: what are they working on, are they taking students, and for which degree and intake?

The early analyzer asked the model for a research summary, a `yes / no / uncertain` recruitment assessment, and supporting text. That was useful, but the prompt could not compensate for the wrong input. If it received only a department introduction, a fluent answer still would not describe the professor’s own page.

I later required separate records for the official profile and the personal or lab site. The reading task had three parts:

1. **Research problems and methods.** Medical multimodal learning, graph learning, or data quality are more informative than the word “AI.”
2. **Recruitment wording.** PhD, MPhil, and RA openings are different. So are an active call, a generic invitation to make contact, and an explicit closure.
3. **Dates.** The intake, deadline, and age of the announcement affect what the wording means.

`Uncertain` is a useful result here. Silence does not establish that someone is unavailable, and an old welcome message does not establish that they have space in the current cycle. The column describes what the page supports, with questions left for further checking.

![Advisor screening workflow](/images/phd-screening/workflow.svg)

*A schematic of the project’s division of work. Directories define the roster; individual pages supply details. Research fit and recruitment are assessed separately before review and draft preparation.*

## Scores help order the reading

The prototype had two matching paths. With embeddings available, it used a normalized cosine similarity between descriptions. Otherwise, it combined keyword coverage with an LLM assessment, weighted 65% and 35% respectively.

This was easy to implement and had clear limitations. A professor applying graph learning to medical data might never use the exact phrase in my keyword list. An embedding could reward the broad fact that both descriptions concern machine learning. Neither path produced a calibrated admission probability, and their numerical scales were not established as interchangeable.

The later specialized version separated research-problem fit, method fit, recruitment assessment, and source quality. Rules supplied initial scores, with page-based revisions recorded in the curation data.

The explanation mattered more to me than a small decimal difference: **which piece of work connects to my experience, and why is it worth reading further?** “This professor works in AI and strongly matches the applicant” remains equally plausible after swapping in another name. It does little to guide the next step.

Research fit also stayed separate from availability. A close research match with uncertain recruitment should retain that uncertainty, rather than acquire a `yes` merely to qualify for a shortlist.

## Continue from a saved position

Reading units, faculty lists, and personal pages takes longer than a single conversation. At first, I asked the agent to proceed step by step and request confirmation between stages. That left me typing `yes` repeatedly. Automatic continuation then raised a different question: what should the next session resume?

I asked the project to draw on Anthropic’s [article about long-running agent harnesses](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents). The practical part was to leave the current task, completed records, and next entry point in files, so a new session would not need the entire browsing history.

The main run artifacts were:

```text
run/
├── coverage_audit.csv           # Progress and gaps by unit
├── professors.csv              # People and profile entry points
├── professor_evaluation.csv    # Research fit, intake, and reasons
├── step_queue.csv              # Stages and dependencies
├── step_results.csv            # Batch results and continuation notes
└── progress_summary.md         # A quick summary for me
```

The next session could read the queue and load the rows it needed. An inaccessible page retained its status and missing information; an unfinished unit retained its position. Scheduled invocations also needed protection against overlapping runs and browser processes left by an earlier session. I added locking, heartbeats, and cleanup to address those scheduling problems. They did not guarantee that a website would load.

The saved BU progress is a useful example. Of 57 discovered units, 22 were marked complete, 33 pending, one in progress, and one blocked. There were already 1,424 professor records and 15 email drafts.

**That was a substantial table inside an unfinished task.** Records included cross-listed people, and some homepage assessments and scores still needed review. Row count could not stand in for unit coverage; draft count could not stand in for messages sent.

## A more explicit scope for the next university

For the July 2026 HKUST(GZ) run, I defined the scope as research professors in the AI and Data Science and Analytics thrusts. The official directory made that boundary checkable. Visiting, adjunct, practice, and emeritus titles were excluded from this particular roster.

| Roster scope | Saved count |
|---|---:|
| AI thrust | 35 |
| DSA thrust | 34 |
| Listed in both | 4 |
| Merged roster | 65 |

35 + 34 − 4 = 65. Once that boundary and overlap were explicit, I could check for an evaluation per person, unresolved homepages, and uncertain recruitment evidence.

The saved table had evaluation rows for all 65 people, alongside 11 homepage exceptions. Those facts need to be read together. Automatically assigned `visited` or `completed` fields also do not, by themselves, establish that the relevant page content was read.

This is how the tool became useful to me: it brought directories, individual pages, and unresolved questions into one place that I could read through. Drafts came last, after inspecting the actual research. A more concrete finish condition emerged too: within the chosen scope, who is missing, whose page needs another look, and which matching explanations hold up when I follow the links?
