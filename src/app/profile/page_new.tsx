"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const formSchema = z
  .object({
    fullName: z.string().min(2, {
      message: "Nama harus lebih dari 2 karakter.",
    }),
    username: z.string().min(3, {
      message: "Username harus lebih dari 3 karakter.",
    }),
    email: z.string().email({
      message: "Email tidak valid.",
    }),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(6, {
        message: "Password baru harus minimal 6 karakter.",
      })
      .optional()
      .or(z.literal("")),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // If new password is provided, confirm password must match
      if (data.newPassword && data.newPassword.length > 0) {
        return data.newPassword === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Konfirmasi password tidak cocok",
      path: ["confirmPassword"],
    }
  );

export default function ProfilePage() {
  const { user, fetchUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName || "",
        username: user.username || "",
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }, [user, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;

    setIsLoading(true);
    try {
      const updateData: any = {
        fullName: values.fullName,
        username: values.username,
        email: values.email,
      };

      // Only include password fields if new password is provided
      if (values.newPassword && values.newPassword.length > 0) {
        if (!values.currentPassword) {
          toast({
            title: "Error",
            description:
              "Password saat ini harus diisi untuk mengubah password",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        updateData.currentPassword = values.currentPassword;
        updateData.newPassword = values.newPassword;
      }

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal mengupdate profil");
      }

      await fetchUser(); // Refresh user data

      // Reset password fields
      form.setValue("currentPassword", "");
      form.setValue("newPassword", "");
      form.setValue("confirmPassword", "");

      toast({
        title: "Berhasil",
        description: "Profil berhasil diperbarui",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal mengupdate profil",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header outside the containers */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profil Pengguna</h1>
        <p className="text-gray-600 mt-2">
          Kelola informasi profil dan keamanan akun Anda
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Container - Personal Information */}
            <Card>
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-20 w-20 bg-gray-200">
                    <AvatarFallback className="text-gray-600">
                      <User className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">Informasi Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nama Lengkap */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan nama lengkap"
                          {...field}
                          className="focus-visible:ring-[#5D1451]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Username */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan username"
                          {...field}
                          className="focus-visible:ring-[#5D1451]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Masukkan email"
                          type="email"
                          {...field}
                          className="focus-visible:ring-[#5D1451]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Right Container - Password Security */}
            <Card>
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-xl">Keamanan Password</CardTitle>
                <CardDescription>
                  Ubah password untuk meningkatkan keamanan akun
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Password */}
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password Saat Ini</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Masukkan password saat ini"
                            type={showCurrentPassword ? "text" : "password"}
                            {...field}
                            className="focus-visible:ring-[#5D1451] pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* New Password */}
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password Baru</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Masukkan password baru"
                            type={showNewPassword ? "text" : "password"}
                            {...field}
                            className="focus-visible:ring-[#5D1451] pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirm Password */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Konfirmasi Password Baru</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Konfirmasi password baru"
                            type={showConfirmPassword ? "text" : "password"}
                            {...field}
                            className="focus-visible:ring-[#5D1451] pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              className="w-full max-w-md bg-[#5D1451] hover:bg-[#4A1040] text-white"
              disabled={isLoading}
            >
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
