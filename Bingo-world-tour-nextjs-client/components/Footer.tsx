import React from 'react'
import Image from 'next/image'

const Footer = () => {
  return (
    <footer className="bg-tertiary-500 h-[136px]">
      <div className="max-w-7xl mx-auto px-20 py-8">
        <div className="h-[72px] flex flex-col items-center justify-center space-y-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="relative w-6 h-6">
              <Image
                src="/assets/Logo.svg"
                alt="Sunset Leisure Travel Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="heading-6 text-white">
              Sunset Leisure Travel
            </span>
          </div>
          
          {/* Tagline */}
          <p className="body-1 text-tertiary-100 text-center max-w-md">
            Creating unforgettable travel experiences since 1995
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
