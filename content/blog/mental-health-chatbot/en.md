---
title: "A mental-health chatbot: training models and evaluating answers"
date: "2026-10-11"
updated: "2026-10-11"
language: "en"
project: "mental-health-chatbot"
excerpt: "A counseling QA prototype comparing a Transformer with DialoGPT: data cleaning, classification, fine-tuning, and why fluent responses still need scrutiny."
cover: "/images/chatbot/web-interface.webp"
coverAlt: "Django chatbot input interface"
tags: [NLP, Transformer, DialoGPT, Evaluation, Django]
draft: false
---

For an undergraduate NLP project, I worked on a mental-health question-answering prototype. The project connected a public counseling dataset, a topic classifier, two response-generation approaches, and a Django interface.

One test response explains the difficulty better than the model names do. The user described trouble communicating with a parent who controlled their decisions. DialoGPT opened with condolences about the parent's death, then continued with polished advice.

The sentences sounded considerate. The situation was wrong. That failure gives this project its central question: once a model can produce an answer, how do we decide whether it actually answered the question?

## Building the dataset

The project used Python Requests and BeautifulSoup to collect questions, answers, titles, and topic labels from CounselChat. Those fields served different purposes: titles supported exploratory analysis, labels supported classification, and question–answer pairs supported generation.

The work followed four stages:

1. Collect and clean the question–answer data.
2. Train a bidirectional LSTM to classify question topics.
3. Compare an encoder–decoder Transformer with fine-tuned DialoGPT.
4. Evaluate the responses and expose the model through a web interface.

Classification and generation remained separate evaluation tasks. Recognizing an anxiety-related question does not establish that the response is useful.

![Frequent bigrams in questions and titles](/images/chatbot/question-bigrams.webp)

Pairs of words provide slightly more context than isolated word counts. They helped describe the corpus; they were not assessments of the people asking the questions.

Cleaning left **1,734 question–answer samples**. The filters removed samples containing URLs, words repeated more than three times, and answers shorter than five or longer than 350 words. Classification preprocessing also used lemmatization and stop-word removal. For questions with multiple topics, the first topic became the label.

These choices simplified training but discarded information. A repeated phrase might be scraping noise or part of the question. A single label might omit another relevant topic. Cleaning deserves inspection of the removed examples, not just a count of removed rows. The information needed by a classifier also differs from the information needed to write a response.

## The classifier's 99% was not the result to celebrate

The bidirectional LSTM represented the text using both sequence directions and predicted a topic. The report used a 70/30 training–validation split, a batch size of 128, and 32 epochs.

| Metric | Result |
| --- | ---: |
| Training accuracy | 99% |
| Validation accuracy | 71% |
| Final training loss | 0.01 |

![Training and validation accuracy of the topic classifier](/images/chatbot/classification-accuracy.webp)

Training accuracy kept rising while validation accuracy reached a plateau much earlier. There was a substantial generalization gap. Focusing on 99% would miss the more useful result.

Topic overlap complicates the interpretation: family, relationships, and anxiety can describe the same question. That makes error inspection important, but it does not excuse every incorrect prediction. The figure labels the second curve `test`; the report describes this split as validation, which is the terminology used here.

## Training a Transformer versus fine-tuning DialoGPT

The project compared two routes. One assembled a standard encoder–decoder Transformer, including attention, positional encoding, and masking. The other adapted a pretrained dialogue model to counseling questions.

| Route | Main work | Main constraint |
| --- | --- | --- |
| Encoder–decoder Transformer | Encode the question and generate the response token by token | The small corpus must teach both language patterns and question–answer relationships |
| DialoGPT fine-tuning | Adapt a pretrained GPT-2-based dialogue model | General conversational ability does not ensure understanding of a counseling question |

Positional encoding represents token order. A padding mask excludes filler positions, while the decoder's causal mask prevents training from exposing future answer tokens. These details make the learning task valid; they are not extra architectural inventions.

![Training loss and accuracy of the Transformer response model](/images/chatbot/transformer-training.webp)

This is a generation-model training curve. Its accuracy cannot be compared directly with the topic classifier's accuracy: the prediction targets differ.

The DialoGPT experiment used the **345M-parameter** model with Hugging Face Transformers and PyTorch. The report records 1,145 training examples and Colab V100 / Kaggle T4 environments. That training count is distinct from the 1,734 samples remaining after cleaning. [Original DialoGPT project](https://github.com/microsoft/DialoGPT)

Pretraining reduced the burden of learning language from scratch. It did not resolve the limited coverage of counseling situations. Learning familiar reassurance is easier than responding accurately to a particular person's circumstances.

## What the metrics actually said

First, the project compared generated responses with reference answers using text metrics.

| Automatic metric | Transformer | DialoGPT |
| --- | ---: | ---: |
| BLEU | 0.0452 | 0.0469 |
| ROUGE | 0.0694 | 0.0382 |
| METEOR | 0.0281 | 0.0264 |

DialoGPT scored slightly higher on BLEU and lower on the other two. The recorded evaluation does not support an across-the-board improvement. The exact metric implementations and ROUGE variant are not fully documented, so these values should stay within this project comparison.

A dialogue question can have several reasonable answers with different wording. Conversely, a familiar reassurance can overlap with a reference answer while doing little to address the question. The project therefore added a questionnaire: participants read **20 questions and corresponding responses**, scoring five dimensions from 0 to 10. There were **37 valid submissions**.

| Human rating | Transformer | DialoGPT |
| --- | ---: | ---: |
| Quality | 5.932 | 7.392 |
| Diversity | 4.510 | 5.389 |
| Consistency | 4.107 | 4.736 |
| Fluency | 5.381 | 5.483 |
| Appropriateness | **4.193** | **3.038** |

DialoGPT had higher means on the first four dimensions and a lower mean on appropriateness: whether the response suited the question and audience. These were reader ratings of generated text, not measures of clinical benefit.

The opening example makes the distinction concrete. The Transformer gave a vague reply about expressing sadness or weakness. DialoGPT produced a fuller response but introduced a death that the question never mentioned. More elaborate language did not make the answer more relevant. The example illustrates a failure worth inspecting; it does not establish the cause of the aggregate rating difference.

## What the web demo completed

A Django interface provided a text box and a send button for submitting questions and displaying responses.

![The Django chatbot input interface](/images/chatbot/web-interface.webp)

The interface made the prototype accessible, but it did not improve its understanding. The system also lacked reliable memory of earlier exchanges, limiting its ability to maintain context. A working interface, a readable single response, and a useful ongoing conversation require different checks.

My main lesson from this project is specific: **a falling loss and readable output are not enough. Return to the input and check whether the answer preserves its facts and addresses its actual question.**

The prototype connected data collection, classification, training, fine-tuning, evaluation, and a web demo. Pretraining improved several reader ratings, while appropriateness remained weak. That gap is part of the result, rather than something to hide behind a successful demo.
