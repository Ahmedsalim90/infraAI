import socketio
import time

# Connect to the Socket.IO server
sio = socketio.Client()

@sio.event
def connect():
    print("✅ AI Pipeline Connected")

@sio.event
def disconnect():
    print("❌ AI Pipeline Disconnected")


def generate_design():
    """
    Simulates an AI-generated infrastructure diagram.
    """

    return {
        "project_id": "infra123",
        "version": 0,
        "design": {
            "nodes": [
                {
                    "id": "1",
                    "type": "client",
                    "label": "React App"
                },
                {
                    "id": "2",
                    "type": "api",
                    "label": "Flask API"
                },
                {
                    "id": "3",
                    "type": "database",
                    "label": "PostgreSQL"
                }
            ],
            "edges": [
                {
                    "from": "1",
                    "to": "2"
                },
                {
                    "from": "2",
                    "to": "3"
                }
            ]
        }
    }


sio.connect("http://localhost:5000")

while True:

    time.sleep(15)

    design = generate_design()

    print("🚀 AI Generated Diagram")

    sio.emit(
        "design_generated",
        design
    )
