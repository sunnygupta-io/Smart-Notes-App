import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await login();
        navigate("/dashboard");
      } catch {
        setError("Failed to complete Google login");
      }
    };
    handleCallback();
  }, [login, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <a href="/login" className="text-blue-600 text-sm hover:underline">
            Back to login
          </a>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500 text-sm">Completing Google login...</p>
    </div>
  );
};

export default GoogleCallback;
