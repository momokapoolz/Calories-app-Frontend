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

// Your backend base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

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
      setIsLoading(true);      console.log('Attempting login with JWT endpoint');
      console.log('API_URL:', API_URL);
      console.log('Login data:', data);
      
      // Use the api-client which handles CORS and other configurations
      const loginResponse = await api.post('/login', data);

      const responseData = loginResponse.data;
      console.log('Login response:', responseData);// If login successful, we should have user data and tokens
      if (responseData.status === "success" && responseData.data?.user) {
        console.log('=== LOGIN SUCCESS ===')
        console.log('User data:', responseData.data.user)
        console.log('Tokens data:', responseData.data.tokens)
          // Store the access token ID as the bearer token
        if (responseData.data.tokens) {
          const accessToken = responseData.data.tokens.access_token_id.toString();
          const refreshToken = responseData.data.tokens.refresh_token_id.toString();
            console.log('=== TOKEN STORAGE DEBUG ===')
          console.log('Raw tokens from backend:', responseData.data.tokens)
          console.log('Access token to store:', accessToken)
          console.log('Refresh token to store:', refreshToken)
          console.log('Access token type:', typeof accessToken)
          console.log('Access token length:', accessToken.length)
          
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
            console.log('Making test call to /api/auth/profile with stored token...')
            console.log('Token being used for test:', storedAccessToken?.substring(0, 20) + '...')
            
            const testResponse = await api.get('/api/auth/profile');
            console.log('Immediate token test SUCCESS:', testResponse.data);
          } catch (testError: any) {
            console.error('Immediate token test FAILED - Full error object:', testError);
            console.error('Error message:', testError?.message || 'No message');
            console.error('Error name:', testError?.name || 'No name');
            console.error('Error code:', testError?.code || 'No code');
            console.error('Response status:', testError?.response?.status || 'No status');
            console.error('Response data:', testError?.response?.data || 'No response data');
            console.error('Request URL:', testError?.config?.url || 'No URL');
            console.error('Request headers:', testError?.config?.headers || 'No headers');            // Also try a direct axios call to compare
            console.log('Trying direct axios call for comparison...')
            try {
              const directResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/auth/profile`, {
                headers: {
                  'Authorization': `Bearer ${storedAccessToken}`,
                  'Accept': 'application/json'
                }
              });
              console.log('Direct axios call SUCCESS:', directResponse.data);
            } catch (directError: any) {
              console.error('Direct axios call also FAILED:', {
                message: directError?.message,
                status: directError?.response?.status,
                data: directError?.response?.data
              });
            }
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
        errorMessage = "Cannot connect to server. Please check if the backend is running on http://localhost:8080";
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

        <div className="text-center text-sm">
          <Link href="/register" className="text-primary hover:underline">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}