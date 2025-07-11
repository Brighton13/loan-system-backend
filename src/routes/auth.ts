
// src/routes/auth.ts
import { Router } from 'express';
import { changePassword, forgotPassword, login, register, resetPassword } from '../controllers/authController';
import { authenticate } from '../middleware/auth';


const router = Router();

router.post('/register', register);
router.post('/login', login);
// New password management routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', authenticate, changePassword);
export default router;