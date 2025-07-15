import { endGame } from "./ui.js";
import { generateProblem, displayProblem } from "./math.js";
import {currentAnswer, op, a} from "./math.js";
import { timer } from "./utils.js";

export let currentDifficulty = "easy";
export let currentAllowNegatives = false;

export function setGameSettings(difficulty, allowNegatives) {
  currentDifficulty = difficulty;
  currentAllowNegatives = allowNegatives;
}

export function average(values) {
  if (values.length === 0) return 0; // avoid divide-by-zero error
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

export function resetGameState() {
  score = 0;
  count = 0;
  previousTime = 60;
  lives = 3;
  lastAnswer = null;
  allSpread = [];
}

export async function submitHighScore(difficulty, allowNegatives, finalScore, avgR) {
  const scoreData = {
    difficulty,
    negatives: allowNegatives,
    score: finalScore,
    averageResponseTime: avgR
  };

  try {
    // 1️⃣ Check if user is logged in
    const sessionRes = await fetch("/api/session-status");
    const sessionData = await sessionRes.json();

    if (sessionData.loggedIn) {
      // ✅ Logged in → send score to backend
      const response = await fetch("/api/submit-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scoreData)
      });

      const result = await response.json();
      console.log("✅ Score submitted to server:", result);

    } else {
      // 🟡 Guest user → store score locally if it's better
      const key = `${difficulty}_${allowNegatives}`;
      const existingScores = JSON.parse(localStorage.getItem("pendingScores") || "{}");

      const existing = existingScores[key];

      if (!existing || finalScore > existing.score) {
        existingScores[key] = scoreData;
        localStorage.setItem("pendingScores", JSON.stringify(existingScores));
        console.log("💾 Guest score saved locally:", scoreData);
      } else {
        console.log("⚠️ Guest score not saved — lower than existing:", finalScore, "<=", existing.score);
      }
    }
  } catch (error) {
    console.error("❌ Error submitting high score:", error);
  }
}

let count = 0;
let previousTime = 60; // Default to 60 seconds
let lastAnswer = null;
export let score = 0;
export let allSpread = []; // Array to store all spread values for calculating average
export let avgSpread = 0; // Average spread of response times
let lives = 3; // Default lives, can be set from the game settings
let previousScore = 0; // To track the previous score for streak bonuses
let scoreGain = 0; // To track the score gain for the current answer


