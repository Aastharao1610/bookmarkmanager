"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "../lib/supabseBrowserClinet";
import { User } from "@supabase/supabase-js";
import Header from "../components/header/header";
import { toast } from "react-toastify";
import { Copy, ExternalLink, Search } from "lucide-react";
import { useBookmarks } from "../hooks/useBookmarks";

function normalizeUrl(url: string) {
  try {
    url = url.trim();

    if (!url) return "";

    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    const normalized = new URL(url);

    return normalized.href.replace(/\/$/, "").toLowerCase();
  } catch {
    return "";
  }
}

function getDisplayUrl(url: string) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [search, setSearch] = useState("");

  const { bookmarks, loading, addBookmark, deleteBookmark } = useBookmarks(user);


  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabaseBrowser.auth.getSession();

      if (!session) {
        window.location.href = "/";
        return;
      }

      setUser(session.user);
    };

    init();
  }, []);

  const handleAdd = () => {
    const trimmedTitle = title.trim();
    const trimmedUrl = normalizeUrl(url.trim());

    if (!trimmedTitle || !trimmedUrl) return;

    addBookmark(trimmedTitle, trimmedUrl);
    setTitle("");
    setUrl("");
  };




  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-400 text-lg">
          Loading your bookmarks...
        </div>
      </div>
    );
  }


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

        <div
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-10 transition hover:shadow-md"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAdd();
                }
              }}


              type="text"
              placeholder="Bookmark title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value.replace(/^\s+/, ""))
              }

              onBlur={(e) => setTitle(e.target.value.trim())}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition"
            />


            <input
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAdd();
                }
              }}


              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) =>
                setUrl(e.target.value.replace(/^\s+/, ""))
              }
              onBlur={(e) => setUrl(e.target.value.trim())}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition"
            />

            <button
              onClick={handleAdd}

              disabled={!isValid || loading}


              className={`px-6 py-3 rounded-xl cursor-pointer font-medium transition active:scale-95
    ${isValid
                  ? "bg-black text-white hover:bg-slate-800"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed"
                }`}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "Add"
              )}

            </button>
          </div>
        </div>
        <div className="mb-6 relative">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />

          <input
            type="text"
            placeholder="Search bookmarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-black"
          />
        </div>


        <div className="space-y-4">
          {!loading && bookmarks.length === 0 && (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center text-slate-500 text-xl text-semibold">
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔖</div>
                <p className="text-lg text-slate-500">No bookmarks yet</p>
              </div>
            </div>


          )}

          {/* {bookmarks.map((bookmark) => ( */}
          {bookmarks
            .filter((bookmark) =>
              bookmark.title.toLowerCase().includes(search.toLowerCase()) ||
              bookmark.url.toLowerCase().includes(search.toLowerCase())
            )
            .map((bookmark) => (
              <div
                key={bookmark.id}
                className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex justify-between items-center"
              >
                <div>

                  <div className="flex items-center gap-2">

                    <img
                      src={`https://www.google.com/s2/favicons?domain=${bookmark.url}&sz=32`}
                      className="w-5 h-5"
                      alt=""
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />


                    <h3 className="font-semibold">
                      {bookmark.title}
                    </h3>

                  </div>
                  <div className="flex gap-4">

                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-slate-500 hover:text-black transition"
                    >
                      {getDisplayUrl(bookmark.url)}
                    </a>
                    <button
                      onClick={() => window.open(bookmark.url, "_blank")}
                      className="text-slate-400 hover:text-black"
                    >
                      <ExternalLink size={14} />
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(bookmark.url);
                        toast.success("Copied to clipboard");
                      }}
                      className="flex cursor-pointer items-center gap-1 text-xs text-slate-500 hover:text-black"
                    >
                      <Copy size={14} />
                      {/* Copy */}
                    </button>


                  </div>

                  <p className="text-xs text-slate-400 font-bold mt-2">
                    Added {new Date(bookmark.created_at).toLocaleDateString()}
                  </p>
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
