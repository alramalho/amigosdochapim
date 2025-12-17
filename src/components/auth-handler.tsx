"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function AuthHandler() {
  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth event:", event, session?.user?.email);

        if (event === "SIGNED_IN" && session) {
          if (!window.location.pathname.startsWith("/painel")) {
            window.location.href = "/painel";
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
