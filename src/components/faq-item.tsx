"use client";

import { useState } from "react";

interface FAQItemProps {
  question: string;
  children: React.ReactNode;
}

export function FAQItem({ question, children }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-start gap-3 cursor-pointer py-3 text-lg md:text-xl font-semibold text-left w-full"
      >
        <svg
          className={`w-4 h-4 md:w-5 md:h-5 mt-1.5 transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-90" : ""}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
        {question}
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="pl-6 md:pl-8 pb-4 text-sm md:text-base text-foreground/80">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
