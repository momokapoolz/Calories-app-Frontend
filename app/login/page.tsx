"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import axios from "axios"
import api from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Utensils } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  useEffect(() => {
    setMounted(true)
  }, [])
  const onSubmit = async (data: LoginData) => {
    if (!mounted) return; // Prevent submission if not mounted
    
    try {
      setIsLoading(true);      console.log('Attempting login with API route');
      console.log('Login data:', data);
      
      // Use the frontend API route that proxies to the backend
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!loginResponse.ok) {
        throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
      }

      const responseData = await loginResponse.json();
      console.log('Login response:', responseData);
      if (responseData.status === "success" && responseData.data?.user) {
        console.log('=== LOGIN SUCCESS ===')
        console.log('User data:', responseData.data.user)
        console.log('Tokens data:', responseData.data.tokens)
          // Store the access token ID as the bearer token
        if (responseData.data.tokens) {
          const accessToken = responseData.data.tokens.access_token_id.toString();
          const refreshToken = responseData.data.tokens.refresh_token_id.toString();
            console.log('=== TOKEN STORAGE DEBUG (UUID Mode) ===')
          console.log('Raw tokens from backend:', responseData.data.tokens)
          console.log('Access token ID to store:', accessToken)
          console.log('Refresh token ID to store:', refreshToken)
          console.log('Access token ID type:', typeof accessToken)
          console.log('Access token ID length:', accessToken.length)
          
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          
          // Verify tokens were stored correctly
          const storedAccessToken = localStorage.getItem('accessToken');
          const storedRefreshToken = localStorage.getItem('refreshToken');
          console.log('Verified stored access token:', storedAccessToken);
          console.log('Verified stored refresh token:', storedRefreshToken);
          console.log('Stored tokens match:', accessToken === storedAccessToken);          // Test the token immediately after login
          console.log('Testing token immediately after login...')
          try {
            console.log('Making test call to /api/profile with stored token...')
            console.log('Token being used for test:', storedAccessToken?.substring(0, 20) + '...')
            
            // Use the frontend API route that proxies to the backend
            const testResponse = await fetch('/api/profile', {
              headers: {
                'Authorization': `Bearer ${storedAccessToken}`,
                'Accept': 'application/json'
              }
            });
            
            if (testResponse.ok) {
              const profileData = await testResponse.json();
              console.log('Immediate token test SUCCESS:', profileData);
            } else {
              throw new Error(`Profile test failed: ${testResponse.status} ${testResponse.statusText}`);
            }
          } catch (testError: any) {
            console.error('Immediate token test FAILED - Full error object:', testError);
            console.error('Error message:', testError?.message || 'No message');
            console.error('Error name:', testError?.name || 'No name');
            
            // Note: Using frontend API route (/api/profile) instead of direct backend call
            // This prevents CORS and network issues
          }
          
          console.log('=== TOKEN STORAGE DEBUG END ===')
        }

        // Set user in auth context
        login(responseData.data.user);
        
        toast({
          title: "Success",
          description: responseData.message || "Logged in successfully",
        });
      } else {
        throw new Error('Login failed: Invalid server response');
      }    } catch (error: any) {
      console.error("=== LOGIN ERROR DETAILS ===");
      console.error("Full error object:", error);
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      console.error("Error response:", error.response);
      console.error("Error config:", error.config);
      console.error("Is network error:", error.message === 'Network Error');
      console.error("Error request:", error.request);
      
      let errorMessage = "An error occurred during login";
      
      // Handle different types of errors
      if (error.message === 'Network Error') {
        errorMessage = "Cannot connect to server. Please check if the backend is running";
      } else if (error.response) {
        errorMessage = error.response.data?.message || error.response.data?.error || 'Invalid email or password';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Show a loading state or nothing during SSR
  if (!mounted) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Utensils className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-bold">NutriTrack</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Utensils className="h-8 w-8 text-green-600" />
            <h1 className="text-2xl font-bold">NutriTrack</h1>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to sign in to your account
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="m@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Form>

        <div className="text-center text-sm space-y-2">
          <div>
            <Link href="/register" className="text-primary hover:underline">
              Don't have an account? Sign up
            </Link>
          </div>
          <div>
            <Link href="/" className="text-muted-foreground hover:text-primary">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}