from flask import Blueprint, request, session, jsonify
from .models import User
from .extensions import db

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/api/session-status")
def session_status():
    return jsonify({"loggedIn": bool(session.get("user_id"))})

@auth_bp.route("/api/signup", methods=["POST"])
def api_signup():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if User.query.filter_by(username=username).first():
        return jsonify({"success": False, "message": "Username already exists"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "message": "Email already registered"}), 400

    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    session["user_id"] = user.id
    return jsonify({"success": True})

@auth_bp.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    user = User.query.filter_by(username=username).first()

    if not user:
        user = User.query.filter_by(email=username).first()

    if user and user.check_password(password):
        session["user_id"] = user.id
        return jsonify({"success": True})
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

@auth_bp.route("/api/logout", methods=["POST"])
def api_logout():
    session.pop("user_id", None)
    return jsonify({"success": True})

@auth_bp.route("/api/user")
def api_get_current_user():
    user_id = session.get("user_id")
    if user_id:
        user = User.query.get(user_id)
        return jsonify({"loggedIn": True, "username": user.username})
    return jsonify({"loggedIn": False})
