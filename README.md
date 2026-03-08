LiveScape — Remote Location Experience Preview Platform

Overview
--------
LiveScape lets users pick any point on a map and preview the real-world condition at that exact coordinate using multiple data sources (geocoding, weather, webcams, photos, satellite imagery) and smart analysis (Scenic Score, crowd estimation, travel recommendation).

This repository contains two projects:
- `frontend/` — React + Vite single page app
- `backend/` — Node.js + Express REST API

Run
---
1. Backend: open a terminal in `backend/` and run:

   npm install
   npm run dev

2. Frontend: open another terminal in `frontend/` and run:

    npm install
    npm run dev

Utility scripts
- Quick push helper (cross-platform): `tools/gitgone.sh` (POSIX) or `tools/gitgone.bat` (Windows). Run from repository root with an optional commit message:
  - `bash tools/gitgone.sh "my message"`
  - `tools\\gitgone.bat "my message"`

Environment
-----------
Copy `.env.example` in `backend/` and `frontend/` to `.env` and fill your API keys (Mapbox token, Weather API keys, etc.). The code will use environment variables and also fall back to mock responses if keys are not provided.

Folder Structure
----------------
See `frontend/` and `backend/` for individual README notes and comments in the code explaining services.

Goal
----
Provide a modern dark UI to preview remote locations and help decide whether travelling there is worth it.
