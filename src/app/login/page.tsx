
"use client";

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast"
import { Landmark, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const success = login(username, password);

    if (success) {
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      router.push('/dashboard');
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid username or password. Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                <Landmark className="h-10 w-10 text-primary" />
            </div>
          <CardTitle className="text-3xl font-headline">Jilliane LoadBuddy</CardTitle>
          <CardDescription>Enter your credentials to log in.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute inset-y-0 right-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !username || !password}>
              {isLoading ? 'Logging In...' : 'Login'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">Use 'admin' or 'user' with any password.</p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
