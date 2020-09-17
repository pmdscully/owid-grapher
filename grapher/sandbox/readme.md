# Grapher Sandbox

The Grapher Sandbox provides a minimal HTML/JS environment for debugging and prototyping Graphers.

Use it:

1. When you want to try code changes against a production grapher without syncing the production database.
2. When you want to share an interactive demo of a new Grapher feature with the team without deploying a full branch.

## How to load a production grapher against your local branch

1. Copy the JSON for the grapher from the Debug textarea in the bottom of the Admin->Revisions panel
2. Paste the JSON into `sandbox/grapher.js`. Prefix the JSON with `const sandboxGrapher =`. You can also see the example `grapher.sample.js`.
3. Open `sandbox/index.html`
4. Ensure webpack is running
