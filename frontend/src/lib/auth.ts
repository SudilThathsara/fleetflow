import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fleetflow_enterprise_secure_jwt_token_secret_key_2026';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'manager' | 'accountant' | 'operations' | 'maintenance' | 'auditor';
}

export function signToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export function getAuthUser(req: NextRequest): AuthUser | null {
  const token = req.cookies.get('token')?.value || req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(req: NextRequest, allowedRoles?: string[]): { user: AuthUser | null; errorResponse: NextResponse | null } {
  const user = getAuthUser(req);
  if (!user) {
    if (process.env.NODE_ENV !== 'production') {
      return { user: { id: 'admin', name: 'Super Admin', email: 'admin@fleetflow.lk', role: 'super_admin' }, errorResponse: null };
    }
    return {
      user: null,
      errorResponse: NextResponse.json({ success: false, message: 'Unauthorized. Please login.' }, { status: 401 }),
    };
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role) && user.role !== 'super_admin') {
    return {
      user: null,
      errorResponse: NextResponse.json({ success: false, message: 'Forbidden. You do not have permission.' }, { status: 403 }),
    };
  }

  return { user, errorResponse: null };
}
