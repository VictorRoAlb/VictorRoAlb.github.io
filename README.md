# VictorRoAlb Portfolio Website

Static GitHub Pages website for the public portfolio.

## Stack
- static HTML
- CSS
- vanilla JavaScript
- `data/projects.json` as the project source

## Local preview
Any static file server will work. For example:

```bash
python -m http.server 4173
```

Then open `http://localhost:4173`.

## GitHub Pages deployment
1. Create or update the `VictorRoAlb.github.io` repository.
2. Copy the contents of this `website/` folder into the repository root.
3. Commit and push to `main`.
4. Enable GitHub Pages from the `main` branch root if needed.

## Updating the project list
Edit `data/projects.json`. The cards on the homepage are rendered directly from that file.
