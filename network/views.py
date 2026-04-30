from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.shortcuts import render
from django.urls import reverse
from django.http import HttpResponseRedirect
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from .models import User, Post, Comment, Follow
from .serializers import PostSerializer, CommentSerializer, ProfileSerializer

from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.generics import RetrieveUpdateAPIView
from .pagination import StandardResultsSetPagination
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from django.contrib.auth import get_user_model
import json
from django.db import IntegrityError
# --- Django HTML views ---
def index(request):
    return render(request, "index.html")

def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {"message": "Invalid username and/or password."})
    return render(request, "network/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

User = get_user_model()

@csrf_exempt
def register(request):
    #  GET request → show registration page
    if request.method == "GET":
        return render(request, "network/register.html")

    #  POST request → handle registration
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))

            username = data.get("username")
            email = data.get("email")
            password = data.get("password")
            confirmation = data.get("confirmation")

            if not username:
                return JsonResponse({"error": "Username is required."}, status=400)

            if password != confirmation:
                return JsonResponse({"error": "Passwords must match."}, status=400)

            user = User.objects.create_user(
                username=username,
                email=email,
                password=password
            )
            user.save()

            return JsonResponse(
                {"message": "User registered successfully."},
                status=201
            )

        except IntegrityError:
            return JsonResponse({"error": "Username already taken."}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data."}, status=400)

    #  Any other method
    return JsonResponse({"error": "Method not allowed"}, status=405)

# --- API views ---
@api_view(['GET'])
def api_test(request):
    return Response({"message": "DRF is working correctly!"})

class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.all().order_by('-timestamp')
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = StandardResultsSetPagination

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)



class PostRetrieveUpdateAPIView(RetrieveUpdateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        post = self.get_object()
        if post.user != request.user:
            return Response({"error": "Cannot edit another user’s post"}, status=403)
        return super().patch(request, *args, **kwargs)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_like(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({"error": "Post not found"}, status=404)
    user = request.user
    if user in post.likes.all():
        post.likes.remove(user)
        liked = False
    else:
        post.likes.add(user)
        liked = True
    return Response({"liked": liked, "likes_count": post.likes.count()})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def following_posts(request):
    following_users = Follow.objects.filter(follower=request.user).values_list('following', flat=True)
    posts = Post.objects.filter(user__in=following_users).order_by('-timestamp')
    paginator = StandardResultsSetPagination()
    result_page = paginator.paginate_queryset(posts, request)
    serializer = PostSerializer(result_page, many=True, context={'request': request})
    return paginator.get_paginated_response(serializer.data)

# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def profile_view(request, username):
#     try:
#         user = User.objects.get(username=username)
#     except User.DoesNotExist:
#         return Response({"error": "User not found"}, status=404)
#     return Response({
#         "username": user.username,
#         "email": user.email,
#         "first_name": user.first_name,
#         "last_name": user.last_name,
#     })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile_view(request, username):
    """Return profile info for any user by username"""
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    serializer = ProfileSerializer(user, context={"request": request})
    return Response(serializer.data)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def follow_user(request, username):
    """Follow a user and return updated profile info"""
    try:
        target_user = User.objects.get(username=username)
        if request.user == target_user:
            return Response({"error": "You cannot follow yourself."}, status=400)

        # Check if already following
        if Follow.objects.filter(follower=request.user, following=target_user).exists():
            return Response({"message": f"Already following {username}."}, status=200)

        Follow.objects.create(follower=request.user, following=target_user)

        # Return updated info
        serializer = ProfileSerializer(target_user, context={"request": request})
        return Response({
            "message": f"You followed {username}.",
            "is_following": True,
            "followers_count": serializer.data["followers_count"],
            "following_count": serializer.data["following_count"],
        }, status=201)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unfollow_user(request, username):
    """Unfollow a user and return updated profile info"""
    try:
        target_user = User.objects.get(username=username)
        relation = Follow.objects.filter(follower=request.user, following=target_user)
        if not relation.exists():
            return Response({"error": "You are not following this user."}, status=400)

        relation.delete()

        serializer = ProfileSerializer(target_user, context={"request": request})
        return Response({
            "message": f"You unfollowed {username}.",
            "is_following": False,
            "followers_count": serializer.data["followers_count"],
            "following_count": serializer.data["following_count"],
        })
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def follow_user(request, username):
#     try:
#         target_user = User.objects.get(username=username)
#         if request.user == target_user:
#             return Response({"error": "You cannot follow yourself."}, status=400)
#         if Follow.objects.filter(follower=request.user, following=target_user).exists():
#             return Response({"message": f"You are already following {username}."})
#         Follow.objects.create(follower=request.user, following=target_user)
#         return Response({"message": f"You followed {username}."}, status=201)
#     except User.DoesNotExist:
#         return Response({"error": "User not found."}, status=404)

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
# def unfollow_user(request, username):
#     try:
#         target_user = User.objects.get(username=username)
#         follow_relation = Follow.objects.filter(follower=request.user, following=target_user)
#         if not follow_relation.exists():
#             return Response({"error": "You are not following this user."}, status=400)
#         follow_relation.delete()
#         return Response({"message": f"You unfollowed {username}."})
#     except User.DoesNotExist:
#         return Response({"error": "User not found."}, status=404)

class CommentListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        post_id = self.kwargs['post_id']
        return Comment.objects.filter(post_id=post_id).order_by('-timestamp')

    def perform_create(self, serializer):
        post_id = self.kwargs['post_id']
        post = Post.objects.get(id=post_id)
        serializer.save(user=self.request.user, post=post)

# class ProfileMeView(APIView):
#     permission_classes = [IsAuthenticated]
#     def get(self, request):
#         serializer = ProfileSerializer(request.user)
#         return Response(serializer.data)
class ProfileMeView(APIView):
    """Return profile info for the currently logged-in user"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Include context so serializer can access request.user
        serializer = ProfileSerializer(request.user, context={"request": request})
        return Response(serializer.data)


@api_view(["GET"])
@permission_classes([permissions.AllowAny])   # allow public read
def user_posts(request, username):
    """
    Return posts for the given username, paginated, newest first.
    """
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)

    posts_qs = Post.objects.filter(user=user).order_by('-timestamp')
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(posts_qs, request)
    serializer = PostSerializer(page, many=True, context={'request': request})
    return paginator.get_paginated_response(serializer.data)
