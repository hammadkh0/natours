const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const HttpError = require('../utils/httpError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) create error if updating password
  if (req.body.password || req.body.passwordConfirm) {
    return next(new HttpError('This route does not support updating password!', 400));
  }

  // 2) filter out the fields that are not allowed to be updated.
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) update user document.
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true });

  // 3) send user back.
  res.status(200).send({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).send({
    status: 'success',
    data: null,
  });
});

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();
  res.status(200).send({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});
exports.getUserById = (req, res) => {
  res.status(500).send({
    status: 'fail',
    message: 'This route is not yet implemented',
  });
};
exports.createUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    message: 'This route is not yet implemented',
  });
};
exports.updateUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    message: 'This route is not yet implemented',
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).send({
    status: 'fail',
    message: 'This route is not yet implemented',
  });
};
