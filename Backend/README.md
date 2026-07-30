# InfraAI Socket Server

## Overview

This project is the real-time collaboration backend for InfraAI.

It enables multiple users to collaborate on infrastructure diagrams using Flask and Socket.IO.

---

## Features

- Real-time communication
- Project rooms
- User presence tracking
- Live design broadcasting
- AI-generated design updates
- Version conflict detection
- Redis support
- Socket.IO events

---

## Installation

Create a virtual environment:

```bash
python3 -m venv venv
```

Activate it:

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the server:

```bash
python3 app.py
```

---

## Testing

Run a client:

```bash
python3 test_client.py
```

Run room tests:

```bash
python3 test_client_room.py
```

Run conflict tests:

```bash
python3 test_conflicts.py
```

Run AI pipeline:

```bash
python3 ai_pipeline.py
```

---

## Technologies

- Python
- Flask
- Flask-SocketIO
- Redis
- Eventlet
