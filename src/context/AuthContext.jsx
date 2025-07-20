import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// Helper to decode JWT (very basic, for demo)
function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    if (token) {
      const payload = parseJwt(token);
      setUser({
        displayName:
          payload?.[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
          ] || "",
        email:
          payload?.[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
          ] || "",
      });
      let role =
        payload?.[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];
      if (role) {
        setRoles(Array.isArray(role) ? role : [role]);
      } else {
        setRoles([]);
      }
    } else {
      setUser(null);
      setRoles([]);
    }
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, roles, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
