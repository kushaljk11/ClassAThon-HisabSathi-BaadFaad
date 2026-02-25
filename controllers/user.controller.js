import User from '../models/user.model.js';
import { sendResponse } from '../utils/response.js';

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }
    sendResponse(res, 200, true, 'User fetched successfully', { user });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, avatar, upiId, bankDetails } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (upiId) user.upiId = upiId;
    if (bankDetails) user.bankDetails = bankDetails;

    const updatedUser = await user.save();

    sendResponse(res, 200, true, 'User updated successfully', {
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        upiId: updatedUser.upiId,
        bankDetails: updatedUser.bankDetails,
      },
    });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    sendResponse(res, 200, true, 'Users fetched successfully', { users });
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    await user.deleteOne();
    sendResponse(res, 200, true, 'User deleted successfully');
  } catch (error) {
    sendResponse(res, 500, false, error.message);
  }
};
