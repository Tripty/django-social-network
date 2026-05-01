import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8004/api";

export default function PostItem({ post, onUpdate, disableUserLink = false }) {
  const token = localStorage.getItem("access_token");
  const username = localStorage.getItem("username");

  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(post.content);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [liked, setLiked] = useState(post.current_user_liked || false);

  // Fix for invalid date issue (handle created_at / timestamp)
  const rawTs = post.created_at || post.timestamp || post.date || null;
  const formattedDate = rawTs ? new Date(rawTs).toLocaleString() : "No date";

  const handleEdit = async () => {
    try {
      await axios.patch(
        `${API_URL}/posts/${post.id}/`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditing(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
      alert("Cannot edit this post");
    }
  };

  const handleToggleLike = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/posts/${post.id}/like/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLikesCount(response.data.likes_count);
      setLiked(response.data.liked);
    } catch (err) {
      console.error(err);
      alert("Failed to like/unlike");
    }
  };

  return (
    <div className="border rounded p-2 mb-2 bg-white shadow-sm">
      <p className="font-semibold">
        {disableUserLink ? (
          <span>{post.user.username}</span>
        ) : (
          <Link
            to={`/profile/${post.user.username}`}
            className="authorname hover:underline text-blue-600"
          >
            {post.user.username}
          </Link>
        )}
      </p>

      {editing ? (
        <>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-1 border rounded mb-1"
          />
          <button
            onClick={handleEdit}
            className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
          >
            Save
          </button>
          <button
            onClick={() => setEditing(false)}
            className="bg-gray-500 text-white px-2 py-1 rounded"
          >
            Cancel
          </button>
        </>
      ) : (
        <p>{post.content}</p>
      )}

      <p className="text-sm text-gray-500">{formattedDate}</p>

      <div className="mt-1">
        <button
          onClick={handleToggleLike}
          className={`follow_like px-2 py-1 rounded ${
            liked ? "bg-red-500 text-white" : "bg-blue-200 text-blue-800"
          }`}
        >
          {liked ? "Unlike" : "Like"} ({likesCount})
        </button>
        {username === post.user.username && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="nav_post_edit px-2 py-1 rounded bg-blue-500 text-white ml-2"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
