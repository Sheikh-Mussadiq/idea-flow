"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuthForm from "../components/auth/AuthForm";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import Logo from "../assets/Logo.png";
import LoginPageBG from "../assets/LoginBG_black.png";
const LoginSignUpPage = () => {
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading to show animation
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen overflow-hidden relative bg-white">
      {/* Animated background elements */}

      {/* Loading animation */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 bg-white z-50 flex items-center justify-center"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.5, repeat: 1, repeatType: "reverse" }}
              className="flex flex-col items-center"
            >
              <img src={Logo} className="h-16 w-16 text-primary-500" />
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 200 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="h-1 bg-primary-500 mt-4 rounded-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Section - Form */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-4 lg:p-8"
        >
          <div className="w-full max-w-md">
            <AuthForm onAuthenticated={() => setIsAuthenticated(true)} />
          </div>
        </motion.div>

        {/* Right Section - Background Image */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hidden lg:block lg:fixed lg:right-0 lg:top-0 lg:bottom-0 p-4"
        >
          <div className="relative w-full h-full rounded-2xl overflow-hidden">
            <img
              src={LoginPageBG}
              alt="Login background"
              className="w-full h-full object-contain"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginSignUpPage;
