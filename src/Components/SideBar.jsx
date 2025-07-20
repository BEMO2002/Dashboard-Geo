import React from "react";
import {
  FaHome,
  FaNewspaper,
  FaProjectDiagram,
  FaEnvelope,
  FaDownload,
  FaSignOutAlt,
  FaPhone,
} from "react-icons/fa";
import logo from "../assets/dashboard/Picture1.png";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

const navLinks = [
  { name: "Home", icon: <FaHome />, href: "/" },
  { name: "News", icon: <FaNewspaper />, href: "/news" },
  { name: "Projects", icon: <FaProjectDiagram />, href: "/projects" },
  { name: "Contact", icon: <FaPhone />, href: "/contact" },
  { name: "Download Files", icon: <FaDownload />, href: "#" },
];

const SideBar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    setTimeout(() => {
      window.location.href = "/login";
    }, 1000);
  };

  return (
    <div className="h-screen w-64 shadow-lg flex flex-col items-center py-8">
      {/* Logo */}
      <div className="mb-10 ">
        <img src={logo} alt="Logo" className="w-50" />
      </div>
      {/* Navigation Links */}
      <nav className="flex-1 w-full">
        <ul className="space-y-11 flex flex-col items-right  ml-5 mt-5 px-6">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <li key={link.name}>
                <a
                  href={link.href}
                  className={`w-full flex items-center gap-3 font-medium transition-colors rounded-lg px-4 py-2 justify-start ${
                    isActive
                      ? "bg-gray-500 text-white"
                      : "hover:bg-gray-500 hover:text-white text-gray-800"
                  }`}
                >
                  {React.cloneElement(link.icon, { className: "text-lg" })}
                  {link.name}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-8 w-48 flex items-center justify-center font-semibold py-2 px-4 bg-primary text-white rounded transition-colors"
      >
        <FaSignOutAlt className="mr-2" /> Logout
      </button>
    </div>
  );
};

export default SideBar;
