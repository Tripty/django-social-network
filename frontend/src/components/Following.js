import { useEffect, useState } from "react";
import axios from "axios";
import PostItem from "./PostItem";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8004";

export default function Following() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchPosts = async (url = `api/following/`) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPosts(response.data.results);
      setNextPage(response.data.next);
      setPrevPage(response.data.previous);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load following posts.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="container mt-5 pt-5">
      <h2 className="mb-4 bg-light p-3 rounded">Following Posts</h2>

      {loading && <p>Loading posts...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && posts.length === 0 && <p>No posts from users you follow yet.</p>}

      {posts.map((post) => (
        <PostItem key={post.id} post={post} onUpdate={fetchPosts} />
      ))}

      <div className="mt-3">
        {prevPage && (
          <button
            className="nav_post_edit btn btn-primary me-2"
            onClick={() => fetchPosts(prevPage)}
          >
            Previous
          </button>
        )}
        {nextPage && (
          <button className="nav_post_edit btn btn-primary" onClick={() => fetchPosts(nextPage)}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}
