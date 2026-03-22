# Publishing (GitHub Pages) — movie pages must build with plugins

Movie pages are created at build time by **`_plugins/movie_page_generator.rb`**.  
GitHub’s **default** “Jekyll” build runs in **safe mode** and **does not run** custom plugins, so **`/movies/*.html` files are never produced** → **404** for every movie link.

## Fix: deploy with GitHub Actions (full `jekyll build`)

1. In the repo on GitHub: **Settings → Pages → Build and deployment**
2. Under **Source**, choose **GitHub Actions** (not “Deploy from a branch”).
3. After each push to **`main`** or **`master`**, open the **Actions** tab and confirm **“Deploy Jekyll site to Pages”** completes successfully (green check).
4. Wait a minute for the site to update, then hard-refresh the live site.

The workflow file is **`.github/workflows/jekyll.yml`**. It runs `bundle exec jekyll build` so **`_plugins/` runs** and movie pages exist in `_site/movies/`.

### If your default branch has another name

Edit `.github/workflows/jekyll.yml` and add your branch under `on.push.branches`, for example:

```yaml
on:
  push:
    branches: ["main", "master", "your-branch-name"]
```

### If the workflow fails (e.g. Bundler exit 16)

Run locally, commit the updated lockfile, and push:

```bash
bundle install
bundle lock --add-platform x86_64-linux   # if needed for CI
git add Gemfile.lock && git commit -m "Update lockfile for CI" && git push
```

### Project site (`username.github.io/repo-name/`)

In **`_config.yml`**, set (example):

```yaml
baseurl: "/Todor_Website"   # leading slash, no trailing slash
url: "https://yourusername.github.io"
```

Then use the **`relative_url`** filter for links (the home layout already uses it for movie links if updated). Rebuild via Actions after changing `baseurl`.

### Quick local check

```bash
bundle exec jekyll build
ls _site/movies/*.html
```

You should see one HTML file per `movieID` in `_data/movies.yml`.
