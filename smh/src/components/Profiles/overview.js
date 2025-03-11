'use client';

import { useState } from 'react';
import { FaArrowRight } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";
import Link from 'next/link';


const ProfilesOverview = () => {
  const [isClient, setIsClient] = useState(true); // Track which container is shown, true = Client, false = Preserver

  const handleToggle = () => {
    setIsClient((prev) => !prev); // Toggle between Client and Preserver
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="w-full max-w-4xl px-4 py-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-semibold text-gray-900">Profiles Overview</h2>
          <p className="text-lg text-gray-700 mt-4">
            There are two types of options at Records to Remember: Client and Preserver. Choose the one that suits your needs best.
          </p>
        </div>

        {/* Sliding Containers */}
        <div className="relative overflow-hidden w-full h-[500px]">
          <div
            className={`flex transition-transform duration-500 ease-in-out transform ${
              isClient ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Client Container */}
            <div className="flex-shrink-0 w-full h-full flex flex-col items-center justify-center bg-gray-100 p-8 rounded-xl shadow-2xl">
              <h3 className="text-7xl font-bold text-gray-900">Client</h3>
              <h3 className="text-4xl font-bold text-blue-800">Benefits:</h3>

              <ul className="mt-10 list-disc pl-6 text-left space-y-2 text-gray-800">
                <li>Access to a wide pool of preservers with specialized expertise.</li>
                <li>Easy to track progress on your preservation projects.</li>
                <li>Dedicated support and assistance from our team.</li>
                <li>Manage your preservation tasks seamlessly through the dashboard.</li>
              </ul>
              {/* Arrow for Client to Preserver */}
              <div className="grid">
                <button
                  onClick={handleToggle} // Toggle the state
                  className="py-10 text-5xl text-blue-800 hover:text-blue-600 focus:outline-none  transform translate-x-1/2"
                >
                 <FaArrowRight />

                </button>
                <Link href="/new-client" className="text-4xl text-gray-900 hover:text-blue-900 transform translate-x-1/8">
                    Sign up today
                </Link>
              </div>
            </div>

            {/* Preserver Container */}
            <div className="flex-shrink-0 w-full h-full flex flex-col items-center justify-center bg-gray-100 p-8 rounded-xl shadow-2xl">
            <h3 className="text-7xl font-bold text-gray-900">Preserver</h3>
            <h3 className="text-4xl font-bold text-blue-800">Benefits:</h3>
              <ul className="mt-6 list-disc pl-6 text-left space-y-2 text-gray-800">
                <li>Help preserve valuable records and memories for clients.</li>
                <li>Earn income while making a real impact in the preservation industry.</li>
                <li>Access to flexible working hours and job opportunities.</li>
                <li>Build a reputation through client reviews and ratings.</li>
              </ul>
              {/* Arrow for Preserver to Client */}
              <div className="grid">
                <button
                  onClick={handleToggle} // Toggle the state
                  className="text-5xl text-blue-800 hover:text-blue-600 focus:outline-none"
                >
               <FaArrowLeft />

                </button>
                <Link href="/new-preserver-application" className="text-4xl text-gray-900 hover:text-blue-900 transform translate-x-1/8">
                    Become a Preserver
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilesOverview;
