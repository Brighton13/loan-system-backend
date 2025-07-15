import { Request, Response } from 'express';
import User from '../models/User';
import Loan, { LoanStatus } from '../models/Loan';
import Payment, { PaymentStatus } from '../models/Payment';
import sequelize from '../config/database';
import { Op } from 'sequelize';



interface AuthRequest extends Request {
    user?: User;
}

export const make_payment = async (req: AuthRequest, res: Response) => {
    const transaction = await sequelize.transaction(); // Start transaction

    try {
        const loanId = req.params.id;
        const userId = req.user?.id;
        const { amount, payment_method, notes } = req.body;

        // Validate user authentication
        if (!userId) {
            await transaction.rollback();
            return res.status(401).json({
                status: 1,
                message: "You must be logged in to make a payment."
            });
        }

        // Validate payment amount
        if (amount <= 0) {
            await transaction.rollback();
            return res.status(400).json({
                status: 1,
                message: "Payment amount must be greater than zero."
            });
        }

        // Find the loan within transaction
        const existingLoan = await Loan.findByPk(loanId, { transaction });
        if (!existingLoan) {
            await transaction.rollback();
            return res.status(404).json({
                status: 1,
                message: "Loan not found."
            });
        }

        // Validate loan status
        if (!['active', 'approved'].includes(existingLoan.status)) {
            await transaction.rollback();
            return res.status(400).json({
                status: 1,
                message: "Payments can only be made for active or approved loans."
            });
        }

        // Calculate balances
        const currentBalance = Number(existingLoan.totalAmount ?? 0);
        const paidAmount = Number(existingLoan.paidAmount ?? 0);
        const paymentAmount = Number(amount);
       
       
        const newPaidAmount = paidAmount + paymentAmount;
        const remainingBalance = currentBalance - newPaidAmount;

        // Validate payment doesn't exceed loan amount
        if (remainingBalance < 0) {
            await transaction.rollback();
            return res.status(400).json({
                status: 1,
                message: "Payment amount exceeds the remaining loan balance."
            });
        }

        // Update loan with transaction
        const [loanUpdateCount] = await Loan.update({
            remainingAmount: remainingBalance,
            paidAmount: newPaidAmount,
            ...(remainingBalance <= 0 && { status: LoanStatus.COMPLETED }) // Mark as completed if fully paid
        }, {
            where: { id: loanId },
            transaction
        });

        if (loanUpdateCount === 0) {
            await transaction.rollback();
            return res.status(400).json({
                status: 1,
                message: "Failed to update loan record."
            });
        }

        const payment_status =  PaymentStatus.COMPLETED;
        // Create payment record with transaction
        const payment = await Payment.create({
            loanId: existingLoan.id,
            receivedBy: userId.toString(),
            transactionId: txn_generator(),
            amount: amount,
            status: payment_status,
            paymentDate: new Date(),
            paymentMethod: payment_method,
            notes: notes
        }, { transaction });

        // Commit the transaction if everything succeeded
        await transaction.commit();

        return res.status(201).json({
            status: 0,
            message: "Payment made successfully",
            data: {
                paymentId: payment.id,
                remainingBalance: remainingBalance,
                isLoanCompleted: remainingBalance <= 0
            }
        });

    } catch (error) {
        // Rollback transaction on error
        await transaction.rollback();
        console.error('Payment processing error:', error);

        return res.status(500).json({
            status: 1,
            message: "An error occurred while processing the payment.",

        });
    }
};

export const get_all_payments = async (req: AuthRequest, res: Response) => {
    try {
        // Extract query parameters
        const {
            page = 1,
            limit = 10,
            loan_number,
            method_of_payment,
            transactionId,
            start_date,
            end_date
        } = req.query;

        // Calculate offset for pagination
        const offset = (Number(page) - 1) * Number(limit);

        // Build where conditions
        const where: any = {};
        const loanWhere: any = {};
        const include = [
            {
                model: Loan,
                attributes: ['loan_number', 'amount', 'status'],
                where: loanWhere
            },
            {
                model: User,
                as: 'receiver',
                attributes: ['firstName', 'lastName']
            }
        ];

        // Add search filters
        if (loan_number) {
            loanWhere.loan_number = loan_number;
        }

        if (method_of_payment) {
            where.method_of_payment = method_of_payment;
        }

        if (transactionId) {
            where.transactionId = transactionId;
        }

        // Add date filter
        if (start_date || end_date) {
            where.createdAt = {};
            if (start_date) {
                where.createdAt[Op.gte] = new Date(start_date as string);
            }
            if (end_date) {
                where.createdAt[Op.lte] = new Date(end_date as string);
            }
        }

        // Get payments with pagination
        const { count, rows: payments } = await Payment.findAndCountAll({
            where,
            include,
            limit: Number(limit),
            offset,
            order: [['createdAt', 'DESC']] // Sort by newest first
        });

        // Calculate total pages
        const totalPages = Math.ceil(count / Number(limit));

        return res.status(200).json({
            status: 0,
            message: "Payments retrieved successfully",
            data: {
                payments,
                pagination: {
                    currentPage: Number(page),
                    totalPages,
                    totalItems: count,
                    itemsPerPage: Number(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error retrieving payments:', error);
        return res.status(500).json({
            status: 1,
            message: "An error occurred while retrieving payments."
        });
    }
};

function txn_generator(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `txn-${timestamp}-lnp-${random}`;
}
