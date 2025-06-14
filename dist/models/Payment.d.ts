import { Model, Optional } from 'sequelize';
export declare enum PaymentStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed"
}
interface PaymentAttributes {
    id: string;
    loanId: string;
    receivedBy: string;
    amount: number;
    paymentDate: Date;
    status: PaymentStatus;
    paymentMethod: string;
    transactionId?: string;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id' | 'status'> {
}
declare class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
    id: string;
    loanId: string;
    receivedBy: string;
    amount: number;
    paymentDate: Date;
    status: PaymentStatus;
    paymentMethod: string;
    transactionId?: string;
    notes?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Payment;
//# sourceMappingURL=Payment.d.ts.map