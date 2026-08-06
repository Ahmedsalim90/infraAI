from flask import Flask
from flask_socketio import SocketIO
from celery_app import celery

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

if __name__ == '__main__':
    socketio.run(app, debug=True)