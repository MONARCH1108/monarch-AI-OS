# ProjectMN

ProjectMN currently has two parts:

- `ClientMN`: React + Vite frontend
- `Server`: FastAPI backend that reads Google Sheets data, generates analytics JSON, and exposes API endpoints

## Current status

- Dashboard route is available at `/`
- Tracker route exists at `/Tracker`
- The frontend shows daily and weekly analytics
- The backend pipeline generates task, daily, weekly, and monthly data files

## Run the project

### Backend

From the `Server` folder:

```bash
python -m uvicorn server:app --reload
```

```bash
python -m uvicorn server:app --host 0.0.0.0 --port 8000
```
The Above command is to host backend with Local IPV4 Address

Backend runs on:

```text
http://127.0.0.1:8000
```

API docs:

```text
http://127.0.0.1:8000/docs
```

### Frontend

From the `ClientMN` folder:

```bash
npm install
npm run dev
```

Frontend runs on Vite's local dev server.

## Backend endpoints

- `GET /health`
- `POST /pipeline/run`
- `GET /tasks`
- `GET /analytics/daily`
- `GET /analytics/weekly`
- `GET /analytics/monthly`

## Important note

`ClientMN/vite.config.js` currently proxies `/analytics` requests to `http://192.168.0.7:8000`. If your backend is running on a different host, update that value before using the frontend in development.
