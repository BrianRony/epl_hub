                                                                                
from rest_framework import serializers                                       
from .models import Club, Post                                               
                                                                                
class ClubSerializer(serializers.ModelSerializer):                           
       class Meta:                                                              
           model = Club                                                         
           fields = ['id', 'name', 'slug']                                      
                                                                                
class PostSerializer(serializers.ModelSerializer):                           
       club = ClubSerializer(read_only=True)                                    
                                                                                
       class Meta:                                                              
           model = Post                                                         
           fields = [                                                           
               'id',                                                            
               'title',                                                         
               'content',                                                       
               'publication_date',                                              
               'club',                                                          
               'created_at',                                                    
               'updated_at'                                                     
           ]  