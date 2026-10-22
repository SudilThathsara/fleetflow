import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fleetflow_enterprise_secure_jwt_token_secret_key_2026';

export type UserRole =
  | 'super_admin'
  | 'manager'
  | 'accountant'
  | 'operations'
  | 'maintenance'
  | 'auditor'
  | 'customer';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  customerId?: string;
  customerCompanyId?: string;
}

export function signToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      customerId: user.customerId,
      customerCompanyId: user.customerCompanyId,
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

export function requireAuth(
  req: NextRequest,
  allowedRoles?: UserRole[]
): { user: AuthUser | null; errorResponse: NextResponse | null } {
  const user = getAuthUser(req);
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, message: 'Authentication required. Please sign in.' },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role) && user.role !== 'super_admin') {
      return {
        user: null,
        errorResponse: NextResponse.json(
          { success: false, message: 'Forbidden. You do not have permission for this resource.' },
          { status: 403 }
        ),
      };
    }
  }

  return { user, errorResponse: null };
}

export function requireCustomerAuth(req: NextRequest): { user: AuthUser | null; errorResponse: NextResponse | null } {
  const user = getAuthUser(req);
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { success: false, message: 'Customer sign in required.' },
        { status: 401 }
      ),
    };
  }
  return { user, errorResponse: null };
}

export function requireStaffAuth(req: NextRequest): { user: AuthUser | null; errorResponse: NextResponse | null } {
  const staffRoles: UserRole[] = ['super_admin', 'manager', 'accountant', 'operations', 'maintenance', 'auditor'];
  return requireAuth(req, staffRoles);
}
