"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabseClient";
import { User } from "@supabase/supabase-js";
import Header from "../components/header/header";
import toast from "react-toastify";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [formError, setFormError] = useState("");

  const [bookmarks, setBookMarks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/";
        return;
      }

      setUser(session.user);

      const { data } = await supabase
        .from("bookmarks")
        .select("*")
        .order("created_at", { ascending: false });

      setBookMarks(data || []);

      const channel = supabase
        .channel("bookmarks-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookmarks",
            filter: `user_id=eq.${session.user.id}`,
          },
          (payload) => {
            console.log("🔥 EVENT:", payload);

            if (payload.eventType === "INSERT") {
              setBookMarks((prev) => {
                const exists = prev.find((b) => b.id === payload.new.id);
                if (exists) return prev;
                return [payload.new as any, ...prev];
              });
            }

            if (payload.eventType === "DELETE") {
              setBookMarks((prev) =>
                prev.filter((b) => b.id !== payload.old.id),
              );
            }
          },
        )
        .subscribe((status) => {
          console.log("STATUS", status);
        });
    };

    init();
  }, []);

  if (!user) return <div className="p-10">Loading...</div>;
  const addBookmark = async () => {
    const trimmedTitle = title.trim();
    const trimmedUrl = url.trim();

    // Prevent empty or whitespace-only
    if (!trimmedTitle || !trimmedUrl) {
      setFormError("Title and URL are required.");
      return;
    }

    const urlPattern = /^(https?:\/\/)/i;
    if (!urlPattern.test(trimmedUrl)) {
      setFormError("URL must start with http:// or https://");
      return;
    }

    const { error } = await supabase
      .from("bookmarks")
      .insert([
        {
          title: trimmedTitle,
          url: trimmedUrl,
          user_id: user.id,
        },
      ])
      .select();
    if (error) {
      console.error("Insert error", error);
      return;
    }

    setTitle("");
    setUrl("");
  };
  const deleteBookmark = async (id: string) => {
    const { data, error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id);

    console.log(data, "DATA OF DELETING BOOKMARK");
    console.log(error, "ERROR OF DELETING BOOKMARK");
    if (!error) {
      setBookMarks((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const isValid = title.trim().length > 0 && url.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Header user={user} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-800">
            Welcome back, {user.user_metadata.full_name}
          </h2>
          <p className="text-slate-500 mt-2">
            Organize and manage your bookmarks in real time.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-10 transition hover:shadow-md">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Bookmark title"
              onBlur={(e) => setUrl(e.target.value.trim())}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition"
            />

            <input
              type="text"
              placeholder="https://example.com"
              value={url}
              onBlur={(e) => setTitle(e.target.value.trim())}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition"
            />

            <button
              onClick={addBookmark}
              disabled={!isValid}
              className={`px-6 py-3 rounded-xl font-medium transition active:scale-95
    ${
      isValid
        ? "bg-black text-white hover:bg-slate-800"
        : "bg-slate-300 text-slate-500 cursor-not-allowed"
    }`}
            >
              Add
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {bookmarks.length === 0 && (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center text-slate-500">
              No bookmarks yet. Add your first one
            </div>
          )}

          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold text-slate-800">
                  {bookmark.title}
                </h3>
                <a
                  href={bookmark.url}
                  target="_blank"
                  className="text-sm text-slate-500 hover:text-black transition"
                >
                  {bookmark.url}
                </a>
              </div>

              <button
                onClick={() => deleteBookmark(bookmark.id)}
                className="opacity-100 cursor-pointer group-hover:opacity-100 text-sm font-medium text-red-500 hover:text-red-600 transition"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
