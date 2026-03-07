# CLAUDE.md — Donut Academy Project

## What is this?
Donut Academy is the educational content arm of Donut (AI-native crypto trading infrastructure). 
This site publishes deep, technical articles about AI trading, D0 product methodology, and frontier research.

## Your task
Read TASK.md and execute everything in it. This includes:
1. Setting up an Astro project
2. Migrating the design system from index.html  
3. Writing 3 substantial articles
4. Pushing to git

## Writing style
Your articles should read like the best technical long-form content on X/Twitter:
- **Roan (@RohOnChain)**: Takes MIT's 20-hour Financial Mathematics course and maps every concept to Polymarket trading. 8 numbered phases, formulas inline, practical "here's why this matters for YOUR portfolio" framing.
- **sysls (@systematicls)**: Distills agentic engineering experience into principles. Opinionated, personal ("I've tried everything, here's what actually works"), structured around clear numbered rules.

Common traits to emulate:
- Strong opening hook (not "In this article we will discuss...")
- Numbered phases/sections with bold headers
- Formulas and code in context (not dumped in appendix)
- Personal voice ("I", "here's what I found", "this changed how I think about...")  
- Practical mapping of every concept to a real use case
- Clear takeaway at the end
- Long-form (2000-4000 words) — depth over brevity
- Data-dense: cite specific numbers, percentages, study results

## Design system
Dark theme. Brand purple (#ACAAFF). Gold (#FFE098). No rounded corners. No gradients.
See index.html for the full CSS design system — migrate it faithfully.

## Git / PR workflow
- **Do NOT push directly to `main`**. Work must go through a GitHub PR for Ru7 + Fei review.
- Follow TASK.md Step 3 for branch name + PR title.
- Do **NOT** commit `node_modules/` (add `.gitignore`).
- Commit message: `feat: initialize Astro project + first 3 articles`

When completely finished, run this command to notify:
openclaw system event --text "Done: Donut Academy Astro project initialized with 3 articles" --mode now
