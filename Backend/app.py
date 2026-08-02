import eventlet
eventlet.monkey_patch()

import os
from dotenv import load_dotenv
from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room, leave_room
load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-change-later")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")


socketio = SocketIO(app, cors_allowed_origins="*")
#project presence and project designs are still in-memory for now when the redis will be ready we should remember to
#  connect it for now is processing just one local project
project_presence = {}
project_designs = {}


@app.route("/health")
def health():
    return {"status": "ok"}


@socketio.on("connect")
def handle_connect():
    print("Client connected")
    emit("echo", {"message": "connected to InfraAI socket server"})


@socketio.on("test_echo")
def handle_test_echo(data):
    print("Received test_echo:", data)
    emit("echo", {"message": f"echo: {data}"})

@socketio.on("join_project")
def handle_join_project(data):
    project_id = data.get("project_id")
    join_room(project_id)

    if project_id not in project_presence:
        project_presence[project_id] = set()
    project_presence[project_id].add(request.sid)

    print(f"Client {request.sid} joined project room: {project_id}")
    current = project_designs.get(project_id, {"version": 0, "design": {}})
    emit("joined_project", {
        "project_id" : project_id,
        "version": current["version"],
        "design": current["design"]
        })

    emit("presence_update", {
        "project_id": project_id,
        "online_count": len(project_presence[project_id])

    }, to=project_id)

@socketio.on("design_update")
def handle_design_update(data):
    project_id = data.get("project_id")
    client_version = data.get("version")
    new_design = data.get("design")
    print(f"design_update received for {project_id}: client version={client_version}")

    current = project_designs.get(project_id, {"version": 0, "design": {}})
    print(f" current state in project_designs: {current}")

    if client_version != current["version"]:
        print(f"design_update REJECTED for {project_id}: client had v{client_version}, server has v{current['version']}")
        emit("design_conflict", {
            "project_id": project_id,
            "current_version": current ["version"],
            "current_design": current["design"]
        })
        return

    new_version = current["version"] + 1
    project_designs[project_id] = {
        "version": new_version,
        "design": new_design 
    }
    print(f"design_update ACCEPTED for {project_id}: now v{new_version}")

    emit("design_updated", {
         "project_id": project_id,
         "version": new_version,
         "design": new_design
    }, to=project_id)



@socketio.on("disconnect")
def handle_disconnect():
    sid = request.sid
    print(f"Client disconnected: {sid}")
    for project_id, members in list(project_presence.items()):
        if sid in members:
            members.discard(sid)
            print(f"Client {sid} left project room: {project_id}")

            emit("presence_update", {
                "project_id": project_id,
                "online_count": len(members)
            }, to=project_id)

            if len(members) == 0:
                del project_presence[project_id]


if __name__ == "__main__":

    socketio.run(app, debug=True, port=5000, use_reloader=False)