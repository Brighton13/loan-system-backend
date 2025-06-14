// src/routes/loans.ts
import { Router } from 'express';
import { createLoan, getLoans, getLoanById, approveLoan, AdminDashBoard } from '../controllers/loanController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import { uploadCollateral } from '../middleware/uploadMiddleware';
import auth from './auth';
import { make_payment } from '../controllers/payementController';

const router = Router();

router.use(authenticate);

// router.post('/', createLoan);

router.post('/', auth, uploadCollateral.array('collateralImages', 5), createLoan);
router.get('/', getLoans);
router.get('/:id', getLoanById);
router.patch('/:id/approve', authorize(UserRole.ADMIN), approveLoan);

router.post('/:id/payments',auth, make_payment);


export default router;