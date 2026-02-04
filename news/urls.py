from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClubViewSet, PostViewSet, CommentViewSet, BookmarkViewSet

router = DefaultRouter()
router.register(r'clubs', ClubViewSet)
router.register(r'posts', PostViewSet)
router.register(r'comments', CommentViewSet)
router.register(r'bookmarks', BookmarkViewSet, basename='bookmark')

urlpatterns = [
    path('', include(router.urls)),
]
