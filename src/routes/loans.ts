// src/routes/loans.ts
import { Router } from 'express';
import { createLoan, getLoans, getLoanById, approveLoan, AdminDashBoard, getCollateralImage } from '../controllers/loanController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import { uploadCollateral } from '../middleware/uploadMiddleware';
import auth from './auth';
import { make_payment } from '../controllers/payementController';

const router = Router();
router.get('/collateral/:filename', getCollateralImage);
router.use(authenticate);

// router.post('/', createLoan);

router.post('/', auth, uploadCollateral.array('collateralImages', 5), createLoan);
// Public route to serve collateral images

router.get('/', getLoans);
router.get('/:id', getLoanById);
router.patch('/:id/approve', authorize(UserRole.ADMIN), approveLoan);

router.post('/:id/payments',auth, make_payment);


export default router;