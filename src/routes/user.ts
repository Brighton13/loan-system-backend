import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { get } from 'http';
import { adminAddUser, adminChangePassword, adminChangeStatus, adminDeleteUser, adminGetUserLoans, adminUpdateUser, getallusers } from '../controllers/usersController';



const router = Router();

router.use(authenticate);

router.get('/', getallusers);

router.patch('/:id/password', adminChangePassword);
router.patch('/:id/status', adminChangeStatus);
router.patch('/:id', adminUpdateUser);
router.delete('/:id', adminDeleteUser);
router.get('/:id/loans', adminGetUserLoans);
router.post('/create', adminAddUser);

export default router;