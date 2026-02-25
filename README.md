# OfflineChat

Local chatbot interface powered by Qwen2.5:14b.

## Quick Start

```bash
# Navigate to the project directory
cd path/to/Chatbot

# Start the application
./scripts/start.sh

# Or access the application manualy
# Open http://localhost:8080 in your browser
```

## Documentation

For complete setup guide, see [SETUP.md](docs/SETUP.md)

For quick reference commands, see [startup_commands.txt](docs/startup_commands.txt)

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

