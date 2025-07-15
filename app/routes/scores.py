from flask import Blueprint, jsonify, request, session
from app.models import HighScore
from ..extensions import db
from sqlalchemy import desc

scores_bp = Blueprint('scores', __name__)

@scores_bp.route("/api/high-scores")
def get_high_scores():
    difficulties = ['easy', 'medium', 'hard']
    results = []

    for diff in difficulties:
        for allow_neg in [False, True]:
            top_score = (
                HighScore.query
                .filter_by(difficulty=diff, allow_negatives=allow_neg)
                .order_by(desc(HighScore.score))
                .first()
            )
            results.append({
                "difficulty": diff,
                "negatives": allow_neg,
                "score": top_score.score if top_score else 0
            })

    return jsonify(results)

@scores_bp.route("/api/submit-score", methods=["POST"])
def submit_score():
    user_id = session.get("user_id")

    # ✅ Don't allow guests to save to DB
    if not user_id:
        return jsonify({"status": "guest", "message": "Score not saved (user not logged in)"}), 200

    data = request.get_json()
    difficulty = data.get("difficulty", "easy")
    allow_negatives = data.get("negatives", False)
    score_value = data.get("score", 0)
    avg_spread = data.get("averageResponseTime", 0.0)

    try:
        score = HighScore(
            difficulty=difficulty,
            allow_negatives=allow_negatives,
            score=score_value,
            avgSpread=avg_spread,
            user_id=user_id
        )
        db.session.add(score)
        db.session.commit()
        return jsonify({"status": "success"})
    except Exception as e:
        print("❌ Failed to submit score:", e)
        return jsonify({"status": "error", "message": str(e)}), 500
