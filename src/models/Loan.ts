// src/models/Loan.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { getSequelize } from '../config/database';
import User from './User';
const sequelize = getSequelize();
export enum LoanStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    ACTIVE = 'active',
    COMPLETED = 'completed',
    DEFAULTED = 'defaulted',
    OVERDUE = 'overdue'
}

export interface LoanAttributes {
    id: string;
    loan_number: string;
    approval_reason?: string; // Added this field
    userId: string;
    amount: number;
    interestRate: number;
    termWeeks: number;
    collateralImages?: string[]; // Added this field
    purpose: string;
    status: LoanStatus;
    reminderSent?: boolean; // Assuming you have this field for reminders
    approvedBy?: number;
    approvedAt?: Date;
    startDate?: Date;
    endDate?: Date;
    totalAmount?: number;
    paidAmount: number;
    remainingAmount?: number;
    collateral_details?: string; // Added this field
    createdAt?: Date;
    updatedAt?: Date;
}

interface LoanCreationAttributes extends Optional<LoanAttributes, 'id' | 'status' | 'paidAmount' | 'collateralImages'> { }

class Loan extends Model<LoanAttributes, LoanCreationAttributes> implements LoanAttributes {
    public id!: string;
    public loan_number!: string;
    public approval_reason?: string;
    public userId!: string;
    public amount!: number;
    public interestRate!: number;
    public termWeeks!: number;
    public collateralImages?: string[]; 
    public purpose!: string;
    public status!: LoanStatus;
    public approvedBy?: number;
    public approvedAt?: Date;
    public startDate?: Date;
    public endDate?: Date;
    public reminderSent?: boolean; // Assuming you have this field for reminders
    public totalAmount?: number;
    public paidAmount!: number;
    public remainingAmount?: number;
    public collateral_details?: string; 
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    borrower: any;
    user: any;
}

Loan.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        loan_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model:'users',
                key: 'id',
            },
        },
        amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            validate: {
                min: 200,
                max: 1000000,
            },
        },
        interestRate: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            validate: {
                min: 0,
                max: 100,
            },
        },
        termWeeks: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 4,
            },
        },
        collateralImages: {
            type: DataTypes.TEXT,
            allowNull: true,
            get() {
                const rawValue = (this as any).getDataValue('collateralImages');
                return rawValue ? JSON.parse(rawValue) : [];
            },
            set(value: string[]) {
                (this as any).setDataValue('collateralImages', JSON.stringify(value));
            },
        },
        purpose: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(LoanStatus)),
            allowNull: false,
            defaultValue: LoanStatus.PENDING,
        },
        approvedBy: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: 'id',
            },
        },
        approvedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        approval_reason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        totalAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
        },
        paidAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
        },
        remainingAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
        },
        collateral_details:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        reminderSent:{
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }
    },
    {
        sequelize,
        modelName: 'Loan',
        tableName: 'loans',
    }
);

export default Loan;