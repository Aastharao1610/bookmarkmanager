import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(req: NextRequest) {
   const res = NextResponse.next();


   console.log("---- MIDDLEWARE RUNNING ----");
   console.log("PATH:", req.nextUrl.pathname);
   console.log("COOKIES:", req.cookies.getAll());

   const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
         cookies: {
            getAll() {
               return req.cookies.getAll();
            },
            setAll(cookiesToSet) {
               cookiesToSet.forEach(({ name, value, options }) =>
                  res.cookies.set(name, value, options)
               );
            },
         },
      }
   );

   const {
      data: { session },
   } = await supabase.auth.getSession();

   const path = req.nextUrl.pathname;

   /* protect dashboard */
   if (path.startsWith("/dashboard") && !session) {
      return NextResponse.redirect(new URL("/", req.url));
   }

   /* prevent logged in user from login page */
   if (path === "/" && session) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
   }

   return res;
}

export const config = {
   matcher: ["/dashboard/:path*", "/"],
};
