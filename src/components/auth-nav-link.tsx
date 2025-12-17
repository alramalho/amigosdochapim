"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export function AuthNavLink({ className }: { className?: string }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setIsLoggedIn(!!session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Link href={isLoggedIn ? "/painel" : "/entrar"} className={className}>
      {isLoggedIn ? "Minha Conta" : "Entrar"}
    </Link>
  );
}
