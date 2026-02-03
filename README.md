
# 🎬 5000 Movie Challenge
[![Live Demo](https://img.shields.io/badge/demo-live-green.svg?style=for-the-badge&logo=github)](https://cristelo-sirc.github.io/movie-challenge/)

**Can you watch them all?**
A Tinder-style movie discovery app that challenges you to track your film history across **5,014 movies** spanning from 1980 to 2025.

## ✨ Features

### 🎞 Massive Dataset
*   **5,000+ Movies:** Curated selection of hits, cult classics, and hidden gems.
*   **Rich Metadata:** Flip the card to see **Runtime**, **Director**, **Top Cast**, and **Synopsis**.
*   **Decade Filtering:** Jump straight to the 80s, 90s, 2000s, 2010s, or 2020s.

### ⚡️ Interactive Experience
*   **Swipe Interface:** Swipe **Right** for "Seen It" (Green), **Left** for "Haven't Seen" (Red).
*   **3D Card Flip:** Tap the "Info" button to reveal detailed movie info on the back.
*   **Responsive:** optimized for both Desktop (Keyboard shortcuts) and **Mobile** (Touch gestures).

### 🎮 Gamification
*   **Streaks:** Build up a "Seen" streak to unlock fire animations.
*   **Ranks:** Level up from "Casual Viewer" to "Cinephile" as you rate more movies.
*   **Retrowave Aesthetics:** 80s-inspired neon UI with satisfying sound effects.

### 💾 Backup & Sync
*   **Local First:** All progress is saved automatically to your browser.
*   **Privacy Focused:** No account required. No tracking.
*   **Cross-Device Sync:** Export your progress as a **QR Code** to move from Desktop to Mobile instantly.

## 🛠 Tech Stack
Built for speed and simplicity using modern web standards.
*   **Core:** Vanilla JavaScript (ES6+), HTML5, CSS3.
*   **Storage:** `localStorage` for persistence, `LZString` for compressed QR codes.
*   **Performance:**
    *   Zero frameworks (No React/Vue/Angular bloat).
    *   Virtual "Sliding Window" DOM rendering (renders only 5 cards at a time for 60fps performance).
    *   Smart image preloading.

## 🚀 Deployment
This project is automatically deployed/hosted via **GitHub Pages**.
*   **Live URL:** [https://cristelo-sirc.github.io/movie-challenge/](https://cristelo-sirc.github.io/movie-challenge/)
*   **Workflow:** Pushing to the `main` branch triggers a GitHub Action (`.github/workflows/deploy.yml`) that builds and deploys the static content.

## 💻 Run Locally
No build step required! This is a static web application.

1.  Clone the repository.
2.  Open `index.html` in your browser.
    *   *Note: For the best experience with file paths, running a simple local server (e.g., `python3 -m http.server`) is recommended but not strictly required.*

## 👏 Credits
*   Movie Data provided by [The Movie Database (TMDB)](https://www.themoviedb.org/).
*   *This product uses the TMDB API but is not endorsed or certified by TMDB.*
