import { createSupabaseServerClient } from "@/app/lib/supabaseServerClient";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
   const requestUrl = new URL(request.url);

   const code = requestUrl.searchParams.get("code");

   if (!code) {
      return NextResponse.redirect(`${requestUrl.origin}`);
   }

   const supabase = await createSupabaseServerClient();


   const { data, error } = await supabase.auth.exchangeCodeForSession(code);

   console.log("EXCHANGE RESULT:", data);
   console.log("EXCHANGE ERROR:", error);

   return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
