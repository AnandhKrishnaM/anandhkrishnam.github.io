# anandhkrishnam.github.io

Personal site for notes, lectures and essays on mathematics, physics and philosophy.
Built with [Hugo](https://gohugo.io), written in Markdown that Obsidian also understands,
math typeset by MathJax, and hosted on GitHub Pages.

It merges the earlier attempts: the Jekyll site's pages, diagrams and CV; Atlas's
theorem environments, margin notes and ⌘K search; and the portfolio's timeline.

---

## 1 · Run it locally

One-time setup on macOS:

```bash
sudo xcodebuild -license accept     # unblocks git & Homebrew (asks for your password)
brew install hugo
```

Then, from this folder:

```bash
./site serve
```

This opens **http://localhost:1313**. Every save reloads the page instantly. Drafts are
shown, marked in red. The **Writing guide** (footer link, local only) demonstrates every
feature.

`./site preview` shows exactly what will be published (no drafts) on port 1314.

## 2 · Write

| To…                                  | Run                                                     |
|--------------------------------------|---------------------------------------------------------|
| write a note                         | `./site new note physics "Kerr–Schild form"`            |
| write an essay / thought             | `./site new thought "On rigour" philosophy`             |
| start a lecture series               | `./site new series "Spin geometry" mathematics physics` |
| add a lecture to a series            | `./site new lecture spin-geometry "Clifford algebras"`  |
| add a new subject (biology, music …) | `./site new subject "Biology" "β"`                      |
| bring in an Obsidian note + images   | `./site import "path/to/Note.md" physics`               |
| …into a lecture series               | `./site import "path/to/Note.md" lectures/spin-geometry` |
| see what's still a draft             | `./site drafts`                                         |
| add a trip / place                     | `./site new trip "Lisbon" "Lisbon, Portugal"`            |
| add photos to it (GPS stripped)       | `./site photos lisbon ~/Pictures/Lisbon/*.jpg`          |
| update the /now page                  | `./site now`                                            |

New pages start with `draft: true`. Delete that line to publish.

**What you can write in Markdown** (full reference in `content/guide.md`):

- `$…$`, `$$…$$`, `\begin{equation}…\label{eq:x}\end{equation}`, `\eqref{eq:x}`, plus macros in `hugo.toml`
- Obsidian callouts as theorem environments: `> [!theorem] Name {#thm:x}`, `> [!proof]-`, `> [!definition]` …
  numbered automatically; `[](#thm:x)` becomes "Theorem 3"
- `^[inline notes]` and `[^1]` footnotes go in the margin
- `[[Wikilinks]]`, `[[Page|alias]]`, `![[image.png]]`; "Linked from" backlinks are automatic
- `{{< cite "dhr2019" >}}` with `data/references.yaml`
- ` ```mermaid ` and ` ```tikz ` diagrams, `{{< diagram type="penrose" >}}`, `{{< pdf src="notes.pdf" >}}`
- lecture front matter: `pdf`, `slides`, `video`, `repo`, `links`

### Writing in Obsidian

You can open `content/` as an Obsidian vault and write there directly: callouts, math and
wikilinks render the same on the site. Set Obsidian's attachment folder to
`../static/attachments` so pasted images land where the site looks for them.

## 3 · Customise

| What                                         | Where                                          |
|----------------------------------------------|------------------------------------------------|
| name, position, photo, PDF CV, links, menus, home-page blocks | `hugo.toml` (`[params.author]`, `[params.home]`) |
| look (`academic` or `colourful`), palette (`academic`, `atlas`, `spacetime`, `tufte`), fonts, single colours | `hugo.toml` → `look`, `palette`, `[params.fonts]`, `[params.colors]` |
| the academic typography & restraint rules  | `assets/css/academic.css`                     |
| features on/off (sidenotes, toc, backlinks, cite box, search, comments) | `hugo.toml` → `[params]` |
| CV, projects, open questions, reading list, equations of the day | `data/*.yaml` |
| callout kinds, labels, numbering             | `data/callouts.yaml`                           |
| subject descriptions, colours, symbols       | `content/subjects/<name>/_index.md`            |
| any style                                    | `assets/css/custom.css` (loads last)           |
| extra `<head>` / `<body>` code               | `layouts/_partials/hooks/`                     |
| page structure                               | `layouts/` (plain Hugo templates)              |

## 4 · Publish to GitHub Pages

1. Create a **public** repository named exactly `AnandhKrishnaM.github.io` on GitHub.
   If one already exists (e.g. from the Jekyll site), either reuse it — this replaces its
   contents — or rename the old one first.
2. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. From this folder:

   ```bash
   git init -b main
   git add -A
   git commit -m "New site"
   git remote add origin https://github.com/AnandhKrishnaM/AnandhKrishnaM.github.io.git
   git push -u origin main
   ```

4. The workflow in `.github/workflows/deploy.yml` builds and deploys. After a minute or two the site is
   live at **https://anandhkrishnam.github.io**.

After that, publishing is just `./site publish "what changed"` (commit + push).

**Keep Hugo versions in step.** The workflow pins `HUGO_VERSION`. If `hugo version`
locally is newer, bump the number in `deploy.yml`.

## Layout

```
hugo.toml               site settings — start here
content/                everything you write
  notes/<subject>/        notes, filed by subject automatically
  lectures/<series>/      one folder per series: _index.md + a file per lecture
  thoughts/               essays
  subjects/<name>/        description, colour and symbol of each subject
  _index.md (home bio)  cv.md  research.md  resources.md  guide.md
data/                   CV, projects, reading, references, callouts, equations
static/attachments/     images & PDFs (Obsidian embeds look here)
assets/css, assets/js   styles and behaviour (no build tools needed)
layouts/                templates
archetypes/             templates for new pages
site                    the helper command
```
