import { startCountdown } from "./utils.js";
import { generateProblem } from './math.js';
import { displayProblem } from './math.js';
import { stopCountdown, resetTimer } from "./utils.js";
import { currentDifficulty, currentAllowNegatives, score, setGameSettings, resetGameState} from './scoring.js';


let lives = 3;
let timer = 60;
let lastAnswer = null;

// Function to show the game screen and initialize the game
export function showGameScreen(settings) {
    const gameScreen = document.getElementById("game-screen");
    gameScreen.classList.remove("hidden");
  
    lives = 3;
    timer = 60;
    let score = 0;
    lastAnswer = null;
  
    document.getElementById("score-display").textContent = `Score: ${score}`;
    document.getElementById("lives-display").textContent = `Lives: ${lives}`;
    document.getElementById("timer-display").textContent = `Time: ${timer}s`;
  
    startCountdown();
  
    const problem = generateProblem(settings.difficulty, settings.allowNegatives);
    displayProblem(problem);
}

// Function to end the game and display the final score
export function endGame(sspread = 0) {
  stopCountdown(); // ✅ stop the ticking interval

  const gameScreen = document.getElementById("game-screen");
  const endScreen = document.getElementById("end-screen");
  const finalScoreEl = document.getElementById("final-score");
  const personalBestEl = document.getElementById("personal-best");
  const personalSpreadEl = document.getElementById("personal-spread");
  const formattedSpread = sspread;

  gameScreen.classList.add("hidden");
  endScreen.classList.remove("hidden");

  finalScoreEl.textContent = `Your score: ${score}`;
  personalSpreadEl.textContent = `Your average response time: ${formattedSpread} seconds`;

  const catLabel = `${capitalize(currentDifficulty)} (${currentAllowNegatives ? "Negatives allowed" : "No negatives"})`;

  // 🧠 Fetch personal best from server
  fetch("/api/session-status")
  .then(res => res.json())
  .then(session => {
    if (session.loggedIn) {
      // ✅ Logged-in user → fetch from DB
      fetch("/api/high-scores")
        .then(res => res.json())
        .then(scores => {
          const match = scores.find(s =>
            s.difficulty === currentDifficulty && s.negatives === currentAllowNegatives
          );
          const high = match?.score ?? 0;
          personalBestEl.textContent = `Your highest score for ${catLabel}: ${high}`;
        })
        .catch(() => {
          personalBestEl.textContent = `Could not load your highest score.`;
        });
    } else {
      // 🟡 Guest → fetch from localStorage
      const key = `${currentDifficulty}_${currentAllowNegatives}`;
      const guestScores = JSON.parse(localStorage.getItem("pendingScores") || "{}");
      const guestBest = guestScores[key]?.score ?? 0;

      personalBestEl.textContent = `Your highest score for ${catLabel}: ${guestBest}`;
    }
  })
  .catch(() => {
    personalBestEl.textContent = `Could not load your highest score.`;
  });

  // Play again button reloads the page
  document.getElementById("play-again-btn").addEventListener("click", () => {
    resetTimer(); // Reset the timer
    resetGameState(); // Reset game state
    endScreen.classList.add("hidden");
    setGameSettings(currentDifficulty, currentAllowNegatives); // Reapply previous settings
    showGameScreen({ 
      difficulty: currentDifficulty, 
      allowNegatives: currentAllowNegatives 
    }); // Restart the game screen directly
  });
  
  // Just reload the page for a full reset
  document.getElementById("change-d-btn").addEventListener("click", () => {
    location.reload();
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}