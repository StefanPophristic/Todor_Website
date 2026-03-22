# frozen_string_literal: true

# Builds one page per entry in _data/movies.yml (layout: movie, movieID from YAML).
# Run `bundle exec jekyll serve` / `build` as usual — no separate sync step.
# Remove hand-maintained movies/*.md stubs so URLs are not duplicated.
module Jekyll
  class MoviePageGenerator < Generator
    safe true
    priority :low

    def generate(site)
      movies = site.data["movies"]
      return unless movies.is_a?(Array)

      movies.each do |movie|
        id = movie["movieID"]
        next if id.nil? || id.to_s.strip.empty?

        page = PageWithoutAFile.new(site, site.source, "movies", "#{id}.html")
        page.data.merge!(
          "layout" => "movie",
          "movieID" => id
        )
        page.data["title"] = movie["name"] if movie["name"]
        page.content = ""
        site.pages << page
      end
    end
  end
end
