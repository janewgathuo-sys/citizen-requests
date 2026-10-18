"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  // form values
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // false = login form, true = register form
  const [showRegister, setShowRegister] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (showRegister) {
      // create a new account
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: { data: { full_name: name } },
      });
      if (error) {
        setMessage(error.message);
        return;
      }
    } else {
      // login to an existing account
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) {
        setMessage(error.message);
        return;
      }
    }

    // go to the dashboard after success
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-80">
        <h1 className="text-xl font-bold mb-4 text-center">
          {showRegister ? "Register" : "Login"}
        </h1>

        {showRegister && (
          <input
            className="border w-full p-2 mb-3"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}

        <input
          className="border w-full p-2 mb-3"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="border w-full p-2 mb-3"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {message && <p className="text-red-600 text-sm mb-3">{message}</p>}

        <button className="bg-blue-600 text-white w-full p-2 rounded">
          {showRegister ? "Register" : "Login"}
        </button>

        <p className="text-sm mt-3 text-center">
          {showRegister ? "Already have an account? " : "No account? "}
          <span
            className="text-blue-600 cursor-pointer underline"
            onClick={() => setShowRegister(!showRegister)}
          >
            {showRegister ? "Login" : "Register"}
          </span>
        </p>
      </form>
    </div>
  );
}