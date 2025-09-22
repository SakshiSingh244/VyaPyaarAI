import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Heart, Sparkles } from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api"; 
const signUp = async (userData: { username: string; password: string; email?: string }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    return data; 
  } catch (error) {
    return { success: false, message: "Network error" };
  }
};

const login = async (username: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return { success: false, message: "Network error" };
  }
};

export function LoginPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast({
        title: "Missing information",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await login(formData.username, formData.password);

      if (response.success) {
        localStorage.setItem("vyapyaar_user", JSON.stringify(response.user));
        toast({
          title: "Welcome back! 🎉",
          description: `Namaste ${formData.username}! Ready to build your dreams?`,
        });
        navigate("/home");
      } else {
        toast({
          title: "Login failed",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password || !formData.email) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await signUp({
        username: formData.username,
        password: formData.password,
        email: formData.email
      });

      if (response.success) {
        toast({
          title: "Registration successful!",
          description: "Your account has been created. Please login.",
        });
        setIsLoginView(true);
        setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
      } else {
        toast({
          title: "Registration failed",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setFormData({
      username: "",
      password: "",
      email: "",
      confirmPassword: ""
    });
  };

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-gradient-primary p-3 rounded-full">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            VyaPyaarAI
          </h1>
          <p className="text-muted-foreground mt-2">
           <div> Your loving business companion , made with love💕</div>
            [ Sakshi, Vanshika and Aditi ]
          </p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold">
              {isLoginView ? "Welcome Back!" : "Create Account"}
            </CardTitle>
            <CardDescription>
              {isLoginView 
                ? "Ready to continue building your business dreams? ✨"
                : "Join us and start building your business dreams today! ✨"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isLoginView ? handleLogin : handleSignUp} className="space-y-4">
              {!isLoginView && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email*</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="transition-all duration-300 focus:shadow-warm"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username*</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder={isLoginView ? "Enter your username" : "Choose a username"}
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="transition-all duration-300 focus:shadow-warm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password*</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={isLoginView ? "Enter your password" : "Create a password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="transition-all duration-300 focus:shadow-warm"
                />
              </div>

              {!isLoginView && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password*</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="transition-all duration-300 focus:shadow-warm"
                  />
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90 text-white font-medium py-6 transition-all duration-300 hover:shadow-elegant"
                disabled={isLoading}
              >
                {isLoading 
                  ? (isLoginView ? "Signing in..." : "Creating account...")
                  : (isLoginView ? "Sign In 🚀" : "Sign Up 🎉")}
              </Button>
            </form>
            
            <p className="text-center text-sm text-muted-foreground mt-4">
              {isLoginView 
                ? "Don't have an account? "
                : "Already have an account? "}
              <button 
                onClick={toggleView}
                className="text-primary hover:underline focus:outline-none"
              >
                {isLoginView ? "Sign up" : "Sign in"}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
