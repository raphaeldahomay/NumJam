// main.js
let lives = 3;
let timer = 60;

// Function to initialize the game settings and UI
import { showGameScreen } from './ui.js';
import { handleSubmit } from './scoring.js';
import { setGameSettings } from './scoring.js';

// Function to check if the user is logged in
function userIsLoggedIn() {
  return fetch("/api/session-status")
    .then(res => res.json())
    .then(data => data.loggedIn)
    .catch(() => false); // default to false on error
}

async function logout() {
  try {
    const res = await fetch("/api/logout", {
      method: "POST"
    });

    const data = await res.json();

    if (data.success) {
      // Reset UI
      document.getElementById("logout-btn")?.classList.add("hidden");
      document.getElementById("login-btn")?.classList.remove("hidden");
      document.getElementById("signup-btn")?.classList.remove("hidden");
      document.getElementById("start-screen")?.classList.remove("hidden");
      document.getElementById("top-bar")?.classList.remove("hidden");

      // 🔄 Refresh high scores
      await displayHighScores();

      alert("Logged out successfully.");
    } else {
      alert("Logout failed.");
    }
  } catch (err) {
    console.error("Logout error:", err);
    alert("An error occurred during logout.");
  }
}

function fetchGuestScores() {
  const raw = localStorage.getItem("pendingScores");
  const container = document.getElementById("high-score-display");

  if (!raw) {
    container.innerHTML = "<h3>🏆 Guest High Scores</h3><p>No scores available.</p>";
    return;
  }

  const scores = JSON.parse(raw);
  container.innerHTML = "<h3>🏆 Guest High Scores</h3><p>" +
    Object.values(scores).map(score =>
      `<p>${capitalize(score.difficulty)} (${score.negatives ? "w/ negative" : "w/o negative"}): ${score.score}</p>`
    ).join("") + "</p>";
}

async function displayHighScores() {
  const loggedIn = await userIsLoggedIn();
  if (loggedIn) {
    fetchHighScores();
  } else {
    fetchGuestScores();
  }
}

async function fetchHighScores() {
  const response = await fetch("/api/high-scores");
  const scores = await response.json();
  const container = document.getElementById("high-score-display");

  container.innerHTML = "<h3>🏆 High Scores</h3><p>" +
    scores.map(s => 
      `<p>${capitalize(s.difficulty)} (${s.negatives ? "w/ negative" : "w/o negative"}): ${s.score}</p>`
    ).join("") + "</p>";
}

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}

async function returnToGame() {
  // Hide forms
  document.getElementById("signup-form").classList.add("hidden");
  document.getElementById("login-form")?.classList.add("hidden");

  // Show main UI
  document.getElementById("start-screen").classList.remove("hidden");
  document.getElementById("top-bar").classList.remove("hidden");

  // Check login state
  try {
    const res = await fetch("/api/session-status");
    const data = await res.json();

    const loginBtn = document.getElementById("login-btn");
    const signupBtn = document.getElementById("signup-btn");
    const logoutBtn = document.getElementById("logout-btn");

    if (data.loggedIn) {
      loginBtn?.classList.add("hidden");
      signupBtn?.classList.add("hidden");
      logoutBtn?.classList.remove("hidden");
    } else {
      loginBtn?.classList.remove("hidden");
      signupBtn?.classList.remove("hidden");
      logoutBtn?.classList.add("hidden");
    }
  } catch (err) {
    console.error("❌ Failed to check session:", err);
  }
}

async function handleSignup() {
  const startScreen = document.getElementById("start-screen");
  startScreen.classList.add("hidden");

  const topBar = document.getElementById("top-bar");
  topBar.classList.add("hidden");

  const signupScreen = document.getElementById("signup-form");
  signupScreen.classList.remove("hidden");

  const username = document.getElementById("signup-username").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-mdp").value;

  const backBtn = document.getElementById("back-btn-s"); // use class or ID
  if (backBtn) {
    backBtn.addEventListener("click", returnToGame, { once: true });
  }

  if (!username || !email || !password) {
    return;
  }
  try {
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });
    
    let data;
    try {
      data = await res.json();
      console.log("Parsed response JSON:", data);
    } catch (e) {
      console.error("Could not parse JSON:", e);
      alert("Invalid server response.");
      return;
    }
    
    if (res.ok && data.success) {
      console.log("✅ Signup succeeded. Returning to game...");
      returnToGame();
      alert(`Account created. Welcome, ${username}!`);
    } else {
      alert(data.message || "Signup failed.");
    }    
  } catch (err) {
    console.error(err);
    alert("An error occurred during signup.");
  }
}

