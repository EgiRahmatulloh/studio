
import { PrismaClient, Role, Permission } from '../generated/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  permissions: string[];
  posyanduName?: string | null;
}

export interface CreateUserInput {
    email: string;
    password: string;
    role?: Role;
    posyanduName?: string;
}

export interface UpdateUserInput {
    permissions?: string[];
    posyanduName?: string | null;
    role?: Role;
}


export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser({ email, password, role = 'USER', posyanduName }: CreateUserInput): Promise<AuthUser> {
  const hashedPassword = await hashPassword(password);
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
      posyanduName,
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
    posyanduName: user.posyanduName,
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
    posyanduName: user.posyanduName,
  };
}

export function generateToken(user: AuthUser): string {
  const payload: Omit<AuthUser, 'permissions'> & { userId: string, permissions: string[] } = {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      posyanduName: user.posyanduName,
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
      role: decoded.role,
      permissions: decoded.permissions || [],
      posyanduName: decoded.posyanduName
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
    posyanduName: user.posyanduName,
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
    posyanduName: user.posyanduName,
  }));
}

export async function updateUser(userId: string, data: UpdateUserInput): Promise<void> {
    const updateData: any = {};

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
  return user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.permissions.includes(permissionName);
}

export function isAdmin(user: AuthUser): boolean {
  return user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
}
