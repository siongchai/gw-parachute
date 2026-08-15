import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Parachute Rescue",
  description: "Retro LCD parachute rescue arcade game — catch parachutists with your boat.",
  applicationName: "Parachute Rescue",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Parachute Rescue",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#3a2a1c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
