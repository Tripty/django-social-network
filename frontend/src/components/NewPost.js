import { useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export default function NewPost({ onPostCreated }) {
  const [content, setContent] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    if (!token) return alert("Please login first");
    try {
      const response = await axios.post(
        `api/posts/`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContent("");
      onPostCreated(response.data);
    } catch (err) {
      console.error(err);
      alert("Failed to create post");
    }
  };

  return (
    <div className="mb-4 p-4 bg-white rounded shadow">
      <h4 className="orange">New Post</h4>
      <form onSubmit={handleSubmit}>
        <textarea
          cols="100" 
          className="w-full p-2 border rounded mb-2"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="10" 
          
          required
        ></textarea>
        <button className="nav_post_edit bg-blue-500  px-4 py-2 ms-3 rounded">
          Post
        </button>
      </form>
    </div>
  );
}
