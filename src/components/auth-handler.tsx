"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import posthog from "posthog-js";

export function AuthHandler() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user?.email) {
        posthog.identify(session.user.email, { email: session.user.email });
      }
      if (event === "SIGNED_OUT") {
        posthog.reset();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
