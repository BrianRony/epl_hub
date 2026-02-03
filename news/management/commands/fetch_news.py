import feedparser                                                            
from django.core.management.base import BaseCommand                          
from news.models import Club, Post                                           
                                                                                
   # A dictionary mapping club slugs to their news RSS feeds.                   
   # We'll need to find these URLs. I've put in a placeholder.                  
RSS_FEEDS = {                                                                
       'arsenal': 'https://www.skysports.com/rss/12041',                        
       'chelsea': 'https://www.skysports.com/rss/11095',                        
       'liverpool': 'https://www.skysports.com/rss/11095',                      
       'manchester-city': 'https://www.skysports.com/rss/11095',                
       'manchester-united': 'https://www.skysports.com/rss/11095',              
       'tottenham-hotspur': 'https://www.skysports.com/rss/11095',              
   }                                                                            
                                                                                
class Command(BaseCommand):                                                  
       # A brief description of what this command does.                         
       help = 'Fetches and parses news from RSS feeds for the Big Six clubs.'   
                                                                                
       def handle(self, *args, **kwargs):                                       
           # This is the main logic of the command.                             
           self.stdout.write(self.style.SUCCESS('Starting to fetch news...'))   
                                                                                
           for slug, feed_url in RSS_FEEDS.items():                             
               # First, try to get the Club object from our database using its  slug.                                                                          
               try:                                                             
                   club = Club.objects.get(slug=slug)                           
                   self.stdout.write(f'Fetching news for {club.name}...')       
               except Club.DoesNotExist:                                        
                   self.stdout.write(self.style.WARNING(f'Club with slug        
 "{slug}" not found. Skipping.'))                                               
                   continue                                                     
                                                                                
               # Parse the RSS feed.                                            
               feed = feedparser.parse(feed_url)                                
                                                                                
               # Loop through each entry in the feed.                           
               for entry in feed.entries:                                       
                   # Check if a post with this link already exists in our       
 database.                                                                      
                   # This is how we avoid creating duplicate posts.             
                   if not Post.objects.filter(link=entry.link).exists():        
                       # If it doesn't exist, create and save a new Post        
 object.                                                                        
                       Post.objects.create(                                     
                           club=club,                                           
                           title=entry.title,                                   
                           content=entry.summary,  # The summary from the RSS   
 feed.                                                                          
                           link=entry.link,                                     
                           publication_date=entry.published_parsed  #           
 feedparser gives us a usable datetime                                          
                       )                                                        
                       self.stdout.write(f'  - Added new post:                  
 "{entry.title}"')                                                              
                                                                                
           self.stdout.write(self.style.SUCCESS('Finished fetching news.'))   