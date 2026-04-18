import { createContext, useContext, useState, useEffect, useMemo } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "degy_auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

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
    () => ({ user, isLoading, login, signup, logout, isAuthenticated: !!user }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
