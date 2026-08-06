import re

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
)

from models_auth import db, User, Role

auth_bp = Blueprint("auth", __name__)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _default_role() -> Role:
    """Ensure a 'user' role exists and return it, for new signups."""
    role = Role.query.filter_by(name="user").first()
    if role is None:
        role = Role(name="user", description="Default account role")
        db.session.add(role)
        db.session.commit()
    return role


def _make_tokens(user: User):
    additional_claims = {"role": user.role_name, "username": user.username}
    access_token = create_access_token(
        identity=str(user.id), additional_claims=additional_claims
    )
    refresh_token = create_refresh_token(
        identity=str(user.id), additional_claims=additional_claims
    )
    return access_token, refresh_token


@auth_bp.post("/signup")
def signup():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not email or not username or not password:
        return jsonify({"error": "email, username and password are required"}), 400
    if not EMAIL_RE.match(email):
        return jsonify({"error": "invalid email format"}), 400
    if len(password) < 8:
        return jsonify({"error": "password must be at least 8 characters"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "email already registered"}), 409
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "username already taken"}), 409

    user = User(email=email, username=username, role=_default_role())
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    access_token, refresh_token = _make_tokens(user)
    return (
        jsonify(
            {
                "user": user.to_dict(),
                "access_token": access_token,
                "refresh_token": refresh_token,
            }
        ),
        201,
    )


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if user is None or not user.check_password(password):
        return jsonify({"error": "invalid email or password"}), 401
    if not user.is_active:
        return jsonify({"error": "account is disabled"}), 403

    access_token, refresh_token = _make_tokens(user)
    return jsonify(
        {
            "user": user.to_dict(),
            "access_token": access_token,
            "refresh_token": refresh_token,
        }
    )


@auth_bp.get("/me")
@jwt_required()
def me():
    """Sanity-check what a token exposes — returns identity + claims
    straight from the JWT."""
    user_id = get_jwt_identity()
    claims = get_jwt()
    user = db.session.get(User, int(user_id))
    if user is None:
        return jsonify({"error": "user not found"}), 404
    return jsonify({"user": user.to_dict(), "token_claims": claims})