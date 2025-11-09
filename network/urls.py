from django.urls import path
from . import views
from .views import (
    PostListCreateView, PostRetrieveUpdateAPIView, CommentListCreateView,
    profile_view, follow_user, unfollow_user, ProfileMeView, toggle_like, following_posts
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("profile/me/", ProfileMeView.as_view(), name="profile-me"),

    # JWT
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Posts
    path("api/posts/", PostListCreateView.as_view(), name="posts"),
    path("api/posts/<int:pk>/", PostRetrieveUpdateAPIView.as_view(), name="post-detail"),
    path("api/posts/<int:post_id>/comments/", CommentListCreateView.as_view(), name="comments"),
    path("api/posts/<int:post_id>/like/", toggle_like, name="toggle-like"),

    # Profile
    path("api/profile/<str:username>/", profile_view, name="profile"),
    path("api/profile/<str:username>/follow/", follow_user, name="follow_user"),
    path("api/profile/<str:username>/unfollow/", unfollow_user, name="unfollow_user"),
    path("api/profile/<str:username>/posts/", views.user_posts, name="user-posts"),

    # Following
    path("api/following/", following_posts, name="following-posts"),
]
