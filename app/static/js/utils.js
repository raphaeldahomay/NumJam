import { endGame } from './ui.js';
import { score, allSpread, average } from './scoring.js';
import { submitHighScore, currentDifficulty, currentAllowNegatives } from './scoring.js';

let countdownInterval = null;
export let timer = 60; // Default timer value
export let computedSpread = 0; // Placeholder for computed spread

export function resetTimer() {
  timer = 60;
  clearInterval(countdownInterval);
}

// Function to start the countdown timer
export function startCountdown() {
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
      timer--;
      const timerDisplay = document.getElementById("timer-display")
      if (timerDisplay) {
      timerDisplay.textContent = `Time: ${timer}s`;
      }
  
      if (timer <= 0) {
        clearInterval(countdownInterval);
        computedSpread = parseFloat(average(allSpread).toFixed(2)); // Calculate the average spread
        submitHighScore(currentDifficulty, currentAllowNegatives, score, computedSpread); // Example parameters, adjust as needed
        endGame(computedSpread); // End the game with the computed spread
      }
    }, 1000);
}

export function stopCountdown() {
    clearInterval(countdownInterval);
}