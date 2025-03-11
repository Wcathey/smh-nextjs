'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SignupPreserver = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone_number: '',
    username: '',
    experience: '',
    reason: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      email: formData.email,
      password: formData.password,
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone_number: formData.phone_number,
      username: formData.username,
      user_type: 'preserver',
    };

    // First, create the user account
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (res.ok) {
      console.log('User created successfully', data);

      // After user is created, now create the application for the preserver
      const applicationData = {
        reason: formData.reason,
        experience: formData.experience,
      };

      const appRes = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData),
      });

      const appData = await appRes.json();

      if (appRes.ok) {
        console.log('Application submitted successfully', appData);
        router.push('/dashboard');
      } else {
        setError(appData.error);
      }
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg space-y-8 rounded-xl bg-white p-8 shadow-lg">
        <h2 className="text-center text-3xl font-semibold text-gray-900">Become a Preserver</h2>
        <p className="text-center text-sm text-gray-800">
          Complete the application by filling in your contact information.
        </p>

        {error && <p className="text-center text-sm text-red-600">{error}</p>}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Personal Information</h3>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 p-3"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 p-3"
            />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone_number}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 p-3"
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 p-3"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 p-3"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 p-3"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Application Questions</h3>
            <textarea
              name="reason"
              placeholder="Why do you want to be a preserver?"
              value={formData.reason}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 p-3"
              rows={3}
            />
            <input
              type="text"
              name="experience"
              placeholder="Experience (Optional)"
              value={formData.experience}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 p-3"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-2 text-white transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPreserver;
