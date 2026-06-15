import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingCallButton from "@/components/FloatingCallButton";

export const metadata: Metadata = {
  title: "Olive Prayer House | House of Prayer for All Nations",
  description: "Welcome to Olive Prayer House in Hyderabad. Join us for weekly programs, worship services, and prayer meetings. Call us directly at +91 92468 87888.",
  keywords: "Olive Prayer House, Church, Hyderabad Church, Prayer House, Worship, Chapel Road Church",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main style={{ flex: 1, paddingTop: "80px" }}>{children}</main>
        <Footer />
        <FloatingCallButton />
      </body>
    </html>
  );
}
