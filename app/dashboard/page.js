"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function Dashboard() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    // check who is logged in
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    // if nobody is logged in, go back to login
    if (!user) {
      router.push("/login");
      return;
    }

    // get the name and role of the user
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single();
    if (profile) {
      setName(profile.full_name);
      if (profile.role === "admin") {
        setIsAdmin(true);
      }
    }

    // get the requests (a citizen only sees their own)
    const { data: list } = await supabase
      .from("requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setRequests(list || []);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  // colour of the status label
  function statusColor(status) {
    if (status === "Resolved") return "bg-green-200 text-green-800";
    if (status === "In Progress") return "bg-yellow-200 text-yellow-800";
    return "bg-gray-200 text-gray-800";
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Welcome, {name}</h1>
          <div className="flex gap-3">
            {isAdmin && (
              <Link href="/admin" className="bg-purple-600 text-white px-4 py-2 rounded">
                Admin Dashboard
              </Link>
            )}
            <button onClick={logout} className="bg-gray-800 text-white px-4 py-2 rounded">
              Logout
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">My Requests</h2>
          <Link href="/dashboard/new" className="bg-blue-600 text-white px-4 py-2 rounded">
            New Request
          </Link>
        </div>

        {requests.length === 0 && (
          <p className="bg-white p-4 rounded shadow">You have not submitted any requests yet.</p>
        )}

        {requests.map((r) => (
          <div key={r.id} className="bg-white p-4 rounded shadow mb-3">
            <div className="flex justify-between">
              <h3 className="font-semibold">{r.category}</h3>
              <span className={"px-3 py-1 rounded text-sm " + statusColor(r.status)}>
                {r.status}
              </span>
            </div>
            <p className="text-sm mt-1">Location: {r.location}</p>
            <p className="text-sm text-gray-500">
              Submitted: {new Date(r.created_at).toLocaleDateString()}
            </p>
            <p className="mt-2">{r.description}</p>
            {r.image_url && (
              <img src={r.image_url} alt="request photo" className="mt-3 w-48 rounded" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}