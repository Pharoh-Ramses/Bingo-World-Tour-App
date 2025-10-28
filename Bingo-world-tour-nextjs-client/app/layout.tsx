import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
	variable: "--font-heading",
	subsets: ["latin"],
	weight: ["400", "500", "700"],
});

const dmSans = DM_Sans({
	variable: "--font-body",
	subsets: ["latin"],
	weight: ["100", "400"],
});

export const metadata: Metadata = {
	title: "BINGO World Tour with Sunset Leisure Travel",
	description:
		"Join the ultimate travel-themed bingo experience! Play with destinations from around the world and win amazing prizes.",
	keywords: [
		"bingo",
		"travel",
		"game",
		"destinations",
		"world tour",
		"convention",
		"prizes",
	],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider>
			<html lang="en">
				<body
					className={`${cormorantGaramond.variable} ${dmSans.variable} antialiased bg-neutral-100`}
				>
					<main className="min-h-screen">{children}</main>
				</body>
			</html>
		</ClerkProvider>
	);
}
