import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto px-20 py-16">
      <div className="space-y-20">
        {/* Hero Section */}
        <div className="text-center space-y-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center p-0">
              <Image
                src="/assets/Logo.svg"
                alt="Bingo World Tour Logo"
                width={64}
                height={64}
                className="w-16 h-16"
              />
            </div>
            <h1 className="heading-1 text-tertiary-500">BINGO World Tour</h1>
          </div>
          <p className="heading-3 text-primary-500">with Sunset Leisure Travel</p>
          <p className="body-1 text-tertiary-300 max-w-3xl mx-auto">
            Welcome to the ultimate travel-themed bingo experience! Join your convention&apos;s game 
            session and compete with fellow attendees as you explore destinations from around the world. 
            Create your custom board, watch locations reveal in real-time, and be the first to call BINGO!
          </p>
        </div>

        {/* How It Works */}
        <div className="space-y-8">
          <h2 className="heading-2 text-tertiary-500 text-center">How to Play</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-accent-soft-coral rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="heading-4 text-white">1</span>
                </div>
                <CardTitle className="heading-4 text-tertiary-500">Get Your Code</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="body-1 text-tertiary-300">
                  Your convention host will provide a 6-character session code. 
                  Enter it below to join the game and start your adventure!
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-accent-sage rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="heading-4 text-white">2</span>
                </div>
                <CardTitle className="heading-4 text-tertiary-500">Create Your Board</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="body-1 text-tertiary-300">
                  Choose 24 dream destinations from 50 amazing locations to create 
                  your personalized 5x5 bingo board. The center space is always FREE!
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-accent-deep-burgundy rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="heading-4 text-white">3</span>
                </div>
                <CardTitle className="heading-4 text-tertiary-500">Play & Win Prizes</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="body-1 text-tertiary-300">
                  Watch as destinations are revealed in real-time. Mark your tiles 
                  and be the first to complete a row, column, or diagonal to win amazing prizes!
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* What You'll Experience */}
        <div className="space-y-8">
          <h2 className="heading-2 text-tertiary-500 text-center">What You&apos;ll Experience</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-500">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h3 className="heading-5 text-tertiary-500">50 Dream Destinations</h3>
              <p className="body-2 text-tertiary-300">From Paris to Tokyo, choose your favorite travel spots</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-secondary-500">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <h3 className="heading-5 text-tertiary-500">Real-Time Excitement</h3>
              <p className="body-2 text-tertiary-300">Watch destinations reveal live with fellow attendees</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent-sand rounded-full flex items-center justify-center mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-tertiary-600">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                  <path d="M4 22h16"/>
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21l-1.5.5c-.5.17-1.03.17-1.53 0l-1.5-.5C3.47 17.98 3 17.55 3 17v-2.34"/>
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21l1.5.5c.5.17 1.03.17 1.53 0l1.5-.5C20.53 17.98 21 17.55 21 17v-2.34"/>
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
                </svg>
              </div>
              <h3 className="heading-5 text-tertiary-500">Amazing Prizes</h3>
              <p className="body-2 text-tertiary-300">Win travel vouchers, gift cards, and exclusive rewards</p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent-soft-coral rounded-full flex items-center justify-center mx-auto">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h3 className="heading-5 text-tertiary-500">Connect & Compete</h3>
              <p className="body-2 text-tertiary-300">Meet fellow convention attendees and make new friends</p>
            </div>
          </div>
        </div>

        {/* Game Features */}
        <div className="bg-neutral-200 rounded-lg p-8 space-y-8">
          <h2 className="heading-2 text-tertiary-500 text-center">Why You&apos;ll Love It</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="heading-4 text-tertiary-500">Easy & Fun</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="body-2 text-tertiary-300">Simple 3-step process to get started</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="body-2 text-tertiary-300">Works on any device - phone, tablet, or laptop</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="body-2 text-tertiary-300">No downloads required - play instantly in your browser</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="heading-4 text-tertiary-500">Engaging Experience</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                  <span className="body-2 text-tertiary-300">Beautiful destination images and descriptions</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                  <span className="body-2 text-tertiary-300">Live updates and instant notifications</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                  <span className="body-2 text-tertiary-300">Celebration animations when you win</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-8">
          <h2 className="heading-2 text-tertiary-500">Ready to Play?</h2>
          <p className="body-1 text-tertiary-300 max-w-2xl mx-auto">
            Get your session code from your convention host and join the fun! 
            Create your dream travel board and compete for amazing prizes.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/join">
              <Button variant="primary" className="px-8 py-3 rounded-lg h-12 w-full sm:w-auto">
                Enter Session Code
              </Button>
            </Link>
          </div>
          <p className="body-2 text-tertiary-400">
            Don&apos;t have a code? Ask your convention host or event organizer!
          </p>
        </div>

        {/* About the Game */}
        <div className="border-t border-neutral-300 pt-12">
          <div className="text-center space-y-6">
            <h3 className="heading-3 text-tertiary-500">About This Game</h3>
            <p className="body-1 text-tertiary-300 max-w-2xl mx-auto">
              BINGO World Tour is brought to you by Sunset Leisure Travel, creating unforgettable 
              travel experiences since 1995. This interactive game combines our passion for travel 
              with the excitement of bingo, featuring real destinations from around the world.
            </p>
            <div className="flex justify-center gap-8 text-tertiary-300">
              <div className="text-center">
                <p className="heading-4 text-primary-500">50</p>
                <p className="body-2">Amazing Destinations</p>
              </div>
              <div className="text-center">
                <p className="heading-4 text-primary-500">Real-Time</p>
                <p className="body-2">Live Gameplay</p>
              </div>
              <div className="text-center">
                <p className="heading-4 text-primary-500">Fun</p>
                <p className="body-2">Prizes to Win</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home