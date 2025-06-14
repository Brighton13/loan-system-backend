import { Request, Response } from 'express';
import User from '../models/User';
import Loan, { LoanStatus } from '../models/Loan';
import Payment, { PaymentStatus } from '../models/Payment';
import sequelize from '../config/database';



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

function txn_generator(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `txn-${timestamp}-lnp-${random}`;
}
