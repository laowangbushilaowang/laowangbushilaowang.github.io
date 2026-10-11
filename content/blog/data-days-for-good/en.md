---
title: "Data Days: a survey report people can keep questioning"
date: "2026-10-11"
updated: "2026-10-11"
language: "en"
project: "data-days-for-good"
excerpt: "Turning a student-experience survey into an R Shiny report in four days: cleaning comments, comparing groups, choosing denominators, and reading two survey waves together."
cover: "/images/data-days/interactive-report.webp"
coverAlt: "Question and demographic controls in the Data Days R Shiny report"
tags: [R Shiny, Survey analysis, NLP, Data product]
draft: false
---

“Students are generally satisfied with their departments” can be a conclusion. Ask about international students, first-generation students, or a particular major, and the overall chart no longer answers the question.

In spring 2024, I joined Boston University's Data Days for Good collaboration with MassMutual. During the four-day project, we analyzed undergraduate experiences in technology-related majors for the BU DEI Tech Collective: instructional support, belonging, departmental climate, and discrimination. We also compared the survey with its 2022 predecessor. Our deliverable was an **R Shiny interactive report**, with controls for questions, demographic groups, and side-by-side survey years.

My focus was cleaning free-text comments, grouping them as positive, neutral, or negative, and extracting frequent words within those groups. I also participated in visualization and product delivery. What interests me about the project is how the two kinds of survey material work together: selections locate a difference; comments help explain what students are talking about.

## A useful deliverable in four days

