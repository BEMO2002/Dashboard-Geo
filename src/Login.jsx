import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "./context/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import logo from "./assets/dashboard/Picture1.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(
        "https://api.geoduke.com/admin/account/login",
        {
          Email: email,
          Password: password,
        }
      );
      if (response.data && response.data.token) {
        login(response.data.token);
        toast.success("Login successful!");
        navigate("/");
      } else {
        setError("Login failed: No token returned.");
        toast.error("Login failed: No token returned.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base via-baseTwo to-second">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center border border-gray-100"
      >
        <img
          src={logo}
          alt="Logo"
          className="w-30 h-30 mb-6 rounded-full p-3 shadow-md border border-gray-200 bg-white object-contain"
        />
        <h2 className="text-3xl font-extrabold mb-2 text-center text-primary tracking-tight">
          Welcome Back
        </h2>
        <p className="mb-6 text-baseTwo text-center text-sm">
          Sign in to your account
        </p>
        {error && (
          <div className="mb-4 text-red-600 text-center font-medium bg-red-50 border border-red-200 rounded px-3 py-2 w-full">
            {error}
          </div>
        )}
        <div className="mb-4 w-full">
          <label className="block text-baseTwo mb-2 font-semibold">Email</label>
          <input
            type="email"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none  bg-gray-50 text-gray-900 placeholder-gray-400 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            autoComplete="email"
          />
        </div>
        <div className="mb-6 w-full">
          <label className="block text-baseTwo mb-2 font-semibold">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none  bg-gray-50 text-gray-900 placeholder-gray-400 pr-10 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-primary text-lg"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={0}
              role="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-white hover:text-primary py-2.5 rounded-lg font-semibold hover:bg-white border border-primary transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed text-lg"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
