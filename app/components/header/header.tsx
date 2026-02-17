"use client";

import { User } from "@supabase/supabase-js";
import { supabase } from "@/app/lib/supabseClient";
import { useState, useRef, useEffect } from "react";

type HeaderProps = {
  user: User;
};

const Header = ({ user }: HeaderProps) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-semibold">
            B
          </div>
          <span className="text-lg font-semibold tracking-tight text-slate-800">
            Bookmark
          </span>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 transition"
          >
            <img
              src={user.user_metadata?.avatar_url}
              alt="avatar"
              className="w-9 h-9 rounded-full object-cover"
            />
            <div className="text-left cursor-pointer hidden sm:block">
              <p className="text-sm font-medium text-slate-800 leading-none">
                {user.user_metadata?.full_name || user.email}
              </p>
              <p className="text-xs text-slate-500 mt-1">{user.email}</p>
            </div>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-fadeIn">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-slate-50 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
