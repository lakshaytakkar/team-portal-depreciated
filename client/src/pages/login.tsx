import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Zap, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  User, 
  Check,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();
  const { setCurrentUser } = useStore();
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordInput, setForgotPasswordInput] = useState("");

  const handleForgotPasswordEmail = () => {
    const subject = encodeURIComponent("Password Reset Request");
    const body = encodeURIComponent(`Hello HR Team,\n\nI am requesting a password reset for my account.\n\nName/Email: ${forgotPasswordInput}\n\nThank you.`);
    window.location.href = `mailto:hr@suprans.in?subject=${subject}&body=${body}`;
    setForgotPasswordOpen(false);
    setForgotPasswordInput("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const user = await api.login(email, password) as any;
      setCurrentUser(user);
      setLocation("/");
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-muted relative flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-8 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="bg-primary h-9 w-9 rounded-lg flex items-center justify-center shadow-sm">
            <Zap className="h-5 w-5 text-white fill-current" />
          </div>
          <span className="text-2xl font-semibold text-foreground tracking-tight">Suprans</span>
        </div>
        
        <div className="flex items-center gap-2 bg-card border rounded-lg px-3 py-2 shadow-sm cursor-pointer transition-colors">
          <div className="w-5 h-5 rounded-full overflow-hidden bg-muted relative">
             <img 
               src="https://flagcdn.com/us.svg" 
               alt="US Flag" 
               className="w-full h-full object-cover"
             />
          </div>
          <span className="text-foreground font-medium text-sm">EN</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* Background Pattern - Simplified version of Figma mask */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-grid-pattern" 
                style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
           </div>
        </div>

        <div className="bg-card w-full max-w-[480px] rounded-2xl p-10 shadow-[0px_4px_24px_rgba(0,0,0,0.04)] border relative z-20">
          <div className="flex flex-col items-center text-center space-y-6 mb-8">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-2 ring-8 ring-red-50/50">
              <div className="w-12 h-12 bg-card rounded-full flex items-center justify-center shadow-sm border border-red-100">
                <User className="h-6 w-6 text-primary" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-foreground">Welcome Back</h1>
              <p className="text-muted-foreground text-[15px]">Glad to see you again. Log in to your account.</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Email Address <span className="text-primary">*</span>
              </label>
              <Input 
                type="email" 
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-[52px] bg-card text-base rounded-xl focus-visible:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Password <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-[52px] bg-card text-base rounded-xl pr-10 focus-visible:ring-primary"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" className="rounded-[6px] data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                >
                  Keep me logged in
                </label>
              </div>
              <button 
                type="button"
                onClick={() => setForgotPasswordOpen(true)}
                className="text-sm font-medium text-primary transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm" data-testid="text-error">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-[52px] text-base font-semibold rounded-xl transition-all duration-200 mt-2"
              disabled={isLoading}
              style={{ backgroundColor: email && password ? 'hsl(var(--primary))' : '#FBC4C6', cursor: email && password ? 'pointer' : 'not-allowed' }}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

        </div>
      </div>

      {/* Footer */}
      <div className="p-8 flex items-center justify-between text-sm text-muted-foreground">
        <p>© 2026 Suprans. All right reserved.</p>
        <div className="flex items-center gap-8">
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          <a href="#" className="hover:text-foreground transition-colors">Get help</a>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Forgot Password?</DialogTitle>
            <DialogDescription>
              Please contact HR at hr@suprans.in for password reset assistance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Your Name or Email ID
              </label>
              <Input
                type="text"
                placeholder="Enter your name or email"
                value={forgotPasswordInput}
                onChange={(e) => setForgotPasswordInput(e.target.value)}
                className="h-[44px] bg-card rounded-lg focus-visible:ring-primary"
              />
            </div>
            <Button
              onClick={handleForgotPasswordEmail}
              disabled={!forgotPasswordInput.trim()}
              className="w-full h-[44px] font-medium rounded-lg"
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email to HR
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
