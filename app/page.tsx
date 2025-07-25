"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Utensils, Star, Users, TrendingUp } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <Utensils className="h-8 w-8 text-green-600" />
          <span className="text-2xl font-bold">NutriTrack</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-sm font-medium">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button className="text-sm font-medium bg-green-600 hover:bg-green-700">
              Sign Up
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-blue-600/90 z-10"></div>
          <div 
            className="relative h-[80vh] bg-cover bg-center flex items-center justify-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2053&q=80')"
            }}
          >
            <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Your Journey to 
                <span className="text-yellow-300"> Better Health</span>
                <br />
                Starts Here
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-2xl mx-auto leading-relaxed">
                "Take care of your body. It's the only place you have to live."
              </p>
              <p className="text-lg md:text-xl mb-12 text-gray-200 max-w-3xl mx-auto">
                Transform your relationship with food and fitness. Track calories, monitor nutrition, 
                and achieve your health goals with personalized insights and expert guidance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 text-lg">
                    Start Your Journey
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-8 py-4 text-lg">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Comprehensive tools to help you track, analyze, and achieve your health and fitness goals.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Utensils className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Smart Nutrition Tracking</h3>
                <p className="text-gray-600 leading-relaxed">
                  Log meals effortlessly with our comprehensive food database. 
                  Get detailed nutritional insights and personalized recommendations.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Progress Analytics</h3>
                <p className="text-gray-600 leading-relaxed">
                  Visualize your progress with detailed charts and reports. 
                  Track trends and make data-driven decisions about your health.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Personalized Goals</h3>
                <p className="text-gray-600 leading-relaxed">
                  Set custom goals based on your lifestyle, preferences, and health objectives. 
                  Get tailored advice to reach your targets faster.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-green-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Health?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who have already started their journey to better health and nutrition.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg">
                Get Started Free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Utensils className="h-6 w-6 text-green-400" />
                <span className="text-xl font-bold">NutriTrack</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Your comprehensive nutrition and fitness companion for a healthier lifestyle.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Calorie Tracking</li>
                <li>Nutrition Analysis</li>
                <li>Exercise Logging</li>
                <li>Progress Reports</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 NutriTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
