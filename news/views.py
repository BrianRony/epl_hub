from rest_framework import viewsets                                          
from .models import Club, Post                                               
from .serializers import ClubSerializer, PostSerializer                      
                                                                                
class ClubViewSet(viewsets.ReadOnlyModelViewSet):                            
       """                                                                      
       API endpoint that allows clubs to be viewed.                             
       """                                                                      
       queryset = Club.objects.all()                                            
       serializer_class = ClubSerializer                                        
                                                                                
class PostViewSet(viewsets.ReadOnlyModelViewSet):                            
       """                                                                      
       API endpoint that allows posts to be viewed.                             
       """                                                                      
       queryset = Post.objects.all().order_by('-publication_date')     
       serializer_class = PostSerializer 