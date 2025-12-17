import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") || "/painel";

  if (token_hash && type) {
    const supabase = createServiceClient();

    const { error } = await supabase.auth.verifyOtp({
      type: type as "magiclink" | "email",
      token_hash,
    });

    if (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(
        new URL(`/erro?message=${encodeURIComponent(error.message)}`, request.url)
      );
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
