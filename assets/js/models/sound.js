// ======================================================================
// SoundManager – handles background music and mute state
// ======================================================================

class SoundManager {
  constructor() {
    this.musicGameplay = document.getElementById("ingame-audio");
    this.musicGameOver = document.getElementById("menu-audio");

    this.currentMusic = null;
    this.isMuted = false;
  }

  // Play a music track, handling switching between tracks
  playMusic(audioElement) {
    if (!audioElement) return;

    // Stop previously playing track if it's different
    if (this.currentMusic && this.currentMusic !== audioElement) {
      this.currentMusic.pause();
    }

    this.currentMusic = audioElement;

    // When muted, do not start playback (but remember selected track)
    if (this.isMuted) return;

    audioElement.loop = true;
    audioElement.volume = 0.4;

    audioElement.play().catch((err) => {
      console.log("Error playing track:", err);
    });
  }

  // Toggle global mute state (pauses or resumes current track)
  toggleMute() {
    this.isMuted = !this.isMuted;

    if (this.isMuted) {
      if (this.currentMusic) this.currentMusic.pause();
    } else {
      if (this.currentMusic) {
        this.currentMusic.play().catch((err) => {
          console.log("Error resuming track:", err);
        });
      }
    }
  }
}
