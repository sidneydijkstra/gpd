#!/bin/bash

# Start the backend
cd /app/server
echo -e "GITHUB_API_KEY=github-key\nGITLAB_API_KEY=gitlab-key" > .env # <-- set keys here
touch ./database.db
node ./src/database/_migrate.js
npm run prod -- --host 0.0.0.0 --port 3000 &

# Start the frontend
cd /app/website
npm run dev -- --host 0.0.0.0 --port 3001 &

# Wait for all background processes to finish
wait