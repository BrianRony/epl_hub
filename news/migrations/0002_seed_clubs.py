from django.db import migrations

def seed_clubs(apps, schema_editor):
    # We can't import the Club model directly as it may be a newer
    # version than this migration expects. We use the historical version.
    Club = apps.get_model('news', 'Club')
    
    clubs_data = [
        {'name': 'Arsenal', 'slug': 'arsenal'},
        {'name': 'Chelsea', 'slug': 'chelsea'},
        {'name': 'Liverpool', 'slug': 'liverpool'},
        {'name': 'Manchester City', 'slug': 'manchester-city'},
        {'name': 'Manchester United', 'slug': 'manchester-united'},
        {'name': 'Tottenham Hotspur', 'slug': 'tottenham-hotspur'},
    ]

    for data in clubs_data:
        # get_or_create ensures we don't create duplicates if we run this again
        Club.objects.get_or_create(slug=data['slug'], defaults={'name': data['name']})

def reverse_seed(apps, schema_editor):
    # This optional function allows us to reverse the migration (delete the clubs)
    # if we ever run "python manage.py migrate news 0001"
    Club = apps.get_model('news', 'Club')
    Club.objects.filter(slug__in=[
        'arsenal', 'chelsea', 'liverpool', 'manchester-city', 
        'manchester-united', 'tottenham-hotspur'
    ]).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('news', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_clubs, reverse_seed),
    ]
