from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from decorators import require_role
from models_auth import db
from models import Comment, Project

comments_bp = Blueprint("comments", __name__)


@comments_bp.route("/projects/<int:project_id>/comments", methods=["GET"])
@require_role("viewer")
def list_comments(project_id):
    """Returns the full comment feed for a project, oldest first."""
    comments = (
        Comment.query
        .filter_by(project_id=project_id)
        .order_by(Comment.created_at.asc())
        .all()
    )
    return jsonify([c.to_dict() for c in comments]), 200


@comments_bp.route("/projects/<int:project_id>/comments", methods=["POST"])
@require_role("viewer")
def post_comment(project_id):
    """
    Posts a new comment and pushes it live to everyone currently viewing
    the project via the socket, in addition to saving it.
    Body: { "content": "some message" }
    """
    project = Project.query.get(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    data = request.get_json(silent=True) or {}
    content = (data.get("content") or "").strip()
    if not content:
        return jsonify({"error": "content is required"}), 400

    user_id = get_jwt_identity()

    comment = Comment(project_id=project_id, user_id=user_id, content=content)
    db.session.add(comment)
    db.session.commit()

    comment_data = comment.to_dict()

   
    from app import socketio
    socketio.emit("comment_added", comment_data, room=str(project_id))

    return jsonify(comment_data), 201