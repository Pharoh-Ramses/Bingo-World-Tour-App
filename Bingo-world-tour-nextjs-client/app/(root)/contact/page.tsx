"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Contact = () => {
	return (
		<div className="max-w-7xl mx-auto px-20 py-16">
			<div className="space-y-16">
				{/* Header */}
				<div className="text-center space-y-6">
					<h1 className="heading-1 text-tertiary-500">Contact Us</h1>
					<p className="body-1 text-tertiary-300 max-w-3xl mx-auto">
                    Have questions about BINGO World Tour? Want to bring our game to
                    your next event? We&apos;d love to hear from you!
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
					{/* Contact Form */}
					<div className="space-y-8">
						<Card>
							<CardHeader>
								<CardTitle className="heading-3 text-tertiary-500">
									Send us a Message
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								<form className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<label
												htmlFor="firstName"
												className="body-2 text-tertiary-500"
											>
												First Name
											</label>
											<Input id="firstName" placeholder="John" />
										</div>
										<div className="space-y-2">
											<label
												htmlFor="lastName"
												className="body-2 text-tertiary-500"
											>
												Last Name
											</label>
											<Input id="lastName" placeholder="Doe" />
										</div>
									</div>

									<div className="space-y-2">
										<label htmlFor="email" className="body-2 text-tertiary-500">
											Email
										</label>
										<Input
											id="email"
											type="email"
											placeholder="john@example.com"
										/>
									</div>

									<div className="space-y-2">
										<label
											htmlFor="subject"
											className="body-2 text-tertiary-500"
										>
											Subject
										</label>
										<Input id="subject" placeholder="How can we help?" />
									</div>

									<div className="space-y-2">
										<label
											htmlFor="message"
											className="body-2 text-tertiary-500"
										>
											Message
										</label>
										<Textarea
											id="message"
											placeholder="Tell us more about your inquiry..."
											rows={6}
										/>
									</div>

									<Button variant="primary" className="w-full">
										Send Message
									</Button>
								</form>
							</CardContent>
						</Card>
					</div>

					{/* Contact Information */}
					<div className="space-y-8">
						<div className="space-y-6">
							<h2 className="heading-2 text-tertiary-500">Get in Touch</h2>
							<p className="body-1 text-tertiary-300">
                                Whether you&apos;re interested in hosting BINGO World Tour at your
                                event, have technical questions, or want to learn more about our
                                travel services, we&apos;re here to help.
							</p>
						</div>

						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle className="heading-4 text-tertiary-500">
										Email Us
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-center gap-4">
										<div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
											<svg
												width="24"
												height="24"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												className="text-primary-500"
											>
												<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
												<polyline points="22,6 12,13 2,6" />
											</svg>
										</div>
										<div>
											<p className="body-2 text-tertiary-500">
												General Inquiries
											</p>
											<p className="body-1 text-tertiary-300">
												info@sunsetleisuretravel.com
											</p>
										</div>
									</div>
									<div className="flex items-center gap-4">
										<div className="w-12 h-12 bg-accent-sage rounded-full flex items-center justify-center">
											<svg
												width="24"
												height="24"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												className="text-white"
											>
												<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
												<circle cx="12" cy="10" r="3" />
											</svg>
										</div>
										<div>
											<p className="body-2 text-tertiary-500">Event Bookings</p>
											<p className="body-1 text-tertiary-300">
												events@sunsetleisuretravel.com
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="heading-4 text-tertiary-500">
										Call Us
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex items-center gap-4">
										<div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center">
											<svg
												width="24"
												height="24"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												className="text-secondary-500"
											>
												<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
											</svg>
										</div>
										<div>
											<p className="body-2 text-tertiary-500">Main Office</p>
											<p className="body-1 text-tertiary-300">1-800-555-0123</p>
											<p className="body-2 text-tertiary-400">
												Mon-Fri 9AM-6PM EST
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="heading-4 text-tertiary-500">
										Visit Us
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex items-center gap-4">
										<div className="w-12 h-12 bg-accent-soft-coral rounded-full flex items-center justify-center">
											<svg
												width="24"
												height="24"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												className="text-white"
											>
												<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
												<circle cx="12" cy="10" r="3" />
											</svg>
										</div>
										<div>
											<p className="body-2 text-tertiary-500">
												Sunset Leisure Travel
											</p>
											<p className="body-1 text-tertiary-300">123 Travel Way</p>
											<p className="body-1 text-tertiary-300">
												Orlando, FL 32801
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

</div>
				</div>
			</div>
		</div>
	);
};

export default Contact;
