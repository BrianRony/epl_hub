from rest_framework import viewsets, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Club, Post, Comment, Bookmark
from .serializers import ClubSerializer, PostSerializer, CommentSerializer, BookmarkSerializer
import random
import os
import threading
from django.core.management import call_command

def run_fetch_news_background():
    """Run fetch_news command in background thread"""
    try:
        from io import StringIO
        out = StringIO()
        call_command('fetch_news', stdout=out)
        print(f"✓ Background fetch_news completed. Output: {out.getvalue()[-100:]}")
    except Exception as e:
        print(f"✗ Background fetch_news error: {str(e)}")

@api_view(['GET', 'POST'])
@permission_classes([permissions.AllowAny])
def trigger_news_fetch(request):
    # Security check: Match the CRON_SECRET environment variable
    request_key = request.GET.get('key')
    expected_key = os.environ.get('CRON_SECRET', 'default-cron-secret')
    
    if request_key != expected_key:
        return Response({'status': 'unauthorized'}, status=403)

    try:
        # Run fetch_news in background thread to avoid blocking the server
        thread = threading.Thread(target=run_fetch_news_background, daemon=True)
        thread.start()
        
        return Response({
            'status': 'success', 
            'message': 'News fetch started in background',
            'note': 'Check server logs for completion'
        })
    except Exception as e:
        print(f"Fetch trigger error: {str(e)}")
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
