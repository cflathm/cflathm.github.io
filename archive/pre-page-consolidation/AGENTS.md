# Website editing instructions

## Voice is an acceptance requirement

Copy must not sound AI-generated. Apply these instructions to page text, project
descriptions, figure captions, metadata, and future edits.

- Use Christopher's explanation below as the voice reference. Keep its directness,
  concern for human relationships, and support for useful AI disruption.
- Write in first person, with concrete subjects, active verbs, and natural sentence
  lengths. Explain what we build, the problem it addresses, and why it matters.
- Remove generic claims and stock language: "unlock potential", "seamless
  integration", "empowering organizations", "at the forefront", and similar copy.
- Avoid repetitive slogans, formulaic three-part sentences, excessive em dashes,
  and polished abstractions that obscure the work.
- Establish seniority through actual responsibilities and evidence, never invented
  titles or executive adjectives. Distinguish personal contributions from team work.
- Do not invent outcomes, deployments, architectures, testimonials, team sizes, or
  publication findings. Christopher leads research and development and has built
  systems hands-on; do not imply he personally implemented every project.
- Read every paragraph aloud when reviewing. Rewrite anything that could describe
  almost any AI researcher. Automated checks do not replace editorial judgment.
- For industry readers, make leadership scope, systems built, and evaluation
  evidence easy to find. Do not add a skills or framework list without verified
  experience, imply production deployments, or turn the site into a consulting offer.
- Label study sizes as study sizes, never as team-management scope. Label grant
  totals as project awards, never as personal allocation or commercial revenue.
- Keep research findings separate from Christopher's interpretation of what they
  mean for system design. Link featured findings to the actual papers.

### Christopher's voice reference (lightly corrected spelling)

AI is becoming a highly disruptive process. It's critical that we disrupt the
processes that need to and should be disrupted. However, a large degree of
human-human collaboration is getting caught in this crossfire. My work shows that
workplace relationships worsen because of AI, knowledge becomes unmanageable, and
teams break down. My research builds AI systems and trains teams to ensure the
preservation and enhancement of these relationships while maintaining the
disruptive transformation of AI.

## Content and maintenance

- Keep the academic record complete and preserve existing course, tool, and PDF URLs.
- Describe collaborative grant totals, PI roles, and personal allocations accurately.
- Keep consulting branding and offers out of published content. The sole permitted
  company-domain reference is the nonacademic email address in the site data.
- CV.pdf and Resume.pdf are independent files. Never synchronize them during builds.
- The three figures explain knowledge networks, proactive cognitive protection,
  and human-human coordination. They are conceptual, not claimed architectures.
- Shared knowledge is collective and cyclical. Show people exchanging experience,
  building understanding, and revising knowledge through use. Do not reduce it
  to a one-way sequence from people to documents.
- The knowledge figure must explain who knows what, when that knowledge is
  needed, and how its shared use forms collective judgement. A generic learning
  cycle or easier retrieval alone does not communicate the work.
- The protection figure must show AI blocking cognitive risks with a clear shield
  or blocking signal. Detection or noticing alone is insufficient. Keep its team
  formation simple and orderly.
- In the selected protection figure, risk routes start below Overload and above
  Manipulation. Both vertical segments share one x position, centered on Overload,
  then approach the AI block as two parallel arrows. Do not combine them into one.
- Keep the selected figures free of footer legends, "Concept sketch" labels,
  footer statements, and captions beneath the figures. In the overview, label
  Risk directly below its cross. Keep accessible SVG titles and descriptions.
- A separate overview figure belongs in the homepage hero. Do not repeat one of
  the three mechanism figures there. Make the concepts recognizable inside each
  figure: people, shared knowledge, cognitive risks, teams, handoffs, and work.
  Keep AI support beside human connections rather than routing every person
  through AI.
- Christopher selected the football playbook set, Option B, for the main homepage.
  Its SVGs and scoped styles live in `src/assets/figures/playbook/`. Keep the
  boards, circled people, formations, blocking marks, and chalk routes. Preserve
  the original football routes, arrowheads, and line weights. Christopher preferred
  that linework over a uniform geometry pass. Make minor, scoped adjustments to
  one or two figures; do not restyle or standardize the whole set.
  The untouched football baseline is saved in `design/figures/playbook-approved/`.
- Preserve the earlier Option A sources in `src/assets/figures/`, including its
  approved overview and coordination drawings. A saved copy is in
  `design/figures/option-a/`; do not overwrite it while refining the selected set.
  The comparison page and `/figure-originals.html` keep that option available.
- Keep recognizable people and work objects within the sports metaphor. Field
  markings must not obscure the concepts. Conceptual clarity takes priority.
- The overview must show what AI does between people. Label its support for
  sharing knowledge, blocking cognitive risk, and coordinating handoffs.
  A generic AI badge pointing at shared work is not enough.
- The selected boards use warm chalk for human routes, blue for AI support, coral
  for cognitive risks, and amber for coaching notes. Keep readable contrast on
  the green boards within the page's light surfaces and navy hero. Labels must explain the meaning
  without relying on color or a caption. Human icons must look like people.
  Use Source Sans 3 for readable labels and Kalam sparingly for annotations.
  Both fonts are hosted locally and embedded in standalone SVG exports; keep
  their licenses with those exports.
- Keep figures as native SVG diagrams. Do not use AI-generated raster artwork
  or hide a bitmap inside an SVG wrapper. Review the SVG design study before
  integrating a new figure into the site.
- Keep JavaScript optional for primary navigation and reading content. Respect
  reduced motion, keyboard access, readable contrast, and accessible SVG descriptions.
- Run `pnpm check`, `pnpm build`, and `pnpm test` after substantive changes.
