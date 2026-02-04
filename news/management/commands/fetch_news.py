import feedparser
import time
from datetime import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Q
from news.models import Club, Post

# 1️⃣ RSS structure (multiple sources per club)
RSS_FEEDS = {
    'arsenal': {
        'official': ['https://www.arsenal.com/rss-feeds/news'],
        'mainstream': [
            'https://www.skysports.com/rss/11670',
            'https://feeds.bbci.co.uk/sport/football/teams/arsenal/rss.xml',
            'https://www.theguardian.com/football/arsenal/rss'
        ],
    },
    'chelsea': {
        'official': ['https://www.chelseafc.com/en/news/rss'],
        'mainstream': [
            'https://www.skysports.com/rss/11668',
            'https://feeds.bbci.co.uk/sport/football/teams/chelsea/rss.xml',
            'https://www.theguardian.com/football/chelsea/rss'
        ],
    },
    'liverpool': {
        'official': ['https://www.liverpoolfc.com/news.rss'],
        'mainstream': [
            'https://www.skysports.com/rss/11669',
            'https://feeds.bbci.co.uk/sport/football/teams/liverpool/rss.xml',
            'https://www.theguardian.com/football/liverpool/rss'
        ],
    },
    'manchester-city': {
        'official': ['https://www.mancity.com/rss/news'],
        'mainstream': [
            'https://www.skysports.com/rss/11679',
            'https://feeds.bbci.co.uk/sport/football/teams/manchester-city/rss.xml',
            'https://www.theguardian.com/football/manchester-city/rss'
        ],
    },
    'manchester-united': {
        'official': ['https://www.manutd.com/en/rss/news-and-features'],
        'mainstream': [
            'https://www.skysports.com/rss/11667',
            'https://feeds.bbci.co.uk/sport/football/teams/manchester-united/rss.xml',
            'https://www.theguardian.com/football/manchester-united/rss'
        ],
    },
    'tottenham-hotspur': {
        'official': ['https://www.tottenhamhotspur.com/rss/news/'],
        'mainstream': [
            'https://www.skysports.com/rss/11675',
            'https://feeds.bbci.co.uk/sport/football/teams/tottenham-hotspur/rss.xml',
            'https://www.theguardian.com/football/tottenham-hotspur/rss'
        ],
    },
}

# 2️⃣ Source credibility map (opinionated + realistic)
SOURCE_SCORES = {
    'official': 5,
    'mainstream': 3,
    'fan': 1,
}

class Command(BaseCommand):
    help = 'Fetch football news from multiple RSS sources, deduplicate, and rank posts.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting news fetch...'))

        for slug, sources in RSS_FEEDS.items():
            try:
                club = Club.objects.get(slug=slug)
            except Club.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'Club "{slug}" not found. Skipping.'))
                continue

            self.stdout.write(f' Fetching news for {club.name}')

            for source_type, feeds in sources.items():
                credibility = SOURCE_SCORES.get(source_type, 1)
                
                for feed_url in feeds:
                    try:
                        feed = feedparser.parse(feed_url)
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'  Failed to parse {feed_url}: {e}'))
                        continue

                    for entry in feed.entries:
                        link = entry.get('link')
                        title = entry.get('title', '').strip()

                        if not link or not title:
                            continue

                        # 🔒 Deduplication (link OR very similar title for the same club)
                        # We use title__iexact for a basic check, in production fuzzy matching might be better
                        if Post.objects.filter(
                            Q(link=link) | Q(title__iexact=title, club=club)
                        ).exists():
                            continue

                        # 📅 Date handling
                        if hasattr(entry, 'published_parsed'):
                            published = timezone.make_aware(
                                datetime.fromtimestamp(time.mktime(entry.published_parsed))
                            )
                        else:
                            published = timezone.now()

                        # 🧮 Ranking score (credibility + freshness)
                        # Score = Credibility * (1 / Age in Hours)
                        # Newer posts from credible sources score highest
                        age_hours = max((timezone.now() - published).total_seconds() / 3600, 0.1) # 0.1 min to avoid div by zero
                        score = credibility * (10 / age_hours) # Multiplied by 10 to keep numbers readable

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
                        
                        self.stdout.write(f'  + [{source_type.upper()}] {title[:70]}...')

        self.stdout.write(self.style.SUCCESS(' Finished fetching news.'))
