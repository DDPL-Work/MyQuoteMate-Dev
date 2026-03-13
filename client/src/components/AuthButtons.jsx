// client/src/components/AuthButtons.jsx
import React from "react";
import { useAuth } from "../hooks/useAuth";

const AuthButtons = () => {
  const { user, logout, showLogin, showSignup } = useAuth();

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Welcome, {user.firstName}!</span>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={showLogin}
        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        Sign In
      </button>
      <button
        onClick={showSignup}
        className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700"
      >
        Create Account
      </button>
    </div>
  );
};

export default AuthButtons;