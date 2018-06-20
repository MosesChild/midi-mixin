# Readme

## Notes
Current build seems to work but needs testing...

## Build Log
### 6/19/2018
- Initialized repository and created a github origin "midi-mixin"

```Linux
$ git init
git remote add origin https://github.com/MosesChild/midi-mixin.git
```

* added midi.js
* created readme.md

Investigated VS-Code Notification "Could not load 'markdown.styles'.
Copied github-markdown.css to workspace root (audio-components). Also setup in settings, but on success found the effect to be strange. Commenting out the 

```json
//"markdown.styles": ["./github-markdown.css"],
```

in **user.settings** seemd to be the best option for now.  Not sure what these were meant to over-ride.