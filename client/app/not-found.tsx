import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 - Page Not Found | Sunset Leisure Travel',
  description: 'The page you are looking for could not be found. Return to our homepage or explore our travel destinations.',
}

export default function NotFound() {
  return (
    <div className="max-w-7xl mx-auto px-20 py-16">
      <div className="text-center space-y-12">
        {/* 404 Error */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="heading-1 text-primary-500">404</h1>
            <h2 className="heading-2 text-tertiary-500">Page Not Found</h2>
            <p className="body-1 text-tertiary-300 max-w-2xl mx-auto">
              Oops! It looks like you&apos;ve wandered off the beaten path. The page you&apos;re looking for 
              seems to have taken an unexpected detour on its journey.
            </p>
          </div>
        </div>

        {/* Travel-themed Illustration */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center">
              <svg 
                width="64" 
                height="64" 
                viewBox="0 0 24 24" 
                fill="none" 
                className="text-primary-500"
              >
                <path 
                  d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <circle 
                  cx="12" 
                  cy="10" 
                  r="3" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-soft-coral rounded-full"></div>
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-accent-sage rounded-full"></div>
            <div className="absolute top-1/2 -left-4 w-3 h-3 bg-accent-sand rounded-full"></div>
            <div className="absolute top-1/2 -right-4 w-3 h-3 bg-accent-deep-burgundy rounded-full"></div>
          </div>
        </div>

        {/* Helpful Message */}
        <div className="space-y-6">
          <p className="body-2 text-tertiary-300">
            Don&apos;t worry, even the best travelers sometimes take a wrong turn. Let&apos;s get you back on track!
          </p>
          
          {/* Navigation Options */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/">
              <Button variant="primary" className="px-8 py-3 rounded-lg h-12">
                Return Home
              </Button>
            </Link>
            <Link href="/destinations">
              <Button variant="outline" className="px-8 py-3 rounded-lg h-12 border-2 border-primary-500 font-semibold">
                Explore Destinations
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary" className="px-8 py-3 rounded-lg h-12">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>

        {/* Additional Help */}
        <div className="pt-8 border-t border-neutral-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-accent-soft-coral rounded-full flex items-center justify-center mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h3 className="heading-6 text-tertiary-500">Popular Destinations</h3>
              <p className="body-3 text-tertiary-300">
                Discover our most loved travel destinations
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-accent-sage rounded-full flex items-center justify-center mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
              </div>
              <h3 className="heading-6 text-tertiary-500">Travel Packages</h3>
              <p className="body-3 text-tertiary-300">
                Browse our curated travel packages
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-accent-sand rounded-full flex items-center justify-center mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <h3 className="heading-6 text-tertiary-500">Get Help</h3>
              <p className="body-3 text-tertiary-300">
                Contact our travel experts for assistance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
