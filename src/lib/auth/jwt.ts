import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production-minimum-32-chars';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function generateToken(userId: string, role: string): string {
  try {
    if (!JWT_SECRET || JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters');
    }

    const payload: JwtPayload = { 
      userId, 
      role 
    };
    
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: 'HS256'
    } as any);

    console.log('✅ Token generated for:', { userId, role });
    return token;

  } catch (error: any) {
    console.error('❌ Error generating token:', error);
    throw new Error('Failed to generate token');
  }
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Check if token has required fields
    if (!decoded.userId || !decoded.role) {
      console.error('❌ Token missing required fields');
      return null;
    }

    return decoded;

  } catch (error: any) {
    console.error('❌ Token verification failed:', error.message);
    
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      console.error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      console.error('Invalid token');
    }
    
    return null;
  }
}

export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    console.error('Token decoding error:', error);
    return null;
  }
}

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

// Helper to refresh token
export function refreshToken(oldToken: string): string | null {
  try {
    const decoded = verifyToken(oldToken);
    if (!decoded) return null;
    
    return generateToken(decoded.userId, decoded.role);
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
}