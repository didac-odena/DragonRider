class ScoreManager {
  constructor() {
    this.scores = this.loadScores();

    this.pendingTime = 0;
    this.uiSetupDone = false;
  }

  loadScores() {
    const storage = localStorage.getItem(SCORE_STORAGE_KEY);

    if (!storage) {
      return [];
    }

    const parsed = JSON.parse(storage);

    if (Array.isArray(parsed)) {
      return parsed;
    } else {
      return [];
    }
  }

  saveScores() {
    const json = JSON.stringify(this.scores);

    localStorage.setItem(SCORE_STORAGE_KEY, json);
  }

  correctName(name) {
    let clean = String(name);
    clean = clean.trim();

    if (clean.length > 10) {
      clean = clean.slice(0, 10);
    }
    if (clean === "") {
      clean = "?????";
    }
    return clean;
  }

  addScore(name, timeSurvived) {
    const safeName = this.correctName(name);
    const safeTime = Number(timeSurvived) || 0;

    const newEntry = {
      name: safeName,
      timeSurvived: safeTime,
      date: new Date().toISOString(),
    };

    this.scores.push(newEntry);

    this.scores.sort((a, b) => b.timeSurvived - a.timeSurvived);

    this.scores = this.scores.slice(0, MAX_SCORES);

    this.saveScores();
  }

  isTopScore(timeSurvived) {
    if (this.scores.length < MAX_SCORES) {
      return true;
    }

    const worstScore = this.scores[this.scores.length - 1].timeSurvived;

    return timeSurvived >= worstScore;
  }

  getScores() {
    return [...this.scores];
  }

  formatTimeWithTenths(ms) {
    var totalTenths = Math.floor(ms / 100);
    var totalSeconds = Math.floor(totalTenths / 10);

    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    var tenths = totalTenths % 10;

    var mm = String(minutes).padStart(2, "0");
    var ss = String(seconds).padStart(2, "0");

    return mm + ":" + ss + "." + tenths;
  }

  setupUI() {
    if (this.uiSetupDone) {
      return;
    }

    const saveButton = document.getElementById("highscore-save-button");
    if (!saveButton) {
      return;
    }

    saveButton.addEventListener("click", () => {
      const input = document.getElementById("highscore-name-input");
      let name = "";

      if (input) {
        name = input.value;
      }

      this.addScore(name, this.pendingTime);
      renderHighscoreList("highscore-list-gameover", this.getScores());


      const panel = document.getElementById("highscore-panel");
      if (panel) {
        panel.classList.add("hidden");
      }

      const menu = document.getElementById("gameover-menu");
      if (menu) {
        menu.classList.remove("hidden");
      }
    });

    this.uiSetupDone = true;
  }

  showHighscorePanel(timeMs) {
    this.pendingTime = timeMs;

    this.setupUI();

    const panel = document.getElementById("highscore-panel");
    if (panel) {
      panel.classList.remove("hidden");
    }

    const timeSpan = document.getElementById("highscore-time");
    if (timeSpan) {
      timeSpan.textContent = this.formatTimeWithTenths(timeMs);
    }
  }
}
