from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app)

    from app.admin.routes import admin_bp
    app.register_blueprint(admin_bp)

    return app