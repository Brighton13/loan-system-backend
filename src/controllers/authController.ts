
import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Joi from 'joi';
import User, { UserRole } from '../models/User';

const registerSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().optional().max(10), // Optional field for phone number
    password: Joi.string().min(6).required(),
    role: Joi.string().valid(...Object.values(UserRole)).optional(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

interface JwtData extends JwtPayload {
    id: string;
    email: string;
}

const generateToken = (payload: JwtData, p0: { id: string; email: string; }) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("Missing access key environment variables");
    }
    if (!process.env.JWT_SECRET_EXPIRY) {
        throw new Error("Missing access expiration in environment variables");
    }
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_SECRET_EXPIRY as any,
    });
};

export const register = async (req: Request, res: Response) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { firstName, lastName, email,phone, password, role } = value;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            phone,
            password,
            role: role || UserRole.USER,
        });

        const token = generateToken({
            id: user.id.toString(),
            email: user.email,
        }, {
            id: user.id.toString(),
            email: user.email,
        });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
        return;
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { email, password } = value;

        const user = await User.findOne({ where: { email, isActive: true } });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken({
            id: user.id.toString(),
            email: user.email,
        }, {
            id: user.id.toString(),
            email: user.email,
        });

        
        res.json({
            message: 'Login successful',
            data: {
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            },}
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};