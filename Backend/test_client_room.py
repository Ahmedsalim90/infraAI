import socketio

# Create Socket.IO client
sio = socketio.Client()

# Connect event
@sio.event
def connect():
    print("✅ Connected to the Socket Server")

# Disconnect event
@sio.event
def disconnect():
    print("❌ Disconnected from the Socket Server")

# User joined notification
@sio.on("user_joined")
def user_joined(data):
    print(f"🟢 {data['username']} joined project {data['project_id']}")

# Presence update
@sio.on("presence_update")
def presence_update(data):
    print("\n========== ONLINE USERS ==========")
    for user in data["users"]:
        print(f"🟢 {user}")
    print("==================================\n")

# Connect to backend
sio.connect("http://localhost:5000")

username = input("Username: ")
project = input("Project ID: ")

# Join room
sio.emit(
    "join_project",
    {
        "username": username,
        "project_id": project
    }
)

print("\nPress ENTER to disconnect...")
input()

# Leave room
sio.emit(
    "leave_project",
    {
        "username": username,
        "project_id": project
    }
)

sio.disconnect()
