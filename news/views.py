from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Club, Post, Comment, Bookmark
from .serializers import ClubSerializer, PostSerializer, CommentSerializer, BookmarkSerializer

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
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['post']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

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
