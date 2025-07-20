// import { Request, Response } from 'express';
// import jwt, { JwtPayload } from 'jsonwebtoken';
// import Joi from 'joi';
// import User, { UserRole } from '../models/User';
// import { sendForgotPasswordEmail } from '../services/email';

// const registerSchema = Joi.object({
//     firstName: Joi.string().min(2).max(50).required(),
//     lastName: Joi.string().min(2).max(50).required(),
//     email: Joi.string().email().required(),
//     phone: Joi.string().required().min(10).max(10),
//     password: Joi.string().min(6).required(),
//     nationalId: Joi.string().required(),
//     address: Joi.string().optional(),
//     dateOfBirth: Joi.date().required(),
//     role: Joi.string().valid(...Object.values(UserRole)).optional(),
// });

// const loginSchema = Joi.object({
//     email: Joi.string().email().required(),
//     password: Joi.string().required(),
// });

// // New validation schemas for password management
// const forgotPasswordSchema = Joi.object({
//     email: Joi.string().email().required(),
// });

// const resetPasswordSchema = Joi.object({
//     token: Joi.string().required(),
//     newPassword: Joi.string().min(6).required(),
// });

// const changePasswordSchema = Joi.object({
//     currentPassword: Joi.string().required(),
//     newPassword: Joi.string().min(6).required(),
// });

// interface JwtData extends JwtPayload {
//     id: string;
//     email: string;
// }

// interface ResetTokenData extends JwtPayload {
//     id: string;
//     email: string;
//     type: 'password_reset';
// }

// const generateToken = (payload: JwtData, p0: { id: string; email: string; }) => {
//     if (!process.env.JWT_SECRET) {
//         throw new Error("Missing access key environment variables");
//     }
//     if (!process.env.JWT_SECRET_EXPIRY) {
//         throw new Error("Missing access expiration in environment variables");
//     }
//     return jwt.sign(payload, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_SECRET_EXPIRY as any,
//     });
// };

// const generateResetToken = (payload: ResetTokenData) => {
//     if (!process.env.JWT_SECRET) {
//         throw new Error("Missing reset token secret in environment variables");
//     }
//     if (!process.env.JWT_SECRET_EXPIRY) {
//         throw new Error("Missing reset token expiration in environment variables");
//     }
//     return jwt.sign(payload, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRY as any || '1h', // Default to 1 hour
//     });
// };

// const verifyResetToken = (token: string): ResetTokenData => {
//     if (!process.env.JWT_SECRET) {
//         throw new Error("Missing reset token secret in environment variables");
//     }
//     return jwt.verify(token, process.env.JWT_SECRET) as ResetTokenData;
// };

// // Helper function to send email (you'll need to implement this with your email service)
// const sendPasswordResetEmail = async (email: string, resetToken: string) => {
//     // This is a placeholder - implement with your email service (nodemailer, sendgrid, etc.)
//     const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
//     console.log(`Password reset email would be sent to ${email} with link: ${resetLink}`);
    
//     // Example implementation with nodemailer:
//     /*
//     const transporter = nodemailer.createTransporter({
//         // your email config
//     });
    
//     await transporter.sendMail({
//         to: email,
//         subject: 'Password Reset Request',
//         html: `
//             <p>You requested a password reset. Click the link below to reset your password:</p>
//             <a href="${resetLink}">Reset Password</a>
//             <p>This link will expire in 1 hour.</p>
//             <p>If you didn't request this, please ignore this email.</p>
//         `
//     });
//     */
// };

// export const register = async (req: Request, res: Response) => {
//     try {
//         const { error, value } = registerSchema.validate(req.body);
//         if (error) {
//             return res.status(400).json({ error: error.details[0].message });
//         }

//         const { firstName, lastName, email, phone, password, role, address, nationalId, dateOfBirth } = value;

//         const existingUser = await User.findOne({ where: { email } });
//         if (existingUser) {
//             return res.status(409).json({ error: 'Email already registered' });
//         }

//         const user = await User.create({
//             firstName,
//             lastName,
//             email,
//             phone,
//             password,
//             role: role || UserRole.USER,
//             nationalId,
//             dateOfBirth,
//             address,
//         });

//         const token = generateToken({
//             id: user.id.toString(),
//             email: user.email,
//         }, {
//             id: user.id.toString(),
//             email: user.email,
//         });

//         res.status(201).json({
//             message: 'User registered successfully',
//             token,
//             user: {
//                 id: user.id,
//                 firstName: user.firstName,
//                 lastName: user.lastName,
//                 email: user.email,
//                 phone: user.phone,
//                 role: user.role,
//             },
//         });
//         return;
//     } catch (error) {
//         console.error('Registration error:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };

// export const login = async (req: Request, res: Response) => {
//     try {
//         const { error, value } = loginSchema.validate(req.body);
//         if (error) {
//             return res.status(400).json({ error: error.details[0].message });
//         }

//         const { email, password } = value;

//         const user = await User.findOne({ where: { email, isActive: true } });
//         if (!user || !(await user.comparePassword(password))) {
//             return res.status(401).json({ error: 'Invalid credentials' });
//         }

