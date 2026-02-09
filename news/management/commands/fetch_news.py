import feedparser
import time
import random
import socket
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
        # Official feed (often blocks on free tier) -> try but don't rely on it
        'official': 'https://www.mancity.com/meta/feeds/news',
        # Extra reliable RSS sources as fallback
        'extra_feeds': [
            'https://www.manchestereveningnews.co.uk/all-about/manchester-city-fc/?service=rss',
            'https://cityxtra.co.uk/feed/',  # Fan source but usually fast
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
        "User-Agent": "Mozilla/5.0 (compatible; FootballNewsBot/1.0)"
    })


class Command(BaseCommand):
    help = 'Fetch football news from multiple RSS sources dynamically.'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.total_created = 0  # Track posts created in this run

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting dynamic news fetch...'))

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

            # Official feed (try but don't depend on it for Man City)
            if 'official' in config:
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

            # Extra feeds (fan sites / aggregators - mostly for Man City backup)
            for extra_url in config.get('extra_feeds', []):
                feeds.append(('fan', extra_url))

            # FREE TIER SAFETY: Limit feeds per club
            feeds = feeds[:MAX_FEEDS_PER_CLUB]

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
            self.stdout.write(self.style.ERROR(f'  ✗ Failed: {feed_url} ({str(e)[:50]})'))
            return
        
        elapsed = time.time() - start_time
        if elapsed > 2.0:
            self.stdout.write(self.style.WARNING(f'  ⚠ Slow fetch ({elapsed:.2f}s): {feed_url}'))

        # Log how many entries found
        entry_count = len(feed.entries)
        if entry_count == 0:
            self.stdout.write(self.style.WARNING(f'  ⚠ Zero entries found: {feed_url}'))
            return
        else:
            self.stdout.write(f'  ✓ Found {entry_count} entries from {feed_url}')

        # FREE TIER SAFETY: Limit entries processed per feed
        entries_to_process = feed.entries[:MAX_ENTRIES_PER_FEED]
        
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
            self.stdout.write(f'    + {title[:50]}...')