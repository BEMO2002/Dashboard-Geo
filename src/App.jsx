import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Login from "./Login";
import Home from "./Pages/Home";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./ProtectedRoute";
import News from "./Pages/News";
import Projects from "./Pages/Projects";
import ContactMessage from "./Pages/ContactMessage";
import ChangePassword from "./Pages/ChangePassword";
import Solutions from "./Pages/Solutions";
import CareerMessage from "./Pages/CareerMessage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="/news" element={<News />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<ContactMessage />} />
            <Route path="/career" element={<CareerMessage />} />
            <Route path="/change" element={<ChangePassword />} />
            <Route path="/solutions" element={<Solutions />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
