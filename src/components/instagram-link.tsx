import { Instagram } from "lucide-react";

export const INSTAGRAM_URL = "https://www.instagram.com/associacaoamigosdochapim";

export function InstagramLink({ className = "" }: { className?: string }) {
  return (
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors ${className}`}
    >
      <Instagram className="h-4 w-4" aria-hidden="true" />
      <span>Instagram</span>
    </a>
  );
}
