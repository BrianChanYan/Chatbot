#!/bin/bash

# Navigate to project root directory
cd "$(dirname "$0")/.."

if ! pgrep -x "ollama" > /dev/null; then
    ollama serve > /dev/null 2>&1 &
    sleep 2
fi

if ! lsof -Pi :8080 -sTCP:LISTEN -t > /dev/null 2>&1; then
    node server/server.js > /dev/null 2>&1 &
    sleep 1
fi

open http://localhost:8080
