from flask import Blueprint, jsonify, request
from app.models import get_user, set_user_role

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.route("/users/<int:user_id>/role", methods=["GET"])
def get_user_role(user_id):
    user = get_user(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user_id": user_id, "role": user["role"]}), 200


@admin_bp.route("/users/<int:user_id>/role", methods=["PUT"])
def assign_user_role(user_id):
    data = request.get_json(silent=True) or {}
    new_role = data.get("role")

    if not new_role:
        return jsonify({"error": "Missing 'role' in request body"}), 400

    updated_user, error = set_user_role(user_id, new_role)

    if error == "User not found":
        return jsonify({"error": error}), 404
    if error:
        return jsonify({"error": error}), 400

    return jsonify({"user_id": user_id, "role": updated_user["role"]}), 200