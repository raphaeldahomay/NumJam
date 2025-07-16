import os

SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///highscores.db")
SQLALCHEMY_TRACK_MODIFICATIONS = False
SECRET_KEY = "lifeisbeautiful"  # Example secret key, change this in production 