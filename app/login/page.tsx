"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import axios from "axios"
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
      setIsLoading(true);
      
      console.log('Attempting login through Next.js API route');
      const loginResponse = await axios.post('/api/auth/login', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseData = loginResponse.data;
      console.log('Login response:', responseData);

      // If login successful, we should have user data and tokens
      if (responseData.status === "success" && responseData.data?.user) {
        // Store tokens if needed
        if (responseData.data.tokens) {
          localStorage.setItem('accessToken', responseData.data.tokens.access_token_id.toString());
          localStorage.setItem('refreshToken', responseData.data.tokens.refresh_token_id.toString());
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
      console.error("Login error:", error);
      
      let errorMessage = "An error occurred during login";
      
      // Handle axios error responses
      if (error.response) {
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