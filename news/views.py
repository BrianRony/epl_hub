from rest_framework import viewsets, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Club, Post, Comment, Bookmark
from .serializers import ClubSerializer, PostSerializer, CommentSerializer, BookmarkSerializer
import random
from django.core.management import call_command
from django.conf import settings

@api_view(['GET', 'POST'])
@permission_classes([permissions.AllowAny])
def trigger_news_fetch(request):
    # Simple security check using SECRET_KEY or a specific CRON_KEY
    # For simplicity, we check if a 'key' param matches part of our SECRET_KEY
    # In production, use a dedicated env var like CRON_SECRET
    
    request_key = request.GET.get('key')
    # Use the first 10 chars of SECRET_KEY as the "password" for this endpoint
    expected_key = settings.SECRET_KEY[:10]
    
    if request_key != expected_key:
        return Response({'status': 'unauthorized'}, status=403)

    try:
        # Run the management command
        call_command('fetch_news')
        return Response({'status': 'success', 'message': 'News fetch triggered'})
    except Exception as e:
        return Response({'status': 'error', 'message': str(e)}, status=500)

class ClubViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Club.objects.all()
    serializer_class = ClubSerializer
    permission_classes = [permissions.AllowAny]

class PostViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['club__slug', 'source']
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def is_bookmarked(self, request, pk=None):
        post = self.get_object()
        bookmarked = Bookmark.objects.filter(user=request.user, post=post).exists()
        return Response({'bookmarked': bookmarked})

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['post']

    def perform_create(self, serializer):
        author_name = self.request.data.get('author_name', '').strip()
        
        if not author_name:
            adjectives = ['Funny', 'Happy', 'Grumpy', 'Sleepy', 'Speedy', 'Lucky', 'Brave', 'Wild', 'Crazy', 'Mysterious']
            animals = ['Lion', 'Tiger', 'Bear', 'Eagle', 'Shark', 'Panda', 'Wolf', 'Fox', 'Badger', 'Falcon']
            author_name = f"{random.choice(adjectives)} {random.choice(animals)}"
        
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user, author_name=author_name)

class BookmarkViewSet(viewsets.ModelViewSet):
    serializer_class = BookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Bookmark.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        post_id = self.request.data.get('post')
        if Bookmark.objects.filter(user=self.request.user, post_id=post_id).exists():
             return
        serializer.save(user=self.request.user)
