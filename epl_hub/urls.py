from django.contrib import admin
from django.urls import path, include
from news.views import trigger_news_fetch

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('news.urls')),
    path('api/cron/fetch-news/', trigger_news_fetch),
    
    # Auth Endpoints
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('accounts/', include('allauth.urls')), # For social auth callbacks
]
