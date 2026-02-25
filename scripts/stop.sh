#!/bin/bash

if lsof -Pi :8080 -sTCP:LISTEN -t > /dev/null 2>&1; then
    kill $(lsof -t -i:8080) 2>/dev/null
fi

if pgrep -x "ollama" > /dev/null; then
    pkill -x ollama
fi
