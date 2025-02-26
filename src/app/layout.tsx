import type { Metadata } from "next";
import localFont from "next/font/local";
import { Fondamento } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const fontHeading = Fondamento({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${fontHeading.variable} antialiased font-sans bg-backgroundd`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
