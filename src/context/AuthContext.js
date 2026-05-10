"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi, loginApi, signupApi } from "@/lib/api";
import { isAdminUser } from "@/lib/authRole";

const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function hydrateUser() {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) return;
        const me = await authApi.me();
        if (active) {
          const resolvedUser = me.user || me.data || me;
          setUser(resolvedUser || null);
          localStorage.setItem("auth_user", JSON.stringify(resolvedUser || null));
        }
      } catch (e) {
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token");
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    hydrateUser();
    return () => {
      active = false;
    };
  }, []);

  const login = async (email, password) => {
    const data = await loginApi({ email, password });
    const resolvedUser = data?.user || data?.data?.user || data?.data || null;
    const token = data?.token || data?.data?.token || "";
    setUser(resolvedUser);
    try {
      localStorage.setItem("auth_user", JSON.stringify(resolvedUser));
      localStorage.setItem("auth_token", token);
    } catch (e) {}
    return { ...data, user: resolvedUser, token };
  };

  const signup = async (name, email, password, phone) => {
    const data = await signupApi({ name, email, password, phone });
    return data;
  };

  const verifyEmail = async (email, code) => {
    return authApi.verifyEmail({ email, code });
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // no-op
    }
    setUser(null);
    try {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        verifyEmail,
        logout,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: isAdminUser(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
