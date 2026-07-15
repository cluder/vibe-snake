// Snake 5.0 - Core Game Logic
document.addEventListener("DOMContentLoaded", () => {
    // Canvas & Context Setup
    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");

    // Grid Dimensions
    const GRID_SIZE = 20;
    const COLS = canvas.width / GRID_SIZE; // 40
    const ROWS = canvas.height / GRID_SIZE; // 30

    // Snake Configurations
    const SNAKE_TYPES = {
        veloscythe: {
            name: "Velo-Scythe",
            color: "#00f0ff",
            glowColor: "rgba(0, 240, 255, 0.8)",
            baseSpeed: 11.4, // +20% speed (9.5 * 1.2)
            scoreMult: 1.0,
            description: "Geschwindigkeits-Spezialist.",
            startShield: false,
            trailParticle: "#00f0ff"
        },
        viper: {
            name: "Neon Viper",
            color: "#00ff66",
            glowColor: "rgba(0, 255, 102, 0.8)",
            baseSpeed: 9.5, // Standard speed
            scoreMult: 1.0,
            description: "Klassisch & ausgeglichen.",
            startShield: false,
            trailParticle: "#00ff66"
        },
        monarch: {
            name: "Gold Monarch",
            color: "#ffd700",
            glowColor: "rgba(255, 215, 0, 0.8)",
            baseSpeed: 7.6, // Slower (approx 20% slower than 9.5)
            scoreMult: 2.0, // Double points!
            description: "Gierig aber schwerfällig.",
            startShield: false,
            trailParticle: "#ffd700"
        }
    };

    // Game Variables
    let snake = [];
    let direction = { x: 1, y: 0 };
    let nextDirection = { x: 1, y: 0 };
    let currentSnakeType = "viper";
    let score = 0;
    let multiplier = 1.0;
    let gameState = "MENU"; // MENU, PLAYING, PAUSED, GAMEOVER, SKILLTREE

    // Incremental Game Progression State
    let saveState = {
        globalBits: 0,
        timeLevel: 0,
        foodMultLevel: 0,
        foodSpeedLevel: 0,
        foodCountLevel: 0,
        speedLevel: 0,
        aiPlayerPurchased: false,
        aiPlayerEnabled: false
    };
    let roundTimeLimit = 10;
    let timeLeft = 10.0;

    function loadSaveState() {
        const raw = localStorage.getItem("snake5_save");
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                if (parsed) {
                    saveState.globalBits = Number(parsed.globalBits) || 0;
                    saveState.timeLevel = Number(parsed.timeLevel) || 0;
                    saveState.foodMultLevel = Number(parsed.foodMultLevel) || 0;
                    saveState.foodSpeedLevel = Number(parsed.foodSpeedLevel) || 0;
                    saveState.foodCountLevel = Number(parsed.foodCountLevel) || 0;
                    saveState.speedLevel = Number(parsed.speedLevel) || 0;
                    saveState.aiPlayerPurchased = parsed.aiPlayerPurchased === true;
                    saveState.aiPlayerEnabled = parsed.aiPlayerEnabled === true;
                }
            } catch (e) {
                console.warn("Failed to load save state, resetting", e);
            }
        }
        updateCurrencyDisplays();
    }

    function saveSaveState() {
        localStorage.setItem("snake5_save", JSON.stringify(saveState));
        updateCurrencyDisplays();
    }

    function updateCurrencyDisplays() {
        const globalBitsDisplay = document.getElementById("global-bits-display");
        const skilltreeBits = document.getElementById("skilltree-bits");
        const finalGlobalBalance = document.getElementById("global-balance-final");

        const text = `${saveState.globalBits} BITS`;
        if (globalBitsDisplay) globalBitsDisplay.innerText = text;
        if (skilltreeBits) skilltreeBits.innerText = text;
        if (finalGlobalBalance) finalGlobalBalance.innerText = String(saveState.globalBits);
    }

    // Items (Food & Power-ups)
    let foods = []; // Array of food items: { x, y, type: 'normal'|'gold' }
    let foodSpawnCooldown = 0; // Dynamic replenishment timer
    let comboTimeLeft = 0; // Remaining combo buffer in seconds
    let decayTimer = 0; // Timer in seconds for 500ms multiplier decay steps
    let activePowerUp = null; // { type, duration, maxDuration }
    let hasShield = false;
    let invulnerabilityTimer = 0; // Blinking invulnerability frames after shield breaks
    let powerupItem = null; // { x, y, type: 'speed'|'ghost'|'shield', blinkTimer }
    let powerupSpawnTimer = 0; // Ticks until next powerup spawns

    // Visuals
    let particles = [];
    let lastTickTime = 0;
    let lastFrameTime = 0;
    let soundTimer = 0; // Sound reminder ticks


    // upgrade costs variables
    let foodMultiplier = 1.6;
    let upgradeSnakeSpeedMult = 1.2;
    let upgradeRoundTimeMult = 1;
    let upgradeFoodCountMult = 1.1;
    let upgradeFoodReplicaSpeedMult = 1.6;

    // Menu Buttons
    const btnStart = document.getElementById("btn-start");
    const btnShowSkillTree = document.getElementById("btn-show-skilltree");
    const btnSkillTreeBack = document.getElementById("btn-skilltree-back");
    const btnMenuReset = document.getElementById("btn-menu-reset");
    const btnSkillTreeStart = document.getElementById("btn-skilltree-start");
    const btnUpgradeTime = document.getElementById("btn-upgrade-time");
    const btnGameoverUpgrades = document.getElementById("btn-gameover-upgrades");
    const btnRestart = document.getElementById("btn-restart");
    const btnMenu = document.getElementById("btn-menu");
    const btnResume = document.getElementById("btn-resume");

    // HUD Elements
    const hudScore = document.getElementById("hud-score");
    const hudMultiplier = document.getElementById("hud-multiplier");
    const hudSnakeType = document.getElementById("hud-snake-type");
    const hudTimer = document.getElementById("hud-timer");
    const hudPowerupName = document.getElementById("hud-powerup-name");
    const hudPowerupBar = document.getElementById("hud-powerup-bar");
    const hudPowerupContainer = document.getElementById("hud-powerup-container");

    // Screens & Overlays
    const screenMenu = document.getElementById("screen-menu");
    const screenGame = document.getElementById("screen-game");
    const screenSkillTree = document.getElementById("screen-skilltree");
    const gameoverOverlay = document.getElementById("gameover-overlay");
    const pauseOverlay = document.getElementById("pause-overlay");

    // Navigation triggers
    btnStart.addEventListener("click", () => {
        SoundManager.init(); // Initialize audio context on first click
        SoundManager.playClick();
        changeState("PLAYING");
        resetGame();
    });

    btnShowSkillTree.addEventListener("click", () => {
        SoundManager.playClick();
        changeState("SKILLTREE");
    });

    btnSkillTreeBack.addEventListener("click", () => {
        SoundManager.playClick();
        changeState("MENU");
    });

    btnSkillTreeStart.addEventListener("click", () => {
        SoundManager.init(); // Initialize audio context on first click
        SoundManager.playClick();
        changeState("PLAYING");
        resetGame();
    });

    // Custom reset confirm modal
    const resetModal = document.getElementById("reset-confirm-modal");
    const btnResetConfirm = document.getElementById("btn-reset-confirm");
    const btnResetCancel = document.getElementById("btn-reset-cancel");

    if (btnMenuReset && resetModal) {
        btnMenuReset.addEventListener("click", () => {
            SoundManager.playClick();
            resetModal.classList.remove("hidden");
        });

        btnResetConfirm.addEventListener("click", () => {
            resetModal.classList.add("hidden");
            saveState.globalBits = 0;
            saveState.timeLevel = 0;
            saveState.foodMultLevel = 0;
            saveState.foodSpeedLevel = 0;
            saveState.foodCountLevel = 0;
            saveState.speedLevel = 0;
            saveState.aiPlayerPurchased = false;
            saveState.aiPlayerEnabled = false;
            saveSaveState();
            updateCurrencyDisplays();
            renderSkillTree();
        });

        btnResetCancel.addEventListener("click", () => {
            resetModal.classList.add("hidden");
        });

        // Also close on backdrop click
        resetModal.addEventListener("click", (e) => {
            if (e.target === resetModal) resetModal.classList.add("hidden");
        });
    }

    btnUpgradeTime.addEventListener("click", () => {
        const currentLevel = saveState.timeLevel;
        const cost = Math.floor(50 * Math.pow(upgradeRoundTimeMult, currentLevel));

        if (saveState.globalBits >= cost) {
            saveState.globalBits -= cost;
            saveState.timeLevel += 1;
            saveSaveState();
            renderSkillTree();
            SoundManager.playPowerUp(); // play upgrade success sound
        } else {
            SoundManager.playHit(); // play error sound
        }
    });

    const btnUpgradeFoodMult = document.getElementById("btn-upgrade-food-mult");
    if (btnUpgradeFoodMult) {
        btnUpgradeFoodMult.addEventListener("click", () => {
            const currentLevel = saveState.foodMultLevel || 0;
            const cost = Math.floor(60 * Math.pow(foodMultiplier, currentLevel));

            if (saveState.globalBits >= cost) {
                saveState.globalBits -= cost;
                saveState.foodMultLevel = currentLevel + 1;
                saveSaveState();
                renderSkillTree();
                SoundManager.playPowerUp();
            } else {
                SoundManager.playHit();
            }
        });
    }

    const btnUpgradeFoodSpeed = document.getElementById("btn-upgrade-food-speed");
    if (btnUpgradeFoodSpeed) {
        btnUpgradeFoodSpeed.addEventListener("click", () => {
            const currentLevel = saveState.foodSpeedLevel || 0;
            const cost = Math.floor(80 * Math.pow(upgradeFoodReplicaSpeedMult, currentLevel));

            if (saveState.globalBits >= cost) {
                saveState.globalBits -= cost;
                saveState.foodSpeedLevel = currentLevel + 1;
                saveSaveState();
                renderSkillTree();
                SoundManager.playPowerUp();
            } else {
                SoundManager.playHit();
            }
        });
    }

    const btnUpgradeFoodCount = document.getElementById("btn-upgrade-food-count");
    if (btnUpgradeFoodCount) {
        btnUpgradeFoodCount.addEventListener("click", () => {
            const currentLevel = saveState.foodCountLevel || 0;
            const cost = Math.floor(120 * Math.pow(upgradeFoodCountMult, currentLevel));

            if (saveState.globalBits >= cost) {
                saveState.globalBits -= cost;
                saveState.foodCountLevel = currentLevel + 1;
                saveSaveState();
                renderSkillTree();
                SoundManager.playPowerUp();
            } else {
                SoundManager.playHit();
            }
        });
    }

    const btnUpgradeSpeed = document.getElementById("btn-upgrade-speed");
    if (btnUpgradeSpeed) {
        btnUpgradeSpeed.addEventListener("click", () => {
            const currentLevel = saveState.speedLevel || 0;
            const cost = Math.floor(40 * Math.pow(upgradeSnakeSpeedMult, currentLevel));

            if (saveState.globalBits >= cost) {
                saveState.globalBits -= cost;
                saveState.speedLevel = currentLevel + 1;
                saveSaveState();
                renderSkillTree();
                SoundManager.playPowerUp();
            } else {
                SoundManager.playHit();
            }
        });
    }

    const btnUpgradeAIPlayer = document.getElementById("btn-upgrade-ai-player");
    if (btnUpgradeAIPlayer) {
        btnUpgradeAIPlayer.addEventListener("click", () => {
            if (!saveState.aiPlayerPurchased) {
                const cost = 500;
                if (saveState.globalBits >= cost) {
                    saveState.globalBits -= cost;
                    saveState.aiPlayerPurchased = true;
                    saveState.aiPlayerEnabled = true; // Auto-enable on purchase
                    saveSaveState();
                    renderSkillTree();
                    SoundManager.playPowerUp();
                } else {
                    SoundManager.playHit();
                }
            } else {
                // Toggle state
                saveState.aiPlayerEnabled = !saveState.aiPlayerEnabled;
                saveSaveState();
                renderSkillTree();
                SoundManager.playClick();
            }
        });
    }

    btnGameoverUpgrades.addEventListener("click", () => {
        SoundManager.playClick();
        gameoverOverlay.classList.add("hidden");
        changeState("SKILLTREE");
    });

    btnRestart.addEventListener("click", () => {
        SoundManager.playClick();
        gameoverOverlay.classList.add("hidden");
        resetGame();
        changeState("PLAYING");
    });

    btnMenu.addEventListener("click", () => {
        SoundManager.playClick();
        gameoverOverlay.classList.add("hidden");
        changeState("MENU");
    });

    btnResume.addEventListener("click", () => {
        resumeGame();
    });

    // Pause Resume trigger on Overlay Click
    pauseOverlay.addEventListener("click", () => {
        resumeGame();
    });

    // Keyboard Input Handling
    window.addEventListener("keydown", (e) => {
        if (gameState === "PLAYING") {
            switch (e.key) {
                case "ArrowUp":
                case "w":
                case "W":
                    if (direction.y === 0) nextDirection = { x: 0, y: -1 };
                    break;
                case "ArrowDown":
                case "s":
                case "S":
                    if (direction.y === 0) nextDirection = { x: 0, y: 1 };
                    break;
                case "ArrowLeft":
                case "a":
                case "A":
                    if (direction.x === 0) nextDirection = { x: -1, y: 0 };
                    break;
                case "ArrowRight":
                case "d":
                case "D":
                    if (direction.x === 0) nextDirection = { x: 1, y: 0 };
                    break;
                case "Escape":
                    pauseGame();
                    break;
            }
        } else if (gameState === "PAUSED" && e.key === "Escape") {
            resumeGame();
        }
    });

    // Touch controls mapping
    document.getElementById("ctrl-up").addEventListener("click", () => {
        if (gameState === "PLAYING" && direction.y === 0) nextDirection = { x: 0, y: -1 };
    });
    document.getElementById("ctrl-down").addEventListener("click", () => {
        if (gameState === "PLAYING" && direction.y === 0) nextDirection = { x: 0, y: 1 };
    });
    document.getElementById("ctrl-left").addEventListener("click", () => {
        if (gameState === "PLAYING" && direction.x === 0) nextDirection = { x: -1, y: 0 };
    });
    document.getElementById("ctrl-right").addEventListener("click", () => {
        if (gameState === "PLAYING" && direction.x === 0) nextDirection = { x: 1, y: 0 };
    });
    document.getElementById("ctrl-pause").addEventListener("click", () => {
        if (gameState === "PLAYING") pauseGame();
        else if (gameState === "PAUSED") resumeGame();
    });

    // State Machine
    function changeState(newState) {
        gameState = newState;

        screenMenu.classList.remove("active");
        screenGame.classList.remove("active");
        if (screenSkillTree) screenSkillTree.classList.remove("active");

        const container = document.querySelector(".game-container");

        if (newState === "MENU") {
            if (container) container.classList.remove("wide-layout");
            screenMenu.classList.add("active");
            updateCurrencyDisplays();
        } else if (newState === "PLAYING" || newState === "PAUSED" || newState === "GAMEOVER") {
            if (container) container.classList.remove("wide-layout");
            screenGame.classList.add("active");
        } else if (newState === "SKILLTREE") {
            if (container) container.classList.add("wide-layout");
            if (screenSkillTree) screenSkillTree.classList.add("active");
            renderSkillTree();
        }
    }

    function pauseGame() {
        if (gameState === "PLAYING") {
            gameState = "PAUSED";
            pauseOverlay.classList.remove("hidden");
        }
    }

    function resumeGame() {
        if (gameState === "PAUSED") {
            gameState = "PLAYING";
            pauseOverlay.classList.add("hidden");
        }
    }

    // Reset Game State
    function resetGame() {
        const typeConfig = SNAKE_TYPES[currentSnakeType];

        // Starting coordinates (middle of the board)
        const startX = Math.floor(COLS / 4);
        const startY = Math.floor(ROWS / 2);

        snake = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY }
        ];

        direction = { x: 1, y: 0 };
        nextDirection = { x: 1, y: 0 };

        score = 0;
        multiplier = typeConfig.scoreMult;
        comboTimeLeft = 0;
        decayTimer = 0;
        activePowerUp = null;
        hasShield = typeConfig.startShield;
        invulnerabilityTimer = 0;
        powerupItem = null;
        powerupSpawnTimer = getRandomInt(100, 250); // steps count
        particles = [];

        // Reset and load round time settings
        roundTimeLimit = 10 + saveState.timeLevel;
        timeLeft = roundTimeLimit;
        lastTickTime = performance.now();
        lastFrameTime = performance.now();

        // HUD setup
        hudSnakeType.innerText = typeConfig.name;
        hudSnakeType.className = `hud-value neon-text-${getSnakeColorName(currentSnakeType)}`;
        updateHUD();

        foods = [];
        const maxFoods = 1 + (saveState.foodCountLevel || 0);
        for (let i = 0; i < maxFoods; i++) {
            spawnFood();
        }

        // Reset spawn cooldown
        const baseInterval = 5.0;
        const speedLevel = saveState.foodSpeedLevel || 0;
        foodSpawnCooldown = baseInterval * Math.pow(0.75, speedLevel);
    }

    // Generate random int
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Get color theme string
    function getSnakeColorName(type) {
        if (type === "viper") return "green";
        if (type === "veloscythe") return "blue";
        if (type === "phantom") return "purple";
        if (type === "monarch") return "gold";
        return "blue";
    }

    // Spawn Food
    function spawnFood() {
        let spawned = false;
        let attempts = 0;
        while (!spawned && attempts < 100) {
            attempts++;
            const fx = getRandomInt(1, COLS - 2);
            const fy = getRandomInt(1, ROWS - 2);

            // Check if coordinates overlap with snake
            const collidesSnake = snake.some(part => part.x === fx && part.y === fy);
            // Check if coordinates overlap with current powerup
            const collidesPower = powerupItem && powerupItem.x === fx && powerupItem.y === fy;
            // Check if coordinates overlap with existing food items
            const collidesFood = foods.some(f => f.x === fx && f.y === fy);

            if (!collidesSnake && !collidesPower && !collidesFood) {
                // 15% chance for a golden food
                const isGold = Math.random() < 0.15;
                foods.push({
                    x: fx,
                    y: fy,
                    type: isGold ? 'gold' : 'normal'
                });
                spawned = true;
            }
        }
    }

    // Spawn Power-Up
    function spawnPowerUp() {
        let spawned = false;
        let limit = 0;

        while (!spawned && limit < 100) {
            limit++;
            const px = getRandomInt(1, COLS - 2);
            const py = getRandomInt(1, ROWS - 2);

            // Check overlaps
            const collidesSnake = snake.some(part => part.x === px && part.y === py);
            const collidesFood = foods.some(f => f.x === px && f.y === py);

            if (!collidesSnake && !collidesFood) {
                // Decide type
                const rand = Math.random();
                let pType = 'speed';
                if (rand < 0.35) {
                    pType = 'ghost';
                } else if (rand < 0.70) {
                    pType = 'shield';
                }

                powerupItem = {
                    x: px,
                    y: py,
                    type: pType,
                    blinkTimer: 0
                };
                spawned = true;
            }
        }
    }

    // Helper to find nearest food item using Manhattan distance
    function getNearestFood(head) {
        if (foods.length === 0) return null;
        let nearest = foods[0];
        let minDist = Math.abs(foods[0].x - head.x) + Math.abs(foods[0].y - head.y);
        for (let i = 1; i < foods.length; i++) {
            const dist = Math.abs(foods[i].x - head.x) + Math.abs(foods[i].y - head.y);
            if (dist < minDist) {
                minDist = dist;
                nearest = foods[i];
            }
        }
        return nearest;
    }

    // Flood fill helper: count reachable cells from (startX, startY) given the snake body set
    function floodFillCount(startX, startY, bodySet, canWrap) {
        const visited = new Set();
        const queue = [[startX, startY]];
        const key = (x, y) => x * 1000 + y;
        visited.add(key(startX, startY));
        let count = 0;
        const dirs = [{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}];
        while (queue.length > 0) {
            const [cx, cy] = queue.shift();
            count++;
            for (const d of dirs) {
                let nx = cx + d.x;
                let ny = cy + d.y;
                if (canWrap) {
                    nx = (nx + COLS) % COLS;
                    ny = (ny + ROWS) % ROWS;
                } else {
                    if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) continue;
                }
                const k = key(nx, ny);
                if (!visited.has(k) && !bodySet.has(k)) {
                    visited.add(k);
                    queue.push([nx, ny]);
                }
            }
        }
        return count;
    }

    // Improved AI with flood-fill safety scoring to avoid body collisions and dead ends
    function calculateAIDirection() {
        if (foods.length === 0) return;
        const head = snake[0];
        const target = getNearestFood(head);
        if (!target) return;

        const possibleMoves = [
            { x: 0, y: -1 }, // Up
            { x: 0, y: 1 },  // Down
            { x: -1, y: 0 }, // Left
            { x: 1, y: 0 }   // Right
        ];

        const isGhostActive = activePowerUp && activePowerUp.type === "ghost";
        const isInvulnerable = invulnerabilityTimer > 0;
        const canWrap = isGhostActive || isInvulnerable;

        // Build body occupancy set (exclude tail since it moves away next step)
        const bodyKey = (x, y) => x * 1000 + y;
        const bodySet = new Set();
        for (let i = 0; i < snake.length - 1; i++) {
            bodySet.add(bodyKey(snake[i].x, snake[i].y));
        }

        const totalCells = COLS * ROWS;
        let bestMove = null;
        let bestScore = -Infinity;

        for (const move of possibleMoves) {
            // Prevent immediate reverse turn
            if (move.x === -direction.x && move.y === -direction.y) continue;

            // Project next position
            let nextX = head.x + move.x;
            let nextY = head.y + move.y;

            // Boundary check
            if (nextX < 0 || nextX >= COLS || nextY < 0 || nextY >= ROWS) {
                if (canWrap) {
                    nextX = (nextX + COLS) % COLS;
                    nextY = (nextY + ROWS) % ROWS;
                } else {
                    continue; // Wall collision – skip
                }
            }

            // Body collision check (ghost/invulnerable ignores body)
            if (!isGhostActive && !isInvulnerable) {
                if (bodySet.has(bodyKey(nextX, nextY))) continue;
            }

            // Flood fill to count reachable space from this candidate cell
            const space = (isGhostActive || isInvulnerable)
                ? totalCells  // Ghost ignores body, treat as fully open
                : floodFillCount(nextX, nextY, bodySet, canWrap);

            // Manhattan distance to target (lower = better)
            const dist = Math.abs(target.x - nextX) + Math.abs(target.y - nextY);

            // Score: prioritize open space to avoid traps, break ties by proximity to food
            // Weight space heavily so the snake avoids cutting itself off
            const score = space * 1000 - dist;

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        if (bestMove) {
            nextDirection = bestMove;
        } else {
            // Absolute fallback: any move that isn't a 180° reverse
            for (const move of possibleMoves) {
                if (move.x === -direction.x && move.y === -direction.y) continue;
                nextDirection = move;
                break;
            }
        }
    }

    // Core Game Update
    function update() {
        if (gameState !== "PLAYING") return;

        // Tick invulnerability
        if (invulnerabilityTimer > 0) {
            invulnerabilityTimer--;
        }

        // Run Autopilot KI logic if enabled
        if (saveState.aiPlayerEnabled) {
            calculateAIDirection();
        }

        // Applybuffered keyboard changes
        direction = nextDirection;

        // Head position
        const head = snake[0];
        const newHead = {
            x: head.x + direction.x,
            y: head.y + direction.y
        };

        const config = SNAKE_TYPES[currentSnakeType];
        const isGhostActive = activePowerUp && activePowerUp.type === "ghost";
        const isInvulnerable = invulnerabilityTimer > 0;

        // Boundary Collision (wrapping in ghost or invulnerable mode)
        if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
            if (isGhostActive || isInvulnerable) {
                // Wrap around!
                newHead.x = (newHead.x + COLS) % COLS;
                newHead.y = (newHead.y + ROWS) % ROWS;
            } else {
                handleCollision();
                return;
            }
        }

        // Self Collision Check (only when ghost and invulnerability are NOT active)
        const selfCollide = snake.some(part => part.x === newHead.x && part.y === newHead.y);
        if (selfCollide && !isGhostActive && !isInvulnerable) {
            handleCollision();
            return;
        }

        // Move head to front
        snake.unshift(newHead);

        // Check if food is eaten
        let foodEatenIndex = -1;
        for (let i = 0; i < foods.length; i++) {
            if (newHead.x === foods[i].x && newHead.y === foods[i].y) {
                foodEatenIndex = i;
                break;
            }
        }

        let foodEaten = false;
        if (foodEatenIndex !== -1) {
            foodEaten = true;
            const eatenFood = foods[foodEatenIndex];
            foods.splice(foodEatenIndex, 1);
            handleFoodEaten(eatenFood);
        }

        // Check if Powerup is collected
        if (powerupItem && newHead.x === powerupItem.x && newHead.y === powerupItem.y) {
            collectPowerUp(powerupItem.type);
            powerupItem = null;
        }

        // Remove tail if no food eaten
        if (!foodEaten) {
            snake.pop();
        } else {
            // Gold Monarch grows faster (extra segment)
            if (currentSnakeType === "monarch" && Math.random() < 0.5) {
                // Grow double speed
            } else {
                // Normal growth, no pop needed
            }
        }

        // Sparkle Trail effects for Speedster or Active Speed
        const isSpeedActive = activePowerUp && activePowerUp.type === "speed";
        if (config.trailParticle || isSpeedActive) {
            const tail = snake[snake.length - 1];
            if (Math.random() < (isSpeedActive ? 0.8 : 0.3)) {
                createSparkle(
                    tail.x * GRID_SIZE + GRID_SIZE / 2,
                    tail.y * GRID_SIZE + GRID_SIZE / 2,
                    isSpeedActive ? "#ff007f" : config.trailParticle
                );
            }
        }

        // Ticking Power-up Duration
        if (activePowerUp) {
            activePowerUp.duration--;

            // Sound feedback for running out (last 3 seconds)
            if (activePowerUp.duration <= 30 && activePowerUp.duration > 0 && activePowerUp.duration % 10 === 0) {
                SoundManager.playTick();
            }

            if (activePowerUp.duration <= 0) {
                activePowerUp = null;
                updateHUD();
            }
        }

        // Tick Power-up spawn cooldowns
        if (!powerupItem && !activePowerUp) {
            powerupSpawnTimer--;
            if (powerupSpawnTimer <= 0) {
                spawnPowerUp();
                powerupSpawnTimer = getRandomInt(150, 300); // Reset timer
            }
        }

        // Blink animations for items on canvas
        if (powerupItem) {
            powerupItem.blinkTimer = (powerupItem.blinkTimer + 1) % 60;
        }

        updateHUD();
    }

    // Handles Game Over / Collision
    function handleCollision() {
        if (hasShield) {
            hasShield = false;
            invulnerabilityTimer = 18; // ~1.8 seconds of invulnerability (18 steps at 10 FPS)
            SoundManager.playShieldBreak();
            createExplosion(snake[0].x * GRID_SIZE + GRID_SIZE / 2, snake[0].y * GRID_SIZE + GRID_SIZE / 2, "#ff007f", 15);
            return;
        }

        // Actual game over
        SoundManager.playHit();
        SoundManager.playGameOver();
        createExplosion(snake[0].x * GRID_SIZE + GRID_SIZE / 2, snake[0].y * GRID_SIZE + GRID_SIZE / 2, SNAKE_TYPES[currentSnakeType].color, 35);
        gameState = "GAMEOVER";

        // Add score to meta-currency
        saveState.globalBits += score;
        saveSaveState();

        setTimeout(() => {
            showGameOverScreen(false); // false means crash
        }, 800);
    }

    // Handles Timer expiring
    function handleTimeUp() {
        SoundManager.playPowerUp();
        createExplosion(snake[0].x * GRID_SIZE + GRID_SIZE / 2, snake[0].y * GRID_SIZE + GRID_SIZE / 2, "#00ff66", 25);
        gameState = "GAMEOVER";

        // Add score to meta-currency
        saveState.globalBits += score;
        saveSaveState();

        setTimeout(() => {
            showGameOverScreen(true); // true means time up
        }, 800);
    }

    // Food Eaten
    function handleFoodEaten(eatenFood) {
        SoundManager.playEat();

        // Increase combo multiplier and reset combo buffer (5.0s)
        multiplier += 0.5;
        if (multiplier > 5.0) {
            multiplier = 5.0;
        }
        comboTimeLeft = 5.0;

        let baseScore = eatenFood.type === 'gold' ? 35 : 10;
        let growthAmount = eatenFood.type === 'gold' ? 2 : 1;

        // Multiply points if Speed Power-up is active
        let points = baseScore * multiplier;
        if (activePowerUp && activePowerUp.type === 'speed') {
            points *= 1.5;
        }

        // Apply food score multiplier upgrade (+10% compounding per level)
        const multLevel = saveState.foodMultLevel || 0;
        const upgradeMult = Math.pow(1.10, multLevel);
        points *= upgradeMult;

        score += Math.round(points);
        createExplosion(eatenFood.x * GRID_SIZE + GRID_SIZE / 2, eatenFood.y * GRID_SIZE + GRID_SIZE / 2, eatenFood.type === 'gold' ? "#ffd700" : "#ff007f", 10);

        // Spawn next food immediately if board is empty
        if (foods.length === 0) {
            spawnFood();
        }

        // Extra segments if golden food
        if (growthAmount > 1) {
            const tail = snake[snake.length - 1];
            for (let i = 0; i < growthAmount - 1; i++) {
                snake.push({ x: tail.x, y: tail.y });
            }
        }
    }

    // Collect Power-up
    function collectPowerUp(type) {
        SoundManager.playPowerUp();

        const config = SNAKE_TYPES[currentSnakeType];

        if (type === 'shield') {
            hasShield = true;
            createExplosion(powerupItem.x * GRID_SIZE + GRID_SIZE / 2, powerupItem.y * GRID_SIZE + GRID_SIZE / 2, "#ff3b30", 15);
        } else {
            // Duration calculations (Phantom Wraith gets longer ghost time)
            let baseDuration = 80; // 8 seconds at ~10 updates/sec
            if (type === 'ghost' && currentSnakeType === 'phantom') {
                baseDuration = 130; // 13 seconds!
            }

            activePowerUp = {
                type: type,
                duration: baseDuration,
                maxDuration: baseDuration
            };
            createExplosion(powerupItem.x * GRID_SIZE + GRID_SIZE / 2, powerupItem.y * GRID_SIZE + GRID_SIZE / 2, type === 'speed' ? "#00f0ff" : "#bd00ff", 15);
        }
    }

    // Explosion Effect
    function createExplosion(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                alpha: 1,
                decay: Math.random() * 0.03 + 0.015,
                radius: Math.random() * 3 + 1.5
            });
        }
        capParticles();
    }

    // Sparkle tail effect
    function createSparkle(x, y, color) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            color: color,
            alpha: 0.8,
            decay: 0.04,
            radius: Math.random() * 2 + 1
        });
        capParticles();
    }

    // Cap particles array size for performance
    function capParticles() {
        if (particles.length > 150) {
            particles.splice(0, particles.length - 150);
        }
    }

    // Update particles positions
    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            if (p.alpha <= 0) {
                particles.splice(i, 1);
            }
        }
    }

    // Update HUD display
    function updateHUD() {
        hudScore.innerText = String((saveState.globalBits || 0) + score).padStart(6, '0');

        let curMultiplier = multiplier;
        if (activePowerUp && activePowerUp.type === 'speed') {
            curMultiplier += 0.5;
        }
        hudMultiplier.innerText = `x${curMultiplier.toFixed(1)}`;

        // Multiplier combo bar update
        const multiplierBar = document.getElementById("hud-multiplier-bar");
        if (multiplierBar) {
            const percent = (comboTimeLeft / 5.0) * 100;
            multiplierBar.style.width = `${percent}%`;
        }

        // Timer update
        if (hudTimer) {
            hudTimer.innerText = `${timeLeft.toFixed(1)}s`;
            if (timeLeft <= 3.0) {
                hudTimer.className = "hud-value neon-text-red blink";
            } else if (timeLeft <= 5.0) {
                hudTimer.className = "hud-value neon-text-pink";
            } else {
                hudTimer.className = "hud-value neon-text-blue";
            }
        }

        // Power-up indicators
        if (activePowerUp) {
            hudPowerupContainer.style.display = "flex";
            const percent = (activePowerUp.duration / activePowerUp.maxDuration) * 100;
            hudPowerupBar.style.width = `${percent}%`;

            if (activePowerUp.type === 'speed') {
                hudPowerupName.innerText = "SPEED";
                hudPowerupBar.style.background = "var(--neon-blue)";
                hudPowerupBar.style.boxShadow = "0 0 8px var(--neon-blue)";
            } else if (activePowerUp.type === 'ghost') {
                hudPowerupName.innerText = "GEIST";
                hudPowerupBar.style.background = "var(--neon-purple)";
                hudPowerupBar.style.boxShadow = "0 0 8px var(--neon-purple)";
            }
        } else if (hasShield) {
            hudPowerupContainer.style.display = "flex";
            hudPowerupName.innerText = "SCHILD";
            hudPowerupBar.style.width = "100%";
            hudPowerupBar.style.background = "var(--neon-pink)";
            hudPowerupBar.style.boxShadow = "0 0 8px var(--neon-pink)";
        } else {
            hudPowerupContainer.style.display = "none";
        }
    }

    // Show Game Over Overlay
    function showGameOverScreen(isTimeUp) {
        const titleEl = document.getElementById("gameover-title");
        if (titleEl) {
            if (isTimeUp) {
                titleEl.innerText = "ZEIT ABGELAUFEN!";
                titleEl.className = "neon-text-green blink";
            } else {
                titleEl.innerText = "CRASH!";
                titleEl.className = "neon-text-red blink";
            }
        }

        updateCurrencyDisplays();
        gameoverOverlay.classList.remove("hidden");
    }

    // Render Skilltree screen
    function renderSkillTree() {
        updateCurrencyDisplays();

        // 1. Time Upgrade
        {
            const level = saveState.timeLevel || 0;
            const duration = 10 + level;
            const cost = Math.floor(50 * Math.pow(upgradeRoundTimeMult, level));

            const levelSpan = document.getElementById("time-level");
            const currentSpan = document.getElementById("time-current");
            if (levelSpan) levelSpan.innerText = String(level);
            if (currentSpan) currentSpan.innerText = `${duration}s`;

            if (btnUpgradeTime) {
                btnUpgradeTime.innerText = `VERBESSERN (${cost} B)`;
                if (saveState.globalBits >= cost) {
                    btnUpgradeTime.removeAttribute("disabled");
                    btnUpgradeTime.classList.remove("disabled-upgrade");
                } else {
                    btnUpgradeTime.setAttribute("disabled", "true");
                    btnUpgradeTime.classList.add("disabled-upgrade");
                }
            }
        }

        // 2. Food Multiplier Upgrade
        {
            const level = saveState.foodMultLevel || 0;
            const multiplierVal = Math.pow(1.10, level);
            const cost = Math.floor(60 * Math.pow(foodMultiplier, level));

            const levelSpan = document.getElementById("food-mult-level");
            const currentSpan = document.getElementById("food-mult-current");
            if (levelSpan) levelSpan.innerText = String(level);
            if (currentSpan) currentSpan.innerText = `x${multiplierVal.toFixed(2)}`;

            const btnUpgradeFoodMult = document.getElementById("btn-upgrade-food-mult");
            if (btnUpgradeFoodMult) {
                btnUpgradeFoodMult.innerText = `VERBESSERN (${cost} B)`;
                if (saveState.globalBits >= cost) {
                    btnUpgradeFoodMult.removeAttribute("disabled");
                    btnUpgradeFoodMult.classList.remove("disabled-upgrade");
                } else {
                    btnUpgradeFoodMult.setAttribute("disabled", "true");
                    btnUpgradeFoodMult.classList.add("disabled-upgrade");
                }
            }
        }

        // 3. Food Speed (Replicator) Upgrade
        {
            const level = saveState.foodSpeedLevel || 0;
            const interval = 5.0 * Math.pow(0.75, level);
            const cost = Math.floor(80 * Math.pow(upgradeFoodReplicaSpeedMult, level));

            const levelSpan = document.getElementById("food-speed-level");
            const currentSpan = document.getElementById("food-speed-current");
            if (levelSpan) levelSpan.innerText = String(level);
            if (currentSpan) currentSpan.innerText = `${interval.toFixed(1)}s`;

            const btnUpgradeFoodSpeed = document.getElementById("btn-upgrade-food-speed");
            if (btnUpgradeFoodSpeed) {
                btnUpgradeFoodSpeed.innerText = `VERBESSERN (${cost} B)`;
                if (saveState.globalBits >= cost) {
                    btnUpgradeFoodSpeed.removeAttribute("disabled");
                    btnUpgradeFoodSpeed.classList.remove("disabled-upgrade");
                } else {
                    btnUpgradeFoodSpeed.setAttribute("disabled", "true");
                    btnUpgradeFoodSpeed.classList.add("disabled-upgrade");
                }
            }
        }

        // 4. Food Count (Reserve) Upgrade
        {
            const level = saveState.foodCountLevel || 0;
            const count = 1 + level;
            const cost = Math.floor(150 * Math.pow(upgradeFoodCountMult, level));

            const levelSpan = document.getElementById("food-count-level");
            const currentSpan = document.getElementById("food-count-current");
            if (levelSpan) levelSpan.innerText = String(level);
            if (currentSpan) currentSpan.innerText = `${count}x`;

            const btnUpgradeFoodCount = document.getElementById("btn-upgrade-food-count");
            if (btnUpgradeFoodCount) {
                btnUpgradeFoodCount.innerText = `VERBESSERN (${cost} B)`;
                if (saveState.globalBits >= cost) {
                    btnUpgradeFoodCount.removeAttribute("disabled");
                    btnUpgradeFoodCount.classList.remove("disabled-upgrade");
                } else {
                    btnUpgradeFoodCount.setAttribute("disabled", "true");
                    btnUpgradeFoodCount.classList.add("disabled-upgrade");
                }
            }
        }

        // 5. Snake Speed Upgrade
        {
            const level = saveState.speedLevel || 0;
            const currentSpeedPct = 100 + (level * 20);
            const cost = Math.floor(40 * Math.pow(upgradeSnakeSpeedMult, level));

            const levelSpan = document.getElementById("speed-level");
            const currentSpan = document.getElementById("speed-current");
            if (levelSpan) levelSpan.innerText = String(level);
            if (currentSpan) currentSpan.innerText = `${currentSpeedPct}%`;

            const btnUpgradeSpeed = document.getElementById("btn-upgrade-speed");
            if (btnUpgradeSpeed) {
                btnUpgradeSpeed.innerText = `VERBESSERN (${cost} B)`;
                if (saveState.globalBits >= cost) {
                    btnUpgradeSpeed.removeAttribute("disabled");
                    btnUpgradeSpeed.classList.remove("disabled-upgrade");
                } else {
                    btnUpgradeSpeed.setAttribute("disabled", "true");
                    btnUpgradeSpeed.classList.add("disabled-upgrade");
                }
            }
        }

        // 6. AI Player Autopilot Upgrade
        {
            const purchased = saveState.aiPlayerPurchased === true;
            const enabled = saveState.aiPlayerEnabled === true;
            const cost = 500;

            const currentSpan = document.getElementById("ai-player-current");
            if (currentSpan) {
                if (!purchased) {
                    currentSpan.innerText = "NICHT ERWORBEN";
                    currentSpan.className = "neon-text-pink";
                } else if (enabled) {
                    currentSpan.innerText = "AKTIV";
                    currentSpan.className = "neon-text-green";
                } else {
                    currentSpan.innerText = "INAKTIV";
                    currentSpan.className = "neon-text-gold";
                }
            }

            const btnUpgradeAIPlayer = document.getElementById("btn-upgrade-ai-player");
            if (btnUpgradeAIPlayer) {
                if (!purchased) {
                    btnUpgradeAIPlayer.innerText = `KAUFEN (${cost} B)`;
                    btnUpgradeAIPlayer.className = "btn-neon btn-upgrade";
                    if (saveState.globalBits >= cost) {
                        btnUpgradeAIPlayer.removeAttribute("disabled");
                        btnUpgradeAIPlayer.classList.remove("disabled-upgrade");
                    } else {
                        btnUpgradeAIPlayer.setAttribute("disabled", "true");
                        btnUpgradeAIPlayer.classList.add("disabled-upgrade");
                    }
                } else {
                    btnUpgradeAIPlayer.removeAttribute("disabled");
                    btnUpgradeAIPlayer.classList.remove("disabled-upgrade");
                    if (enabled) {
                        btnUpgradeAIPlayer.innerText = "DEAKTIVIEREN";
                        btnUpgradeAIPlayer.className = "btn-neon btn-upgrade secondary";
                    } else {
                        btnUpgradeAIPlayer.innerText = "AKTIVIEREN";
                        btnUpgradeAIPlayer.className = "btn-neon btn-upgrade";
                    }
                }
            }
        }
    }

    // Drawing helper functions
    function draw() {
        // Clear screen with neon trails
        ctx.fillStyle = "rgba(7, 0, 14, 0.4)"; // trails effect!
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw retro background grid lines
        drawGridPattern();

        if (gameState === "PLAYING" || gameState === "PAUSED" || gameState === "GAMEOVER") {
            // Draw Food
            foods.forEach(f => {
                drawFoodItem(f);
            });

            // Draw Powerups
            if (powerupItem) {
                drawPowerupItem();
            }

            // Draw Snake
            drawSnakeSegments();
        }

        // Draw active Particle system
        drawParticles();
    }

    // Draws subtle grid
    function drawGridPattern() {
        ctx.strokeStyle = "rgba(189, 0, 255, 0.05)";
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += GRID_SIZE) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    // Draws Food with neon glow
    function drawFoodItem(foodItem) {
        ctx.save();
        const px = foodItem.x * GRID_SIZE + GRID_SIZE / 2;
        const py = foodItem.y * GRID_SIZE + GRID_SIZE / 2;

        const isGold = foodItem.type === 'gold';

        ctx.shadowBlur = 15;
        ctx.shadowColor = isGold ? varValue('--neon-gold') : varValue('--neon-pink');
        ctx.fillStyle = isGold ? varValue('--neon-gold') : varValue('--neon-pink');

        ctx.beginPath();
        // Golden coins are slightly larger, else normal food
        const rad = isGold ? GRID_SIZE / 2 - 2 : GRID_SIZE / 2 - 4;
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.fill();

        if (isGold) {
            // Shiny retro star shape inner detail
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(px, py - 4);
            ctx.lineTo(px, py + 4);
            ctx.moveTo(px - 4, py);
            ctx.lineTo(px + 4, py);
            ctx.stroke();
        }
        ctx.restore();
    }

    // Draw active spawning Powerup Item
    function drawPowerupItem() {
        // Skip drawing frame in blinking state to simulate retro flashes
        if (powerupItem.blinkTimer > 45) return;

        ctx.save();
        const px = powerupItem.x * GRID_SIZE + GRID_SIZE / 2;
        const py = powerupItem.y * GRID_SIZE + GRID_SIZE / 2;
        const rad = GRID_SIZE / 2 - 2;

        let pColor = varValue('--neon-blue');
        if (powerupItem.type === 'ghost') pColor = varValue('--neon-purple');
        if (powerupItem.type === 'shield') pColor = varValue('--neon-pink');

        ctx.shadowBlur = 18;
        ctx.shadowColor = pColor;
        ctx.strokeStyle = pColor;
        ctx.lineWidth = 2.5;

        // Draw shape outer bounding ring
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.stroke();

        // Draw inside symbol
        ctx.fillStyle = "#fff";
        ctx.shadowBlur = 0;

        if (powerupItem.type === 'speed') {
            // Lightning symbol
            ctx.beginPath();
            ctx.moveTo(px + 2, py - 6);
            ctx.lineTo(px - 4, py + 1);
            ctx.lineTo(px - 1, py + 1);
            ctx.lineTo(px - 2, py + 6);
            ctx.lineTo(px + 4, py - 1);
            ctx.lineTo(px + 1, py - 1);
            ctx.closePath();
            ctx.fill();
        } else if (powerupItem.type === 'ghost') {
            // Ghost Eye
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(px - 4, py - 1, 2, 0, Math.PI * 2);
            ctx.arc(px + 4, py - 1, 2, 0, Math.PI * 2);
            ctx.fill();
        } else if (powerupItem.type === 'shield') {
            // Shield Cross
            ctx.fillRect(px - 5, py - 1.5, 10, 3);
            ctx.fillRect(px - 1.5, py - 5, 3, 10);
        }

        ctx.restore();
    }

    // Draws all Snake segments
    function drawSnakeSegments() {
        const config = SNAKE_TYPES[currentSnakeType];

        // Active states flags
        const isGhost = activePowerUp && activePowerUp.type === "ghost";
        const isSpeed = activePowerUp && activePowerUp.type === "speed";

        snake.forEach((part, index) => {
            // Blinking effect when invulnerable (approx 12Hz flash rate)
            if (invulnerabilityTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
                return; // Skip rendering this segment to create blinking
            }

            ctx.save();

            // Adjust segment opacity in ghost mode
            if (isGhost) {
                ctx.globalAlpha = 0.45 + Math.sin(Date.now() * 0.01 + index * 0.5) * 0.15;
            }

            const isHead = index === 0;

            // Colors configuration (Speed powerup forces pink color)
            let drawColor = config.color;
            let glow = config.glowColor;

            if (isSpeed) {
                drawColor = varValue('--neon-pink');
                glow = "rgba(255, 0, 127, 0.8)";
            } else if (isGhost) {
                drawColor = varValue('--neon-purple');
                glow = "rgba(189, 0, 255, 0.8)";
            }

            ctx.fillStyle = drawColor;
            ctx.shadowBlur = isHead ? 15 : 8;
            ctx.shadowColor = drawColor;

            // Draw Head vs Body
            const x = part.x * GRID_SIZE;
            const y = part.y * GRID_SIZE;
            const size = GRID_SIZE;

            if (isHead) {
                // Draw rounded head towards movement
                ctx.beginPath();
                ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
                ctx.fill();

                // Eyes details
                ctx.fillStyle = "#000000";
                ctx.shadowBlur = 0;

                // Position eyes depending on moving directions
                let eyeX1, eyeY1, eyeX2, eyeY2;
                if (direction.x !== 0) {
                    eyeX1 = x + size / 2 + direction.x * 3;
                    eyeY1 = y + size / 2 - 4;
                    eyeX2 = x + size / 2 + direction.x * 3;
                    eyeY2 = y + size / 2 + 4;
                } else {
                    eyeX1 = x + size / 2 - 4;
                    eyeY1 = y + size / 2 + direction.y * 3;
                    eyeX2 = x + size / 2 + 4;
                    eyeY2 = y + size / 2 + direction.y * 3;
                }
                ctx.beginPath();
                ctx.arc(eyeX1, eyeY1, 2, 0, Math.PI * 2);
                ctx.arc(eyeX2, eyeY2, 2, 0, Math.PI * 2);
                ctx.fill();

                // Active Shield Orbiting layer
                if (hasShield) {
                    ctx.strokeStyle = varValue('--neon-pink');
                    ctx.shadowBlur = 12;
                    ctx.shadowColor = varValue('--neon-pink');
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    // Rotating or static shielding orbit ring
                    const radius = size * 0.95;
                    ctx.arc(x + size / 2, y + size / 2, radius, (Date.now() * 0.005) % (Math.PI * 2), ((Date.now() * 0.005) + Math.PI * 1.5) % (Math.PI * 2));
                    ctx.stroke();
                }
            } else {
                // Body segments (draw slightly smaller and rounded corners)
                const shrink = 1.5;
                ctx.beginPath();
                ctx.arc(x + size / 2, y + size / 2, (size - shrink) / 2, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        });
    }

    // Draws particle explosions
    function drawParticles() {
        particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 6;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    // Fetch CSS variables directly
    function varValue(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }

    // Run custom game ticks inside main loop
    let tickCount = 0;
    function loop(timestamp) {
        // Calculate dynamic FPS ticks
        const currentType = SNAKE_TYPES[currentSnakeType];
        let currentSpeed = currentType.baseSpeed;

        // Apply Speed Upgrade (+10% per level)
        const upgradeMult = 1.0 + ((saveState.speedLevel || 0) * 0.1);
        currentSpeed *= upgradeMult;

        // Active Speed power-up increases updates speed
        if (activePowerUp && activePowerUp.type === "speed") {
            currentSpeed += 4.5;
        }

        const tickInterval = 1000 / currentSpeed;
        const delta = timestamp - lastTickTime;

        // Always update particles at 60fps for smooth physics decay
        updateParticles();

        if (gameState === "PLAYING") {
            // Update timer based on elapsed milliseconds since last frame
            if (lastFrameTime > 0) {
                const deltaSec = (timestamp - lastFrameTime) / 1000;
                // Cap deltaSec to avoid jumps on tab switches
                const dt = Math.min(deltaSec, 0.1);
                timeLeft -= dt;

                // Combo multiplier timer & decay checks
                const baseMult = SNAKE_TYPES[currentSnakeType].scoreMult;
                if (comboTimeLeft > 0) {
                    comboTimeLeft -= dt;
                    if (comboTimeLeft <= 0) {
                        comboTimeLeft = 0;
                        decayTimer = 0.5; // Start the 500ms decay tick
                    }
                } else if (multiplier > baseMult) {
                    decayTimer -= dt;
                    if (decayTimer <= 0) {
                        multiplier -= 0.1;
                        if (multiplier < baseMult) {
                            multiplier = baseMult;
                        } else {
                            decayTimer = 0.5; // Decrement by 0.1 every 500ms
                        }
                    }
                }

                // Tick food spawn cooldown
                const maxFoods = 1 + (saveState.foodCountLevel || 0);
                if (foods.length < maxFoods) {
                    foodSpawnCooldown -= dt;
                    if (foodSpawnCooldown <= 0) {
                        spawnFood();
                        // Reset cooldown based on upgrade level
                        const baseInterval = 5.0;
                        const speedLevel = saveState.foodSpeedLevel || 0;
                        const interval = baseInterval * Math.pow(0.75, speedLevel);
                        foodSpawnCooldown = interval;
                    }
                }

                if (timeLeft <= 0) {
                    timeLeft = 0;
                    handleTimeUp();
                    lastFrameTime = timestamp;
                    // Immediately re-draw and loop to apply the gameover state
                    draw();
                    requestAnimationFrame(loop);
                    return;
                }
            }
            lastFrameTime = timestamp;

            if (delta >= tickInterval) {
                update();
                lastTickTime = timestamp - (delta % tickInterval);
            }
        } else {
            // If in menu/paused, still blink elements
            lastFrameTime = timestamp;
            if (delta >= 1000 / 30) { // Stable 30fps animation for UI
                if (powerupItem) {
                    powerupItem.blinkTimer = (powerupItem.blinkTimer + 1) % 60;
                }
                lastTickTime = timestamp - (delta % (1000 / 30));
            }
        }

        // Run animations on ALL states
        draw();
        requestAnimationFrame(loop);
    }

    // Load save data on startup
    loadSaveState();

    // Start requestAnimationFrame Loop
    requestAnimationFrame((timestamp) => {
        lastTickTime = timestamp;
        lastFrameTime = timestamp;
        loop(timestamp);
    });
});
