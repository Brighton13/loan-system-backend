import { Model, Optional } from 'sequelize';
export declare enum LoanStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    ACTIVE = "active",
    COMPLETED = "completed",
    DEFAULTED = "defaulted"
}
export interface LoanAttributes {
    id: string;
    loan_number: string;
    approval_reason?: string;
    userId: string;
    amount: number;
    interestRate: number;
    termWeeks: number;
    collateralImages?: string[];
    purpose: string;
    status: LoanStatus;
    approvedBy?: number;
    approvedAt?: Date;
    startDate?: Date;
    endDate?: Date;
    totalAmount?: number;
    paidAmount: number;
    remainingAmount?: number;
    createdAt?: Date;
    updatedAt?: Date;
}
interface LoanCreationAttributes extends Optional<LoanAttributes, 'id' | 'status' | 'paidAmount' | 'collateralImages'> {
}
declare class Loan extends Model<LoanAttributes, LoanCreationAttributes> implements LoanAttributes {
    id: string;
    loan_number: string;
    approval_reason?: string;
    userId: string;
    amount: number;
    interestRate: number;
    termWeeks: number;
    collateralImages?: string[];
    purpose: string;
    status: LoanStatus;
    approvedBy?: number;
    approvedAt?: Date;
    startDate?: Date;
    endDate?: Date;
    totalAmount?: number;
    paidAmount: number;
    remainingAmount?: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Loan;
//# sourceMappingURL=Loan.d.ts.map