//         const token = generateToken({
//             id: user.id.toString(),
//             email: user.email,
//         }, {
//             id: user.id.toString(),
//             email: user.email,
//         });

//         res.json({
//             message: 'Login successful',
//             data: {
//                 token,
//                 user: {
//                     id: user.id,
//                     firstName: user.firstName,
//                     lastName: user.lastName,
//                     email: user.email,
//                     role: user.role,
//                 },
//             }
//         });
//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };

// export const forgotPassword = async (req: Request, res: Response) => {
//     try {
//         const { error, value } = forgotPasswordSchema.validate(req.body);
//         if (error) {
//             return res.status(400).json({ error: error.details[0].message });
//         }

//         const { email } = value;

//         const user = await User.findOne({ where: { email, isActive: true } });
//         if (!user) {
//             // Don't reveal if email exists or not for security
//             return res.status(200).json({
//                 message: 'If an account with that email exists, a password reset link has been sent.'
//             });
//         }

//         const resetToken = generateResetToken({
//             id: user.id.toString(),
//             email: user.email,
//             type: 'password_reset'
//         });

//         // Send email with reset link
//         // await sendPasswordResetEmail(email, resetToken);
//         await sendForgotPasswordEmail(email, resetToken);
        

//         res.status(200).json({
//             message: 'If an account with that email exists, a password reset link has been sent.'
//         });
//     } catch (error) {
//         console.error('Forgot password error:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };

// export const resetPassword = async (req: Request, res: Response) => {
//     try {
//         const { error, value } = resetPasswordSchema.validate(req.body);
//         if (error) {
//             return res.status(400).json({ error: error.details[0].message });
//         }

//         const { token, newPassword } = value;

//         // Verify the reset token
//         let decodedToken: ResetTokenData;
//         try {
//             decodedToken = verifyResetToken(token);
//         } catch (err) {
//             return res.status(400).json({ error: 'Invalid or expired reset token' });
//         }

//         // Check if token is for password reset
//         if (decodedToken.type !== 'password_reset') {
//             return res.status(400).json({ error: 'Invalid token type' });
//         }

//         // Find the user
//         const user = await User.findOne({ 
//             where: { 
//                 id: decodedToken.id, 
//                 email: decodedToken.email,
//                 isActive: true 
//             } 
//         });

//         if (!user) {
//             return res.status(400).json({ error: 'User not found' });
//         }

//         // Update the password
//         user.password = newPassword;
//         await user.save();

//         res.status(200).json({
//             message: 'Password reset successfully'
//         });
//     } catch (error) {
//         console.error('Reset password error:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };

// export const changePassword = async (req: Request, res: Response) => {
//     try {
//         const { error, value } = changePasswordSchema.validate(req.body);
//         if (error) {
//             return res.status(400).json({ error: error.details[0].message });
//         }

//         const { currentPassword, newPassword } = value;

//         // Get user from the authenticated request (assumes you have auth middleware)
//         const userId = (req as any).user?.id; // Assumes auth middleware adds user to request
//         if (!userId) {
//             return res.status(401).json({ error: 'Authentication required' });
//         }

//         const user = await User.findOne({ where: { id: userId, isActive: true } });
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }

//         // Verify current password
//         const isCurrentPasswordValid = await user.comparePassword(currentPassword);
//         if (!isCurrentPasswordValid) {
//             return res.status(400).json({ error: 'Current password is incorrect' });
//         }

//         // Check if new password is different from current password
//         const isSamePassword = await user.comparePassword(newPassword);
//         if (isSamePassword) {
//             return res.status(400).json({ error: 'New password must be different from current password' });
//         }

//         // Update password
//         user.password = newPassword;
//         await user.save();

//         res.status(200).json({
//             message: 'Password changed successfully'
//         });
//     } catch (error) {
//         console.error('Change password error:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };


import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Joi from 'joi';
import User, { UserRole } from '../models/User';
import { sendForgotPasswordEmail } from '../services/email';

const registerSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required().min(10).max(10),
    password: Joi.string().min(6).required(),
    nationalId: Joi.string().required(),
    address: Joi.string().optional(),
    dateOfBirth: Joi.date().required(),
    role: Joi.string().valid(...Object.values(UserRole)).optional(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
});

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
});

// New schema for refresh token
const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required(),
});

interface JwtData extends JwtPayload {
    id: string;
    email: string;
    role: string;
}

interface RefreshTokenData extends JwtPayload {
    id: string;
    email: string;
    role: string;
    type: 'refresh';
}

interface ResetTokenData extends JwtPayload {
    id: string;
    email: string;
    type: 'password_reset';
}

const generateAccessToken = (payload: { id: string; email: string; role: string }) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("Missing JWT secret in environment variables");
    }
    if (!process.env.JWT_ACCESS_EXPIRY) {
        throw new Error("Missing access token expiration in environment variables");
    }
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRY as any  || '15m', // Default to 15 minutes
    });
};

