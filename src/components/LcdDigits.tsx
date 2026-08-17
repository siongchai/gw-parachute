"use client";

type Props = {
  value: number;
  digits?: number;
  tone?: "dark" | "red";
  size?: number;
};

/** Renders a number using the extracted seven-segment sprites. */
export function LcdDigits({ value, digits = 3, tone = "dark", size }: Props) {
  const text = String(Math.max(0, Math.min(999, value))).padStart(digits, "0");
  return (
    <span
      className={`lcd-digits ${tone}`}
      style={size != null ? { ["--lcd-digit-h" as string]: `${size}px` } : undefined}
    >
      {text.split("").map((ch, i) => (
        <span
          key={i}
          className="lcd-digit"
          style={{
            maskImage: `url(/sprites/digits/digit_${ch}.png)`,
            WebkitMaskImage: `url(/sprites/digits/digit_${ch}.png)`,
          }}
        />
      ))}
    </span>
  );
}
