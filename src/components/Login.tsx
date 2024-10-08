import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd validate credentials here
    if (username && password) {
      sessionStorage.setItem("isLoggedIn", "true");
      navigate("/");
    } else {
      alert("Please enter both username and password");
    }
  };

  return (
    <div
      id="login"
      className="flex items-center justify-center min-h-screen bg-gray-100"
    >
      <form onSubmit={handleLogin} className="p-6 bg-white rounded shadow-md">
        <h2 className="text-2xl mb-4">Login</h2>
        <input
          name="username"
          id="username"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          name="password"
          id="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <Button type="submit" id="submit" className="w-full">
          Login
        </Button>
        {/* <input type="submit" value="Login" id="submit" /> */}
      </form>
    </div>
  );
}
