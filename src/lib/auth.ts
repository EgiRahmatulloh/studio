
import { PrismaClient, Role, Permission } from '../../src/generated/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string | null;
  posyanduName?: string | null;
  role: Role;
  permissions: string[];
}

export interface CreateUserInput {
    email: string;
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

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser({ email, password, role = 'USER', fullName, posyanduName }: CreateUserInput): Promise<AuthUser> {
  const hashedPassword = await hashPassword(password);
  
  const user = await prisma.user.create({
    data: {
      email,
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
    fullName: user.fullName,
    posyanduName: user.posyanduName,
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
    fullName: user.fullName,
    posyanduName: user.posyanduName,
    role: user.role,
    permissions: user.permissions.map(p => p.name),
  };
}

export function generateToken(user: AuthUser): string {
  const payload: Omit<AuthUser, 'permissions'> & { userId: string, permissions: string[] } = {
      id: user.id,
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      posyanduName: user.posyanduName,
      role: user.role,
      permissions: user.permissions,
  };

  return jwt.sign(
    payload,
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
    fullName: user.fullName,
    posyanduName: user.posyanduName,
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
    fullName: user.fullName,
    posyanduName: user.posyanduName,
    role: user.role,
    permissions: user.permissions.map(p => p.name),
  }));
}

export async function updateUser(userId: string, data: UpdateUserInput): Promise<void> {
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
              permissions: { set: [] }
            }
        });
        // Then connect the new ones
        updateData.permissions = {
            connect: data.permissions.map(name => ({ name })),
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
  return user.role === 'ADMIN' || user.permissions.includes(permissionName);
}

export function isAdmin(user: AuthUser): boolean {
  return user.role === 'ADMIN';
}
