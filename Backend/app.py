import eventlet
eventlet.monkey_patch()

import os
from dotenv import load_dotenv
from flask import Flask
from flask_socketio import SocketIO, emit
load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-change-later")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# message_queue=REDIS_URL is what lets SocketIO broadcast across multiple
# server processes later (e.g. when deployed with gunicorn workers).
# Locally with one process it also just works normally.
socketio = SocketIO(app, cors_allowed_origins="*")


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


@socketio.on("disconnect")
def handle_disconnect():
    print("Client disconnected")


if __name__ == "__main__":
    # eventlet is what lets this handle many concurrent socket connections
    socketio.run(app, debug=True, port=5000)