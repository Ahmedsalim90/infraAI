from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from models import ProjectMember

# Role hierarchy: higher number = more permissions.
# "owner" can do anything an "editor" or "viewer" can, and so on.
ROLE_LEVELS = {
    "viewer": 1,
    "editor": 2,
    "owner": 3
}


def require_role(minimum_role):
    """
    Decorator for Flask routes that enforces project-level permissions.

    Usage:
        @app.route("/projects/<int:project_id>", methods=["DELETE"])
        @require_role("owner")
        def delete_project(project_id):
            ...

    Expects the route to have a `project_id` keyword argument (from the
    URL, e.g. <int:project_id>) so it knows WHICH project to check the
    user's role against.

    Requires a valid JWT (via Flask-JWT-Extended) identifying the user
    making the request.
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user_id = get_jwt_identity()

            project_id = kwargs.get("project_id")
            if project_id is None:
                return jsonify({"error": "require_role: no project_id found in route"}), 500

            membership = ProjectMember.query.filter_by(
                project_id=project_id,
                user_id=user_id
            ).first()

            if not membership:
                return jsonify({"error": "You are not a member of this project"}), 403

            user_level = ROLE_LEVELS.get(membership.role_name, 0)
            required_level = ROLE_LEVELS.get(minimum_role, 999)

            if user_level < required_level:
                return jsonify({
                    "error": f"This action requires '{minimum_role}' role or higher. "
                             f"Your role: '{membership.role_name}'"
                }), 403

            return f(*args, **kwargs)
        return wrapper
    return decorator