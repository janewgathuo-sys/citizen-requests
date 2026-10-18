"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default function AdminPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    // check who is logged in
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      router.push("/login");
      return;
    }

    // only admins can open this page
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (!profile || profile.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    // get all requests
    const { data: list } = await supabase
      .from("requests")
      .select("*")
      .order("created_at", { ascending: false });
    setRequests(list || []);
  }

  async function changeStatus(id, newStatus) {
    setMessage("");
    const { error } = await supabase
      .from("requests")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    // update the list on the screen
    const updated = requests.map((r) => {
      if (r.id === id) {
        return { ...r, status: newStatus };
      }
      return r;
    });
    setRequests(updated);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  // counts for the analytics cards
  const pending = requests.filter((r) => r.status === "Pending").length;
  const inProgress = requests.filter((r) => r.status === "In Progress").length;
  const resolved = requests.filter((r) => r.status === "Resolved").length;
  const open = pending + inProgress;

  // apply the filters
  const shown = requests.filter((r) => {
    if (statusFilter !== "All" && r.status !== statusFilter) return false;
    if (categoryFilter !== "All" && r.category !== categoryFilter) return false;
    return true;
  });

  function statusColor(status) {
    if (status === "Resolved") return "bg-green-200 text-green-800";
    if (status === "In Progress") return "bg-yellow-200 text-yellow-800";
    return "bg-gray-200 text-gray-800";
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-3">
            <Link href="/dashboard" className="bg-gray-300 px-4 py-2 rounded">
              My Requests
            </Link>
            <button onClick={logout} className="bg-gray-800 text-white px-4 py-2 rounded">
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm">Total</p>
            <p className="text-2xl font-bold">{requests.length}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm">Open</p>
            <p className="text-2xl font-bold text-yellow-700">{open}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm">In Progress</p>
            <p className="text-2xl font-bold text-blue-700">{inProgress}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm">Resolved</p>
            <p className="text-2xl font-bold text-green-700">{resolved}</p>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <select
            className="border p-2 bg-white text-gray-800"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>

          <select
            className="border p-2 bg-white text-gray-800"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option>All</option>
            <option>Streetlight</option>
            <option>Water issue</option>
            <option>Garbage collection</option>
            <option>Other</option>
          </select>
        </div>

        {message && <p className="text-red-600 text-sm mb-3">{message}</p>}

        {shown.length === 0 && (
          <p className="bg-white p-4 rounded shadow">No requests found.</p>
        )}

        {shown.map((r) => (
          <div key={r.id} className="bg-white p-4 rounded shadow mb-3">
            <div className="flex justify-between items-center">
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
            <div className="mt-3 flex items-center gap-2">
              <label className="text-sm">Change status:</label>
              <select
                className="border p-1 bg-white text-gray-800"
                value={r.status}
                onChange={(e) => changeStatus(r.id, e.target.value)}
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}