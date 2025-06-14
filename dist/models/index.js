"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAssociations = setupAssociations;
const User_1 = __importDefault(require("./User"));
const Loan_1 = __importDefault(require("./Loan"));
const Payment_1 = __importDefault(require("./Payment"));
const models = {
    User: User_1.default,
    Loan: Loan_1.default,
    Payment: Payment_1.default
};
// Define associations after all models are imported
function setupAssociations() {
    User_1.default.hasMany(Loan_1.default, { foreignKey: 'userId', as: 'loans' });
    Loan_1.default.belongsTo(User_1.default, { foreignKey: 'userId', as: 'user' });
    User_1.default.hasMany(Loan_1.default, { foreignKey: 'approvedBy', as: 'approvedLoans' });
    Loan_1.default.belongsTo(User_1.default, { foreignKey: 'approvedBy', as: 'approver' });
    Loan_1.default.hasMany(Payment_1.default, { foreignKey: 'loanId', as: 'payments' });
    Payment_1.default.belongsTo(Loan_1.default, { foreignKey: 'loanId', as: 'loan' });
    Payment_1.default.belongsTo(User_1.default, { foreignKey: 'receivedBy', as: 'receiver' });
    User_1.default.hasMany(Payment_1.default, { foreignKey: "receivedBy", as: "receiver" });
}
exports.default = models;
//# sourceMappingURL=index.js.map