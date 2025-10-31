"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavItems = () => {
	const pathname = usePathname();

	const navLinks = [
		{ href: "/join", label: "Join Game" },
		{ href: "/about", label: "About" },
		{ href: "/contact", label: "Contact" },
	];

	return (
		<nav className="flex items-center gap-8">
			{navLinks.map((link) => {
				const isActive = pathname === link.href;
				return (
					<Link
						key={link.href}
						href={link.href}
						className={`
              body-1 text-tertiary-300 transition-colors duration-200
              ${
								isActive
									? "text-tertiary-500 font-medium"
									: "hover:text-tertiary-500"
							}
            `}
					>
						{link.label}
					</Link>
				);
			})}
		</nav>
	);
};

export default NavItems;
