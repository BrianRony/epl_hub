import uuid
from django.db import models
from django.utils import timezone

class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True) 
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Club(BaseModel):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Post(BaseModel):
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=300)
    content = models.TextField(blank=True)
    link = models.URLField(max_length=500, unique=True)
    publication_date = models.DateTimeField()
    source = models.CharField(max_length=50, default='mainstream')
    credibility_score = models.PositiveSmallIntegerField(default=1)
    rank_score = models.FloatField(default=0.0)

    class Meta:
        ordering = ['-rank_score', '-publication_date']

    def __str__(self):
        return self.title
