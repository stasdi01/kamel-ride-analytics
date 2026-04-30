import type { Metadata } from "next";
import { DM_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "Kamel Ride — Analytics Dashboard",
  description: "Marketplace health metrics for the Kamel Ride carpooling platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmMono.variable} ${plusJakarta.variable}`}>
      <body className="font-sans antialiased" style={{ backgroundColor: "#0F0F0F" }}>
        {children}
      </body>
    </html>
  );
}
