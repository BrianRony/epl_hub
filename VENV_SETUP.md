# Virtual Environment Setup Guide

## Activating the Virtual Environment

Follow these steps to enter the Python virtual environment for this project:

### On Linux/macOS:

1. **Open your terminal** and navigate to the project root:
   ```bash
   cd /home/brian/Dev/projects/epl_fan_hub
   ```

2. **Activate the virtual environment**:
   ```bash
   source venv/bin/activate
   ```

3. **Verify activation** - Your terminal prompt should now show `(venv)` at the beginning:
   ```
   (venv) user@machine:~/Dev/projects/epl_fan_hub$
   ```


## Deactivating the Virtual Environment

When you're done working, deactivate the environment by running:

```bash
deactivate
```

---

## Installing Dependencies (while in venv)

Once activated, install required packages:

```bash
pip install -r requirements.txt
```

---

## Running Django Commands

After activating the venv, you can run Django commands:

```bash
# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver

# Create superuser
python manage.py createsuperuser
```

---

## Troubleshooting

- **If venv doesn't exist**, create it:
  ```bash
  python -m venv venv
  ```

- **If you get "Permission denied"** on Linux/macOS, try:
  ```bash
  chmod +x venv/bin/activate
  source venv/bin/activate
  ```
