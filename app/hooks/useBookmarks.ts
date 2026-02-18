"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "../lib/supabseBrowserClinet";
import { User } from "@supabase/supabase-js";
import { toast } from "react-toastify";

export function useBookmarks(user: User | null) {
   const [bookmarks, setBookmarks] = useState<any[]>([]);
   const [loading, setLoading] = useState(false);


   useEffect(() => {
      if (!user) return;

      let channel: any;

      const fetchBookmarks = async () => {
         const { data } = await supabaseBrowser
            .from("bookmarks")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

         setBookmarks(data || []);

         channel = supabaseBrowser
            .channel("bookmarks-realtime")
            .on(
               "postgres_changes",
               {
                  event: "*",
                  schema: "public",
                  table: "bookmarks",
                  filter: `user_id=eq.${user.id}`,
               },
               (payload) => {
                  if (payload.eventType === "INSERT") {
                     setBookmarks((prev) => [payload.new, ...prev]);
                  }

                  if (payload.eventType === "DELETE") {
                     setBookmarks((prev) =>
                        prev.filter((b) => b.id !== payload.old.id)
                     );
                  }
               }
            )
            .subscribe();
      };

      fetchBookmarks();

      return () => {
         if (channel) supabaseBrowser.removeChannel(channel);
      };
   }, [user]);

   //ading bookmark logic

   const addBookmark = async (title: string, url: string) => {
      setLoading(true);

      const toastId = toast.loading("Adding bookmark...");

      const { error } = await supabaseBrowser.from("bookmarks").insert({
         title,
         url,
         user_id: user?.id,
      });

      setLoading(false);

      if (error) {
         toast.update(toastId, {
            render: "Failed to add",
            type: "error",
            isLoading: false,
            autoClose: 2500,
         });
         return;
      }

      toast.update(toastId, {
         render: "Bookmark added",
         type: "success",
         isLoading: false,
         autoClose: 2500,
      });
   };

   // deleting bookmark logic
   const deleteBookmark = async (id: string) => {
      const toastId = toast.loading("Deleting...");

      const { error } = await supabaseBrowser
         .from("bookmarks")
         .delete()
         .eq("id", id);

      if (error) {
         toast.update(toastId, {
            render: "Failed to delete",
            type: "error",
            isLoading: false,
            autoClose: 2500,
         });
         return;
      }

      toast.update(toastId, {
         render: "Deleted",
         type: "success",
         isLoading: false,
         autoClose: 2500,
      });
   };

   return {
      bookmarks,
      loading,
      addBookmark,
      deleteBookmark,
   };
}
