# Contributing to The Digital Junk Drawer 

First off, thank you for considering contributing! This project is built on the idea that every app—no matter how small or "useless"—deserves a home.

## How to add your App or Game

To keep the drawer organized and fast, please follow these steps:

### 1. Prepare your files
You only need two things:
* **Your App:** A single `.html` file (CSS and JS should be internal to the HTML or hosted via CDN).
* **A Thumbnail:** A highly compressed `.webp` or `.jpg` image (keep it around 400x300px). **The image must be strictly under 50KB to preserve page load speed.**

### 2. The Workflow
1.  **Fork** this repository to your own GitHub account.
2.  **Upload** your HTML file into the `HTMLs/` folder.
3.  **Upload** your image into the `Images/` folder.
4.  **Edit `projects.json`**: Instead of editing the index file, simply append your app's details as a new JSON object inside the array. 
    *(⚠️ Pro-tip: Make sure to add a comma `,` after the previous project object so the JSON doesn't break!)*
    ```json
    {
      "id": "your-unique-app-name",
      "href": "HTMLs/yourFileName.html",
      "img": "Images/yourImageName.webp",
      "alt": "Short description of the image",
      "title": "Your App Name",
      "info": "A short description of what your app does.\\n\\n Make it fun!",
      "category": "Choose one: Nostalgia, Mini-Games, Brain Teasers, or Useless Tools"
    }
    ```
5.  **Submit a Pull Request (PR)**: Describe what your app does!

### 3. Guidelines
* No malicious scripts or trackers.
* Ensure the UI looks decent on mobile.
* Keep file names simple (e.g., `myCoolGame.html`).

NOTE: If your idea is already in the drawer, add it anyway, we will do some sort of leaderboard for that idea in the future. 

I will review your PR as soon as possible.