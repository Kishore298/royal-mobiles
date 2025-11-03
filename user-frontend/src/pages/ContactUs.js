import React from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Contact Us
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            We're here to help and answer any questions you might have.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <FaPhone className="text-3xl text-blue-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Phone</h3>
            <p className="mt-2 text-gray-600">+1 (555) 123-4567</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <FaEnvelope className="text-3xl text-blue-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Email</h3>
            <p className="mt-2 text-gray-600">support@royalmobiles.com</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <FaMapMarkerAlt className="text-3xl text-blue-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Address</h3>
            <p className="mt-2 text-gray-600">
              123 Mobile Street, Tech City, TC 12345
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <FaClock className="text-3xl text-blue-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Working Hours</h3>
            <p className="mt-2 text-gray-600">
              Monday - Friday: 9:00 AM - 6:00 PM
              <br />
              Saturday: 10:00 AM - 4:00 PM
              <br />
              Sunday: Closed
            </p>
          </div>
        </div>

        <div className="mt-12 bg-white p-8 rounded-lg shadow-md">
          <h3 className="text-xl font-medium text-gray-900 mb-6">
            Send us a Message
          </h3>
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs; 