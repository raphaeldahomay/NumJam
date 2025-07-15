from flask import Flask, render_template
from .auth_routes import auth_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object("config")

    app.secret_key = app.config["SECRET_KEY"]

    from .extensions import db
    db.init_app(app)

    app.register_blueprint(auth_bp)

    # Register Blueprints
    from app.routes.scores import scores_bp
    app.register_blueprint(scores_bp)

    # ✅ Define root route
    @app.route("/")
    def index():
        return render_template("index.html")

    return app