import socketio
import threading

# Create the client
sio = socketio.Client()

# Connect event
@sio.event
def connect():
    print("✅ Connected to the Socket Server")

# Disconnect event
@sio.event
def disconnect():
    print("❌ Disconnected from the Socket Server")

# Presence updates
@sio.on("presence_update")
def presence_update(data):
    print("\n========== ONLINE USERS ==========")
    print(data["users"])
    print("==================================\n")

# Design updates
@sio.on("design_updated")
def design_updated(data):
    print("\n========== DESIGN UPDATED ==========")
    print(data)
    print("====================================\n")

# Version conflicts
@sio.on("conflict")
def conflict(data):
    print("\n⚠️ VERSION CONFLICT")
    print(data)
    print()

# Connect to server
sio.connect("http://localhost:5000")

username = input("Enter Username: ")
project = input("Enter Project ID: ")

# Join a project
sio.emit(
    "join_project",
    {
        "username": username,
        "project_id": project
    }
)

# Send design updates
def send_updates():
    version = 0

    while True:

        command = input("Type a node name (or 'exit'): ")

        if command.lower() == "exit":
            break

        design = {
            "nodes": [
                {
                    "id": 1,
                    "label": command
                }
            ]
        }

        sio.emit(
            "design_update",
            {
                "project_id": project,
                "version": version,
                "design": design
            }
        )

        version += 1

thread = threading.Thread(target=send_updates)
thread.start()

thread.join()

sio.disconnect()
