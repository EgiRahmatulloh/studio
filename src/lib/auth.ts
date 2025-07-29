
import { PrismaClient, Role, Permission } from '../generated/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  permissions: string[];
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(email: string, password: string, role: Role = 'USER'): Promise<AuthUser> {
  const hashedPassword = await hashPassword(password);
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
    },
    include: {
      permissions: true,
    },
  });

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions.map(p => p.name),
  };
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { email },
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
    role: user.role,
    permissions: user.permissions.map(p => p.name),
  };
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      role: user.role,
      permissions: user.permissions 
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    return {
      id: decoded.userId,
      email: decoded.email,
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
    role: user.role,
    permissions: user.permissions.map(p => p.name),
  };
}

export async function getAllUsers(): Promise<AuthUser[]> {
  const users = await prisma.user.findMany({
    include: {
      permissions: true,
    },
  });

  return users.map(user => ({
    id: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions.map(p => p.name),
  }));
}

export async function updateUserPermissions(userId: string, permissionNames: string[]): Promise<void> {
  // Disconnect all current permissions
  await prisma.user.update({
    where: { id: userId },
    data: {
      permissions: {
        set: [],
      },
    },
  });

  // Connect new permissions
  if (permissionNames.length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        permissions: {
          connect: permissionNames.map(name => ({ name })),
        },
      },
    });
  }
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
  return user.role === 'ADMIN' || user.permissions.includes(permissionName);
}

export function isAdmin(user: AuthUser): boolean {
  return user.role === 'ADMIN';
}

    