import feedparser
import time
import random
import socket
import os
from datetime import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Q
from news.models import Club, Post

# Set global timeout for all socket operations (fetching feeds) to 5 seconds
socket.setdefaulttimeout(5.0)

# FREE TIER LIMITS - Prevent timeouts and DB spam
MAX_FEEDS_PER_CLUB = 4          # Keep feed count low
MAX_ENTRIES_PER_FEED = 12       # Don't process huge RSS lists
MAX_POSTS_PER_RUN = 25          # Hard stop to prevent slow runs

# Detect if running on cloud hosting (Render/Vercel) vs local
IS_PRODUCTION = os.getenv('RENDER') or os.getenv('VERCEL') or os.getenv('DATABASE_URL', '').startswith('postgres')

# Configuration for URL generation
CLUB_CONFIG = {
    # Big 6
    'arsenal': {
        'sky': '11670', 
        'guardian': 'arsenal', 
        'official': 'https://www.arsenal.com/rss-feeds/news'
    },
    'chelsea': {
        'sky': '11668', 
        'guardian': 'chelsea', 
        'official': 'https://www.chelseafc.com/en/news/rss'
    },
    'liverpool': {
        'sky': '11669', 
        'guardian': 'liverpool', 
        'official': 'https://www.liverpoolfc.com/news.rss'
    },
    'manchester-city': {
        'sky': '11679',
        'guardian': 'manchester-city',
        # IMPORTANT: Official feed removed for production - blocks cloud IPs
        # Only include it locally for testing
        'official': None if IS_PRODUCTION else 'https://www.mancity.com/meta/feeds/news',
        # Reliable alternatives that work on Render/Vercel
        'extra_feeds': [
            'https://www.manchestereveningnews.co.uk/all-about/manchester-city-fc/?service=rss',
            'https://cityxtra.co.uk/feed/',
            'https://www.goal.com/en-us/feeds/news?fmt=rss&ICID=HP&team=manchester-city',  # Backup
        ]
    },
    'manchester-united': {
        'sky': '11667', 
        'guardian': 'manchester-united', 
        'official': 'https://www.manutd.com/en/rss/news-and-features'
    },
    'tottenham-hotspur': {
        'sky': '11675', 
        'guardian': 'tottenham-hotspur', 
        'official': 'https://www.tottenhamhotspur.com/rss/news/'
    },

    # The Challengers
    'aston-villa': {'sky': '11677', 'guardian': 'aston-villa'},
    'newcastle': {'sky': '11678', 'guardian': 'newcastleunited', 'bbc_slug': 'newcastle-united'},
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
    'premier-league': {
        'sky': '11065', 
        'guardian': 'premierleague', 
        'bbc_slug': 'premier-league', 
        'no_bbc_team_path': True
    } 
}

SOURCE_SCORES = {
    'official': 5,
    'mainstream': 3,
    'fan': 1,
}


def parse_feed(url):
    """Parse RSS feed with user-agent to prevent 403 errors"""
    return feedparser.parse(url, request_headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    })