The survey covered computer science, mathematics and statistics, data science, information systems, and computer engineering. The client wanted to understand experiences across backgrounds and identify areas to investigate or improve. [BU's account of the project](https://www.bu.edu/cds-faculty/2024/04/08/data-science-massmutual-mentorship/) describes the collaboration and deliverable.

A slide deck would require another round of filtering and plotting whenever someone asked a new question. We organized the product around three entry points:

| Page | What a reader does there |
| --- | --- |
| Welcome | Understand the survey and learn how to read the graphs |
| Survey Report | Read the analysis, sample descriptions, and findings |
| Build-a-Graph | Choose a question and group to investigate further |

The report gives a first-time reader context; the interactive page serves someone with a specific question. Shiny connects R analysis and plots to web controls, making it a practical way to deliver an exploratory tool within a short project.

![The report's actual filtering interface](/images/data-days/interactive-report.webp)

*The application with “I feel stressed due to academic workload” selected and responses grouped by Gender. The complete output appears below.*

The relationship between the workstreams was:

```text
Survey responses
├─ Selected answers → valid responses, groups, years → counts / proportions
└─ Free text → cleaning → sentiment groups → frequent words and comment reading
                                              ↓
                       Written interpretation + self-service exploration
```

This summarizes the work rather than reproducing application source code. Text analysis complements selected answers; sentiment scores do not replace what respondents chose.

## Which responses enter the analysis?

The 2024 survey received 1,088 responses. The application's completion rule excluded records with `progress rate ≤ 2`, leaving 895. The 2022 report lists 632 responses.

| Scope | Responses |
| --- | --- |
| 2022 report total | 632 |
| 2024 original responses | 1,088 |
| 2024 after the low-completion filter | 895 |

Questions were optional, and some course questions appeared only for relevant majors. **895 is therefore not the denominator for every chart.** A skipped question does not automatically mean dissatisfaction or the absence of a problem.

The survey used a prize draw to encourage participation. The report notes that some respondents submitted after completing little of it. Filtering addresses low-completion records, but it does not make the remaining respondents representative of all students. Participation was voluntary.

For any comparison, we still need to ask who answered this question, which routing conditions applied, and how much support each group has.

## Read comments within their sentiment groups

Selected answers compress an experience into predefined options. Free text can contain details those options miss. I cleaned comments, separated positive, neutral, and negative responses, and extracted frequent words within each group to support word clouds and the reading of experience themes.

Why group first? If “course” is frequent overall, it tells us that courses get discussed. It might occur in praise or complaints. Separating the contexts makes that distinction easier to investigate. “Course” here illustrates the method; it is not a claimed finding from a project word cloud.

Three relationships matter when interpreting this kind of text processing:

1. **Noise should not become frequency.** Repeated text needs review, but identical short comments from separate students may still be independent feedback.
2. **Negation changes meaning.** Cleaning both `helpful` and `not helpful` down to `helpful` reverses one response.
3. **A word is not a theme.** A student can praise a professor and criticize course scheduling in the same sentence. Frequent words help locate comments; context supplies the meaning.

A large word in a cloud is frequent under the chosen counting method. It is not necessarily the most serious issue. Rare experiences may also deserve attention.

I see sentiment grouping primarily as a way to narrow the reading task. It cannot explain every complex experience or turn each comment into a correct recommendation. Returning to the original text is what tells us what someone is praising or criticizing.

## Counts and proportions: divided by what?

The report provides both counts and proportions. Counts tell us how many respondents chose an answer. A proportion depends on whether the denominator includes all respondents to the question or only those in a particular group.

The welcome page uses a useful example about experiencing discrimination or disrespectful or inappropriate behavior:

![Counts and within-group proportions in the welcome-page example](/images/data-days/count-and-proportion.webp)

*For “No,” the Female category has 110 responses, approximately 64% within the group; Male has 195, approximately 83%. This is one question's example, rather than a population-wide estimate.*

The larger male count partly reflects different participation sizes. Within-group percentages make response distributions easier to compare. A small category in the same image has one respondent and a 100% label: arithmetically valid, but weak support for a general conclusion.

There is also a discrepancy in the current interactive output. Here is the academic-workload question grouped by Gender:

![Actual 2022 and 2024 academic-stress output](/images/data-days/academic-stress.webp)

*Counts and percentages by survey year. The current percentages use a different denominator from the welcome-page within-group example.*

For “Strongly agree” in 2022, the chart labels 104 Female responses as 22%, and 117 Male responses as 24%. Adding the displayed counts gives 478 responses overall, which agrees with those rounded percentages. If we instead ask what share of each group strongly agreed, the comparison changes:

| Group | Strongly agree | Group responses to this question | Share of all 478 | Within-group share |
| --- | --- | --- | --- | --- |
| Female | 104 | 192 | About 22% | About 54% |
| Male | 117 | 265 | About 24% | About 44% |

These are calculations from the displayed counts, including “Prefer not to say,” rather than a rerun of the underlying data. The instructions describe within-group proportions, but this current output does not match that description. The code-level cause remains to be checked.

**The same counts answer different questions when the denominator changes.** A share of all respondents describes composition; a within-group share compares response tendencies. This is more consequential than the choice of bar colors, and it is an issue the product still needs to reconcile.

## Two survey waves are not automatically comparable

The application presents 2022 and 2024 side by side. These are not repeated observations of the same students, and the questionnaires were not identical. The 2024 survey also added identity and background dimensions.

Before interpreting a change, question wording, response options, and group definitions need checking. Removing an option or regrouping joint majors can change a distribution. More responses do not by themselves indicate better experiences.

Comparable questions and groups can identify changes worth discussing. When meaning or response structure differs, the comparison needs that explanation. Placing two plots next to each other is only the beginning.

## Make room for the next question

The report describes broadly favorable responses alongside differences after demographic breakdowns. Departmental social climate, feeling a need to work harder to be equally valued, and discrimination experiences all offer questions to investigate by background. It also describes more unfavorable experiences among some historically excluded groups. An overall average should not end that discussion.

The delivery makes those questions accessible beyond a single presentation. Readers can start with the analysis, then choose their own question; comment analysis adds another route into the experiences behind selected answers.

Four days did not validate every group difference or establish that a recommendation changed university policy. The concrete result is a shared interactive report, with my work focused on comment processing and sentiment grouping. It makes follow-up questions easier, while leaving denominator choices, cross-year definitions, and agreement between instructions and output to be checked carefully.

[Open the original interactive report](https://jun8.shinyapps.io/dd4g-bu-tech-majors-survey/) and choose a question. Before interpreting an eye-catching percentage, check the count beside it and ask what it was divided by.
