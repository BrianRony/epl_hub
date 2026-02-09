# Deployment Guide: EPL Fan Hub

Your project is ready for deployment! Follow these steps to get your backend on Render (with Neon DB) and frontend on Vercel.

## Part 1: Database (Neon)

1.  **Create a Neon Project:**
    *   Go to [console.neon.tech](https://console.neon.tech/).
    *   Create a new project (e.g., `epl-fan-hub`).
    *   **Copy the Connection String:** Look for the Postgres connection string (e.g., `postgres://user:password@ep-xyz.aws.neon.tech/neondb...`).

## Part 2: Backend (Render)

1.  **Create a Web Service:**
    *   Go to [dashboard.render.com](https://dashboard.render.com/).
    *   Click **New +** -> **Web Service**.
    *   Connect your GitHub repository.

2.  **Configure Settings:**
    *   **Name:** `epl-fan-hub-api` (or similar)
    *   **Runtime:** Python 3
    *   **Build Command:** `./build.sh`
    *   **Start Command:** `gunicorn epl_hub.wsgi:application`

3.  **Environment Variables:**
    *   Add the following variables:
        *   `DATABASE_URL`: (Paste your Neon connection string here)
        *   `SECRET_KEY`: (Generate a random string or use a complex password)
        *   `PYTHON_VERSION`: `3.8.10` (or `3.11.0` if you want to upgrade, but matches your local venv)
        *   `RENDER`: `true` (This triggers production settings in `settings.py`)

4.  **Deploy:** Click **Create Web Service**.

5.  **Add the Cron Job (CRITICAL):**
    *   Once the service is created, go to the **Cron Jobs** tab on the Render dashboard sidebar (or create a new "Cron Job" service).
    *   **Command:** `python manage.py fetch_news`
    *   **Schedule:** `*/10 * * * *` (Every 10 minutes)
    *   **Environment:** Connect it to the same repo and use the same `DATABASE_URL` variable!

## Part 3: Frontend (Vercel)

1.  **Import Project:**
    *   Go to [vercel.com](https://vercel.com/).
    *   Click **Add New...** -> **Project**.
    *   Import your `epl-fan-hub` repository.

2.  **Configure:**
    *   **Framework Preset:** Vite (it should auto-detect).
    *   **Root Directory:** `client` (Click "Edit" and select the `client` folder).

3.  **Environment Variables:**
    *   Expand the **Environment Variables** section.
    *   Key: `VITE_API_URL`
    *   Value: `https://your-render-app-name.onrender.com/api` (Replace with your actual Render URL from Part 2).

4.  **Deploy:** Click **Deploy**.

## Troubleshooting

*   **Database Error:** Check if `DATABASE_URL` is correct in Render.
*   **Static Files Error:** Ensure `./build.sh` ran successfully in the Render logs.
*   **CORS Error:** If the frontend can't talk to the backend, ensure your Vercel URL is whitelisted (currently `CORS_ALLOW_ALL_ORIGINS = True` is set, so it should work immediately).
