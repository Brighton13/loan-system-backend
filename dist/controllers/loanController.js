"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLoanNumber = exports.AdminDashBoard = exports.approveLoan = exports.getLoanById = exports.getLoans = exports.getCollateralImage = exports.createLoan = void 0;
const joi_1 = __importDefault(require("joi"));
const Loan_1 = __importStar(require("../models/Loan"));
const User_1 = __importStar(require("../models/User"));
const Payment_1 = __importDefault(require("../models/Payment"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sequelize_1 = require("sequelize");
const createLoanSchema = joi_1.default.object({
    amount: joi_1.default.number().min(200).max(1000000).required()
        .messages({
        'number.min': 'Loan amount must be at least ZMW 200',
        'number.max': 'Loan amount cannot exceed ZMW 1,000,000',
        'any.required': 'Loan amount is required'
    }),
    termWeeks: joi_1.default.number().min(1).max(4).required()
        .messages({
        'number.min': 'Loan term must be at least 1 week',
        'number.max': 'Loan term cannot exceed 4 weeks',
        'any.required': 'Loan term is required'
    }),
    purpose: joi_1.default.string().min(10).max(500).required()
        .messages({
        'string.min': 'Purpose must be at least 10 characters long',
        'string.max': 'Purpose cannot exceed 500 characters',
        'any.required': 'Loan purpose is required'
    }),
    collateralImages: joi_1.default.array()
        .items(joi_1.default.string()
        .pattern(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/)
        .message('Each image must be a valid base64 encoded image (JPEG, PNG, GIF, or WebP)'))
        .min(1)
        .max(10)
        .required()
        .messages({
        'array.min': 'At least 1 collateral image is required',
        'array.max': 'Maximum of 10 collateral images allowed',
        'any.required': 'Collateral images are required'
    }),
    // Optional fields that might be included
    userId: joi_1.default.string().optional(),
    monthlyIncome: joi_1.default.number().min(0).optional(),
    employmentStatus: joi_1.default.string().optional(),
    employer: joi_1.default.string().optional(),
    collateralType: joi_1.default.string().optional(),
    collateralValue: joi_1.default.number().min(0).optional(),
    collateralDescription: joi_1.default.string().max(1000).optional()
});
const approveLoanSchema = joi_1.default.object({
    status: joi_1.default.string().valid(Loan_1.LoanStatus.APPROVED, Loan_1.LoanStatus.REJECTED).required(),
    reason: joi_1.default.string().optional(),
});
const createLoan = async (req, res) => {
    try {
        const { error, value } = createLoanSchema.validate(req.body);
        if (error) {
            // Clean up uploaded files if validation fails
            if (req.files) {
                const files = req.files;
                files.forEach(file => {
                    fs_1.default.unlinkSync(file.path);
                });
            }
            return res.status(400).json({
                status: 0,
                message: error.details[0].message,
                data: null
            });
        }
        // Check for existing active loans
        const activeLoan = await Loan_1.default.findOne({
            where: {
                userId: req.user?.id,
                status: {
                    [sequelize_1.Op.in]: [Loan_1.LoanStatus.ACTIVE, Loan_1.LoanStatus.PENDING, Loan_1.LoanStatus.DEFAULTED, Loan_1.LoanStatus.APPROVED]
                }
            }
        });
        if (activeLoan) {
            // Clean up uploaded files if loan exists
            if (req.files) {
                const files = req.files;
                files.forEach(file => {
                    fs_1.default.unlinkSync(file.path);
                });
            }
            return res.status(200).json({
                status: 1,
                message: "You cannot have multiple unsettled loans",
                data: null
            });
        }
        const { amount, termWeeks, purpose } = value;
        // Calculate interest rate based on term
        let interestRate;
        switch (termWeeks) {
            case 1:
                interestRate = 0.15;
                break;
            case 2:
                interestRate = 0.25;
                break;
            case 3:
                interestRate = 0.35;
                break;
            case 4:
                interestRate = 0.45;
                break;
            default:
                // Clean up uploaded files if term is invalid
                if (req.files) {
                    const files = req.files;
                    files.forEach(file => {
                        fs_1.default.unlinkSync(file.path);
                    });
                }
                return res.status(400).json({
                    status: 0,
                    message: 'Invalid term. Only 1–4 weeks are allowed.',
                    data: null
                });
        }
        // Process uploaded collateral images
        const collateralImages = [];
        if (req.files && Array.isArray(req.files)) {
            const files = req.files;
            files.forEach(file => {
                collateralImages.push(`/uploads/collateral/${file.filename}`);
            });
        }
        // Create the loan with proper typing
        const loan = await Loan_1.default.create({
            userId: req.user.id,
            loan_number: (0, exports.generateLoanNumber)(),
            amount,
            interestRate,
            termWeeks,
            purpose,
            collateralImages,
            status: Loan_1.LoanStatus.PENDING
        });
        // Return success response
        res.status(201).json({
            status: 0,
            message: 'Loan application submitted successfully',
            data: {
                ...loan.get({ plain: true }),
                collateralImages: loan.collateralImages || []
            }
        });
    }
    catch (error) {
        console.error('Create loan error:', error);
        // Clean up uploaded files if error occurs
        if (req.files) {
            const files = req.files;
            files.forEach(file => {
                if (fs_1.default.existsSync(file.path)) {
                    fs_1.default.unlinkSync(file.path);
                }
            });
        }
        res.status(500).json({
            status: 0,
            message: 'Internal server error',
            data: null
        });
    }
};
exports.createLoan = createLoan;
// New endpoint to serve collateral images
const getCollateralImage = async (req, res) => {
    try {
        const { filename } = req.params;
        const imagePath = path_1.default.join(__dirname, '../../uploads/collateral', filename);
        // Check if file exists
        if (!fs_1.default.existsSync(imagePath)) {
            return res.status(404).json({ error: 'Image not found' });
        }
        // Set appropriate headers
        const ext = path_1.default.extname(filename).toLowerCase();
        const contentType = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        }[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        // Stream the file
        const fileStream = fs_1.default.createReadStream(imagePath);
        fileStream.pipe(res);
    }
    catch (error) {
        console.error('Get collateral image error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getCollateralImage = getCollateralImage;
// Updated getLoans to include image URLs
const getLoans = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let whereClause = {};
        if (req.user.role === User_1.UserRole.USER) {
            whereClause.userId = req.user.id;
        }
        if (status) {
            whereClause.status = status;
        }
        const loans = await Loan_1.default.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User_1.default,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
                },
                {
                    model: User_1.default,
                    as: 'approver',
                    attributes: ['id', 'firstName', 'lastName'],
                    required: false,
                },
            ],
            limit: Number(limit),
            offset,
            order: [['createdAt', 'DESC']],
        });
        // Add image URLs to response
        const loansWithImageUrls = loans.rows.map(loan => ({
            ...loan.toJSON(),
            collateralImages: loan.collateralImages?.map((filename) => ({
                filename,
                url: `/api/loans/collateral/${filename}`
            })) || []
        }));
        res.json({
            status: 0,
            message: 'Loans retrieved successfully',
            data: {
                loans: loansWithImageUrls,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: loans.count,
                    pages: Math.ceil(loans.count / Number(limit)),
                },
            }
        });
    }
    catch (error) {
        console.error('Get loans error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getLoans = getLoans;
// Updated getLoanById to include image URLs
const getLoanById = async (req, res) => {
    try {
        const { id } = req.params;
        let whereClause = { id };
        if (req.user.role === User_1.UserRole.USER) {
            whereClause.userId = req.user.id;
        }
        const loan = await Loan_1.default.findOne({
            where: whereClause,
            include: [
                {
                    model: User_1.default,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email'],
                },
                {
                    model: User_1.default,
                    as: 'approver',
                    attributes: ['id', 'firstName', 'lastName'],
                    required: false,
                },
                {
                    model: Payment_1.default,
                    as: 'payments',
                    order: [['paymentDate', 'DESC']],
                },
            ],
        });
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }
        // Add image URLs to response
        const loanWithImageUrls = {
            ...loan.toJSON(),
            collateralImages: loan.collateralImages?.map((filename) => ({
                filename,
                url: `/api/loans/collateral/${filename}`
            })) || []
        };
        res.json({ loan: loanWithImageUrls });
    }
    catch (error) {
        console.error('Get loan error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getLoanById = getLoanById;
// Keep existing functions unchanged
const approveLoan = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = approveLoanSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const { status } = value;
        const loan = await Loan_1.default.findByPk(id);
        if (!loan) {
            return res.status(404).json({ error: 'Loan not found' });
        }
        if (loan.status !== Loan_1.LoanStatus.PENDING) {
            return res.status(400).json({ error: 'Loan has already been processed' });
        }
        if (status === Loan_1.LoanStatus.APPROVED) {
            const amount = Number(loan.amount);
            const interestRate = Number(loan.interestRate);
            const interestAmount = amount * interestRate;
            const totalAmount = amount + interestAmount;
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + loan.termWeeks * 7);
            await loan.update({
                status: Loan_1.LoanStatus.ACTIVE,
                approvedBy: req.user.id,
                approvedAt: new Date(),
                approval_reason: value.reason || null,
                startDate,
                endDate,
                totalAmount: Math.round(totalAmount * 100) / 100,
                remainingAmount: Math.round(totalAmount * 100) / 100,
            });
        }
        else {
            await loan.update({
                status,
                approvedBy: req.user.id,
                approval_reason: value.reason || null,
                approvedAt: new Date(),
            });
        }
        res.json({
            message: `Loan ${status} successfully`,
            loan,
        });
    }
    catch (error) {
        console.error('Approve loan error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.approveLoan = approveLoan;
const AdminDashBoard = async (req, res) => {
    try {
        // Current date and setup for monthly calculations
        const now = new Date();
        const currentYear = now.getFullYear();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        // Function to get monthly data
        const getMonthlyData = async (model, whereClause = {}, sumField = null) => {
            const monthlyData = [];
            for (let month = 0; month < 12; month++) {
                const startDate = new Date(currentYear, month, 1);
                const endDate = new Date(currentYear, month + 1, 0);
                const monthWhere = {
                    ...whereClause,
                    createdAt: {
                        [sequelize_1.Op.between]: [startDate, endDate]
                    }
                };
                if (sumField) {
                    const value = await model.sum(sumField, { where: monthWhere }) || 0;
                    monthlyData.push(Number(value).toFixed(2));
                }
                else {
                    const count = await model.count({ where: monthWhere });
                    monthlyData.push(count);
                }
            }
            return monthlyData;
        };
        // Loan statistics
        const totalLoans = await Loan_1.default.count();
        const totalActiveLoans = await Loan_1.default.count({ where: { status: Loan_1.LoanStatus.ACTIVE } });
        const totalCompletedLoans = await Loan_1.default.count({ where: { status: Loan_1.LoanStatus.COMPLETED } });
        const totalDefaultedLoans = await Loan_1.default.count({ where: { status: Loan_1.LoanStatus.DEFAULTED } });
        const totalPendingLoans = await Loan_1.default.count({ where: { status: Loan_1.LoanStatus.PENDING } });
        const totalRejectedLoans = await Loan_1.default.count({ where: { status: Loan_1.LoanStatus.REJECTED } });
        const totalApprovedLoans = await Loan_1.default.count({
            where: {
                status: {
                    [sequelize_1.Op.in]: [
                        Loan_1.LoanStatus.APPROVED,
                        Loan_1.LoanStatus.ACTIVE,
                        Loan_1.LoanStatus.DEFAULTED,
                        Loan_1.LoanStatus.COMPLETED
                    ]
                }
            }
        });
        // Monthly loan statistics
        const monthlyLoans = await getMonthlyData(Loan_1.default);
        const monthlyApprovedLoans = await getMonthlyData(Loan_1.default, {
            status: {
                [sequelize_1.Op.in]: [
                    Loan_1.LoanStatus.APPROVED,
                    Loan_1.LoanStatus.COMPLETED,
                    Loan_1.LoanStatus.DEFAULTED,
                    Loan_1.LoanStatus.ACTIVE
                ]
            }
        });
        const monthlyDisbursedAmount = await getMonthlyData(Loan_1.default, { status: { [sequelize_1.Op.in]: [Loan_1.LoanStatus.ACTIVE, Loan_1.LoanStatus.COMPLETED, Loan_1.LoanStatus.DEFAULTED] } }, 'amount');
        // User statistics
        const totalUsers = await User_1.default.count({ where: { role: User_1.UserRole.USER } });
        const totalAdmins = await User_1.default.count({ where: { role: User_1.UserRole.ADMIN } });
        // Monthly user onboarding
        const monthlyNewUsers = await getMonthlyData(User_1.default, { role: User_1.UserRole.USER });
        // Financial statistics
        const totalAmountLoaned = await Loan_1.default.sum('amount') || 0;
        const totalAmountRepaid = await Payment_1.default.sum('amount') || 0;
        // Calculate total amount disbursed (only for active and completed loans)
        const totalAmountDisbursed = await Loan_1.default.sum('amount', {
            where: {
                status: {
                    [sequelize_1.Op.in]: [Loan_1.LoanStatus.ACTIVE, Loan_1.LoanStatus.COMPLETED, Loan_1.LoanStatus.DEFAULTED]
                }
            }
        }) || 0;
        // Calculate total interest earned
        const totalInterestAmount = await Loan_1.default.sum('totalAmount') || 0;
        const totalInterestEarned = Number(totalInterestAmount) - Number(totalAmountDisbursed);
        // Payment statistics
        const totalPayments = await Payment_1.default.count();
        const totalPaymentAmount = await Payment_1.default.sum('amount') || 0;
        const totalPendingPayments = await Payment_1.default.count({ where: { status: 'pending' } });
        const totalCompletedPayments = await Payment_1.default.count({ where: { status: 'completed' } });
        const totalFailedPayments = await Payment_1.default.count({ where: { status: 'failed' } });
        // Monthly collection statistics
        const monthlyCollections = await getMonthlyData(Payment_1.default, { status: 'completed' }, 'amount');
        const monthlyPaymentsCount = await getMonthlyData(Payment_1.default, { status: 'completed' });
        // Recent loans (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentLoans = await Loan_1.default.count({
            where: {
                createdAt: {
                    [sequelize_1.Op.gte]: sevenDaysAgo
                }
            }
        });
        // Calculate loan approval rate
        const totalProcessedLoans = totalApprovedLoans + totalRejectedLoans;
        const loanApprovalRate = totalProcessedLoans > 0
            ? ((totalApprovedLoans / totalProcessedLoans) * 100).toFixed(2)
            : 0;
        // Calculate average loan amount
        const averageLoanAmount = totalLoans > 0
            ? (Number(totalAmountLoaned) / totalLoans).toFixed(2)
            : 0;
        // Calculate collection rate (payments vs expected)
        const collectionRate = Number(totalAmountDisbursed) > 0
            ? ((Number(totalAmountRepaid) / Number(totalAmountDisbursed)) * 100).toFixed(2)
            : 0;
        // Outstanding amount (total disbursed - total repaid)
        const outstandingAmount = Number(totalAmountDisbursed) - Number(totalAmountRepaid);
        const dashboardData = {
            loans: {
                total: totalLoans,
                active: totalActiveLoans,
                completed: totalCompletedLoans,
                defaulted: totalDefaultedLoans,
                pending: totalPendingLoans,
                rejected: totalRejectedLoans,
                approved: totalApprovedLoans,
                recent: recentLoans,
                approvalRate: `${loanApprovalRate}%`,
                averageAmount: averageLoanAmount,
                monthly: {
                    labels: months,
                    total: monthlyLoans,
                    approved: monthlyApprovedLoans,
                    disbursedAmount: monthlyDisbursedAmount
                }
            },
            users: {
                total: totalUsers,
                admins: totalAdmins,
                customers: totalUsers,
                monthly: {
                    labels: months,
                    newCustomers: monthlyNewUsers
                }
            },
            financial: {
                totalAmountLoaned: Number(totalAmountLoaned).toFixed(2),
                totalAmountDisbursed: Number(totalAmountDisbursed).toFixed(2),
                totalAmountRepaid: Number(totalAmountRepaid).toFixed(2),
                totalInterestEarned: totalInterestEarned.toFixed(2),
                outstandingAmount: outstandingAmount.toFixed(2),
                collectionRate: `${collectionRate}%`,
                monthly: {
                    labels: months,
                    collections: monthlyCollections,
                    paymentsCount: monthlyPaymentsCount
                }
            },
            payments: {
                total: totalPayments,
                totalAmount: Number(totalPaymentAmount).toFixed(2),
                pending: totalPendingPayments,
                completed: totalCompletedPayments,
                failed: totalFailedPayments
            },
            summary: {
                totalRevenue: totalInterestEarned.toFixed(2),
                totalCustomers: totalUsers,
                totalActiveLoans: totalActiveLoans,
                collectionEfficiency: `${collectionRate}%`
            },
            trends: {
                months: months,
                customerOnboarding: monthlyNewUsers,
                loansApproved: monthlyApprovedLoans,
                collections: monthlyCollections
            }
        };
        res.json({
            success: true,
            message: 'Admin dashboard data retrieved successfully',
            data: dashboardData
        });
    }
    catch (error) {
        console.error('Admin dashboard error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'Failed to retrieve dashboard data'
        });
    }
};
exports.AdminDashBoard = AdminDashBoard;
// Helper function to generate a unique loan number
const generateLoanNumber = () => {
    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');
    const day = pad(now.getDate());
    const month = pad(now.getMonth() + 1);
    const hour = pad(now.getHours());
    const minute = pad(now.getMinutes());
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `LN-${day}${month}${hour}${minute}-${randomSuffix}`;
};
exports.generateLoanNumber = generateLoanNumber;
//# sourceMappingURL=loanController.js.map