---
name: project_steps
description: Steps and instructions for setting up and running this AI Studio project.
---

# Project Setup and Steps

This project is an AI Studio application. Follow these steps to set it up and run it locally:

## 1. Prerequisites
- Ensure **Node.js** is installed on your system.
- Ensure you have a valid **Gemini API Key**.

## 2. Installation
Run the following command in the project root to install the necessary dependencies:
```bash
npm install
```

## 3. Environment Variables
The application requires your Gemini API key to function correctly.
- Copy `.env.example` to `.env.local` (or create a new `.env.local` file).
- Open `.env.local` and set your key:
  ```
  GEMINI_API_KEY=your_gemini_api_key_here
  ```

## 4. Running Locally
Start the development server:
```bash
npm run dev
```
The application should now be accessible locally (usually at `http://localhost:5173/` for Vite).

## 5. Development Guidelines
- **Source Code**: Most of the logic is placed inside the `src` directory. The main entry point is `src/main.tsx`.
- **TypeScript**: The project uses TypeScript. Ensure new files are `.ts` or `.tsx` and define relevant types (e.g., in `src/types.ts`).
- **Styling**: Make sure to check the existing CSS and components before adding new styles to maintain a consistent aesthetic.
