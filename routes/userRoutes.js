const express = require('express');

const router = express.Router();

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
} = require('../controllers/authController');

const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
} = require('../controllers/userController');

router.post('/signup', signup);
router.post('/login', login);

router.patch('/updatePassword', protect, updatePassword);
router.patch('/updateMyInfo', protect, updateMe);
router.delete('/deleteMyAccount', protect, deleteMe);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUserById).patch(updateUser).delete(deleteUser);

module.exports = router;
