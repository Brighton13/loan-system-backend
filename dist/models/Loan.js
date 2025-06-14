"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanStatus = void 0;
// src/models/Loan.ts
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
var LoanStatus;
(function (LoanStatus) {
    LoanStatus["PENDING"] = "pending";
    LoanStatus["APPROVED"] = "approved";
    LoanStatus["REJECTED"] = "rejected";
    LoanStatus["ACTIVE"] = "active";
    LoanStatus["COMPLETED"] = "completed";
    LoanStatus["DEFAULTED"] = "defaulted";
})(LoanStatus || (exports.LoanStatus = LoanStatus = {}));
class Loan extends sequelize_1.Model {
}
Loan.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    loan_number: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: false,
        unique: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    amount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 200,
            max: 1000000,
        },
    },
    interestRate: {
        type: sequelize_1.DataTypes.DECIMAL(5, 2),
        allowNull: false,
        validate: {
            min: 0,
            max: 100,
        },
    },
    termWeeks: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 4,
        },
    },
    collateralImages: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('collateralImages');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('collateralImages', JSON.stringify(value));
        },
    },
    purpose: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM(...Object.values(LoanStatus)),
        allowNull: false,
        defaultValue: LoanStatus.PENDING,
    },
    approvedBy: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        references: {
            model: "users",
            key: 'id',
        },
    },
    approvedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    approval_reason: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    startDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    endDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    totalAmount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: true,
    },
    paidAmount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
    },
    remainingAmount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: true,
    },
}, {
    sequelize: database_1.default,
    modelName: 'Loan',
    tableName: 'loans',
});
exports.default = Loan;
//# sourceMappingURL=Loan.js.map