# Christopher Flathmann's website

Static Astro site for [chrisflathmann.com](https://chrisflathmann.com).
Read [AGENTS.md](AGENTS.md) before changing any copy. Christopher's voice and
accurate attribution are requirements, not optional polish.

## Develop and verify

Use Node 24 (minimum 22.23.4) and pnpm 11.25.0.

```sh
pnpm install
pnpm dev
```

Open the local address printed by Astro. To inspect the exact production output:

```sh
pnpm check
pnpm build
pnpm test
pnpm preview
```

The verification command checks preserved URLs and assets, the complete migrated
academic records, internal links and fragments, PDF integrity, original figures,
and removal of consulting references. Browser review is still needed for layout,
keyboard access, and natural-sounding copy.

## Update content

- Project overviews: `src/content/projects/`. The number controls ordering;
  the anchor is a public link and should remain stable.
- Publications: `src/data/publications.json`. Keep the complete citation in
  `citationHtml` and its matching plain text in `text` for search. Use `year`
  for the year filter, retaining in-press/undated status where appropriate.
- Funding: `src/data/funding.json`. Update the full citation, structured fields,
  and summary totals together. Distinguish total project awards from personal
  allocation. Development/writing support is not a PI award.
- Course deck directory: `src/data/course-decks.json`. Standalone presentations
  remain in `public/hcc3030/` at their original URLs.
- Emails and profile links: `src/data/site.ts`.
- Featured study summaries: `src/data/research-highlights.ts`. Keep study findings
  separate from design interpretations, preserve first-author/co-author attribution,
  and verify any study size against the linked paper.
- Shared presentation: `src/layouts/Base.astro`, `src/styles/global.css`, and
  `src/components/`. The SVG figures are conceptual illustrations.
- Homepage content is shared in `src/components/HomePage.astro`. `src/pages/index.astro`
  renders the selected football playbook figures (Option B). `figure-originals.astro`
  keeps the earlier Option A available in the same homepage layout.
- Figure geometry and styles: `src/assets/figures/`. Keep the figures as native
  SVG diagrams. `pnpm figures` exports standalone SVGs to `public/figures/` and
  creates a study of the selected figures in `design/figures/preview.html`. Builds refresh
  the standalone exports automatically. Edit the sources rather than the exports.
  There are four concept sketches: `overview.svg` for the homepage hero, then
  `knowledge.svg`, `protection.svg`, and `coordination.svg` for the three mechanisms.
  People, knowledge artifacts, cognitive risks, and shared work are labeled
  inside the figures. Keep the overview distinct from the mechanism figures.
  The selected drawings use green coach's boards, warm chalk routes, blue AI
  support, coral risk marks, and amber coaching notes. Circled people and team
  formations keep the concepts visible within the football metaphor. Preserve
  the original football linework; prefer small fixes to individual figures over
  a uniform geometry pass. Its baseline is in `design/figures/playbook-approved/`.
  Source Sans 3 labels and Kalam notes
  are hosted locally and embedded in standalone SVGs, with licenses in `public/figures/`.
- Figure options: `/figure-options.html` compares A and B; `/playbook-preview.html`
  retains the B preview address, while `/figure-originals.html` shows A. These
  design routes are excluded from the sitemap and marked `noindex`. Option A is
  also saved in `design/figures/option-a/`. The main homepage uses B without a
  preview banner. Selected B sources and scoped CSS are in `src/assets/figures/playbook/`; its exports
  are in `public/figures/playbook/`. `pnpm figures` also writes the local design
  comparison to `design/figures/compare.html`.
- Original hobby tools and downloadable resources remain in `public/`.

The migration manifest protects existing presentation and tool assets against
accidental changes. If you intentionally edit one, update its SHA-256 entry in
`scripts/legacy-manifest.json` after reviewing the change. New assets can simply
be added. The CV and resume are exempt from these archival hash checks.

### Academic CV and resume

Replace `public/CV.pdf` to update the full academic CV. Replace `public/Resume.pdf`
to update the industry resume. These files are independent: builds never copy one
over the other. Both links open their PDF directly.

**The initial Resume.pdf is a one-time copy of the academic CV, as requested.**
Replace it with the dedicated resume at launch. The verification script allows
the two documents to differ and only checks that both remain valid PDFs.

## Launch

1. Replace the temporary `public/Resume.pdf` with the dedicated resume when ready.
2. Review project descriptions, contact details, academic records, and both PDFs.
3. Run the checks above and review the local production preview on desktop and phone.
4. In the GitHub repository's **Settings → Pages**, select **GitHub Actions** as
   the build source. Keep the existing custom domain, `chrisflathmann.com`, and
   HTTPS setting. Existing domain DNS does not need to change.
5. Merge the implementation branch into `master`. The workflow checks and builds
   the site before publishing `dist/` to GitHub Pages. Pull requests build and
   validate without deploying. A workflow dispatch on `master` can also deploy.
6. Confirm the custom domain, course links, tools, and PDF links on the live site.

The original site is preserved by the `pre-industry-redesign` Git tag. The archive
is not copied into the published site. Existing HTML, course, tool, and PDF URLs
are retained; `oldindex.html` forwards to the new homepage.

To roll back after launch, revert the redesign merge on `master` and restore the
previous branch-based Pages configuration if returning to the original raw HTML
site. The archived revision can be inspected with `git show pre-industry-redesign`.

## Industry positioning: research behind the iteration

Reviewed October 27, 2026. These are reference descriptions, not a list of roles
Christopher is applying to or a promise that a particular opening remains active.

- [Anthropic: Research Manager, Interpretability (expression of interest)](https://job-boards.greenhouse.io/anthropic/jobs/4980436008)
  emphasizes technical understanding, research planning and execution, people
  development, and coordination across teams. The site now brings documented
  leadership and funded-program scope closer to the introduction. It does not
  infer hiring, performance-management, or commercial P&L experience.
- [NVIDIA: Senior Research Scientist, Human-AI Perception and Interaction](https://nvidia.wd5.myworkdayjobs.com/en-US/NVIDIAExternalCareerSite/job/Senior-Research-Scientist--Human-AI-Perception-and-Interaction_JR2020674)
  emphasizes prototypes, evaluation, collaboration with engineers, demonstrations,
  and a public portfolio. Project overviews now identify the system built and link
  to related research. Featured studies link directly to existing full papers.
- [Microsoft Research: fellowship research challenges](https://www.microsoft.com/en-us/research/academic-program/microsoft-research-fellowship/research-challenges/)
  explicitly includes AI teamwork, organizational knowledge work, coordination,
  group-level evaluation, and socially intelligent agents. This supports keeping
  Christopher's organizational and human-human focus specific and visible.
- [Siân Lindley: Senior Principal Research Manager, Microsoft Research](https://www.microsoft.com/en-us/research/people/sianl/)
  provides a relevant example of senior research positioning that connects human-AI
  collaboration, knowledge workflows, methods, and tools.

The editorial inference is to show research direction, systems built, and evidence
of evaluation together. Employer descriptions are not evidence of Christopher's
skills; claims about him still come only from his supplied information and papers.

The next useful portfolio material would be a shareable project demo, verified
project outcomes, and project-specific leadership scope. Add those when available;
do not fill the gaps with invented deployment claims, a guessed technology stack,
or assumed business results. The current research summaries describe experiments,
not commercial deployments.
