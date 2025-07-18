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
        max = 40;
        min = allowNegatives ? -40 : 0;
        break;
    }
  
    let op, a, b, result;
    let attempts = 0;
  
    do {
      op = ops[Math.floor(Math.random() * ops.length)];
      a = previousAnswer !== null ? previousAnswer : randInt(min, max);
    
      do {
        b = randInt(min, max);
      } while (b === lastB);
    
      lastB = b;
    
      // Ensure safe division
      if (op === '÷') {
        let tries = 0;
        while (
          b === 0 ||                        // Can't divide by 0
          a % b !== 0 ||                    // Must be divisible
          a / b !== Math.floor(a / b)       // Must be exact integer division
        ) {
          b = randInt(min === 0 ? 1 : min, max);
          tries++;
          if (tries > 20) continue;        // Bail if too many retries
        }
      }
    
      // Calculate result
      switch (op) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '×': result = a * b; break;
        case '÷': result = a / b; break; // Now guaranteed to be integer
      }
  
      attempts++;
      // If allowNegatives is false, retry if result is negative
    } while ((!allowNegatives && result < 0) && attempts < 30);
  
    // Fallback: If still no valid problem, just force a safe one
    if (!allowNegatives && result < 0) {
      a = randInt(1, max);
      b = randInt(1, max);
      op = '+';
      result = a + b;
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