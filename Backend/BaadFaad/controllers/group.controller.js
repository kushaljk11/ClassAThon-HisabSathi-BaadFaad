/**
 * @file controllers/group.controller.js
 * @description Group controller — CRUD operations for persistent expense-sharing
 * groups. Supports QR-based joining, member management, and soft-deactivation.
 */
import mongoose from 'mongoose';
import QRCode from 'qrcode';
import Group from '../models/group.model.js';

const QR_BASE_URL = process.env.QR_BASE_URL || 'https://myapp.com';

// Predefined set of group cover images
const GROUP_COVER_IMAGES = [
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1530062845289-9109b2c9c868?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&h=200&fit=crop',
];

const getRandomCoverImage = () => GROUP_COVER_IMAGES[Math.floor(Math.random() * GROUP_COVER_IMAGES.length)];

const sendError = (res, statusCode, message, details = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const formatMongooseError = (error) => {
  if (error?.code === 11000) {
    const duplicateField = Object.keys(error.keyPattern || {})[0] || 'field';
    return {
      statusCode: 409,
      message: `${duplicateField} already exists`,
    };
  }

  if (error?.name === 'ValidationError') {
    const details = Object.values(error.errors).map((validationError) => validationError.message);
    return {
      statusCode: 400,
      message: 'Validation failed',
      details,
    };
  }

  if (error?.name === 'CastError') {
    return {
      statusCode: 400,
      message: 'Invalid request data',
    };
  }

  return {
    statusCode: 500,
    message: 'Internal server error',
  };
};

/**
 * Generates a QR code as Base64 data URL.
 * @param {string} data - URL or text to encode in QR
 * @returns {Promise<string>} Base64 QR code string
 */
const generateQRCode = async (data) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
      width: 300,
    });
    return qrCodeDataURL;
  } catch (error) {
    throw new Error(`QR code generation failed: ${error.message}`);
  }
};

/**
 * Creates a new group with QR code generation.
 * POST /api/groups
 * Body: { name, description?, createdBy, members?, defaultCurrency? }
 */
export const createGroup = async (req, res) => {
  try {
    const { name, description, createdBy, members, defaultCurrency, splitId, sessionId } = req.body;

    if (!name || !createdBy) {
      return sendError(res, 400, 'name and createdBy are required');
    }

    if (!isValidObjectId(createdBy)) {
      return sendError(res, 400, 'Invalid createdBy userId');
    }

    // Validate members array if provided
    if (members && Array.isArray(members)) {
      for (const memberId of members) {
        if (!isValidObjectId(memberId)) {
          return sendError(res, 400, `Invalid member userId: ${memberId}`);
        }
      }
    }

    // Ensure creator is in members list
    const membersList = members && Array.isArray(members) ? [...new Set([createdBy, ...members])] : [createdBy];

    // Create group without QR first to get _id
    const group = await Group.create({
      name,
      description,
      createdBy,
      members: membersList,
      defaultCurrency,
      image: getRandomCoverImage(),
      splitId: splitId || null,
      sessionId: sessionId || null,
    });

    // Generate QR code with group ID
    const joinUrl = `${QR_BASE_URL}/join-group/${group._id}`;
    const qrCodeBase64 = await generateQRCode(joinUrl);

    // Update group with QR code
    group.qrCode = qrCodeBase64;
    await group.save();

    // Populate before returning
    await group.populate('createdBy', 'fullName email avatarUrl');
    await group.populate('members', 'fullName email avatarUrl');

    return res.status(201).json({
      success: true,
      message: 'Group created successfully with QR code',
      data: group.toJSON(),
    });
  } catch (error) {
    const formattedError = formatMongooseError(error);
    return sendError(res, formattedError.statusCode, formattedError.message, formattedError.details);
  }
};

/**
 * Returns all groups ordered by newest first.
 * GET /api/groups
 */
export const getGroups = async (req, res) => {
  try {
    // If createdBy query param is provided, only return groups created by that user (host-only view)
    const filter = {};
    if (req.query.createdBy && isValidObjectId(req.query.createdBy)) {
      filter.createdBy = req.query.createdBy;
    }

    const groups = await Group.find(filter)
      .populate('createdBy', 'fullName email avatarUrl')
      .populate('members', 'fullName email avatarUrl')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: groups.length,
      data: groups,
    });
  } catch (error) {
    const formattedError = formatMongooseError(error);
    return sendError(res, formattedError.statusCode, formattedError.message);
  }
};

/**
 * Returns one group by id with populated members.
 * GET /api/groups/:groupId
 */
export const getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!isValidObjectId(groupId)) {
      return sendError(res, 400, 'Invalid groupId');
    }

    const group = await Group.findById(groupId)
      .populate('createdBy', 'fullName email avatarUrl')
      .populate('members', 'fullName email avatarUrl')
      .lean();

    if (!group) {
      return sendError(res, 404, 'Group not found');
    }

    return res.status(200).json({
      success: true,
      data: group,
    });
  } catch (error) {
    const formattedError = formatMongooseError(error);
    return sendError(res, formattedError.statusCode, formattedError.message);
  }
};

/**
 * Updates group details (name, description, defaultCurrency).
 * PATCH /api/groups/:groupId
 */
