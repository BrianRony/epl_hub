#!/bin/bash
# A simple loop to fetch news every 10 minutes
# Usage: ./auto_fetch.sh &

while true; do
    echo "[$(date)] Fetching news..."
    venv/bin/python manage.py fetch_news
    echo "[$(date)] Done. Sleeping for 10 minutes..."
    sleep 600
done
