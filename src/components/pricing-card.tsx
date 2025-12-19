"use client";

interface PricingCardProps {
  tier: "APOIANTE" | "AMIGO";
  name: string;
  price: string;
  description?: string;
  features?: string[];
  highlighted?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

export function PricingCard({
  tier,
  name,
  price,
  description,
  features,
  highlighted = false,
  selected = false,
  onSelect,
}: PricingCardProps) {
  return (
    <div
      className={`${
        selected
          ? "border-2 border-primary ring-2 ring-primary/20"
          : highlighted
          ? "border-2 border-primary"
          : "border border-border"
      } p-6 md:p-8 rounded-sm relative flex flex-col transition-all`}
    >
      {selected && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
          Selecionado
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl md:text-2xl font-semibold mb-2">{name}</h3>
        <div className="text-2xl md:text-3xl font-semibold">
          {price}{" "}
          <span className="text-base md:text-lg font-normal text-foreground/60">
            / mês
          </span>
        </div>
      </div>

      {description && (
        <p className="text-sm md:text-base text-foreground/80 mb-4">
          {description}
        </p>
      )}

      {features && features.length > 0 && (
        <ul className="space-y-2 text-sm md:text-base text-foreground/80 mb-6">
          {features.map((feature, index) => (
            <li key={index}>• {feature}</li>
          ))}
        </ul>
      )}

      <button
        onClick={onSelect}
        className={`mt-auto w-full py-3 px-4 rounded-sm font-medium transition-all ${
          selected
            ? "bg-primary text-primary-foreground"
            : highlighted
            ? "bg-foreground text-background hover:opacity-90"
            : "border border-foreground hover:bg-foreground/5"
        }`}
      >
        {selected ? "Selecionado" : "Selecionar"}
      </button>
    </div>
  );
}
