import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from './components/Header';
import Footer from './components/Footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "EPI-USE Employee Hierarchy Management",
  description: "A Next.js application for managing employee hierarchies",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Header />
        <div className="flex flex-1">
          {/* Optional Sidebar would go here */}
          {/* For now, just the main content */}
          <main className="flex-grow p-4">{children}</main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