export const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, defaultCurrency } = req.body;

    if (!isValidObjectId(groupId)) {
      return sendError(res, 400, 'Invalid groupId');
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (defaultCurrency !== undefined) updateData.defaultCurrency = defaultCurrency;

    if (Object.keys(updateData).length === 0) {
      return sendError(res, 400, 'No valid fields provided for update');
    }

    const group = await Group.findByIdAndUpdate(groupId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('createdBy', 'fullName email avatarUrl')
      .populate('members', 'fullName email avatarUrl')
      .lean();

    if (!group) {
      return sendError(res, 404, 'Group not found');
    }

    return res.status(200).json({
      success: true,
      message: 'Group updated successfully',
      data: group,
    });
  } catch (error) {
    const formattedError = formatMongooseError(error);
    return sendError(res, formattedError.statusCode, formattedError.message, formattedError.details);
  }
};

/**
 * Public endpoint for joining a group via QR code
 * POST /api/groups/:groupId/join
 * Body: { userId?, name?, email? }
 */
export const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId, name, email } = req.body;

    if (!isValidObjectId(groupId)) {
      return sendError(res, 400, 'Invalid groupId');
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return sendError(res, 404, 'Group not found');
    }

    if (!group.isActive) {
      return sendError(res, 400, 'Group is not active');
    }

    let memberIdToAdd = userId;

    // If no userId provided, check for name to create guest participant
    if (!userId && name) {
      // For guest users, we'll track them differently or skip for groups
      return sendError(res, 400, 'Guest participants not yet supported for groups. Please provide userId.');
    }

    if (!memberIdToAdd || !isValidObjectId(memberIdToAdd)) {
      return sendError(res, 400, 'Valid userId is required');
    }

    // Check if user is already a member
    if (group.members.includes(memberIdToAdd)) {
      await group.populate('createdBy', 'fullName email avatarUrl');
      await group.populate('members', 'fullName email avatarUrl');
      return res.status(200).json({
        success: true,
        message: 'Already a member of this group',
        data: group.toJSON(),
      });
    }

    group.members.push(memberIdToAdd);
    await group.save();

    await group.populate('createdBy', 'fullName email avatarUrl');
    await group.populate('members', 'fullName email avatarUrl');

    return res.status(200).json({
      success: true,
      message: 'Joined group successfully',
      data: group.toJSON(),
    });
  } catch (error) {
    const formattedError = formatMongooseError(error);
    return sendError(res, formattedError.statusCode, formattedError.message);
  }
};

/**
 * Adds a member to the group.
 * POST /api/groups/:groupId/members
 * Body: { userId }
 */
export const addMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    if (!isValidObjectId(groupId)) {
      return sendError(res, 400, 'Invalid groupId');
    }

    if (!userId || !isValidObjectId(userId)) {
      return sendError(res, 400, 'Valid userId is required');
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return sendError(res, 404, 'Group not found');
    }

    // Check if user is already a member
    if (group.members.includes(userId)) {
      return sendError(res, 409, 'User is already a member of this group');
    }

    group.members.push(userId);
    await group.save();

    await group.populate('createdBy', 'fullName email avatarUrl');
    await group.populate('members', 'fullName email avatarUrl');

    return res.status(200).json({
      success: true,
      message: 'Member added successfully',
      data: group.toJSON(),
    });
  } catch (error) {
    const formattedError = formatMongooseError(error);
    return sendError(res, formattedError.statusCode, formattedError.message);
  }
};

/**
 * Removes a member from the group.
 * DELETE /api/groups/:groupId/members/:userId
 */
export const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    if (!isValidObjectId(groupId)) {
      return sendError(res, 400, 'Invalid groupId');
    }

    if (!isValidObjectId(userId)) {
      return sendError(res, 400, 'Invalid userId');
    }

    const group = await Group.findById(groupId);

    if (!group) {
      return sendError(res, 404, 'Group not found');
    }

    // Cannot remove creator
    if (group.createdBy.toString() === userId) {
      return sendError(res, 403, 'Cannot remove group creator');
    }

    const memberIndex = group.members.indexOf(userId);
    if (memberIndex === -1) {
      return sendError(res, 404, 'User is not a member of this group');
    }

    group.members.splice(memberIndex, 1);
    await group.save();

    await group.populate('createdBy', 'fullName email avatarUrl');
    await group.populate('members', 'fullName email avatarUrl');

    return res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      data: group.toJSON(),
    });
  } catch (error) {
    const formattedError = formatMongooseError(error);
    return sendError(res, formattedError.statusCode, formattedError.message);
  }
};

/**
 * Soft-deactivates a group by setting isActive=false.
 * DELETE /api/groups/:groupId
 */
export const deactivateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!isValidObjectId(groupId)) {
      return sendError(res, 400, 'Invalid groupId');
    }

    const group = await Group.findByIdAndUpdate(
      groupId,
      { isActive: false },
      { new: true }
    )
      .populate('createdBy', 'fullName email avatarUrl')
      .populate('members', 'fullName email avatarUrl')
      .lean();

    if (!group) {
      return sendError(res, 404, 'Group not found');
    }

    return res.status(200).json({
      success: true,
      message: 'Group deactivated successfully',
      data: group,
    });
  } catch (error) {
    const formattedError = formatMongooseError(error);
    return sendError(res, formattedError.statusCode, formattedError.message);
  }
};
