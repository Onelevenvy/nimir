# Nimir

English | [简体中文](./README.md)

Nimir(Next Integrated Machine Intelligence Resource) is an integrated platform for annotation, training, and inference based on workflow. It provides an intuitive user interface and powerful features that organically connect the entire data processing pipeline through workflows to achieve end-to-end AI application development.

## UI

![alt text](assets/login-nimir.jpg)

![alt text](assets/flow.jpg)

## Features

- 🎯 Versatile Annotation Tools

  - Support for multiple annotation types (rectangle, polygon, etc.)
  - Keyboard shortcuts for improved efficiency
  - Real-time preview and editing capabilities

- 🔄 Workflow-Driven

  - Flexible Workflow Orchestration
    - Support free combination of data collection, annotation, training, inference, and post-processing nodes
    - Configurable serial, parallel, or hybrid execution modes
    - Support conditional logic and data flow between nodes
  - Rich Node Types
    - Data Source Nodes: Support various data acquisition methods
    - Annotation Nodes: Support multiple annotation task types
    - Model Nodes: Support training and inference
    - Processing Nodes: Support result processing and data transformation
  - Visual Workflow Management
    - Drag-and-drop node orchestration
    - Real-time task status monitoring
    - Node execution result visualization

- 🚀 Integrated Solution
  - End-to-end data and model management
  - Support for various data format import/export
  - Compatible with mainstream deep learning frameworks

## Tech Stack

### Frontend

- Next.js 13 (App Router)
- TypeScript
- Chakra UI
- React Query
- Konva.js

### Backend

- FastAPI
- SQLModel
- PostgreSQL
- Sentry

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- PostgreSQL
- Redis

### Installation

1. Clone the repository

   ```bash
   git clone <your-repo-url>
   ```

2. Environment Setup

   2.1 Copy environment configuration file

   ```bash
   cp .env.example .env
   ```

   2.2 Generate Secret Keys

   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

   Copy the output and update the secret keys in your .env file

   2.3 Start Required Services

   ```bash
   cd docker
   docker compose --env-file ../.env up -d
   ```

3. Backend Setup

   3.1 Install Python dependencies

   ```bash
   cd backend
   poetry env use 3.9
   poetry install
   ```

   3.2 Initialize Database

   ```bash
   # Let the DB start
   python app/backend_pre_start.py

   # Run migrations
   alembic upgrade head

   # Create initial data
   python app/initial_data.py
   ```

   3.3 Start Backend Server

   ```bash
   uvicorn app.main:app --reload --log-level debug
   ```

4. Frontend Setup

   4.1 Install dependencies

   ```bash
   cd frontend
   pnpm install
   ```

   4.2 Start development server

   ```bash
   pnpm dev
   ```

   Or build for production:

   ```bash
   pnpm build
   pnpm start
   ```

5. Access the application at `http://localhost:3000`

## Related Projects

- [Flock](https://github.com/Onelevenvy/flock) - A low-code platform for rapidly building chatbots, RAG applications, and coordinating multi-agent teams

## Contributing

Issues and Pull Requests are welcome.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](./LICENSE) file for details.
