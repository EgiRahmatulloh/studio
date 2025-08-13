import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { AppSidebar } from "@/components/AppSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "SIPOPAY - Sistem Informasi Posyandu",
  description:
    "Aplikasi untuk pengelolaan data kehadiran dan kegiatan posyandu",
  icons: {
    icon: "/images/LOGO POSYANDU.png",
    shortcut: "/images/LOGO POSYANDU.png",
    apple: "/images/LOGO POSYANDU.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        style={{ fontFamily: "'Poppins', sans-serif" }}
        className="antialiased bg-gray-100"
      >
        <AuthProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1 overflow-auto p-4 sm:p-6">
                {children}
              </main>
            </SidebarInset>
          </SidebarProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
