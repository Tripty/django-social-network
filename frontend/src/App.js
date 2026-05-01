import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Posts from "./components/Posts";
import Profile from "./components/Profile";
import Following from "./components/Following";
import Login from "./components/Login"; // your existing login page
import Register from "./components/Register"; // your existing register page

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container-fluid mt-5 pt-4">
        <Routes>
          <Route path="/" element={<Posts />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/following" element={<Following />} />
          <Route path="/profile/:username" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
