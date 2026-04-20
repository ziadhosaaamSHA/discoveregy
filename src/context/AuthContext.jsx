import { useState, useMemo } from "react";
import { AuthContext, useAuth } from "./authBase";

const STORAGE_KEY = "degy_auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  });

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem("degy_users") || "[]");
    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      const userData = { id: foundUser.id, name: foundUser.name, email: foundUser.email, type: foundUser.type };
      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, error: "Invalid email or password" };
  };

  const signup = (name, email, password, type = "tourist", extra = {}) => {
    const users = JSON.parse(localStorage.getItem("degy_users") || "[]");

    if (users.some((u) => u.email === email)) {
      return { success: false, error: "Email already exists" };
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password,
      type,
      phone: extra.phone || "",
      gender: extra.gender || "",
      age: extra.age || null,
      ...(type === "tourist"
        ? { nationality: extra.nationality || "" }
        : { languages: extra.languages || [] }),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem("degy_users", JSON.stringify(users));

    const userData = { id: newUser.id, name: newUser.name, email: newUser.email, type: newUser.type };
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({ user, login, signup, logout, isAuthenticated: !!user }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { useAuth };
