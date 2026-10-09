---
title: "Analysis directories for agents: active work and experiments"
date: "2026-10-09"
updated: "2026-10-09"
language: en
project: codex-workflow
excerpt: "Give each analysis its own version, separate try from active reproduction, and make the current path visible through directories, notebooks, and handoffs."
tags: [Agents, Codex, Analysis, Reproducibility]
draft: false
---

To reproduce a figure, I first need to identify the analysis that produced it. The same model can support a different interpretation after a change in data selection or upstream results. Asking an agent to pick the notebook that looks newest leaves the current line of work uncertain.

My research-workspace convention gives each iteration its own directory. Inputs have recorded sources, figures stay beside the analysis that produced them, and the handoff points to the current task. The arrangement helps distinguish results available for further work from exploratory attempts.

## One directory per analysis version

I call this analysis unit a capsule: a directory containing one version's notebooks, parameters, and results. The abbreviated example below follows my existing conventions. Experiment names are teaching placeholders, not a snapshot of an actual run. Workspaces keep their established `analysis/`, `active_analysis/`, or `active_analysis_reproduce/` roots.

```text
research-project/
├── AGENTS.md
├── README.md                    # Navigation and current-task entry
├── data/                        # Shared raw inputs
├── src/                         # Shared models and stable utilities
├── active_analysis_reproduce/
│   ├── 01_baseline__01_compare__v1_pilot/
│   │   ├── README.md            # Question, inputs, outputs, judgement
│   │   ├── notebooks/
│   │   ├── configs/
│   │   ├── manifests/           # Input sources, versions, parameters
│   │   ├── tables/
│   │   ├── figures/
│   │   └── results/
│   └── 02_validation__01_compare__v2_revised/
│       └── ...                  # The next iteration keeps its records
└── try/                         # Exploratory branch; no reproduction reads
```

Directory names identify the stage, analysis, and version. I check existing stage numbers before adding one. A new iteration preserves earlier models and results. Names such as `final` and `new` say little about what changed; the version description and README explain the difference.

Shared data and model code remain in common locations. A capsule can also contain scripts, logs, and checks when needed. It does not need every possible subdirectory. A figure's directory leads back to its parameters and notebook, although those records still need maintenance: organization alone does not establish successful reproduction.

## Keep exploratory inputs out of active reproduction

`try/` retains exploratory work. For **active reproduction**, I use a stricter dependency rule: a capsule may read shared raw inputs or other active capsules. It must not read any `try/` directory, including through symlinks or indirect paths. Before execution, inspect the resolved input paths and record them in the manifest.

A temporary result could use old selection criteria, come from an incomplete run, or belong to an abandoned approach. Quietly consuming it in the next analysis can leave the reported method out of step with the computation that actually ran.

![Active reproduction reading structure: rules and entry points locate the analysis, declared inputs feed the current capsule, and try is excluded from its dependencies](/images/agent-analysis-path-en.svg)

*Reading relationships drawn from the checked directory rules. Arrows distinguish navigation from data dependencies. This is a schematic, not a run screenshot; the try exclusion applies to active reproduction.*

A useful experiment can inform the next analysis. Bringing it into the reproduction path requires explicit methods, inputs, and parameters in a new, inspectable analysis. Moving a temporary file or changing its name does not establish that it is reliable.

## Make the notebook explain the decisions

Directories tell me where to look. The notebook explains the choices. I require core processing, selection, statistics, and plotting to be visible and editable there. Stable utility functions and training commands can be called from it.

For a data comparison, a notebook can introduce the question and inputs, show the sample distribution before and after filtering, then present metrics and figures. When a metric changes, the reader can return to the selection and parameters to investigate why. This is an organizational example, not an experimental result.

Each important section introduces its purpose and decision criteria. It displays the relevant tables or figures and explains them before continuing. Executed notebooks retain their outputs. I can inspect an agent's choices at the step where they were made and edit that step without first unpacking a script that handles the entire analysis.

## Tell the agent how to resume

AGENTS.md specifies the scope and triggers for these conventions. For example:

- Put new analysis versions in independent capsules. Reuse the existing analysis root and stage numbering.
- Use explicitly permitted inputs for active reproduction; exclude `try/` dependencies.
- Keep core analysis visible in the notebook and retain the outputs of important tables and figures.
- Find the existing entry point and handoff when resuming old work or missing background. Read relevant files as needed for a small change.

The handoff identifies the current version, blocker, next action, and corresponding inputs and results. “Training ended; evaluation pending” preserves two different states.

In AIQuant, I moved detailed notebook and cleanup procedures into dedicated documents and kept pointers in the root instructions. Its historical-input policy and the research reproduction policy remain separate. A try restriction from one project must not silently become a rule for every project.

When handing over a figure, I ask for its capsule and generating notebook alongside it. The next edit starts by checking the inputs and parameters, then deciding which step needs to run again.
