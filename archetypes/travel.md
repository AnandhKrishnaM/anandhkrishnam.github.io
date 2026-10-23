---
title: "{{ replace (path.Base .File.Dir) "-" " " | title }}"
date: {{ .Date }}
description: ""             # one line, shown on the travel page
place: ""                   # e.g. "Potsdam, Germany" — shown under the title
dates: ""                   # e.g. "May – August 2024" (free text)
lat: 0                      # coordinates for the map (decimal degrees; city level is enough)
lon: 0
cover: ""                   # file name of the cover photo in this folder; first photo if empty
# Photo captions and order (optional). Photos not listed appear after these, by file name.
photos: []
  # - src: "photo-01.jpg"
  #   caption: "…"
draft: true
---

