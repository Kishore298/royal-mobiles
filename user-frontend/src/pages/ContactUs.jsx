import React from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

const ContactUs = () => {
    const contactCards = [
        {
            icon: Phone,
            title: "Call Us",
            phones: [
                { label: "+91 63691 22194", action: "tel:+916369122194" },
                { label: "+91 95977 69280", action: "tel:+919597769280" }
            ],
            subContent: "Mon-Sun, 9:30 AM - 9:30 PM",
            color: "from-blue-500 to-cyan-400"
        },
        {
            icon: MessageCircle,
            title: "WhatsApp – Sales",
            content: "Primary Contact",
            subContent: "Product queries & orders",
            color: "from-green-500 to-emerald-400",
            action: "https://wa.me/message/P2SPE6NDBC7XL1"
        },
        {
            icon: MessageCircle,
            title: "WhatsApp – Support",
            content: "Support Team",
            subContent: "Support & service queries",
            color: "from-green-500 to-emerald-400",
            action: "https://wa.me/qr/ENORAMAPD4VFL1"
        },
        {
            icon: Mail,
            title: "Email Us",
            content: "royalmobiles1994@gmail.com",
            subContent: "We reply within 24 hours",
            color: "from-purple-500 to-pink-400",
            action: "mailto:royalmobiles1994@gmail.com"
        },
        {
            icon: Clock,
            title: "Working Hours",
            content: "9:30 AM - 5:30 PM",
            subContent: "Open all days. May differ on holidays",
            color: "from-indigo-500 to-purple-400",
            action: null
        }
    ];

    return (
        <div className="py-4 lg:py-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-teal-500 bg-clip-text text-transparent mb-6">
                        Get in Touch
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        We're here to help you with any questions about our products or services. Reach out to us through any of the channels below.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {contactCards.map((card, index) => (
                        <a
                            href={card.action}
                            key={index}
                            target={card.action && card.action.startsWith('http') ? "_blank" : "_self"}
                            rel={card.action && card.action.startsWith('http') ? "noopener noreferrer" : ""}
                            className={`relative group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden ${!card.action ? 'cursor-default' : 'cursor-pointer'
                                }`}
                        >
                            {/* Gradient Background Effect on Hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${card.color} flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                    <card.icon className="w-8 h-8 text-white" />
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800">
                                    {card.title}
                                </h3>

                                <p className="text-lg font-semibold text-gray-800 mb-1">
                                    {card.content}
                                </p>

                                <p className="text-sm text-gray-500">
                                    {card.subContent}
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
