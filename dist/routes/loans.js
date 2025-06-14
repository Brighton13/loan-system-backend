"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/loans.ts
const express_1 = require("express");
const loanController_1 = require("../controllers/loanController");
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const auth_2 = __importDefault(require("./auth"));
const payementController_1 = require("../controllers/payementController");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// router.post('/', createLoan);
router.post('/', auth_2.default, uploadMiddleware_1.uploadCollateral.array('collateralImages', 5), loanController_1.createLoan);
router.get('/', loanController_1.getLoans);
router.get('/:id', loanController_1.getLoanById);
router.patch('/:id/approve', (0, auth_1.authorize)(User_1.UserRole.ADMIN), loanController_1.approveLoan);
router.post('/:id/payments', auth_2.default, payementController_1.make_payment);
exports.default = router;
//# sourceMappingURL=loans.js.map