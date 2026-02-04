from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Club, Post, Comment, Bookmark

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class ClubSerializer(serializers.ModelSerializer):
    class Meta:
        model = Club
        fields = ['id', 'name', 'slug']

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    # Post ID is required for creation, but we can make it write-only or handle it differently.
    # By default, ModelSerializer expects 'post' to be a primary key input.
    # The error "NOT NULL constraint failed: news_comment.post_id" means it wasn't extracted from the request data.
    
    class Meta:
        model = Comment
        fields = ['id', 'user', 'post', 'text', 'created_at']
        read_only_fields = ['user', 'created_at'] # Removed 'post' from read_only so it can be accepted as input

class BookmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bookmark
        fields = ['id', 'user', 'post', 'created_at']
        read_only_fields = ['user', 'created_at']

class PostSerializer(serializers.ModelSerializer):
    club = ClubSerializer(read_only=True)
    comment_count = serializers.IntegerField(source='comments.count', read_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 
            'title', 
            'content', 
            'link',        
            'source',      
            'publication_date', 
            'club',
            'comment_count',
            'created_at', 
            'updated_at'
        ]
