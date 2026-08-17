# MindWell

Prototype full-stack mental-health chatbot demo

This repository contains a minimal prototype app (Express server + static React frontend via CDN) that asks PHQ-9 and GAD-7 style questions, computes scores client-side, and stores responses in a JSON file (server/data/responses.json).

Run locally (server present):

1. Install server dependencies (only if you wish to run the server):

   cd server
   npm install

2. Start the server:

   npm start

3. Open http://localhost:3000 in a browser.

Client-only (publish to GitHub Pages — fully free):

The app can run entirely in the browser (no server) and store responses in the user's browser localStorage. To publish the frontend on GitHub Pages using the repo's "docs/" folder (free):

1. Copy the client files into the docs/ folder (already added in this repo).
2. Commit and push to GitHub (already done in the feature branch). If not present:

   git add docs
   git commit -m "Add docs site for GitHub Pages"
   git push

3. In your GitHub repository settings > Pages, set the source to "main branch /docs folder" and save. The site will be published at https://<your-username>.github.io/<repo-name>/.

Notes on the client-only mode:
- Responses are saved only in the user's browser (localStorage) — not sent to any server. This is fully free and preserves privacy but data is only available on that device/browser.
- A "Download data" button is provided so users can export their saved responses as JSON and share or backup them manually.
- If you need central storage (server), that requires hosting and may incur costs.

Notes:
- This is a prototype for educational/demo purposes only and is not a diagnostic tool.

A Chatbot which helps to deal with mental stress.
