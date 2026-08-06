from flask import Blueprint, request, jsonify
from app.extensions import db
from .models import Diagram

diagrams_bp = Blueprint('diagrams', __name__)

# NOTE: Auth temporarily disabled here for canvas wiring testing.
# Re-enable @jwt_required() once this branch merges with the auth branch.
PLACEHOLDER_OWNER_ID = "demo-owner"

@diagrams_bp.route('', methods=['POST'])
def create_diagram():
    data = request.get_json() or {}

    diagram = Diagram(
        owner_id=PLACEHOLDER_OWNER_ID,
        name=data.get('name', 'Untitled Design'),
        canvas_json=data.get('canvas', {"nodes": [], "edges": []}),
    )
    db.session.add(diagram)
    db.session.commit()

    return jsonify({"message": "Diagram created", "diagram": diagram.to_dict()}), 201


@diagrams_bp.route('/<id>', methods=['GET'])
def get_diagram(id):
    diagram = Diagram.query.get(id)
    if not diagram:
        return jsonify({"error": "Diagram not found"}), 404
    return jsonify({"diagram": diagram.to_dict()}), 200


@diagrams_bp.route('/<id>', methods=['PUT'])
def update_diagram(id):
    diagram = Diagram.query.get(id)
    if not diagram:
        return jsonify({"error": "Diagram not found"}), 404

    data = request.get_json() or {}
    if 'canvas' in data:
        diagram.canvas_json = data['canvas']
    if 'name' in data:
        diagram.name = data['name']

    db.session.commit()
    return jsonify({"message": "Diagram updated", "diagram": diagram.to_dict()}), 200


@diagrams_bp.route('', methods=['GET'])
def list_diagrams():
    diagrams = Diagram.query.filter_by(owner_id=PLACEHOLDER_OWNER_ID).all()
    return jsonify({"diagrams": [d.to_dict() for d in diagrams]}), 200