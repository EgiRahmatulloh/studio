import { PrismaClient, Role, Permission } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullName?: string | null;
  posyanduName?: string | null;
  role: Role;
  permissions: string[];
}

interface DecodedToken {
  id: string;
  email: string;
  username: string;
  fullName?: string | null;
  posyanduName?: string | null;
  role: Role;
  permissions?: string[]; // Permissions might be optional on the decoded token
}

export interface CreateUserInput {
  email: string;
  username: string;
  password: string;
  fullName?: string;
  posyanduName?: string;
  role?: Role;
}

export interface UpdateUserInput {
  permissions?: string[];
  fullName?: string | null;
  posyanduName?: string | null;
  role?: Role;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser({
  email,
  username,
  password,
  role = "USER",
  fullName,
  posyanduName,
}: CreateUserInput): Promise<AuthUser> {
  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      role,
      fullName,
      posyanduName,
    },
    include: {
      permissions: true,
    },
  });

  return {
    id: user.id,
    email: user.email,
    username: user.username || "", // Fallback to empty string if null
    fullName: user.fullName,
    posyanduName: user.posyanduName,
    role: user.role,
    permissions: user.permissions.map((p: Permission) => p.name),
  };
}

export async function authenticateUser(
  username: string,
  password: string
): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      permissions: true,
    },
  });

  if (!user || !(await verifyPassword(password, user.password))) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username || "", // Fallback to empty string if null
    fullName: user.fullName,
    posyanduName: user.posyanduName,
    role: user.role,
    permissions: user.permissions.map((p: Permission) => p.name),
  };
}

export function generateToken(user: AuthUser): string {
  const payload: AuthUser = {
    id: user.id,
    email: user.email,
    username: user.username,
    fullName: user.fullName,
    posyanduName: user.posyanduName,
    role: user.role,
    permissions: user.permissions,
  };

  return jwt.sign(payload, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "24h",
  });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as DecodedToken;
    return {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      fullName: decoded.fullName,
      posyanduName: decoded.posyanduName,
      role: decoded.role,
      permissions: decoded.permissions || [],
    };
  } catch {
    return null;
  }
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      permissions: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    username: user.username || "", // Fallback to empty string if null
    fullName: user.fullName,
    posyanduName: user.posyanduName,
    role: user.role,
    permissions: user.permissions.map((p: Permission) => p.name),
  };
}

export async function getAllUsers(): Promise<AuthUser[]> {
  const users = await prisma.user.findMany({
    include: {
      permissions: true,
    },
  });

  type UserWithPermissions = Awaited<ReturnType<typeof prisma.user.findMany>>[number];

  return users.map((user: UserWithPermissions) => ({
    id: user.id,
    email: user.email,
    username: user.username || "", // Fallback to empty string if null
    fullName: user.fullName,
    posyanduName: user.posyanduName,
    role: user.role,
    permissions: user.permissions.map((p: Permission) => p.name),
  }));
}

export async function updateUser(
  userId: string,
  data: UpdateUserInput
): Promise<void> {
  const updateData: any = {};

  if (data.fullName !== undefined) {
    updateData.fullName = data.fullName;
  }
  if (data.posyanduName !== undefined) {
    updateData.posyanduName = data.posyanduName;
  }

  if (data.role) {
    updateData.role = data.role;
  }

  if (data.permissions) {
    // Disconnect all current permissions first
    await prisma.user.update({
      where: { id: userId },
      data: {
        permissions: { set: [] },
      },
    });
    // Then connect the new ones
    updateData.permissions = {
      connect: data.permissions.map((name) => ({ name })),
    };
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
}

export async function deleteUser(userId: string): Promise<void> {
  await prisma.user.delete({
    where: { id: userId },
  });
}

export async function createPermission(name: string): Promise<Permission> {
  return await prisma.permission.create({
    data: { name },
  });
}

export async function getAllPermissions(): Promise<Permission[]> {
  return await prisma.permission.findMany();
}

export function hasPermission(user: AuthUser, permissionName: string): boolean {
  return user.role === "ADMIN" || user.permissions.includes(permissionName);
}

export function isAdmin(user: AuthUser): boolean {
  return user.role === "ADMIN";
}
