from .modules.auth.routes import auth_bp
app.register_blueprint(auth_bp, url_prefix="/api/auth")

from .modules.diagrams.routes import diagrams_bp
app.register_blueprint(diagrams_bp, url_prefix="/api/diagrams")