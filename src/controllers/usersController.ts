import { Op } from "sequelize";
import User from "../models/User";
import { AuthRequest } from "./loanController";
import { Response } from 'express';

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
        const status = req.query.status as string || '';

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

        if (status) {
            where.status = status;
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
            message: "Users retrieved successfully",
            data: {
                users,
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