from rest_framework import serializers
from .models import User, Post, Follow, Comment

# --- Comment Serializer ---
class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'content', 'timestamp']


# --- User Serializer (basic info) ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


# --- Post Serializer ---
class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = ["id", "user", "content", "timestamp", "likes_count", "comments"]

    def get_likes_count(self, obj):
        return obj.likes.count()


# --- Profile Serializer (for /api/profile/me/) ---
class ProfileSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()


    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "followers_count", "following_count", "is_following"]

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()
    def get_is_following(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return False
        return Follow.objects.filter(follower=request.user, following=obj).exists()
