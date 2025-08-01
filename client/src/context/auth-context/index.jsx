// * MANAGES THE AUTHENTICATION FORM DATA AND SETTERS (FORM STATE) GLOBALLY
// * FIRES THE REQUEST FOR LOGIN AND REGISTER
// * SETS AND GETS THE JWT TOKEN
// * CHECKAUTH JUST AFTER THE APP LOADS FOR AUTO LOGIN

// TODO: ADD TOAST NOTIFICATIONS

import { Skeleton } from "@/components/ui/skeleton";
import { initialSignInFormData, initialSignUpFormData } from "@/config";
import { registerService, loginService, checkAuthService } from "@/services";
import React, { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [signInFormData, setSignInFormData] = useState(initialSignInFormData);
  const [signUpFormData, setSignUpFormData] = useState(initialSignUpFormData);
  const [auth, setAuth] = useState({
    authenticate: false,
    user: null,
  });
  const [loading, setLoading] = useState(true);

  // SENDS REGISTER REQUEST
  const handleRegisterUser = async (e) => {
    e.preventDefault();
    try {
      const data = await registerService(signUpFormData);
      console.log("Registration response:", data);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  // LOGIN, TOKEN SAVE, AUTH UPDATE
  const handleLoginUser = async (e) => {
    e.preventDefault();
    try {
      const data = await loginService(signInFormData);

      console.log("Login response:", data);

      if (data.success) {
        console.log("Login successful, setting accessToken and user.");
        sessionStorage.setItem(
          "accessToken",
          JSON.stringify(data.data.accessToken)
        );
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
      } else {
        console.log("Login failed, setting auth to false.");
        setAuth({
          authenticate: false,
          user: null,
        });
      }
    } catch (error) {
      console.error("Login failed:", error);
      setAuth({
        authenticate: false,
        user: null,
      });
    }
  };

  // VERIFY JWT JUST AFTER APP START
  const checkAuthUser = async () => {
    try {
      setLoading(true);
      const accessToken = sessionStorage.getItem("accessToken");
      if (!accessToken) {
        setAuth({
          authenticate: false,
          user: null,
        });
        setLoading(false);
        return;
      }

      const data = await checkAuthService();

      if (data.success) {
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
      } else {
        sessionStorage.removeItem("accessToken");
        setAuth({
          authenticate: false,
          user: null,
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Auth check failed:", error);
      sessionStorage.removeItem("accessToken");
      setAuth({
        authenticate: false,
        user: null,
      });
      setLoading(false);
    }
  };

  // LOGOUT FUNCTIONALITY
  const resetCredentials = () => {
    setAuth({
      authenticate: false,
      user: null,
    });
  };

  useEffect(() => {
    checkAuthUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signInFormData,
        setSignInFormData,
        signUpFormData,
        setSignUpFormData,
        handleRegisterUser,
        handleLoginUser,
        auth,
        resetCredentials,
      }}
    >
      {loading ? <Skeleton /> : children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
