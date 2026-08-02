"use client";
import { useState } from "react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-lg font-medium">Create your account</h1>
        </div>

        <label className="text-sm text-gray-600 block mb-1">Full name</label>
        <input value={name} onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4 text-sm" placeholder="Krishna Yadav" />

        <label className="text-sm text-gray-600 block mb-1">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4 text-sm" placeholder="name@college.edu" />

        <label className="text-sm text-gray-600 block mb-1">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4 text-sm" />

        <label className="text-sm text-gray-600 block mb-1">Confirm password</label>
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-5 text-sm" />

        <button className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium">
          Create account
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <a href="/login" className="text-blue-600">Log in</a>
        </p>
      </div>
    </div>
  );
}