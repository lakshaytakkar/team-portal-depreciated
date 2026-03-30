import type { User } from '@shared/schema';

export function requireAuth(req: any, res: any, next: any) {
  next();
}

export function requireRole(...roles: string[]) {
  return (req: any, res: any, next: any) => {
    next();
  };
}

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name: string;
      role: string;
      phone: string | null;
      avatar: string | null;
      createdAt: Date;
    }
  }
}