function showLoginForm() {
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("top-bar").classList.add("hidden");
  document.getElementById("login-form").classList.remove("hidden");

  const backBtn = document.getElementById("back-btn-l");
  if (backBtn) {
    backBtn.addEventListener("click", returnToGame, { once: true });
  }

  // Optional: clear fields so autofill doesn't trigger login
  document.getElementById("login-username").value = "";
  document.getElementById("login-mdp").value = "";
}

async function handleLogin() {
  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-mdp").value.trim();

  if (!username || !password) {
    alert("Please enter username and password.");
    return;
  }

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.success) {
      returnToGame(); // Hide login screen, show game
      await displayHighScores(); // 🔄 Refresh high scores
      alert(`Welcome back, ${username}!`);
    } else {
      alert(data.message || "Login failed.");
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("An error occurred during login.");
  }
}

// Event listeners for starting the game and submitting answers
document.addEventListener("DOMContentLoaded", async () => {
  displayHighScores();

  const startBtn = document.getElementById("start-btn");
  const difficultySelect = document.getElementById("difficulty");
  const allowNegativesCheckbox = document.getElementById("allowNegatives");
  const submitBtn = document.getElementById("submit-btn");
  const input = document.getElementById("answer-input");
  const loginBtn = document.getElementById("login-btn");
  const signupBtn = document.getElementById("signup-btn");
  const signupBtnSubmit = document.getElementById("signup-submit-btn");
  const loginBtnSubmit = document.getElementById("login-submit-btn");
  const logoutBtn = document.getElementById("logout-btn");

  try {
    const res = await fetch("/api/session-status");
    const data = await res.json();

    if (data.loggedIn) {
      // User is still logged in — adjust UI
      document.getElementById("signup-btn")?.classList.add("hidden");
      document.getElementById("login-btn")?.classList.add("hidden");
      document.getElementById("logout-btn")?.classList.remove("hidden");
      document.getElementById("start-screen")?.classList.remove("hidden");
      document.getElementById("top-bar")?.classList.remove("hidden");
    } else {
      // User not logged in — show login/signup
      document.getElementById("signup-btn")?.classList.remove("hidden");
      document.getElementById("login-btn")?.classList.remove("hidden");
      document.getElementById("logout-btn")?.classList.add("hidden");
    }
  } catch (err) {
    console.error("❌ Failed to check session status:", err);
  }

  signupBtn.addEventListener("click", () => {
    handleSignup();
  });

  signupBtnSubmit.addEventListener("click", () => {
    handleSignup();
  });

  loginBtn.addEventListener("click", () => {
    showLoginForm();
  });

  loginBtnSubmit.addEventListener("click", () => {
    handleLogin();
  });

  logoutBtn.addEventListener("click", () => {
    logout();
  });


  startBtn.addEventListener("click", () => {
    const difficulty = difficultySelect.value;
    const allowNegatives = allowNegativesCheckbox.checked;

    // ✅ Save difficulty & negatives globally
    setGameSettings(difficulty, allowNegatives);

    const settings = {
      difficulty,
      allowNegatives
    };

    console.log("Game starting with settings:", settings);

    document.getElementById("start-screen").classList.add("hidden");
    showGameScreen(settings);
  });

  submitBtn.addEventListener("click", () => {
    handleSubmit(difficultySelect.value, allowNegativesCheckbox.checked, lives, timer);
  });
  
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleSubmit(difficultySelect.value, allowNegativesCheckbox.checked, lives, timer);
    }
  });
});
  