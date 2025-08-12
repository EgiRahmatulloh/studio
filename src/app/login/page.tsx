"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import Head from "next/head";
import Image from "next/image";

export default function LoginPage() {
  // Semua hooks harus dipanggil di bagian atas komponen, sebelum return kondisional
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Import Poppins font
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Add overflow hidden to prevent scrolling
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.head.removeChild(link);
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    // Jika pengguna sudah login, arahkan ke dashboard
    if (!authLoading && user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await login(username, password);
      toast({
        title: "Login berhasil",
        description: "Selamat datang kembali!",
      });
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Selama loading atau jika user sudah ada, tampilkan loading screen
  // untuk mencegah form login berkedip.
  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 bg-gray-100"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="w-full max-w-5xl bg-white rounded-[15px] shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-200">
        {/* Left side - System Info */}
        <div
          className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col items-center justify-center"
          style={{ background: "#5D1451" }}
        >
          <div className="text-center text-white">
            <div className="w-28 h-28 sm:w-40 sm:h-40 bg-white rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 p-4">
              <Image
                src="/images/LOGO POSYANDU.png"
                alt="Logo Posyandu"
                width={120}
                height={120}
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2">
              SIPOPAY
            </h1>
            <p className="text-sm sm:text-lg text-white/90">
              Sistem Informasi Posyandu
            </p>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto space-y-4">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 text-center">
                Selamat Datang
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 text-center">
                Silakan login untuk melanjutkan ke sistem
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error message */}
              {error && (
                <Alert variant="destructive" className="text-sm rounded-lg">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-sm sm:text-base font-medium"
                >
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan Username Anda"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="text-sm sm:text-base rounded-lg px-4 py-3 border-gray-300 focus:border-[#5D1451] focus:ring-[#5D1451]"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm sm:text-base font-medium"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan Password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="text-sm sm:text-base rounded-lg px-4 py-3 border-gray-300 focus:border-[#5D1451] focus:ring-[#5D1451]"
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full text-sm sm:text-base py-3 rounded-lg bg-[#5D1451] hover:bg-[#4A1040] text-white font-medium transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Memproses..." : "Login"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
