// Snake 5.0 – Internationalisation (i18n)
// Supported languages: de (German), en (English)

const LANG = {
    de: {
        // ── Menu ──
        scoreLabel:         "PUNKTE:",
        btnStart:           "SPIEL STARTEN",
        btnUpgrades:        "UPGRADES",
        btnHardReset:       "HARD RESET",

        // ── Reset Modal ──
        resetTitle:         "⚠ HARD RESET",
        resetWarning:       "Alle Upgrades und Bits werden unwiderruflich gelöscht!",
        btnConfirm:         "BESTÄTIGEN",
        btnCancel:          "ABBRECHEN",

        // ── HUD ──
        hudTotalBits:       "GESAMT-BITS",
        hudMultiplier:      "MULTIPLIKATOR",
        hudSnake:           "SCHLANGE",
        hudTime:            "ZEIT",
        hudPowerup:         "POWERUP",
        hudNone:            "KEINES",

        // ── Power-up names ──
        powerSpeed:         "SPEED",
        powerGhost:         "GEIST",
        powerShield:        "SCHILD",

        // ── Game Over ──
        timeUp:             "ZEIT ABGELAUFEN!",
        crash:              "CRASH!",
        totalBalance:       "Gesamtguthaben:",
        bits:               "Bits",
        btnGameoverUpgrades: "UPGRADES",
        btnRestart:         "NOCHMAL SPIELEN",
        btnMenu:            "ZUM HAUPTMENÜ",

        // ── Pause ──
        pauseTitle:         "PAUSE",
        pauseHint:          "Drücke <kbd>ESC</kbd> oder tippe hier, um fortzufahren",
        btnResume:          "WEITER",

        // ── Skill Tree ──
        skilltreeTitle:     "UPGRADE-MODULATOR",
        yourBits:           "DEINE BITS:",
        btnStartRound:      "RUNDE STARTEN",
        btnBack:            "ZURÜCK",
        btnUpgrade:         "VERBESSERN",
        btnBuy:             "KAUFEN",
        btnEnable:          "AKTIVIEREN",
        btnDisable:         "DEAKTIVIEREN",

        // Skill: Round Time
        skillTimeName:      "Rundenzeit-Expansion",
        skillTimeDesc:      "Erhöht das Zeitlimit der Runde um +1s.",
        labelLevel:         "Stufe:",
        labelDuration:      "Dauer:",

        // Skill: Food Multiplier
        skillFoodMultName:  "Nahrungs-Multiplikator",
        skillFoodMultDesc:  "Erhöht den Score-Gewinn durch Nahrung um *10%.",
        labelEffect:        "Effekt:",

        // Skill: Food Replicator
        skillFoodSpeedName: "Nahrungs-Replikator",
        skillFoodSpeedDesc: "Repliziert neue Nahrung schneller auf dem Spielfeld.",
        labelSpawnRate:     "Spawntakt:",

        // Skill: Snack Reserve
        skillFoodCountName: "Snack-Reserve",
        skillFoodCountDesc: "Erhöht die maximale Nahrungsmenge auf dem Spielfeld um +1.",
        labelFood:          "Nahrung:",

        // Skill: Snake Speed
        skillSpeedName:     "Schlangen-Antrieb",
        skillSpeedDesc:     "Erhöht das Bewegungstempo der Schlange um *20%.",
        labelSpeed:         "Tempo:",

        // Skill: AI Player
        skillAIName:        "Autopilot-Modul (KI)",
        skillAIDesc:        "Steuert die Schlange automatisch zum nächstgelegenen Snack.",
        labelStatus:        "Status:",
        aiNotBought:        "NICHT ERWORBEN",
        aiActive:           "AKTIV",
        aiInactive:         "INAKTIV",

        // ── Footer ──
        footerHint: "Steuerung: <kbd>WASD</kbd> / <kbd>Pfeiltasten</kbd> zum Bewegen | <kbd>ESC</kbd> für Pause",

        // ── Snake type descriptions ──
        desc_veloscythe:    "Geschwindigkeits-Spezialist.",
        desc_viper:         "Klassisch & ausgeglichen.",
        desc_monarch:       "Gierig aber schwerfällig.",
    },

    en: {
        // ── Menu ──
        scoreLabel:         "SCORE:",
        btnStart:           "START GAME",
        btnUpgrades:        "UPGRADES",
        btnHardReset:       "HARD RESET",

        // ── Reset Modal ──
        resetTitle:         "⚠ HARD RESET",
        resetWarning:       "All upgrades and bits will be permanently deleted!",
        btnConfirm:         "CONFIRM",
        btnCancel:          "CANCEL",

        // ── HUD ──
        hudTotalBits:       "TOTAL BITS",
        hudMultiplier:      "MULTIPLIER",
        hudSnake:           "SNAKE",
        hudTime:            "TIME",
        hudPowerup:         "POWERUP",
        hudNone:            "NONE",

        // ── Power-up names ──
        powerSpeed:         "SPEED",
        powerGhost:         "GHOST",
        powerShield:        "SHIELD",

        // ── Game Over ──
        timeUp:             "TIME'S UP!",
        crash:              "CRASH!",
        totalBalance:       "Total balance:",
        bits:               "Bits",
        btnGameoverUpgrades: "UPGRADES",
        btnRestart:         "PLAY AGAIN",
        btnMenu:            "MAIN MENU",

        // ── Pause ──
        pauseTitle:         "PAUSE",
        pauseHint:          "Press <kbd>ESC</kbd> or tap here to resume",
        btnResume:          "RESUME",

        // ── Skill Tree ──
        skilltreeTitle:     "UPGRADE MODULATOR",
        yourBits:           "YOUR BITS:",
        btnStartRound:      "START ROUND",
        btnBack:            "BACK",
        btnUpgrade:         "UPGRADE",
        btnBuy:             "BUY",
        btnEnable:          "ENABLE",
        btnDisable:         "DISABLE",

        // Skill: Round Time
        skillTimeName:      "Round Time Expansion",
        skillTimeDesc:      "Increases the round time limit by +1s.",
        labelLevel:         "Level:",
        labelDuration:      "Duration:",

        // Skill: Food Multiplier
        skillFoodMultName:  "Food Multiplier",
        skillFoodMultDesc:  "Increases score gain from food by *10%.",
        labelEffect:        "Effect:",

        // Skill: Food Replicator
        skillFoodSpeedName: "Food Replicator",
        skillFoodSpeedDesc: "Replicates new food faster on the playfield.",
        labelSpawnRate:     "Spawn rate:",

        // Skill: Snack Reserve
        skillFoodCountName: "Snack Reserve",
        skillFoodCountDesc: "Increases the maximum food count on the field by +1.",
        labelFood:          "Food:",

        // Skill: Snake Speed
        skillSpeedName:     "Snake Drive",
        skillSpeedDesc:     "Increases the snake movement speed by *20%.",
        labelSpeed:         "Speed:",

        // Skill: AI Player
        skillAIName:        "Autopilot Module (AI)",
        skillAIDesc:        "Automatically steers the snake toward the nearest snack.",
        labelStatus:        "Status:",
        aiNotBought:        "NOT PURCHASED",
        aiActive:           "ACTIVE",
        aiInactive:         "INACTIVE",

        // ── Footer ──
        footerHint: "Controls: <kbd>WASD</kbd> / <kbd>Arrow Keys</kbd> to move | <kbd>ESC</kbd> to pause",

        // ── Snake type descriptions ──
        desc_veloscythe:    "Speed specialist.",
        desc_viper:         "Classic & balanced.",
        desc_monarch:       "Greedy but sluggish.",
    }
};

