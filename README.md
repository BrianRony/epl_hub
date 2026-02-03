# EPL Fan Hub ⚽️

A Django-based news aggregator and API for the English Premier League's "Big Six" clubs. This project collects news from RSS feeds and serves it via a REST API.

## Features

*   **News Aggregator:** Automatically fetches latest news for Arsenal, Chelsea, Liverpool, Man City, Man United, and Tottenham via a custom management command.
*   **REST API:** Fully browsable JSON API built with Django REST Framework (DRF).
*   **Admin Dashboard:** Built-in interface to manage clubs and news posts manually.
*   **Data Models:** robust database structure with UUID primary keys and Foreign Key relationships.

## Tech Stack

*   **Backend:** Python, Django
*   **API:** Django REST Framework
*   **Database:** SQLite (default)
*   **Utilities:** feedparser (for RSS), django-cors-headers

## Getting Started

Follow these steps to get the project running locally.

### 1. Prerequisites

*   Python 3.8+
*   Git

### 2. Installation

Clone the repository and navigate to the project folder:

```bash
git clone git@github.com:BrianRony/epl_hub.git
cd epl_hub
```

Create and activate a virtual environment:

```bash
# Create the environment
python3 -m venv venv

# Activate it (Linux/macOS)
source venv/bin/activate
# Or on Windows:
# venv\Scripts\activate
```

Install the dependencies:

```bash
pip install django djangorestframework django-cors-headers feedparser
```

### 3. Database Setup

Apply the migrations to create your database tables:

```bash
python manage.py migrate
```

Create a superuser to access the admin panel:

```bash
python manage.py createsuperuser
```

### 4. Running the Server

Start the development server:

```bash
python manage.py runserver
```

You can now access:
*   **Admin Panel:** [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)
*   **API (Clubs):** [http://127.0.0.1:8000/api/clubs/](http://127.0.0.1:8000/api/clubs/)
*   **API (Posts):** [http://127.0.0.1:8000/api/posts/](http://127.0.0.1:8000/api/posts/)

## Automation: Fetching News

To populate the database with the latest news from the web, run this custom command:

```bash
python manage.py fetch_news
```

This will scrape the configured RSS feeds and add new articles to your database automatically.

## Project Structure

*   `epl_hub/`: The main Django project configuration.
*   `news/`: The app containing models, views, and the news fetching logic.
    *   `models.py`: Database definitions (Club, Post).
    *   `serializers.py`: API data translators.
    *   `views.py`: API logic.
    *   `management/commands/fetch_news.py`: The RSS scraper script.
