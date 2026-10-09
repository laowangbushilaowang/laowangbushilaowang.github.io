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
