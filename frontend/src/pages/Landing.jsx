import React from 'react';
import { Mail, CheckCircle, ShieldCheck } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import ReCAPTCHA from "react-google-recaptcha";
import logo from "../../public/Serachi_logo-nobg.png"

export default function LandingPage() {
    const handleSubmit = (e) => {
        e.preventDefault();
        // Implement form submit + bot check
    };

    return (
        <div className="bg-[#18394C] text-slate-100 font-sans">
            {/* Navbar */}
            <header className="fixed w-full top-0 z-50 flex justify-between items-center px-6 py-4 bg-[#18394C] shadow-md">
                <img src={logo} alt="Serachi Logo" className="h-25" />
                <div>
                    <button className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-6 py-2 rounded-lg font-semibold">
                        Contact Us
                    </button>
                    <button className="bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 px-6 py-2 rounded-lg font-semibold ml-5">
                        Login
                    </button>
                </div>
            </header>

            {/* Hero */}
            <section className="pt-28 pb-16 text-center bg-[#18394C] mt-10">
                <h1 className="text-4xl md:text-5xl font-bold text-[#00C49F] mb-6">
                    Manage your Dive Center with Ease
                </h1>
                <p className="text-lg text-slate-200 mb-8 max-w-xl mx-auto">
                    From quotes to payments and staff commissions, Serachi.net streamlines your entire operation.
                </p>

                <div className="max-w-3xl mx-auto">
                    <Swiper loop autoplay={{ delay: 3000 }}>
                        <SwiperSlide>
                            <img src="/slider/quote-system.png" alt="Quote System" className="rounded-lg shadow-lg" />
                        </SwiperSlide>
                        <SwiperSlide>
                            <img src="/slider/scheduler.png" alt="Booking Calendar" className="rounded-lg shadow-lg" />
                        </SwiperSlide>
                        <SwiperSlide>
                            <img src="/slider/commissions.png" alt="Staff Commissions" className="rounded-lg shadow-lg" />
                        </SwiperSlide>
                    </Swiper>
                </div>
            </section>

            {/* Benefits */}
            <section className="bg-[#EEF9FC] text-slate-800 py-16 px-6 ">
                <h2 className="text-3xl font-bold text-center text-[#00C49F] mb-10">Why Choose Serachi?</h2>
                <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto text-center">
                    <div className='flex flex-col items-center'>
                        <ShieldCheck className="text-[#118290] mb-2" size={50} />
                        <h3 className="font-semibold text-lg mb-1">Centralized Control</h3>
                        <p>Manage bookings, products, staff and facilities from a single platform.</p>
                    </div>
                    <div className='flex flex-col items-center'>
                        <CheckCircle className="text-[#118290] mb-2" size={50} />
                        <h3 className="font-semibold text-lg mb-1">Smart Pricing & Commissions</h3>
                        <p>Automate payments and define custom commission rules for your team.</p>
                    </div>
                    <div className='flex flex-col items-center'>
                        <Mail className="text-[#118290] mb-2" size={50} />
                        <h3 className="font-semibold text-lg mb-1">Quotes & Communication</h3>
                        <p>Create, send and track quotes easily. Manage customer relations effortlessly.</p>
                    </div>
                </div>
            </section>

            {/* Pricing Plans */}
            <section className="bg-[#18394C] py-16 px-6 text-center text-slate-100">
                <h2 className="text-3xl font-bold text-[#00C49F] mb-10">Choose Your Plan</h2>
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Basic Plan */}
                    <div className="bg-white border border-slate-300 text-slate-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold mb-2">Starter</h3>
                        <p className="text-slate-600 mb-4">Perfect for small dive shops</p>
                        <ul className="text-left mb-4">
                            <li>✓ Quotes & Bookings</li>
                            <li>✓ Product Management</li>
                            <li>✓ Email Support</li>
                        </ul>
                        <button className="w-full py-3 bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 font-bold rounded-lg shadow-lg">
                            Try Now
                        </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-white border border-slate-300 text-slate-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold mb-2">Professional</h3>
                        <p className="text-slate-600 mb-4">Most Popular</p>
                        <ul className="text-left mb-4">
                            <li>✓ Everything in Starter</li>
                            <li>✓ Staff Commissions</li>
                            <li>✓ Calendar Scheduling</li>
                            <li>✓ Custom Branding</li>
                        </ul>
                        <button className="w-full py-3 bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 font-bold rounded-lg shadow-lg">
                            Get Started
                        </button>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="bg-white border border-slate-300 text-slate-800 p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                        <p className="text-slate-600 mb-4">For multi-center operations</p>
                        <ul className="text-left mb-4">
                            <li>✓ Everything in Pro</li>
                            <li>✓ Multi-location Support</li>
                            <li>✓ Dedicated Manager</li>
                            <li>✓ API Access</li>
                        </ul>
                        <button className="w-full py-3 bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 font-bold rounded-lg shadow-lg">
                            Contact Us
                        </button>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="bg-[#EEF9FC] text-slate-800 py-16 px-6" id="contact">
                <h2 className="text-3xl font-bold text-center text-[#00C49F] mb-10">Get in Touch</h2>
                <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md space-y-4">
                    <input className="w-full p-3 border border-slate-300 rounded" placeholder="Name" required />
                    <input type="email" className="w-full p-3 border border-slate-300 rounded" placeholder="Email" required />
                    <textarea className="w-full p-3 border border-slate-300 rounded" placeholder="Message" rows={5} required />
                    <ReCAPTCHA sitekey="6LeEyX8rAAAAAKO_IB05hrtyDspH-Ghq7z9l1ols" />
                    <button type="submit" className="w-full py-3 bg-[#118290] hover:bg-[#0d6c77] text-cyan-50 font-bold rounded-lg shadow-lg">
                        Send Message
                    </button>
                </form>
            </section>

            {/* Footer */}
            <footer className="bg-[#18394C] text-slate-400 text-center py-6">
                © {new Date().getFullYear()} Serachi.net. All rights reserved.
            </footer>
        </div>
    );
}