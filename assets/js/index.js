window.onload = () => {
  const game = new Game("main-canvas");
  game.setupListener();   
  renderHighscoreList("highscore-list-start", game.scoreManager.getScores());
};