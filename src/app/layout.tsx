import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/shared/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trinity Clothiers - Bespoke Custom Tailoring",
  description: "Luxury custom garments configured exactly to your specifications.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (window.self !== window.top || window.location.search.includes('embed=true')) {
                  document.documentElement.classList.add('embedded');
                }
              } catch (e) {
                console.error(e);
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <Header />
        {children}
      </body>
    </html>
  );
}
