# Christopher Flathmann’s website

Static Astro site for [chrisflathmann.com](https://chrisflathmann.com).
Read [AGENTS.md](AGENTS.md) before changing copy. Christopher’s voice and accurate
attribution are acceptance requirements.

## Six pages to maintain

The top bar contains the six main content pages. The only other pages are the
two standalone hobby apps, linked from Tools. There are no project detail pages,
academic directory pages, or public design previews.

| Page     | Edit here                                                          |
| -------- | ------------------------------------------------------------------ |
| Home     | `src/components/HomePage.astro`                                    |
| Work     | `src/pages/work.astro` — teamwork overview and four research areas |
| About    | `src/pages/about.astro`                                            |
| Research | `src/pages/research.astro` and the record data below               |
| Tools    | `src/pages/tools.astro` — links to the two hobby apps              |
| Contact  | `src/pages/contact.astro`                                          |

The shared navigation is in `src/data/navigation.json`. Validation checks that
all main pages appear there. `src/data/tool-pages.json` lists the two permitted
tool exceptions. The sitemap includes the main pages and those apps.
The 404 is a utility page, not an additional content destination.

## Updating records and resources

- Publications: update `public/CV.pdf`. Research links to the CV rather than
  maintaining another list. The original citations in `src/data/publications.json`
  remain available for reference but are not rendered on the site.
- Funding: `src/data/funding.json`. Preserve complete citations, project totals,
  PI roles, and individual allocations. Collaborative awards are not personal
  revenue. Research renders the summaries and full record from this data.
  Its opening paragraphs describe the research scope and funders. Home shows
  the total awards across grants and gifts; About focuses on contributions.
- Teaching: `src/components/TeachingRecord.astro`. Weekly deck links come from
  `src/data/course-decks.json`. The original presentations stay in `public/hcc3030/`
  as course resources, with their existing URLs.
- Featured findings: `src/data/research-highlights.ts`. These feed Home.
  Keep study findings distinct from design interpretations and link the actual papers.
  The evidence review for Work and About is saved in
  `design/content/research-evidence.json`, outside published output.
- Emails and profile links: `src/data/site.ts`.
- Hobby tools: `src/components/HobbyBingo.astro` and `src/data/bingo.json` for
  DCOM Bingo; `src/tools/wood-tile-studio.html` for the self-contained wood tile
  editor. Each app has its own Astro page at its existing URL. The wood tile
  route renders the original editor as a full document, with a return link to
  Tools and site metadata. Old bingo collection addresses forward to DCOM Bingo.
- Shared layout and styles: `src/layouts/Base.astro`, `src/styles/global.css`,
  and `src/styles/research.css`.

### CV and resume

Replace `public/CV.pdf` for the academic CV and `public/Resume.pdf` for the resume.
They are independent files. Builds never synchronize them. Both are linked on
Home, About, Contact, and in the shared footer.

The short resume supplied by Christopher is installed at `public/Resume.pdf`.
Replace either document independently when it changes.

### Figures

The approved football figures are in `src/assets/figures/playbook/`. Preserve their
geometry and linework unless Christopher requests a specific edit. They are native
SVGs with accessible descriptions; Source Sans 3 and Kalam are hosted locally.

`pnpm figures` exports standalone files to `public/figures/` and writes local
studies in `design/figures/`. Those design documents are not deployed. Earlier
figure options and the approved football baseline remain available there.

## Develop and verify

Use Node 24 (minimum 22.23.4) and pnpm 11.25.0.

```sh
pnpm install
pnpm dev
```

For the production preview:

```sh
pnpm check
pnpm build
pnpm test
pnpm preview
```

The build exports figures, builds the six main pages and two apps, and generates compatibility
redirects. Old page addresses are handled by one map in
`src/data/legacy-redirects.json`; there are no individual legacy page templates.
Those redirects are present in the production preview and published site.

Validation covers the page inventory, navigation, sitemap, redirects, full
academic records, original resource bytes, independent PDFs, internal links,
SVGs, metadata, and removal of consulting branding.

## Archived material

`archive/pre-page-consolidation/` holds a snapshot of the previous source and tools.
Both hobby apps have standalone pages linked from Tools; the original bingo cards and
previous standalone wood tile editor remain in the archive for reference.
The archive is excluded from deployment, type checking, and formatting.
Original tool hashes are still checked, against their archived copies.

The original website before the industry redesign is also preserved by the
`pre-industry-redesign` Git tag. Course presentations, papers, and PDF downloads
remain public resources. Retired catalog addresses forward into Research.

## Launch

Keep `CNAME` at the repository root and `public/CNAME` in the built output. Both
contain `chrisflathmann.com`. Removing the root file can clear the existing
GitHub Pages custom-domain binding during a source migration.

1. Review the current resume and academic CV.
2. Run the checks above and review desktop and phone layouts.
3. In GitHub **Settings → Pages**, select **GitHub Actions** as the build source.
   Keep the existing `chrisflathmann.com` domain and HTTPS configuration.
4. Merge into `master` when ready. The workflow validates and builds before
   deploying `dist/`; pull requests validate without deploying.
5. Confirm the six main pages, both standalone tools, old redirects, course resources, and PDF downloads.
