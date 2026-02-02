// lib/auth/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayload {
  userId: string;
  role: string;
  email?: string;
  iat?: number;
  exp?: number;
}

// Fix signToken function - remove expiresIn option issue
export function signToken(payload: { userId: string; role: string; email?: string }): string {
  const options: jwt.SignOptions = { 
    expiresIn: JWT_EXPIRES_IN as any // Type assertion to fix the error
  };
  
  return jwt.sign(payload, JWT_SECRET, options);
}

// Alternative: Use string literal for expiresIn
export function generateToken(userId: string, role: string): string {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: '7d' } // Use string literal
  );
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
}

// Helper function to check token expiration
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if (!decoded.exp) return false;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
}