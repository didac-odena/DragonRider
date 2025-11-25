// ======================================================================
// renderHighscoreList – paints highscore entries into a target container
// ======================================================================

function renderHighscoreList(containerId, scores) {
  const box = document.getElementById(containerId);
  if (!box) return;

  box.innerHTML = "";

  if (scores.length === 0) {
    box.innerHTML = "<div>No scores yet</div>";
    return;
  }

  scores.forEach((entry, i) => {
    const minutes = String(Math.floor(entry.timeSurvived / 1000 / 60)).padStart(2, "0");
    const seconds = String(Math.floor((entry.timeSurvived / 1000) % 60)).padStart(2, "0");
    const tenths  = String(Math.floor(entry.timeSurvived / 100) % 10);

    const formatted = `${minutes}:${seconds}.${tenths}`;

    const line = document.createElement("div");
    line.textContent = `${i + 1}. ${entry.name} - ${formatted}`;
    box.appendChild(line);
  });
}
