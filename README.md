# MindWell

Prototype full-stack mental-health chatbot demo

This repository contains a minimal prototype app (Express server + static React frontend) that asks PHQ-9 and GAD-7 style questions, computes scores client-side, and stores responses in a JSON file at server/data/responses.json.

## Run the project using the live link:

https://tanya21sh.github.io/MindWell/


## Run the full project locally

From the project root:

1. Go to the server folder:

   cd /workspaces/MindWell/server

2. Install dependencies:

   npm install

3. Start the app:

   npm start

4. Open the app in your browser:

   http://localhost:3000

## Run on a custom port

If port 3000 is already in use, start the app on another port:

   cd /workspaces/MindWell/server
   PORT=4000 npm start

Then open:

   http://localhost:4000

You can replace 4000 with any free port number, for example:

   PORT=8080 npm start
   PORT=9000 npm start

If you want to stop a running server that is holding the port:

   kill <PID>

To find the process using port 3000:

   lsof -nP -iTCP:3000 -sTCP:LISTEN

## Project structure

- client/ — frontend HTML, CSS, and JS
- server/ — Express backend and saved responses storage
- server/data/responses.json — data file the app writes to

## Client-only option

Notes on client-only mode:
- responses are saved only in the current browser
- data is not stored centrally
- a Download data button lets users export responses as JSON and fabricate it into a readable PDF.

## Notes

- This is a prototype for educational/demo purposes only and is not a diagnostic tool.
- A Chatbot which helps to deal with mental stress.
