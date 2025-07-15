// src/routes/loans.ts
import { Router } from 'express';
import { createLoan, getLoans, getLoanById, approveLoan, AdminDashBoard, getCollateralImage } from '../controllers/loanController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import { uploadCollateral } from '../middleware/uploadMiddleware';
import auth from './auth';
import { get_all_payments, make_payment } from '../controllers/payementController';

const router = Router();
// router.get('/collateral/:filename', getCollateralImage);
router.use(authenticate);

router.post('/:id/payments',auth, make_payment);
router.get('/get-payments', auth, get_all_payments);



export default router;