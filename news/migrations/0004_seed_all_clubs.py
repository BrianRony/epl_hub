from django.db import migrations

def seed_rest_of_league(apps, schema_editor):
    Club = apps.get_model('news', 'Club')
    
    # The full list of current/recent PL teams to ensure coverage
    clubs_data = [
        # Existing Big 6 (just to be safe, though they exist)
        {'name': 'Arsenal', 'slug': 'arsenal'},
        {'name': 'Chelsea', 'slug': 'chelsea'},
        {'name': 'Liverpool', 'slug': 'liverpool'},
        {'name': 'Manchester City', 'slug': 'manchester-city'},
        {'name': 'Manchester United', 'slug': 'manchester-united'},
        {'name': 'Tottenham Hotspur', 'slug': 'tottenham-hotspur'},
        
        # The Challengers (Already in frontend styles)
        {'name': 'Aston Villa', 'slug': 'aston-villa'},
        {'name': 'Newcastle United', 'slug': 'newcastle'},
        {'name': 'West Ham United', 'slug': 'west-ham'},
        {'name': 'Everton', 'slug': 'everton'},
        {'name': 'Wolverhampton Wanderers', 'slug': 'wolves'},
        
        # The Rest of the League (Standard 2024/25 set)
        {'name': 'Brighton & Hove Albion', 'slug': 'brighton'},
        {'name': 'Brentford', 'slug': 'brentford'},
        {'name': 'Crystal Palace', 'slug': 'crystal-palace'},
        {'name': 'Fulham', 'slug': 'fulham'},
        {'name': 'Nottingham Forest', 'slug': 'nottingham-forest'},
        {'name': 'Bournemouth', 'slug': 'bournemouth'},
        {'name': 'Leicester City', 'slug': 'leicester'},
        {'name': 'Southampton', 'slug': 'southampton'},
        {'name': 'Ipswich Town', 'slug': 'ipswich'},
        
        # General League News
        {'name': 'Premier League', 'slug': 'premier-league'},
    ]

    for data in clubs_data:
        Club.objects.get_or_create(slug=data['slug'], defaults={'name': data['name']})

class Migration(migrations.Migration):

    dependencies = [
        ('news', '0003_alter_post_options_post_credibility_score_and_more'), # Depends on the previous schema change
    ]

    operations = [
        migrations.RunPython(seed_rest_of_league),
    ]
