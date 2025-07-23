import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ChangePassword = () => {
  const { token } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(
        "https://api.geoduke.com/admin/account/change-password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  mr-60 flex items-center justify-center bg-white py-10 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">
          Change Password
        </h2>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Current Password</label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              className="w-full px-4 py-2 border rounded focus:outline-none  pr-10"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-primary text-lg"
              onClick={() => setShowCurrent((prev) => !prev)}
              tabIndex={0}
              role="button"
              aria-label={showCurrent ? "Hide password" : "Show password"}
            >
              {showCurrent ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
        <div className="mb-6">
          <label className="block mb-2 font-semibold">New Password</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              className="w-full px-4 py-2 border rounded focus:outline-none f pr-10"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-primary text-lg"
              onClick={() => setShowNew((prev) => !prev)}
              tabIndex={0}
              role="button"
              aria-label={showNew ? "Hide password" : "Show password"}
            >
              {showNew ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-primary text-white hover:text-primary py-2 rounded font-semibold hover:bg-white border border-primary transition-colors flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading && (
            <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"></span>
          )}
          Change Password
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
