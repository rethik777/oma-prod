import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

import logo from "../assets/logo.png";
import "../styles/login-background.css";
import apiClient, { storeToken, getStoredToken } from "../config/api";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Check if already logged in (token exists)
  useEffect(() => {
    if (getStoredToken()) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await apiClient.fetch("/credential/login", {
        method: "POST",
        body: JSON.stringify({
          username,
          password
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        setError(errorData || "Login failed. Please check your credentials.");
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      
      // Store JWT token
      if (data.token) {
        storeToken(data.token);
      }
      
      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during login");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    // Create network nodes
    const nodeCount = 20;
    const nodes: HTMLDivElement[] = [];
    
    for (let i = 0; i < nodeCount; i++) {
      const node = document.createElement('div');
      node.className = 'network-node';
      node.style.left = `${Math.random() * 100}%`;
      node.style.top = `${Math.random() * 100}%`;
      node.style.animationDelay = `${Math.random() * 4}s`;
      container.appendChild(node);
      nodes.push(node);
    }

    // Create particles
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 3}s`;
      container.appendChild(particle);
    }

    // Create hexagons
    const hexCount = 8;
    for (let i = 0; i < hexCount; i++) {
      const hex = document.createElement('div');
      hex.className = 'hexagon';
      hex.style.left = `${Math.random() * 90}%`;
      hex.style.top = `${Math.random() * 90}%`;
      hex.style.animationDelay = `${Math.random() * 25}s`;
      container.appendChild(hex);
    }

    // Create data streams
    const streamCount = 5;
    for (let i = 0; i < streamCount; i++) {
      const stream = document.createElement('div');
      stream.className = 'data-stream';
      stream.style.left = `${Math.random() * 100}%`;
      stream.style.animationDelay = `${Math.random() * 3}s`;
      stream.style.animationDuration = `${3 + Math.random() * 2}s`;
      container.appendChild(stream);
    }

    // Create geometric shapes
    const shapes = ['circle', 'square'];
    for (let i = 0; i < 6; i++) {
      const shape = document.createElement('div');
      shape.className = `geometric-shape ${shapes[Math.floor(Math.random() * shapes.length)]}`;
      shape.style.width = `${50 + Math.random() * 100}px`;
      shape.style.height = `${50 + Math.random() * 100}px`;
      shape.style.left = `${Math.random() * 90}%`;
      shape.style.top = `${Math.random() * 90}%`;
      shape.style.animationDelay = `${Math.random() * 20}s`;
      shape.style.animationDuration = `${15 + Math.random() * 10}s`;
      container.appendChild(shape);
    }

    return () => {
      // Cleanup
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
  }, []);

  return (
    <div className="flex h-screen w-full">
      {/* Left Side - Premium Animated Background with Logo */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="login-background">
          {/* Grid Overlay */}
          <div className="grid-overlay" />
          
          {/* Glowing Orbs */}
          <div className="glow-orb glow-orb-1" />
          <div className="glow-orb glow-orb-2" />
          <div className="glow-orb glow-orb-3" />
          
          {/* Scan Line */}
          <div className="scan-line" />
          
          {/* Animated Elements Container */}
          <div ref={canvasRef} className="particles" />
        </div>
        
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center animate-fade-in">
          <img
            src={logo}
            alt="OMA Tool Logo"
            className="h-32 w-auto mb-6 drop-shadow-2xl animate-fade-in-down"
            style={{ filter: 'drop-shadow(0 0 30px rgba(99, 179, 237, 0.5))' }}
          />
          <h1 className="text-white text-6xl font-light tracking-wider animate-fade-in-up animate-delay-200"
              style={{ textShadow: '0 0 40px rgba(99, 179, 237, 0.6), 0 0 20px rgba(99, 179, 237, 0.4)' }}>
            OMA Tool
          </h1>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8 flex flex-col items-center">
            <img
              src={logo}
              alt="OMA Tool Logo"
              className="h-24 w-auto mb-4"
            />
            <h1 className="text-4xl font-light tracking-wider text-[#002D72]">
              OMA Tool
            </h1>
          </div>

          <div className="space-y-2 animate-fade-in-up animate-delay-100">
            <h2 className="text-3xl font-light text-[#002D72]">Welcome back</h2>
            <p className="text-[#4A4A4A]">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 animate-fade-in-up animate-delay-200">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#4A4A4A]">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="your.username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                className="h-12 border-gray-300 focus:border-[#002D72] focus:ring-[#002D72]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#4A4A4A]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-12 border-gray-300 focus:border-[#002D72] focus:ring-[#002D72]"
              />
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                className="text-sm text-[#4A4A4A] hover:text-[#002D72] transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#002D72] hover:bg-[#001f52] text-white disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

          </form>
        </div>
      </div>
    </div>
  );
}
