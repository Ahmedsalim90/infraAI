from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models_auth import db, Role, User
from models import Project, ProjectMember, Role, Design
from decorators import require_role

projects_bp = Blueprint("projects", __name__)


@projects_bp.route("/projects", methods=["GET"])
@jwt_required()
def list_projects():
    """Lists all projects the current user is a member of, along with their role."""
    user_id = get_jwt_identity()

    memberships = ProjectMember.query.filter_by(user_id=user_id).all()

    projects = []
    for m in memberships:
        project_data = m.project.to_dict()
        project_data["my_role"] = m.role_name
        project_data["member_count"] = ProjectMember.query.filter_by(project_id=m.project_id).count()
        projects.append(project_data)

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
@projects_bp.route("/projects/<int:project_id>/members", methods=["GET"])
@require_role("viewer")
def list_project_members(project_id):
    """Lists everyone on the project and their role. Any member (viewer+) can see this."""
    memberships = ProjectMember.query.filter_by(project_id=project_id).all()
    return jsonify([
        {
            "user_id": m.user_id,
            "email": m.user.email,
            "username": m.user.username,
            "role": m.role_name
        }
        for m in memberships
    ]), 200


@projects_bp.route("/projects/<int:project_id>/members", methods=["POST"])
@require_role("owner")
def add_project_member(project_id):
    """
    Invites a user to the project by email and assigns them a role.
    Only the project owner can do this.
    Body: { "email": "someone@example.com", "role": "editor" }
    """
    data = request.get_json()
    email = data.get("email")
    role_name = data.get("role")

    if not email or not role_name:
        return jsonify({"error": "email and role are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": f"No user found with email {email}"}), 404

    role = Role.query.filter_by(name=role_name).first()
    if not role:
        return jsonify({"error": f"'{role_name}' is not a valid role. Use viewer, editor, or owner"}), 400

    existing = ProjectMember.query.filter_by(project_id=project_id, user_id=user.id).first()
    if existing:
        existing.role_id = role.id
        db.session.commit()
        return jsonify({"message": f"Updated {email}'s role to {role_name}"}), 200

    membership = ProjectMember(project_id=project_id, user_id=user.id, role_id=role.id)
    db.session.add(membership)
    db.session.commit()

    return jsonify({"message": f"Added {email} to the project as {role_name}"}), 201
@projects_bp.route("/projects/<int:project_id>/validate", methods=["POST"])
@require_role("editor")
def toggle_project_validated(project_id):
    """Toggles whether a project is marked as validated / ready to ship."""
    project = Project.query.get(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    project.is_validated = not project.is_validated
    db.session.commit()

    return jsonify(project.to_dict()), 200


@projects_bp.route("/projects/summary", methods=["GET"])
@jwt_required()
def project_summary():
    """
    Real counts for the Projects dashboard cards: how many active
    architectures the user has, how many AI-generated designs exist
    across them, and how many are marked validated.
    """
    user_id = get_jwt_identity()

    memberships = ProjectMember.query.filter_by(user_id=user_id).all()
    project_ids = [m.project_id for m in memberships]

    active_count = len(project_ids)

    ai_generated_count = 0
    validated_count = 0
    if project_ids:
        ai_generated_count = (
            Design.query
            .filter(Design.project_id.in_(project_ids))
            .filter(Design.prompt.isnot(None))
            .count()
        )
        validated_count = (
            Project.query
            .filter(Project.id.in_(project_ids))
            .filter(Project.is_validated.is_(True))
            .count()
        )

    return jsonify({
        "active_architectures": active_count,
        "ai_generated_designs": ai_generated_count,
        "validated_ready": validated_count
    }), 200