from .extensions import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class HighScore(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    difficulty = db.Column(db.String(10), nullable=False)  # 'easy', 'medium', 'hard'
    allow_negatives = db.Column(db.Boolean, nullable=False)
    score = db.Column(db.Integer, nullable=False)
    avgSpread = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.now())
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

    user = db.relationship('User', backref='scores')
