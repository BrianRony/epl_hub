# Deployment Checklist

When deploying this project to a live server, remember to perform these steps:

## 1. Database
Run migrations to set up the database schema on the server:
```bash
python manage.py migrate
```

## 2. Static Files
Collect static files (CSS/JS) for the backend admin:
```bash
python manage.py collectstatic
```

## 3. Scheduled Tasks (News Fetching)
The news fetcher does **not** run automatically on a new server. You must set it up.

### Option A: VPS / Linux Server (Recommended)
Run `crontab -e` and add this line (update the path!):
```
*/10 * * * * cd /path/to/epl_fan_hub && /path/to/venv/bin/python manage.py fetch_news >> fetch.log 2>&1
```

### Option B: Heroku / PaaS
Add a **Scheduler** add-on and configure a job:
*   **Command:** `python manage.py fetch_news`
*   **Frequency:** Every 10 minutes
