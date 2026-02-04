from rest_framework import viewsets                                          
from django_filters.rest_framework import DjangoFilterBackend                
from .models import Club, Post                                               
from .serializers import ClubSerializer, PostSerializer                      
                                                                                
class ClubViewSet(viewsets.ReadOnlyModelViewSet):                            
       queryset = Club.objects.all()                                            
       serializer_class = ClubSerializer                                        
                                                                                
class PostViewSet(viewsets.ReadOnlyModelViewSet):                            
       queryset = Post.objects.all() # Ordering is already handled by the Model Meta                                                                           
       serializer_class = PostSerializer                                        
                                                                                
       # Enable filtering                                                       
       filter_backends = [DjangoFilterBackend]                                  
       # Allow filtering by these fields                                        
       filterset_fields = ['club__slug', 'source'] 