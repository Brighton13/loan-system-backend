import { Sequelize } from 'sequelize';
import User from './User';
import Loan from './Loan';
import Payment from './Payment';

const models = {
  User,
  Loan,
  Payment
};

// Define associations after all models are imported
export function setupAssociations() {
  User.hasMany(Loan, { foreignKey: 'userId', as: 'loans' });
  Loan.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  User.hasMany(Loan, { foreignKey: 'approvedBy', as: 'approvedLoans' });
  Loan.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

  Loan.hasMany(Payment, { foreignKey: 'loanId', as: 'payments' });
  Payment.belongsTo(Loan, { foreignKey: 'loanId', as: 'loan' });

  Payment.belongsTo(User, {foreignKey: 'receivedBy', as: 'receiver'});
  User.hasMany(Payment, {foreignKey: "receivedBy", as: "receiver"});
}

export default models;