import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-20 py-16">
      <div className="space-y-16">
        {/* Header */}
        <div className="text-center space-y-6">
          <h1 className="heading-1 text-tertiary-500">About Sunset Leisure Travel</h1>
          <p className="body-1 text-tertiary-300 max-w-3xl mx-auto">
            Creating unforgettable travel experiences and memorable convention events since 1995. 
            We specialize in group travel, convention services, and unique entertainment solutions.
          </p>
        </div>

        {/* Our Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="heading-2 text-tertiary-500">Our Story</h2>
            <div className="space-y-4">
              <p className="body-1 text-tertiary-300">
                Founded in 1995, Sunset Leisure Travel began as a small travel agency with a big dream: 
                to create extraordinary travel experiences that bring people together. Over the past 25+ years, 
                we&apos;ve grown into a trusted partner for conventions, corporate events, and group travel across the country.
              </p>
              <p className="body-1 text-tertiary-300">
                Our passion for travel extends beyond just booking trips. We believe in creating connections, 
                fostering community, and making every event memorable. That&apos;s why we developed innovative 
                entertainment solutions like BINGO World Tour to enhance convention experiences.
              </p>
              <p className="body-1 text-tertiary-300">
                Today, we continue to serve thousands of clients each year, from small corporate groups 
                to large-scale conventions, always with the same commitment to excellence and personal service 
                that has defined us from the beginning.
              </p>
            </div>
          </div>
          <div className="bg-primary-100 rounded-lg p-8 text-center">
            <div className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <h3 className="heading-4 text-tertiary-500 mb-2">25+ Years</h3>
            <p className="body-2 text-tertiary-300">Creating unforgettable travel experiences</p>
          </div>
        </div>

        {/* Our Services */}
        <div className="space-y-8">
          <h2 className="heading-2 text-tertiary-500 text-center">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-accent-sage rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <CardTitle className="heading-4 text-tertiary-500">Convention Travel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="body-2 text-tertiary-300">
                  Complete travel management for conventions and conferences, including group bookings, 
                  transportation, and accommodation coordination.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-accent-soft-coral rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <CardTitle className="heading-4 text-tertiary-500">Event Entertainment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="body-2 text-tertiary-300">
                  Custom entertainment solutions for events, including interactive games like 
                  BINGO World Tour that engage attendees and create memorable experiences.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-accent-deep-burgundy rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <CardTitle className="heading-4 text-tertiary-500">Group Tours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="body-2 text-tertiary-300">
                  Curated group travel experiences to destinations worldwide, with expert guides 
                  and personalized itineraries for corporate and leisure groups.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Company Values */}
        <div className="space-y-8">
          <h2 className="heading-2 text-tertiary-500 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="heading-4 text-tertiary-500">Excellence in Service</h3>
              <p className="body-1 text-tertiary-300">
                We&apos;re committed to providing exceptional service and attention to detail in everything we do. 
                From the initial consultation to the final farewell, we ensure every aspect of your travel 
                experience exceeds expectations.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="heading-4 text-tertiary-500">Building Connections</h3>
              <p className="body-1 text-tertiary-300">
                Travel is about more than just destinations—it&apos;s about the people you meet and the connections 
                you make. We create experiences that bring people together and foster lasting relationships.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="heading-4 text-tertiary-500">Innovation & Creativity</h3>
              <p className="body-1 text-tertiary-300">
                We&apos;re always looking for new ways to enhance the travel experience. From interactive games 
                to cutting-edge event technology, we bring fresh ideas to every project.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="heading-4 text-tertiary-500">Personalized Approach</h3>
              <p className="body-1 text-tertiary-300">
                Every client and every event is unique. We take the time to understand your specific needs 
                and create customized solutions that reflect your vision and goals.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-neutral-200 rounded-lg p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="heading-3 text-primary-500">25+</p>
              <p className="body-2 text-tertiary-300">Years in Business</p>
            </div>
            <div>
              <p className="heading-3 text-primary-500">1000+</p>
              <p className="body-2 text-tertiary-300">Events Managed</p>
            </div>
            <div>
              <p className="heading-3 text-primary-500">50K+</p>
              <p className="body-2 text-tertiary-300">Happy Travelers</p>
            </div>
            <div>
              <p className="heading-3 text-primary-500">100+</p>
              <p className="body-2 text-tertiary-300">Destinations</p>
            </div>
          </div>
        </div>

        {/* Meet the Team */}
        <div className="space-y-8">
          <h2 className="heading-2 text-tertiary-500 text-center">Our Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-secondary-200 rounded-full mx-auto flex items-center justify-center">
                <span className="heading-4 text-secondary-600">JD</span>
              </div>
              <h3 className="heading-5 text-tertiary-500">John Davis</h3>
              <p className="body-2 text-tertiary-300">Founder & CEO</p>
              <p className="body-2 text-tertiary-400">Travel industry veteran with 30+ years of experience in creating memorable group experiences.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-accent-sand rounded-full mx-auto flex items-center justify-center">
                <span className="heading-4 text-tertiary-600">SM</span>
              </div>
              <h3 className="heading-5 text-tertiary-500">Sarah Mitchell</h3>
              <p className="body-2 text-tertiary-300">Director of Operations</p>
              <p className="body-2 text-tertiary-400">Expert in convention logistics and event management, ensuring seamless experiences for all clients.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-primary-200 rounded-full mx-auto flex items-center justify-center">
                <span className="heading-4 text-primary-600">MC</span>
              </div>
              <h3 className="heading-5 text-tertiary-500">Mike Chen</h3>
              <p className="body-2 text-tertiary-300">Director of Client Relations</p>
              <p className="body-2 text-tertiary-400">Dedicated to building lasting partnerships and ensuring client satisfaction at every level.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About