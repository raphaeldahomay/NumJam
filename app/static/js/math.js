let currentProblem = null;
export let currentAnswer = null;
export let op = null;
export let a = null;
let b = null;
let lastB = null;

// Function to generate a new math problem based on difficulty and previous answer
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  export function generateProblem(difficulty, allowNegatives, previousAnswer = null) {
    let ops = [], min = 0, max = 10;
  
    switch (difficulty) {
      case "easy":
        ops = ['+', '-'];
        max = 50;
        min = allowNegatives ? -50 : 0;
        break;
      case "medium":
        ops = ['×', '×', '+', '-']; // × more likely
        max = 20;
        min = allowNegatives ? -20 : 0;
        break;
      case "hard":
        ops = ['+', '-', '×', '÷', '÷']; // ÷ more likely
        max = 20;
        min = allowNegatives ? -20 : 0;
        break;
    }
  
    op = ops[Math.floor(Math.random() * ops.length)];
    a = previousAnswer !== null ? previousAnswer : randInt(min, max);
    do {
      b = randInt(min, max);
    } while (b === lastB); // Ensure b is different from lastB
    lastB = b; // Store last b for potential reuse
  
    if (op === '÷') {
      let attempts = 0;
      while ((b === 0 || a % b !== 0) && attempts < 20) {
        b = randInt(min === 0 ? 1 : min, max);
        attempts++;
      }
      // If still invalid after 20 attempts, just pick a new problem
      if (b === 0 || a % b !== 0) {
        return generateProblem(difficulty, allowNegatives, previousAnswer);
      }
    }
  
    return { a, b, op };
}

// Function to display the current problem in the UI
export function displayProblem({ a, b, op }) {
    const problemEl = document.getElementById("problem");
    currentProblem = { a, b, op };
  
    if (op === '-' && b < 0) {
      problemEl.textContent = `${a} ${op} (${b})`;
    }
    else if (op === '÷' && b < 0) {
      problemEl.textContent = `${a} ${op} (${b})`;
    } 
    else if (op === '×' && b < 0) {
      problemEl.textContent = `${a} ${op} (${b})`;
    } 
    else if (op === '+' && b < 0) {
      problemEl.textContent = `${a} ${op} (${b})`;
    }
    else {
      problemEl.textContent = `${a} ${op} ${b}`;
    }
  
    switch (op) {
      case '+': currentAnswer = a + b; break;
      case '-': currentAnswer = a - b; break;
      case '×': currentAnswer = a * b; break;
      case '÷': currentAnswer = b !== 0 ? Math.floor(a / b) : 0; break;
    }
  
    document.getElementById("answer-input").value = '';
    document.getElementById("feedback").textContent = '';
}