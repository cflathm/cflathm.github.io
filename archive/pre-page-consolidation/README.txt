Site source before the five-page consolidation

This archive keeps the previous src/ tree, configuration, validation script,
and maintenance instructions. The public/ folder here contains the original
hobby tools and bingo cards. Their bytes are verified against the migration
manifest through archived-assets.json.

The site now has six maintained content pages: Home, Work, About, Research,
Tools, and Contact. Publications, funding, and teaching are together on Research.
Both hobby apps have standalone pages linked from Tools. Their originals remain here
as a snapshot; the active wood tile source is in src/tools/wood-tile-studio.html.
Old addresses forward through src/data/legacy-redirects.json; they do not have
individually maintained page templates. Course decks and PDFs remain published
as resources at their existing URLs.

This folder is excluded from the build, type checking, and formatting. It is
not deployed. Restore selected material deliberately if the site structure
changes later; do not copy the whole archive into published output.
