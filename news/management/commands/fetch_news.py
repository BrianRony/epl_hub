import feedparser
import time
import random
from datetime import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Q
from news.models import Club, Post

# Configuration for URL generation
# ... (same config)

CLUB_CONFIG = {
    # Big 6
    'arsenal': {'sky': '11670', 'guardian': 'arsenal', 'official': 'https://www.arsenal.com/rss-feeds/news'},
    'chelsea': {'sky': '11668', 'guardian': 'chelsea', 'official': 'https://www.chelseafc.com/en/news/rss'},
    'liverpool': {'sky': '11669', 'guardian': 'liverpool', 'official': 'https://www.liverpoolfc.com/news.rss'},
    'manchester-city': {'sky': '11679', 'guardian': 'manchester-city', 'official': 'https://www.mancity.com/rss/news'},
    'manchester-united': {'sky': '11667', 'guardian': 'manchester-united', 'official': 'https://www.manutd.com/en/rss/news-and-features'},
    'tottenham-hotspur': {'sky': '11675', 'guardian': 'tottenham-hotspur', 'official': 'https://www.tottenhamhotspur.com/rss/news/'},

    # The Challengers
    'aston-villa': {'sky': '11677', 'guardian': 'aston-villa'},
    'newcastle': {'sky': '11678', 'guardian': 'newcastleunited', 'bbc_slug': 'newcastle-united'}, # BBC slug differs slightly
    'west-ham': {'sky': '11685', 'guardian': 'westhamunited', 'bbc_slug': 'west-ham-united'},
    'everton': {'sky': '11671', 'guardian': 'everton'},
    'wolves': {'sky': '11699', 'guardian': 'wolverhampton-wanderers', 'bbc_slug': 'wolverhampton-wanderers'},

    # The Rest
    'brighton': {'sky': '11741', 'guardian': 'brighton', 'bbc_slug': 'brighton-and-hove-albion'},
    'brentford': {'sky': '11715', 'guardian': 'brentford'},
    'crystal-palace': {'sky': '11700', 'guardian': 'crystalpalace'},
    'fulham': {'sky': '11681', 'guardian': 'fulham'},
    'nottingham-forest': {'sky': '11727', 'guardian': 'nottinghamforest'},
    'bournemouth': {'sky': '11734', 'guardian': 'bournemouth'},
    'leicester': {'sky': '11712', 'guardian': 'leicestercity', 'bbc_slug': 'leicester-city'},
    'southampton': {'sky': '11707', 'guardian': 'southampton'},
    'ipswich': {'sky': '11739', 'guardian': 'ipswich-town', 'bbc_slug': 'ipswich-town'},

    # General
    'premier-league': {'sky': '11065', 'guardian': 'premierleague', 'bbc_slug': 'premier-league', 'no_bbc_team_path': True} 
}

SOURCE_SCORES = {
    'official': 5,
    'mainstream': 3,
    'fan': 1,
}

class Command(BaseCommand):
    help = 'Fetch football news from multiple RSS sources dynamically.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting dynamic news fetch...'))

        # OPTIMIZATION: Only fetch 5 random clubs + Premier League to prevent timeout on free tier
        all_clubs = list(CLUB_CONFIG.keys())
        random.shuffle(all_clubs)
        
        # Always include Premier League, then pick 4 others
        target_slugs = ['premier-league'] + all_clubs[:4]
        target_slugs = list(set(target_slugs)) # dedupe if PL was picked randomly

        self.stdout.write(f"Targeting batch: {', '.join(target_slugs)}")

        for slug in target_slugs:
            config = CLUB_CONFIG.get(slug)
            if not config: continue

            try:
                club = Club.objects.get(slug=slug)
            except Club.DoesNotExist:
                continue

            self.stdout.write(f' Fetching for {club.name}...')
            
            # 1. Build Feed List dynamically
            feeds = []

            # Official
            if 'official' in config:
                feeds.append(('official', config['official']))

            # Sky Sports
            if 'sky' in config:
                feeds.append(('mainstream', f"https://www.skysports.com/rss/{config['sky']}"))

            # Guardian
            if 'guardian' in config:
                feeds.append(('mainstream', f"https://www.theguardian.com/football/{config['guardian']}/rss"))

            # BBC
            # Default BBC slug matches our DB slug unless override provided
            bbc_slug = config.get('bbc_slug', slug)
            if config.get('no_bbc_team_path'):
                 feeds.append(('mainstream', "https://feeds.bbci.co.uk/sport/football/premier-league/rss.xml"))
            else:
                 feeds.append(('mainstream', f"https://feeds.bbci.co.uk/sport/football/teams/{bbc_slug}/rss.xml"))

            # 2. Process Feeds
            for source_type, feed_url in feeds:
                self.process_feed(club, source_type, feed_url)

        self.stdout.write(self.style.SUCCESS(' Finished fetching news batch.'))

    def process_feed(self, club, source_type, feed_url):
        credibility = SOURCE_SCORES.get(source_type, 1)
        try:
            feed = feedparser.parse(feed_url)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  Failed: {feed_url}'))
            return

        for entry in feed.entries:
            link = entry.get('link')
            title = entry.get('title', '').strip()

            if not link or not title:
                continue

            # Deduplication
            if Post.objects.filter(Q(link=link) | Q(title__iexact=title, club=club)).exists():
                continue

            # Date handling
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                published = timezone.make_aware(
                    datetime.fromtimestamp(time.mktime(entry.published_parsed))
                )
            else:
                published = timezone.now()

            # Ranking
            age_hours = max((timezone.now() - published).total_seconds() / 3600, 0.1)
            score = credibility * (10 / age_hours)

            Post.objects.create(
                club=club,
                title=title,
                content=entry.get('summary', ''),
                link=link,
                publication_date=published,
                source=source_type,
                credibility_score=credibility,
                rank_score=score
            )
            self.stdout.write(f'   + {title[:50]}...')
