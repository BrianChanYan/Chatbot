# OfflineChat - Ollama Web Interface

Local chat bot interface, powered by Qwen2.5:14b.

## Quick Start

```bash
# Navigate to the project directory
cd /Users/brian/Desktop/ollama

# Start the application
./scripts/start.sh

# Or access the application manualy
# Open http://localhost:8080 in your browser
```

## Documentation

For complete documentation, see [docs/README.md](docs/README.md)

For quick reference commands, see [docs/startup_commands.txt](docs/startup_commands.txt)

## Project Structure

```
OfflineChat/
├── app/              # Frontend application
├── data/             # Data storage (chats.json)
├── docs/             # Documentation files
├── scripts/          # Utility scripts (start.sh, stop.sh)
├── server/           # Backend server
└── README.md         # This file
```

## Requirements

- Node.js v14+
- Ollama with qwen2.5:14b model