const generateRefreshToken = (payload: { id: string; email: string; role: string }) => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error("Missing refresh token secret in environment variables");
    }
    if (!process.env.JWT_REFRESH_EXPIRY) {
        throw new Error("Missing refresh token expiration in environment variables");
    }
    
    const refreshPayload: RefreshTokenData = {
        ...payload,
        type: 'refresh'
    };
    
    return jwt.sign(refreshPayload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRY as any || '7d', // Default to 7 days
    });
};

const generateTokenPair = (payload: { id: string; email: string; role: string }) => {
    const token = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    return { token, refreshToken };
};

const verifyRefreshToken = (token: string): RefreshTokenData => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error("Missing refresh token secret in environment variables");
    }
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET) as RefreshTokenData;
};

const generateResetToken = (payload: ResetTokenData) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("Missing reset token secret in environment variables");
    }
    if (!process.env.JWT_RESET_EXPIRY) {
        throw new Error("Missing reset token expiration in environment variables");
    }
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_RESET_EXPIRY as any || '1h', // Default to 1 hour
    });
};

const verifyResetToken = (token: string): ResetTokenData => {
    if (!process.env.JWT_SECRET) {
        throw new Error("Missing reset token secret in environment variables");
    }
    return jwt.verify(token, process.env.JWT_SECRET) as ResetTokenData;
};

// Helper function to send email (you'll need to implement this with your email service)
const sendPasswordResetEmail = async (email: string, resetToken: string) => {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    console.log(`Password reset email would be sent to ${email} with link: ${resetLink}`);
};

export const register = async (req: Request, res: Response) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { firstName, lastName, email, phone, password, role, address, nationalId, dateOfBirth } = value;

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
            nationalId,
            dateOfBirth,
            address,
        });

        const tokenPayload = {
            id: user.id.toString(),
            email: user.email,
            role: user.role,
        };

        const { token, refreshToken } = generateTokenPair(tokenPayload);

        // Set refresh token as httpOnly cookie for security
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(201).json({
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                },
            }
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

        const tokenPayload = {
            id: user.id.toString(),
            email: user.email,
            role: user.role,
        };

        const { token, refreshToken } = generateTokenPair(tokenPayload);

        // Set refresh token as httpOnly cookie for security
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
                },
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
    try {
        // Try to get refresh token from cookie first, then from body
        let refreshToken = req.cookies?.refreshToken;
        
        if (!refreshToken) {
            const { error, value } = refreshTokenSchema.validate(req.body);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
            refreshToken = value.refreshToken;
        }

        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token not provided' });
        }

        // Verify the refresh token
        let decodedToken: RefreshTokenData;
        try {
            decodedToken = verifyRefreshToken(refreshToken);
        } catch (err) {
            return res.status(401).json({ error: 'Invalid or expired refresh token' });
        }

        // Check if token is for refresh
        if (decodedToken.type !== 'refresh') {
            return res.status(401).json({ error: 'Invalid token type' });
        }

        // Find the user
        const user = await User.findOne({ 
            where: { 
                id: decodedToken.id, 
                email: decodedToken.email,
                isActive: true 
            } 
        });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Generate new token pair
        const tokenPayload = {
            id: user.id.toString(),
            email: user.email,
            role: user.role,
        };

        const { token, refreshToken: newRefreshToken } = generateTokenPair(tokenPayload);

        // Set new refresh token as httpOnly cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({
            message: 'Token refreshed successfully',
            data: {
               token,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                },
            }
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        // Clear the refresh token cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        res.json({
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { error, value } = forgotPasswordSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { email } = value;

        const user = await User.findOne({ where: { email, isActive: true } });
        if (!user) {
            // Don't reveal if email exists or not for security
            return res.status(200).json({
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
        }

        const resetToken = generateResetToken({
            id: user.id.toString(),
            email: user.email,
            type: 'password_reset'
        });

        // Send email with reset link
        await sendForgotPasswordEmail(email, resetToken);

        res.status(200).json({
            message: 'If an account with that email exists, a password reset link has been sent.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { error, value } = resetPasswordSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { token, newPassword } = value;

        // Verify the reset token
        let decodedToken: ResetTokenData;
        try {
            decodedToken = verifyResetToken(token);
        } catch (err) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        // Check if token is for password reset
        if (decodedToken.type !== 'password_reset') {
            return res.status(400).json({ error: 'Invalid token type' });
        }

        // Find the user
        const user = await User.findOne({ 
            where: { 
                id: decodedToken.id, 
                email: decodedToken.email,
                isActive: true 
            } 
        });

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        // Update the password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            message: 'Password reset successfully'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    try {
        const { error, value } = changePasswordSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { currentPassword, newPassword } = value;

        // Get user from the authenticated request (assumes you have auth middleware)
        const userId = (req as any).user?.id; // Assumes auth middleware adds user to request
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await User.findOne({ where: { id: userId, isActive: true } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Check if new password is different from current password
        const isSamePassword = await user.comparePassword(newPassword);
        if (isSamePassword) {
            return res.status(400).json({ error: 'New password must be different from current password' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};