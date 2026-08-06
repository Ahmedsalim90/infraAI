from flask import Flask
import os
from dotenv import load_dotenv
from .extensions import db, jwt, socketio, CORS

load_dotenv()

def create_app():
    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///infra_design_app.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "jwt-secret")

    CORS(app)
    db.init_app(app)
    jwt.init_app(app)
    socketio.init_app(app)

    # REGISTER AUTH BLUEPRINT HERE
    from .modules.auth.routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    # Create DB Tables
    with app.app_context():
        db.create_all()

    @app.route("/health", methods=["GET"])
    def health():
        return {"status": "OK", "service": "Infrastructure Design API"}, 200

    return app