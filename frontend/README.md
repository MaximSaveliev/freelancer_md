<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/f79ff592-8cb2-481a-b7e5-1fc7888c3a0d

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set environment variables in [.env.local](.env.local):
   - `GEMINI_API_KEY` (Gemini API key)
   - `NEXT_PUBLIC_BACKEND_HOST` (backend API host, e.g. `https://localhost:44374`)
   - `NEXT_PUBLIC_MESSENGER_HOST` (messenger API host, e.g. `http://localhost:5273`)

   You can start from [.env.example](.env.example).