// Function to handle the submission of an answer
export function handleSubmit(difficulty, allowNegatives, liveremains) {
    const userAnswer = Number(document.getElementById("answer-input").value.trim());
    const input = document.getElementById("answer-input");
    const feedback = document.getElementById("feedback");
    const scoreDisplay = document.getElementById("score-display");
    const livesDisplay = document.getElementById("lives-display");
    const numJam = document.getElementById("NumJam");
    const scoreAppeal = document.getElementById("score-appeal");
  
    if (input.value === "") {
      feedback.textContent = "Please enter an answer.";
      feedback.classList.add("text-red");
      return;
    }
  
    if (userAnswer === currentAnswer) {
      count++;
      const spread = previousTime - timer;
      allSpread.push(spread);
        // Calculate score based on spread and liveremains
        // Scoring based on spread and lives
        if (spread < 3 && liveremains === 3) {
            score += 30;
        } else if (spread >= 3 && spread < 6 && liveremains === 3) {
            score += 20;
        } else if (spread >= 6 && liveremains === 3) {
            score += 10;
        } else if (spread < 3 && liveremains === 2) {
            score += 30 * 0.5;
        } else if (spread >= 3 && spread < 6 && liveremains === 2) {
            score += 20 * 0.5;
        } else if (spread >= 6 && liveremains === 2) {
            score += 10 * 0.5;
        } else if (spread < 3 && liveremains === 1) {
            score += 30 * 0.25;
        } else if (spread >= 3 && spread < 6 && liveremains === 1) {
            score += 20 * 0.25;
        } else if (spread >= 6 && liveremains === 1) {
            score += 10 * 0.25;
        }

        // Streak-based bonus
        if (count === 3) score += 30;
        if (count === 6) score += 50;
        if (count === 12) score += 100;

        // Size output bonus
        if (currentAnswer >= 100) {
          score += 10; // Large number bonus
        }
        if (currentAnswer >= 1000) {
          score += 20; // Extra large number bonus
        }
        if (currentAnswer >= 10000) {
          score += 40; // Huge number bonus
        }

        // Size a + op bonus
        const aLength = Math.abs(a).toString().length;

        if (aLength === 2 && (op === '×' || op === '÷')) {
          score += 20; // Two-digit number bonus for multiplication/division
        }
        if (aLength === 3 && (op === '×' || op === '÷')) {
          score += 100; // Three-digit number bonus for multiplication/division
        }
        if (aLength >= 4 && (op === '×' || op === '÷')) {
          score += 500; // Four-digit number bonus for multiplication/division
        }

      if (difficulty === "easy") {
        if (count === 24 && lives === 3) {
          score += 1000; // Bonus for reaching 24 correct answers with full lives
          numJam.classList.remove("hidden");
          numJam.textContent = "Num Jam! (+1000)";
          setTimeout(() => {
            numJam.classList.add("hidden");
          }, 3000);
        }
        if (count === 20 && lives === 3) {
          score += 500; // Bonus for reaching 20 correct answers with full lives
          numJam.classList.remove("hidden");
          numJam.textContent = "Jam! (+500)";
          setTimeout(() => {
            numJam.classList.add("hidden");
          }, 3000);
        }
      }
      if (difficulty === "medium") {
        if (count === 20 && lives === 3) {
          score += 1000; // Bonus for reaching 20 correct answers with full lives
          numJam.classList.remove("hidden");
          numJam.textContent = "Num Jam! (+1000)";
          setTimeout(() => {
            numJam.classList.add("hidden");
          }, 3000);
        }
        if (count === 18 && lives === 3) {
          score += 500; // Bonus for reaching 18 correct answers with full lives
          numJam.classList.remove("hidden");
          numJam.textContent = "Jam! (+500)";
          setTimeout(() => {
            numJam.classList.add("hidden");
          }, 3000);
        }
      }
      if (difficulty === "hard") {
        if (count === 15 && lives === 3) {
          score += 1000; // Bonus for reaching 15 correct answers with full lives
          numJam.classList.remove("hidden");
          numJam.textContent = "Num Jam! (+1000)";
          setTimeout(() => {
            numJam.classList.add("hidden");
          }, 3000);
        }
        if (count === 13 && lives === 3) {
          score += 500; // Bonus for reaching 13 correct answers with full lives
          numJam.classList.remove("hidden");
          numJam.textContent = "Jam! (+500)";
          setTimeout(() => {
            numJam.classList.add("hidden");
          }, 3000);
        }
      }

      scoreGain = score - previousScore; // Calculate score gain for the current answer
      previousTime = timer;
      feedback.textContent = "Correct!";
      feedback.classList.add("text-green");
      scoreDisplay.textContent = `Score: ${score}`;
      scoreAppeal.classList.remove("hidden");
      scoreAppeal.textContent = `+${scoreGain}`;
      setTimeout(() => scoreAppeal.classList.add("hidden"), 1000);
      lastAnswer = currentAnswer;
      previousScore = score; // Update previousScore for next calculation
  
      const newProblem = generateProblem(difficulty, allowNegatives, lastAnswer);
      displayProblem(newProblem);
    } else {
      count = 0;
      lives--;
      livesDisplay.textContent = `Lives: ${lives}`;
      feedback.textContent = `Incorrect. Try again.`;
      feedback.classList.add("text-red");
  
      if (lives <= 0) {
        avgSpread = average(allSpread).toFixed(2); // Calculate average spread of response times
        submitHighScore(difficulty, allowNegatives, score, avgSpread); // Submit score with average response time
        endGame(avgSpread);
      }
    }
}