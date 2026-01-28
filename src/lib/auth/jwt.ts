import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayload {
    userId: string;
    role: string;
    iat?: number;
    exp?: number;
}

export function generateToken(userId: string, role: string): string {
    return jwt.sign(
        { userId, role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    )
}

export function verifyToken(token: string): JwtPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload
    } catch (error) {
        return null
    }
}

export function decodeToken(token: string): JwtPayload | null {
    try {
        return jwt.decode(token) as JwtPayload;
    } catch (error) {
        return null
    }
}