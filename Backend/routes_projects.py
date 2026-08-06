from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models_auth import db, Role
from models import Project, ProjectMember
from decorators import require_role

projects_bp = Blueprint("projects", __name__)


@projects_bp.route("/projects", methods=["GET"])
@jwt_required()
def list_projects():
    """Returns all projects the logged-in user is a member of."""
    user_id = get_jwt_identity()

    memberships = ProjectMember.query.filter_by(user_id=user_id).all()
    projects = [m.project.to_dict() for m in memberships]

    return jsonify(projects), 200


@projects_bp.route("/projects", methods=["POST"])
@jwt_required()
def create_project():
    """Creates a new project. The creator automatically becomes owner."""
    user_id = get_jwt_identity()
    data = request.get_json()

    name = data.get("name")
    if not name:
        return jsonify({"error": "name is required"}), 400

    project = Project(
        name=name,
        description=data.get("description"),
        owner_id=user_id
    )
    db.session.add(project)
    db.session.flush()  # so project.id is available before commit

    owner_role = Role.query.filter_by(name="owner").first()
    if not owner_role:
        return jsonify({"error": "owner role not seeded yet — run seed_roles.py"}), 500

    membership = ProjectMember(
        project_id=project.id,
        user_id=user_id,
        role_id=owner_role.id
    )
    db.session.add(membership)
    db.session.commit()

    return jsonify(project.to_dict()), 201


@projects_bp.route("/projects/<int:project_id>", methods=["GET"])
@require_role("viewer")
def get_project(project_id):
    """Returns a single project's details. Requires at least viewer role."""
    project = Project.query.get_or_404(project_id)
    return jsonify(project.to_dict()), 200


@projects_bp.route("/projects/<int:project_id>", methods=["PUT"])
@require_role("editor")
def update_project(project_id):
    """Updates a project's name/description. Requires at least editor role."""
    project = Project.query.get_or_404(project_id)
    data = request.get_json()

    if "name" in data:
        project.name = data["name"]
    if "description" in data:
        project.description = data["description"]

    db.session.commit()
    return jsonify(project.to_dict()), 200


@projects_bp.route("/projects/<int:project_id>", methods=["DELETE"])
@require_role("owner")
def delete_project(project_id):
    """Deletes a project. Requires owner role."""
    project = Project.query.get_or_404(project_id)
    db.session.delete(project)
    db.session.commit()
    return jsonify({"message": "Project deleted"}), 200