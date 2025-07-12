import { Op } from "sequelize";
import User from "../models/User";
import { AuthRequest } from "./loanController";
import { Response } from 'express';
import Loan from "../models/Loan";

export const getallusers = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                status: 1,
                message: "You must be authenticated to access the customer data.",
            });
        }

        if (user.role === "user") {
            return res.status(403).json({
                status: 1,
                message: "You don't have the permission to access this resource."
            });
        }

        // Pagination parameters
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        // Search and filter parameters
        const search = req.query.search as string || '';
        const role = req.query.role as string || '';
        const isActive = req.query.isActive as string || '';

        // Build the where clause
        const where: any = {};

        if (search) {
            where[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (role) {
            where.role = role;
        }

        if (isActive === "true") {
            where.isActive = true;
        } else if (isActive === "false") {  
            where.isActive = false;
        }

        // Get the users with pagination, search, and filters
        const { count, rows: users } = await User.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']] // Default sorting by creation date
        });

        // Calculate pagination metadata
        const totalPages = Math.ceil(count / limit);
        const hasNext = page < totalPages;
        const hasPrevious = page > 1;

        return res.status(200).json({
            status: 0,
            message: users.length > 0 ? "Users retrieved successfully" : "No users found",
            data: {
                users: users || [], // Ensure empty array is returned if no users
                pagination: {
                    totalItems: count,
                    totalPages,
                    currentPage: page,
                    itemsPerPage: limit,
                    hasNext,
                    hasPrevious
                }
            }
        });

    } catch (error) {
        console.error("Error fetching users:", error);
        return res.status(500).json({
            status: 1,
            message: "An error occurred while fetching users",
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};


export const adminChangePassword = async (req: AuthRequest, res: Response) => {
    try {
        const { newPassword } = req.body;
        const targetUserId = req.params.id;

        // Verify the requester is an admin
        const adminUser = (req as any).user;
        if (adminUser.role !== "admin")  {
            return res.status(403).json({ error: 'Admin privileges required' });
        }

        // Find the target user
        const targetUser = await User.findOne({ where: { id: targetUserId } });
        if (!targetUser) {
            return res.status(404).json({ error: 'Target user not found' });
        }

        // Optionally: Validate password strength
        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        // Update password
        targetUser.password = newPassword;
        await targetUser.save();

        // Optionally: Log this admin action
        // await AdminActionLog.create({
        //     adminId: adminUser.id,
        //     action: 'PASSWORD_RESET',
        //     targetUserId: targetUserId,
        //     ipAddress: req.ip
        // });

        res.status(200).json({
            message: 'Password changed successfully by admin'
        });
    } catch (error) {
        console.error('Admin password change error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const adminChangeStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { isActive } = req.body;
        const targetUserId = req.params.id;

        // Verify the requester is an admin
        const adminUser = (req as any).user;
        if (adminUser.role !== "admin")  {
            return res.status(403).json({ error: 'Admin privileges required' });
        }

        // Find the target user
        const targetUser = await User.findOne({ where: { id: targetUserId } });
        if (!targetUser) {
            return res.status(404).json({ error: 'Target user not found' });
        }

        // Update user status
        targetUser.isActive = isActive;
        await targetUser.save();

        // Optionally: Log this admin action
        // await AdminActionLog.create({
        //     adminId: adminUser.id,
        //     action: 'STATUS_CHANGE',
        //     targetUserId: targetUserId,
        //     ipAddress: req.ip
        // });

        res.status(200).json({
            status: 0,
            message: `User status changed to ${isActive ? 'active' : 'inactive'} successfully by admin`
        });
    } catch (error) {
        console.error('Admin status change error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const adminUpdateUser = async (req: AuthRequest, res: Response) => {
    try {
        const { firstName, lastName, email, phone, role } = req.body;
        const targetUserId = req.params.id;

        // Verify the requester is an admin
        const adminUser = (req as any).user;
        if (adminUser.role !== "admin")  {
            return res.status(403).json({ error: 'Admin privileges required' });
        }

        // Find the target user
        const targetUser = await User.findOne({ where: { id: targetUserId } });
        if (!targetUser) {
            return res.status(404).json({ error: 'Target user not found' });
        }

        // Update user details
        targetUser.firstName = firstName || targetUser.firstName;
        targetUser.lastName = lastName || targetUser.lastName;
        targetUser.email = email || targetUser.email;
        targetUser.phone = phone || targetUser.phone;
        if (role) {
            targetUser.role = role; // Ensure role is set only if provided
        }
        
        await targetUser.save();

        // Optionally: Log this admin action
        // await AdminActionLog.create({
        //     adminId: adminUser.id,
        //     action: 'USER_UPDATE',
        //     targetUserId: targetUserId,
        //     ipAddress: req.ip
        // });

        res.status(200).json({
            status: 0,
            message: 'User updated successfully by admin',
            data: targetUser
        });
    } catch (error) {
        console.error('Admin user update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const adminGetUserLoans = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.params.id;
        
        // Get pagination parameters with defaults
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        // Verify the requester is an admin
        const adminUser = req.user; // Assuming you've properly typed AuthRequest
        if (adminUser?.role !== "admin") {
            return res.status(403).json({ error: 'Admin privileges required' });
        }

        // Fetch loans with pagination
        const { count, rows: loans } = await Loan.findAndCountAll({
            where: { userId },
            include: [{ model: User, as: 'user' }],
            limit,
            offset,
            order: [['createdAt', 'DESC']] // Optional: order by creation date
        });

        if (!loans || loans.length === 0) {
            return res.status(404).json({ error: 'No loans found for this user' });
        }

        // Calculate total pages
        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            status: 0,
            message: 'Loans retrieved successfully',
            data: {
                loans,
                pagination: {
                    totalItems: count,
                    totalPages,
                    currentPage: page,
                    itemsPerPage: limit,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Error fetching user loans:', error);
        res.status(500).json({ 
            status: 1,
            error: 'Internal server error' 
        });
    }
};


export const adminDeleteUser = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.params.id;

        // Verify the requester is an admin
        const adminUser = req.user;
        if (adminUser?.role !== "admin") {
            return res.status(403).json({ error: 'Admin privileges required' });
        }

        // Find the user to delete
        const userToDelete = await User.findOne({ where: { id: userId } });
        if (!userToDelete) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete the user
        await userToDelete.destroy();

        res.status(200).json({
            status: 0,
            message: 'User deleted successfully by admin'
        });
    } catch (error) {
        console.error('Admin delete user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};  


export const adminAddUser = async (req: AuthRequest, res: Response) => {
    try {
        const { firstName, lastName, email, phone, password, role } = req.body;

        // Verify the requester is an admin
        const adminUser = req.user;
        if (adminUser?.role !== "admin") {
            return res.status(403).json({ error: 'Admin privileges required' });
        }

        // Create the new user
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            phone,
            password:"User1234",
            role: role || 'user', // Default to 'user' if no role provided
            isActive: true // Default to active
        });

        res.status(201).json({
            status: 0,
            message: 'User created successfully by admin',
            data: newUser
        });
    } catch (error) {
        console.error('Admin add user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};