#!/bin/sh

# Start the backend
cd /app/server
node ./src/database/_migrate.js "database.db"
npm run prod -- --host 0.0.0.0 --port 3000 &

# Start the frontend
cd /app/website
npm run dev -- --host 0.0.0.0 --port 3001 &

# Wait for all background processes to finish
wait