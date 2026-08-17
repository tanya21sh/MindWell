# MindWell

Prototype full-stack mental-health chatbot demo

This repository contains a minimal prototype app (Express server + static React frontend via CDN) that asks PHQ-9 and GAD-7 style questions, computes scores client-side, and stores responses in a JSON file (server/data/responses.json).

Run locally:

1. Install server dependencies:

   cd server
   npm install

2. Start the server:

   npm start

3. Open http://localhost:3000 in a browser.

Notes:
- This is a prototype for educational/demo purposes only and is not a diagnostic tool.
- Responses are stored in server/data/responses.json for demo persistence. If you prefer not to persist responses, the server can be adjusted to skip saving.

A Chatbot which helps to deal with mental stress.
