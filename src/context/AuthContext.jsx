/* eslint-disable react-refresh/only-export-components */
import { useEffect, useMemo, useRef, useState } from "react";
import { AuthContext, useAuth } from "./authBase";
import {
  fetchMyProfile,
  loginApi,
  logoutApi,
  registerApi,
  resolveNationalityId,
  updateMyProfileApi,
} from "../services/auth-api";
import { clearAuthTokens, getAccessToken, setActiveAuthRole } from "../services/api-client";

const STORAGE_KEY = "degy_auth";

export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  });
  const initialUserRef = useRef(user);

  useEffect(() => {
    let cancelled = false;
    const storedUser = initialUserRef.current;

    const bootstrapAuth = async () => {
      if (!getAccessToken()) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        const profile = await fetchMyProfile();
        if (!cancelled) {
          const nextProfile = { ...storedUser, ...profile };
          setUser(nextProfile);
          setActiveAuthRole(nextProfile.type);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
        }
      } catch {
        if (storedUser) {
          setActiveAuthRole(storedUser.type);
        } else {
          clearAuthTokens();
          localStorage.removeItem(STORAGE_KEY);
          if (!cancelled) setUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email, password) => {
    try {
      const profile = await loginApi(email, password);
      setUser(profile);
      setActiveAuthRole(profile.type);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      return { success: true, user: profile };
    } catch (error) {
      return { success: false, error: error?.message || "Invalid email or password" };
    }
  };

  const signup = async (name, email, password, type = "tourist", extra = {}) => {
    try {
      const [firstName = "", ...rest] = String(name || "").trim().split(" ");
      const lastName = rest.join(" ").trim();
      const resolvedFirstName = String(extra.firstName || firstName).trim();
      const resolvedLastName = String(extra.lastName || lastName).trim();
      const fullName = `${resolvedFirstName} ${resolvedLastName}`.trim();
      const nationalityId = await resolveNationalityId(extra.nationality);

      await registerApi({
        firstName: resolvedFirstName,
        lastName: resolvedLastName,
        email,
        phoneNumber: extra.phone,
        birthDate: extra.dateOfBirth,
        gender: extra.gender,
        password,
        confirmPassword: extra.confirmPassword || password,
        nationalityId,
        role: type === "guide" ? "Guide" : "Tourist",
        languageIds: [],
        licenseNumber: extra.licenseId,
        licenseImage: extra.licenseImage,
      });

      const profile = await loginApi(email, password);
      if (fullName) {
        await updateMyProfileApi({
          userName: fullName,
          phoneNumber: extra.phone || "",
        }).catch(() => {});
      }
      const nextProfile = fullName ? { ...profile, name: fullName } : profile;
      setUser(nextProfile);
      setActiveAuthRole(nextProfile.type);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
      return { success: true, user: nextProfile };
    } catch (error) {
      return { success: false, error: error?.message || "Unable to create account" };
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      clearAuthTokens();
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateUser = (nextUser) => {
    if (nextUser) {
      setUser(nextUser);
      setActiveAuthRole(nextUser.type);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
      return;
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({ user, login, signup, logout, updateUser, isAuthenticated: !!user, isLoading }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { useAuth };
