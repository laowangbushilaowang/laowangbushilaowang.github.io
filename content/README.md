# Writing for this site

Projects live in `projects.json`; article pairs live in `blog/<slug>/en.md` and `zh.md`.
English URLs remain `/blog/<slug>/`; Chinese editions use `/zh/blog/<slug>/`.
Both editions must be published together, with matching dates, project, and cover.
Keep old flat articles marked `draft: true`; they are excluded from routing.

Frontmatter requires title, excerpt, language, date, updated, project, and tags. A real project cover and its descriptive coverAlt are optional.
Use actual project screenshots, plots, or outputs. Do not manufacture illustrations to reach a figure count. Compress public images and retain private originals.

Figures use `![specific alt](/images/path.svg "Caption explaining the actual image.")`.
Fenced code supports language-aware highlighting. `$...$` and `$$...$$` render with KaTeX.
Only public, sanitized material belongs here. Private source ledgers stay outside this repository.


Titles should name the technical subject and the question the article explains.
First-person authorship belongs in grounded decisions and observations; it does not require an “How I…” title.
Read specific reference articles before editing. Learn how they explain a choice with code, data, or an actual result; do not copy their phrases or force every post into the same structure.
Introduce unfamiliar terms when the explanation needs them. Avoid adding “deep dive”, “complete chain”, or similar promises when the article does not warrant them.
Keep examples distinguishable: real code excerpts retain their scope; abbreviated directory trees are described as abbreviated; hypothetical examples must say so.

Before publishing: edit each language independently, check claims and ownership against source records,
check bilingual factual agreement, and review the prose for generic or mechanical writing.
Run `npm test`, `npm run validate:content`, `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run validate:export`.
Check reading and navigation at phone, tablet, and desktop sizes, including image zoom and language switching.

Lead with the technical idea a reader can use and explain why it works in this project's setting.
Conversation records verify decisions; they should not dictate a chronology of prompts and edits.
Use a real incident when it helps explain the problem. Label hypothetical teaching examples and do not invent autobiographical scenes, dialogue, or emotions.
Read relevant reference posts before each article and record the editorial lessons in the private source ledger.
Before publishing, check that the opening and section headings expose the technical question, then remove process details that do not help answer it.

同日发布多篇时可填写 `publishedAt: "2026-10-09T13:00:43Z"`（UTC ISO时间，与date同一天，中英一致）。列表优先按publishedAt排序；未填沿用date，阅读页仍显示日期。发布排序时间应来自实际发布记录或此次编辑发布时刻，不以文件名、文件修改时间推断。

Choose technical depth for the article's question. Tool-use and workflow posts should explain what I do, the available choices, and when each choice fits. Keep implementation code out unless it answers the main question. Algorithm posts may include code: introduce the problem and intuition first, explain the inputs, variables, outputs, and why the change matters, then connect it to the actual experiment. Do not impose a code quota or a long-form template on every post.

Keep only material that answers the article's question. Each paragraph should contribute a concrete practice, a reason for a choice, a necessary example, or an actual result. Remove repeated setup, author introductions, generic commentary about AI, and empty conclusions. Source research belongs in the private dossier; its volume should not dictate article length.

Cut filler without removing the substance of the work. Reader-facing articles need concrete structures, examples, and reasons for choices, not a word-count target. Write from the actual research, analysis, engineering, and handoff needs; do not add role labels as decorative sections. A requested explanatory structure diagram may be drawn from verified conventions and clearly labelled as a schematic. This does not authorize invented result figures or decorative image quotas.
