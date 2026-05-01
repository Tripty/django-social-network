import { useEffect, useState } from "react";
import axios from "axios";
import PostItem from "./PostItem";
import NewPost from "./NewPost";

const API_URL = process.env.REACT_APP_API_URL;

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async (url = `${API_URL}/posts/`) => {
    try {
      const token = localStorage.getItem("access_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(url, { headers });
      setPosts(response.data.results);
      setNextPage(response.data.next);
      setPrevPage(response.data.previous);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="container mt-5 pt-4">
      
      <NewPost onPostCreated={handlePostCreated} />
      {loading && <p>Loading posts...</p>}
      <h2 className="mb-4 bg-light p-3 rounded shadow-sm text-center">
        All Posts
      </h2>
      {posts.map((post) => (
        <PostItem key={post.id} post={post} onUpdate={() => fetchPosts()} />
      ))}
      
      <div className="mt-2">
        
        {prevPage && (
          <button
            onClick={() => fetchPosts(prevPage)}
            className="nav_post_edit px-3 py-1 bg-gray-200 rounded mr-2"
          >
            Previous
          </button>
        )}
        {nextPage && (
          <button
            onClick={() => fetchPosts(nextPage)}
            className="nav_post_edit px-3 py-1 bg-gray-200 rounded"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
