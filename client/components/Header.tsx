import Link from 'next/link'
import Image from 'next/image'
import NavItems from './NavItems'
import AuthButton from './AuthButton'

const Header = () => {
  return (
    <header className="bg-white border-b border-neutral-200 h-[85px]">
      <div className="max-w-7xl mx-auto px-20 py-6">
        <div className="flex items-center justify-between h-[36px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-[30px] h-[30px]">
              <Image
                src="/assets/Logo.svg"
                alt="Sunset Leisure Travel Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="heading-5 text-tertiary-500">
              Sunset Leisure Travel
            </span>
          </Link>
          
              {/* Navigation */}
              <div className="hidden sm:flex items-center gap-8">
                <NavItems />
                <AuthButton />
              </div>
        </div>
      </div>
    </header>
  )
}

export default Header