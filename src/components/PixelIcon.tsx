"use client";

type Props = {
  name:
    | "parachute"
    | "trophy"
    | "sound-on"
    | "sound-off"
    | "arrows"
    | "catch"
    | "shark"
    | "misses";
  className?: string;
};

/** Small inline pixel illustrations used by the cream UI panels. */
export function PixelIcon({ name, className }: Props) {
  const common = {
    className,
    viewBox: "0 0 16 16",
    shapeRendering: "crispEdges" as const,
    fill: "currentColor",
    "aria-hidden": true,
  };

  switch (name) {
    case "parachute":
      return (
        <svg {...common}>
          <path d="M3 6h10v1H3zM2 7h2v1H2zM12 7h2v1h-2zM4 5h8v1H4zM6 4h4v1H6zM5 8h1v2H5zM10 8h1v2h-1zM7 9h2v1H7zM7 10h2v3H7zM6 13h1v2H6zM9 13h1v2H9zM5 11h2v1H5zM9 11h2v1H9z" />
        </svg>
      );
    case "trophy":
      return (
        <svg {...common}>
          <path d="M4 2h8v5H4zM2 3h2v3H2zM12 3h2v3h-2zM7 7h2v4H7zM4 11h8v2H4zM3 13h10v2H3z" />
        </svg>
      );
    case "sound-on":
      return (
        <svg {...common}>
          <path d="M3 6h2v4H3zM5 5h2v6H5zM7 3h2v10H7zM11 5h1v6h-1zM13 3h1v10h-1z" />
        </svg>
      );
    case "sound-off":
      return (
        <svg {...common}>
          <path d="M3 6h2v4H3zM5 5h2v6H5zM7 3h2v10H7zM11 5h1v1h-1zM12 6h1v1h-1zM13 7h1v1h-1zM14 5h1v1h-1zM11 9h1v1h-1zM12 8h1v1h-1zM14 9h1v1h-1z" />
        </svg>
      );
    case "arrows":
      return (
        <svg {...common}>
          <path d="M5 8h1v1H5zM4 7h1v3H4zM3 6h1v5H3zM10 8h1v1h-1zM11 7h1v3h-1zM12 6h1v5h-1z" />
        </svg>
      );
    case "catch":
      return (
        <svg {...common}>
          <path d="M6 1h4v1H6zM5 2h6v1H5zM7 3h2v2H7zM6 5h4v2H6zM2 9h12v2H2zM4 11h8v1H4zM3 8h1v1H3zM12 8h1v1h-1z" />
        </svg>
      );
    case "shark":
      return (
        <svg {...common}>
          <path d="M7 3h2v2H7zM6 5h4v2H6zM5 7h6v2H5zM1 10h14v2H1zM3 12h10v1H3z" />
        </svg>
      );
    case "misses":
      return (
        <svg {...common}>
          <path d="M1 4h4v1H1zM2 5h2v3H2zM2 8h1v3H2zM6 4h4v1H6zM7 5h2v3H7zM7 8h1v3H7zM11 4h4v1h-4zM12 5h2v3h-2zM12 8h1v3h-1z" />
        </svg>
      );
  }
}