class Command(BaseCommand):
    help = 'Fetch football news from multiple RSS sources dynamically.'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.total_created = 0  # Track posts created in this run

    def handle(self, *args, **kwargs):
        env_info = "PRODUCTION (Render/Vercel)" if IS_PRODUCTION else "LOCAL"
        self.stdout.write(self.style.SUCCESS(f'Starting dynamic news fetch [{env_info}]...'))

        all_clubs = list(CLUB_CONFIG.keys())
        random.shuffle(all_clubs)
        
        # Pick just 1 club per run (good for free tier cron jobs)
        target_slugs = all_clubs[:1]

        self.stdout.write(f"Targeting batch (1 club): {', '.join(target_slugs)}")

        for slug in target_slugs:
            # Check if we've hit the run limit
            if self.total_created >= MAX_POSTS_PER_RUN:
                self.stdout.write(self.style.WARNING(
                    f"✓ Reached MAX_POSTS_PER_RUN ({MAX_POSTS_PER_RUN}), stopping early."
                ))
                break

            config = CLUB_CONFIG.get(slug)
            if not config: 
                continue

            # Auto-create club if missing (Fixes empty DB issue on Render)
            club_name = slug.replace('-', ' ').title().replace('And', '&')
            club, created = Club.objects.get_or_create(
                slug=slug, 
                defaults={'name': club_name}
            )
            
            if created:
                self.stdout.write(self.style.WARNING(f'✓ Created missing club: {club.name}'))

            self.stdout.write(f'→ Fetching for {club.name}...')
            
            # 1. Build Feed List dynamically
            feeds = []

            # Official feed (skip if None - e.g., Man City in production)
            if config.get('official'):
                feeds.append(('official', config['official']))

            # Sky Sports
            if 'sky' in config:
                feeds.append(('mainstream', f"https://www.skysports.com/rss/{config['sky']}"))

            # Guardian
            if 'guardian' in config:
                feeds.append(('mainstream', f"https://www.theguardian.com/football/{config['guardian']}/rss"))

            # BBC
            bbc_slug = config.get('bbc_slug', slug)
            if config.get('no_bbc_team_path'):
                feeds.append(('mainstream', "https://feeds.bbci.co.uk/sport/football/premier-league/rss.xml"))
            else:
                feeds.append(('mainstream', f"https://feeds.bbci.co.uk/sport/football/teams/{bbc_slug}/rss.xml"))

            # Extra feeds (fan sites / aggregators)
            for extra_url in config.get('extra_feeds', []):
                feeds.append(('fan', extra_url))

            # FREE TIER SAFETY: Limit feeds per club
            feeds = feeds[:MAX_FEEDS_PER_CLUB]

            # Special logging for Man City
            if slug == 'manchester-city':
                self.stdout.write(self.style.WARNING(
                    f"  ℹ Man City mode: {'Skipping official feed (cloud IP blocked)' if IS_PRODUCTION else 'Using all feeds (local)'}"
                ))
                self.stdout.write(f"  ℹ Using {len(feeds)} feeds total")

            # 2. Process Feeds
            for source_type, feed_url in feeds:
                # Stop if we've hit the run limit
                if self.total_created >= MAX_POSTS_PER_RUN:
                    self.stdout.write(self.style.WARNING(
                        f"  ✓ Reached MAX_POSTS_PER_RUN ({MAX_POSTS_PER_RUN}), skipping remaining feeds."
                    ))
                    break
                    
                self.process_feed(club, source_type, feed_url)

        self.stdout.write(self.style.SUCCESS(
            f'✓ Finished! Created {self.total_created} new posts.'
        ))

    def process_feed(self, club, source_type, feed_url):
        """Process a single RSS feed with timeout and error handling"""
        credibility = SOURCE_SCORES.get(source_type, 1)
        start_time = time.time()
        
        try:
            feed = parse_feed(feed_url)
        except Exception as e:
            error_msg = str(e)[:80]
            self.stdout.write(self.style.ERROR(f'  ✗ Failed: {feed_url}'))
            self.stdout.write(f'    Error: {error_msg}')
            return
        
        elapsed = time.time() - start_time
        if elapsed > 3.0:
            self.stdout.write(self.style.WARNING(f'  ⚠ Slow fetch ({elapsed:.2f}s): {feed_url}'))

        # Check for HTTP errors
        if hasattr(feed, 'status') and feed.status >= 400:
            self.stdout.write(self.style.ERROR(
                f'  ✗ HTTP {feed.status}: {feed_url}'
            ))
            return

        # Log how many entries found
        entry_count = len(feed.entries)
        if entry_count == 0:
            self.stdout.write(self.style.WARNING(f'  ⚠ Zero entries found: {feed_url}'))
            return
        else:
            self.stdout.write(f'  ✓ Found {entry_count} entries from {source_type} feed')

        # FREE TIER SAFETY: Limit entries processed per feed
        entries_to_process = feed.entries[:MAX_ENTRIES_PER_FEED]
        created_count = 0
        
        for entry in entries_to_process:
            # Stop if we've hit the run limit
            if self.total_created >= MAX_POSTS_PER_RUN:
                break

            link = entry.get('link')
            title = entry.get('title', '').strip()

            if not link or not title:
                continue

            # Deduplication check
            if Post.objects.filter(Q(link=link) | Q(title__iexact=title, club=club)).exists():
                continue

            # Date handling
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                published = timezone.make_aware(
                    datetime.fromtimestamp(time.mktime(entry.published_parsed))
                )
            else:
                published = timezone.now()

            # Ranking calculation
            age_hours = max((timezone.now() - published).total_seconds() / 3600, 0.1)
            score = credibility * (10 / age_hours)

            # Create the post
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
            
            self.total_created += 1
            created_count += 1

        if created_count > 0:
            self.stdout.write(f'    ✓ Created {created_count} new posts from this feed')