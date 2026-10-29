import React from 'react';
import { Phone, Mail, Clock, MessageCircle, MapPin, Sparkles } from 'lucide-react';

const ContactUs = () => {
  const contactCards = [
    {
      icon: Phone,
      title: 'Call Us Directly',
      content: '+91 63691 22194',
      phones: [
        { label: '+91 63691 22194', action: 'tel:+916369122194' },
        { label: '+91 95977 69280', action: 'tel:+919597769280' },
      ],
      subContent: 'Mon-Sun, 9:30 AM - 9:30 PM IST',
      gradient: 'from-emerald-500 to-green-600',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp – Sales',
      content: 'Primary Sales Line',
      subContent: 'Product inquiries & wholesale orders',
      gradient: 'from-green-500 to-emerald-500',
      action: 'https://wa.me/916369122194?text=Hi%20Royal%20Mobiles,%20I%20have%20an%20inquiry%20about%20your%20products',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp – Support',
      content: 'Technical Support',
      subContent: 'Order status, warranty & returns',
      gradient: 'from-teal-500 to-emerald-600',
      action: 'https://wa.me/919597769280?text=Hi%20Royal%20Mobiles,%20I%20need%20support%20with%20my%20order',
    },
    {
      icon: Mail,
      title: 'Email Support',
      content: 'royalmobiles1994@gmail.com',
      subContent: 'We respond within 24 business hours',
      gradient: 'from-blue-500 to-cyan-500',
      action: 'mailto:royalmobiles1994@gmail.com',
    },
    {
      icon: Clock,
      title: 'Store Working Hours',
      content: '9:30 AM - 9:30 PM',
      subContent: 'Open all 7 days for sales & service',
      gradient: 'from-purple-500 to-indigo-600',
      action: null,
    },
    {
      icon: MapPin,
      title: 'Store Location',
      content: 'Tamil Nadu, India',
      subContent: 'Sales & Service Headquarters',
      gradient: 'from-amber-500 to-orange-500',
      action: null,
    },
  ];

  return (
    <div className="space-y-8 sm:space-y-12 animate-fadeIn max-w-6xl mx-auto py-2">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-50 dark:bg-emerald-950/60 text-primary-700 dark:text-emerald-300 border border-primary-200 dark:border-emerald-800/40">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Customer First</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
          Get in Touch with Royal Mobiles
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          Need help choosing an accessory or tracking an order? Reach our team directly via phone, WhatsApp, or email.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {contactCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-[#121a15] border border-gray-200/80 dark:border-emerald-950/70 shadow-sm hover:shadow-md hover:border-primary-400/50 dark:hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${card.gradient} text-white shadow-md shadow-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {card.title}
                </h3>
                <p className="text-sm font-semibold text-primary-600 dark:text-emerald-400 mb-1">
                  {card.content}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {card.subContent}
                </p>
              </div>

              {card.phones ? (
                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-emerald-950/60 flex flex-col space-y-2">
                  {card.phones.map((p, pIdx) => (
                    <a
                      key={pIdx}
                      href={p.action}
                      className="inline-flex items-center justify-center py-2 px-3 rounded-xl text-xs font-bold bg-primary-50 dark:bg-emerald-950/60 text-primary-700 dark:text-emerald-300 hover:bg-primary-100 dark:hover:bg-emerald-900/40 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 mr-1.5" />
                      {p.label}
                    </a>
                  ))}
                </div>
              ) : card.action ? (
                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-emerald-950/60">
                  <a
                    href={card.action}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center py-2 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-sm transition-all active:scale-95"
                  >
                    Connect Now
                  </a>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContactUs;
