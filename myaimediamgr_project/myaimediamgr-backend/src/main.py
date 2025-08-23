import os
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory, abort
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

from .models import db
from .routes_generation import bp_gen
from .routes_approval import bp_appr

DIST_DIR = Path(os.environ.get("FRONTEND_DIST", "/app/frontend/dist")).resolve()

app = Flask(__name__, static_folder=str(DIST_DIR), static_url_path="")
app.url_map.strict_slashes = False
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:////app/app.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)
with app.app_context():
    db.create_all()

@app.route("/assets/<path:filename>")
def assets(filename):
    p = DIST_DIR / "assets" / filename
    if not p.exists(): abort(404)
    return send_from_directory(DIST_DIR / "assets", filename)

# (your /api/auth/login and /api/auth/signup go here)

# New blueprints
app.register_blueprint(bp_gen)
app.register_blueprint(bp_appr)

@app.errorhandler(405)
def handle_405(e):
    if request.path.startswith("/api/"):
        return jsonify({"ok": False, "error": "Method Not Allowed"}), 405
    return e

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def spa(path):
    if path.startswith(("api/","assets/")): abort(404)
    return send_from_directory(DIST_DIR, "index.html")
