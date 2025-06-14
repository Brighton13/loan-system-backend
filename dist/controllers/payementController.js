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
exports.make_payment = void 0;
const Loan_1 = __importStar(require("../models/Loan"));
const Payment_1 = __importStar(require("../models/Payment"));
const database_1 = __importDefault(require("../config/database"));
const make_payment = async (req, res) => {
    const transaction = await database_1.default.transaction(); // Start transaction
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
        const existingLoan = await Loan_1.default.findByPk(loanId, { transaction });
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
        const [loanUpdateCount] = await Loan_1.default.update({
            remainingAmount: remainingBalance,
            paidAmount: newPaidAmount,
            ...(remainingBalance <= 0 && { status: Loan_1.LoanStatus.COMPLETED }) // Mark as completed if fully paid
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
        const payment_status = Payment_1.PaymentStatus.COMPLETED;
        // Create payment record with transaction
        const payment = await Payment_1.default.create({
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
    }
    catch (error) {
        // Rollback transaction on error
        await transaction.rollback();
        console.error('Payment processing error:', error);
        return res.status(500).json({
            status: 1,
            message: "An error occurred while processing the payment.",
        });
    }
};
exports.make_payment = make_payment;
function txn_generator() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `txn-${timestamp}-lnp-${random}`;
}
//# sourceMappingURL=payementController.js.map