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

// Fixed generateToken function
export function generateToken(userId: string, role: string): string {
  try {
    const payload = { userId, role };
    const options: jwt.SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
    
    return jwt.sign(payload, JWT_SECRET, options);
  } catch (error) {
    console.error('Error generating token:', error);
    throw error;
  }
}

// Alternative signToken function
export function signToken(payload: { userId: string; role: string; email?: string }): string {
  try {
    const options: jwt.SignOptions = { expiresIn: JWT_EXPIRES_IN as any};
    return jwt.sign(payload, JWT_SECRET, options);
  } catch (error) {
    console.error('Error signing token:', error);
    throw error;
  }
}

// Fixed verifyToken function
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error: any) {
    console.error('Token verification error:', error.message);
    return null;
  }
}

// Decode token without verification
export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    console.error('Token decoding error:', error);
    return null;
  }
}

// Check if token is expired
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