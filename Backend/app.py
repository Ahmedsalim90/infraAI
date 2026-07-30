from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode="eventlet"
)

project_users = {}
project_versions = {}
user_sessions = {}

@app.route("/")
def home():
    return "InfraAI Socket Server Connected Successfully"


@socketio.on("connect")
def connect():
    print(f"Client Connected : {request.sid}")


@socketio.on("disconnect")
def disconnect():

    if request.sid not in user_sessions:
        return

    user = user_sessions.pop(request.sid)

    username = user["username"]
    project_id = user["project_id"]

    if project_id in project_users:
        if username in project_users[project_id]:
            project_users[project_id].remove(username)

    emit(
        "presence_update",
        {
            "users": project_users.get(project_id, [])
        },
        room=project_id
    )

    print(f"{username} disconnected")


@socketio.on("join_project")
def join_project(data):

    project_id = data["project_id"]
    username = data["username"]

    join_room(project_id)

    user_sessions[request.sid] = {
        "username": username,
        "project_id": project_id
    }

    if project_id not in project_users:
        project_users[project_id] = []

    if username not in project_users[project_id]:
        project_users[project_id].append(username)

    emit(
        "presence_update",
        {
            "users": project_users[project_id]
        },
        room=project_id
    )

    print(f"{username} joined {project_id}")


@socketio.on("leave_project")
def leave_project(data):

    project_id = data["project_id"]
    username = data["username"]

    leave_room(project_id)

    if project_id in project_users:
        if username in project_users[project_id]:
            project_users[project_id].remove(username)

    emit(
        "presence_update",
        {
            "users": project_users.get(project_id, [])
        },
        room=project_id
    )


@socketio.on("design_update")
def design_update(data):

    project_id = data["project_id"]
    version = data["version"]

    current = project_versions.get(project_id, 0)

    if version != current:

        emit(
            "conflict",
            {
                "current_version": current,
                "message": "Version conflict. Please refresh."
            }
        )

        return

    project_versions[project_id] = current + 1

    emit(
        "design_updated",
        {
            "project_id": project_id,
            "design": data["design"],
            "version": current + 1
        },
        room=project_id,
        include_self=False
    )


@socketio.on("design_generated")
def design_generated(data):

    project_id = data["project_id"]

    emit(
        "design_updated",
        data,
        room=project_id
    )


if __name__ == "__main__":
    socketio.run(
        app,
        host=os.getenv("HOST" "0.0.0.0"),
        port=int(os.getenv("PORT", 5000)),
        debug=os.getenv("DEBUG", "TRUE") == "True"
    )