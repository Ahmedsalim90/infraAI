from flask import Blueprint, request, jsonify, Response
from decorators import require_role
from tasks import generate_design_task
from models import Design, Project
from doc_generator import generate_design_doc
from models_auth import db
from validate_design import validate_design

ai_bp = Blueprint("ai", __name__)


@ai_bp.route("/projects/<int:project_id>/generate", methods=["POST"])
@require_role("editor")
def generate_project_design(project_id):
    """
    Kicks off AI design generation for a project in the background.
    Returns immediately with a task_id — the actual design arrives
    later over the socket as a 'design_generated' event, in that
    project's room.

    Body: { "prompt": "a simple web app with a database" }
    """
    data = request.get_json(silent=True) or {}
    prompt = (data.get("prompt") or "").strip()

    if not prompt:
        return jsonify({"error": "prompt is required"}), 400

    task = generate_design_task.delay(project_id, prompt)

    return jsonify({
        "message": "Design generation started",
        "task_id": task.id,
        "project_id": project_id
    }), 202


@ai_bp.route("/projects/<int:project_id>/doc/download", methods=["GET"])
@require_role("viewer")
def download_project_doc(project_id):
    """
    Generates and downloads a markdown documentation file for the most
    recently generated design on this project.
    """
    project = Project.query.get(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    latest_design = (
        Design.query
        .filter_by(project_id=project_id)
        .order_by(Design.version.desc())
        .first()
    )
    if not latest_design:
        return jsonify({"error": "No design has been generated for this project yet"}), 404

    markdown_text = generate_design_doc(
        project_name=project.name,
        prompt=latest_design.prompt,
        design=latest_design.design_json,
        version=latest_design.version
    )

    safe_name = "".join(c if c.isalnum() or c in "-_" else "_" for c in project.name)
    filename = f"{safe_name}-architecture-v{latest_design.version}.md"

    return Response(
        markdown_text,
        mimetype="text/markdown",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@ai_bp.route("/projects/<int:project_id>/design", methods=["POST"])
@require_role("editor")
def save_project_design(project_id):
    """
    Manually saves a design for a project — used by Import, where the
    person uploads an existing design rather than generating one via AI.
    Creates a new version, same pattern as AI generation.
    Body: { "design": {"nodes": [...], "edges": [...]} }
    """
    data = request.get_json(silent=True) or {}
    design = data.get("design")

    if not design or "nodes" not in design or "edges" not in design:
        return jsonify({"error": "design with 'nodes' and 'edges' is required"}), 400

    try:
        validate_design(design)
    except Exception as e:
        return jsonify({"error": f"Invalid design: {e}"}), 400

    last = (
        Design.query
        .filter_by(project_id=project_id)
        .order_by(Design.version.desc())
        .first()
    )
    next_version = (last.version + 1) if last else 1

    new_design = Design(
        project_id=project_id,
        version=next_version,
        prompt=None,
        design_json=design
    )
    db.session.add(new_design)
    db.session.commit()

    return jsonify(new_design.to_dict()), 201


@ai_bp.route("/projects/<int:project_id>/design/latest", methods=["GET"])
@require_role("viewer")
def get_latest_design(project_id):
    """Returns the most recently saved design for a project — used by Export."""
    latest = (
        Design.query
        .filter_by(project_id=project_id)
        .order_by(Design.version.desc())
        .first()
    )
    if not latest:
        return jsonify({"error": "No design has been generated for this project yet"}), 404

    return jsonify(latest.to_dict()), 200