// ── Active language ────────────────────────────────────────────────────────
let currentLang = localStorage.getItem("snake5_lang") || "de";

/** Translate key to active language. Falls back to key string if missing. */
function t(key) {
    return LANG[currentLang][key] ?? key;
}

/** Switch language, persist to localStorage, and re-apply all static strings */
function setLang(lang) {
    if (!LANG[lang]) return;
    currentLang = lang;
    localStorage.setItem("snake5_lang", lang);
    applyTranslations();
    updateLangToggleUI();
}

/** Apply translations to every element that carries a data-i18n attribute.
 *  data-i18n="key"          → sets innerText
 *  data-i18n-html="key"     → sets innerHTML (for <kbd> tags etc.)
 */
function applyTranslations() {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        el.innerText = t(key);
    });
    document.querySelectorAll("[data-i18n-html]").forEach(el => {
        const key = el.getAttribute("data-i18n-html");
        el.innerHTML = t(key);
    });
}

/** Highlight the active language button */
function updateLangToggleUI() {
    const btnDe = document.getElementById("btn-lang-de");
    const btnEn = document.getElementById("btn-lang-en");
    if (btnDe) btnDe.classList.toggle("active", currentLang === "de");
    if (btnEn) btnEn.classList.toggle("active", currentLang === "en");
}

// Apply translations as soon as the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    applyTranslations();
    updateLangToggleUI();

    document.getElementById("btn-lang-de")?.addEventListener("click", () => setLang("de"));
    document.getElementById("btn-lang-en")?.addEventListener("click", () => setLang("en"));
});
