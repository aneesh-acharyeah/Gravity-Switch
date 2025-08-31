// Get elements
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const scoreText = document.getElementById("scoreText");
const restartButton = document.getElementById("restartButton");

// Game variables
let player, obstacles, gravity, score, gameOver, lastTime, deltaTime;

function init() {
  player = { x: 100, y: 300, size: 20, speedY: 0 };
  gravity = 1; // 1 = down, -1 = up
  obstacles = [];
  score = 0;
  gameOver = false;
  lastTime = performance.now();

  overlay.style.display = "none";
}

function spawnObstacle() {
  const minHeight = 50;
  const maxHeight = 200;
  const height = Math.random() * (maxHeight - minHeight) + minHeight;

  // Decide if obstacle is on top (gravity = 1) or bottom (gravity = -1)
  const y = Math.random() > 0.5 ? 0 : canvas.height - height;

  obstacles.push({
    x: canvas.width,
    y,
    width: 20,
    height,
    passed: false
  });
}

function update() {
  if (gameOver) return;

  const now = performance.now();
  deltaTime = (now - lastTime) / 1000; // seconds
  lastTime = now;

  // Apply gravity
  player.speedY += gravity * 600 * deltaTime; // Acceleration
  player.y += player.speedY * deltaTime;

  // Floor/ceiling collision
  if (gravity === 1 && player.y + player.size > canvas.height) {
    player.y = canvas.height - player.size;
    player.speedY = 0;
  } else if (gravity === -1 && player.y < 0) {
    player.y = 0;
    player.speedY = 0;
  }

  // Update obstacles
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.x -= 150 * deltaTime; // Move left

    // Score when passed
    if (!obs.passed && obs.x + obs.width < player.x) {
      obs.passed = true;
      score++;
    }

    // Collision detection
    if (
      player.x < obs.x + obs.width &&
      player.x + player.size > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.size > obs.y
    ) {
      endGame();
    }
  }

  // Remove off-screen obstacles
  obstacles = obstacles.filter(obs => obs.x + obs.width > 0);

  // Randomly spawn new obstacles
  if (Math.random() < 0.015) {
    spawnObstacle();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw gravity direction hint
  ctx.fillStyle = "rgba(0, 255, 204, 0.1)";
  if (gravity === -1) {
    ctx.fillRect(0, 0, canvas.width, player.size);
  } else {
    ctx.fillRect(0, canvas.height - player.size, canvas.width, player.size);
  }

  // Player
  ctx.fillStyle = "#00ffcc";
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#00ffcc";
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // Obstacles
  ctx.fillStyle = "#ff0066";
  ctx.shadowColor = "#ff0066";
  obstacles.forEach(obs => {
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  });

  // Score
  ctx.shadowBlur = 0;
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);

  // Gravity indicator
  ctx.fillStyle = "#00ffcc";
  ctx.font = "16px Arial";
  ctx.fillText(`Gravity: ${gravity === 1 ? 'Down' : 'Up'}`, 10, 60);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function switchGravity() {
  if (gameOver) return;

  gravity *= -1;
  player.speedY = gravity === 1 ? 200 : -200; // Strong impulse
}

function endGame() {
  gameOver = true;
  scoreText.textContent = `Your Score: ${score}`;
  overlay.style.display = "block";
}

function restartGame() {
  init();
}

// Event listeners
document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    e.preventDefault(); // Prevent scrolling
    switchGravity();
  }
});

document.addEventListener("click", () => {
  if (!gameOver) switchGravity();
});

restartButton.addEventListener("click", restartGame);

// Start game
init();
gameLoop();
