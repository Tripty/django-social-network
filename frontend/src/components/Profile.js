import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import PostItem from "./PostItem";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8004/api";

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [postsError, setPostsError] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const me = localStorage.getItem("username");

  // 🔹 Fetch profile info
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const token = localStorage.getItem("access_token");
        const url = username
          ? `api/profile/${username}/`
          : `api/profile/me/`;

        const response = await axios.get(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          validateStatus: null,
        });

        if (response.status === 200) {
          setProfile(response.data);
          setError("");
        } else {
          setError(
            response.data?.error ||
              response.data?.detail ||
              "Failed to load profile"
          );
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [username]);

  // 🔹 Fetch posts by this user
  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setLoadingPosts(true);
        const token = localStorage.getItem("access_token");
        const target = username ? username : me;

        if (!target) {
          setPostsError("No username specified.");
          setLoadingPosts(false);
          return;
        }

        const response = await axios.get(
          `api/profile/${target}/posts/`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            validateStatus: null,
          }
        );

        if (response.status === 200) {
          const data = response.data.results ?? response.data;
          setPosts(data);
          setPostsError("");
        } else {
          setPostsError(
            response.data?.detail ||
              response.data?.error ||
              "Failed to load posts"
          );
        }
      } catch (err) {
        console.error(err);
        setPostsError("Failed to load posts.");
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchUserPosts();
  }, [username, me]);

  // 🔹 Follow user
  const handleFollow = async () => {
    if (actionLoading) return;
    setActionLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const target = username ?? me;
      const resp = await axios.post(
        `api/profile/${target}/follow/`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, validateStatus: null }
      );

      if (resp.status === 200 || resp.status === 201) {
        setProfile((prev) => ({
          ...prev,
          is_following: true,
          followers_count: prev.followers_count + 1,
        }));
      } else {
        alert(resp.data?.error || "Failed to follow user.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to follow user.");
    } finally {
      setActionLoading(false);
    }
  };

  // 🔹 Unfollow user
  const handleUnfollow = async () => {
    if (actionLoading) return;
    setActionLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const target = username ?? me;
      const resp = await axios.post(
        `api/profile/${target}/unfollow/`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, validateStatus: null }
      );

      if (resp.status === 200) {
        setProfile((prev) => ({
          ...prev,
          is_following: false,
          followers_count: Math.max(0, prev.followers_count - 1),
        }));
      } else {
        alert(resp.data?.error || "Failed to unfollow user.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to unfollow user.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loadingProfile) return <p>Loading profile...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  const isMyProfile = profile.username === me;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-2">
        {isMyProfile ? "My Profile" : `Profile: ${profile.username}`}
      </h2>

      {/* Debug info */}
      {/* <pre className="bg-light p-2 rounded small mt-3 border">
        {JSON.stringify(profile, null, 2)}
      </pre> */}

      <p>Email: {profile.email || "N/A"}</p>
      <p>Followers: {profile.followers_count ?? 0}</p>
      <p>Following: {profile.following_count ?? 0}</p>

      {/* 🔹 Follow/Unfollow toggle */}
      {!isMyProfile && (
        <div className="mt-3">
          {profile.is_following ? (
            <button
              disabled={actionLoading}
              onClick={handleUnfollow}
              className="follow_like btn btn-outline-secondary px-3 py-1"
            >
              Unfollow
            </button>
          ) : (
            <button
              disabled={actionLoading}
              onClick={handleFollow}
              className="follow_like btn btn-primary px-3 py-1"
            >
              Follow
            </button>
          )}
        </div>
      )}

      <hr className="my-3" />

      <h3 className="text-xl mb-2">
        {isMyProfile ? "My Posts" : `Posts by ${profile.username}`}
      </h3>

      {loadingPosts && <p>Loading posts...</p>}
      {postsError && <p className="text-danger">{postsError}</p>}
      {!loadingPosts && posts.length === 0 && <p>No posts yet.</p>}

      {posts.map((p) => (
        <PostItem
          key={p.id}
          post={p}
          onUpdate={() => window.location.reload()}
          disableUserLink={isMyProfile}
        />
      ))}
    </div>
  );
}
