"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

export default function NewRequest() {
  const router = useRouter();
  const [category, setCategory] = useState("Streetlight");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    // check who is logged in
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      router.push("/login");
      return;
    }

    // upload the image if one was chosen
    let imageUrl = null;
    if (image) {
      const cleanName = image.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const path = user.id + "/" + Date.now() + "-" + cleanName;

      const { error: uploadError } = await supabase.storage
        .from("request-images")
        .upload(path, image);

      if (uploadError) {
        setMessage(uploadError.message);
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("request-images")
        .getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    // save the request
    const { error } = await supabase.from("requests").insert({
      user_id: user.id,
      category: category,
      location: location,
      description: description,
      image_url: imageUrl,
    });

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6">
      <form onSubmit={handleSubmit} className="bg-white max-w-lg mx-auto p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-4">New Service Request</h1>

        <label className="block mb-1">Category</label>
        <select
          className="border w-full p-2 mb-3 bg-white text-gray-800"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option>Streetlight</option>
          <option>Water issue</option>
          <option>Garbage collection</option>
          <option>Other</option>
        </select>

        <label className="block mb-1">Location</label>
        <input
          className="border w-full p-2 mb-3 bg-white text-gray-800"
          placeholder="e.g. Murang'a town, near the market"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <label className="block mb-1">Description</label>
        <textarea
          className="border w-full p-2 mb-3 bg-white text-gray-800"
          rows={4}
          placeholder="Describe the problem"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <label className="block mb-1">Image (optional)</label>
        <input
          className="mb-3"
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

        {message && <p className="text-red-600 text-sm mb-3">{message}</p>}

        <div className="flex gap-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            {saving ? "Saving..." : "Submit Request"}
          </button>
          <Link href="/dashboard" className="bg-gray-300 px-4 py-2 rounded">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}