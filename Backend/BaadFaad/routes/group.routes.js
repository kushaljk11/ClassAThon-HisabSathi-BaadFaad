/**
 * @fileoverview Group Management Routes
 * @description Express router for persistent expense-sharing group CRUD operations.
 *              Groups allow users to organize recurring bill-splitting circles.
 *
 * Routes:
 *  POST   /                          - Create a new group
 *  GET    /                          - List all groups
 *  GET    /:groupId                  - Get group by ID
 *  PATCH  /:groupId                  - Update group details
 *  POST   /:groupId/join             - Join a group via QR code / invite link
 *  POST   /:groupId/members          - Add a member to a group
 *  DELETE /:groupId/members/:userId  - Remove a member from a group
 *  DELETE /:groupId                  - Deactivate (soft-delete) a group
 *
 * @module routes/group.routes
 */
import express from 'express';
import {
  addMember,
  createGroup,
  deactivateGroup,
  getGroupById,
  getGroups,
  joinGroup,
  removeMember,
  updateGroup,
} from '../controllers/group.controller.js';

const router = express.Router();

router.post('/', createGroup);
router.get('/', getGroups);
router.get('/:groupId', getGroupById);
router.patch('/:groupId', updateGroup);
router.post('/:groupId/join', joinGroup); // Public endpoint for QR code scanning
router.post('/:groupId/members', addMember);
router.delete('/:groupId/members/:userId', removeMember);
router.delete('/:groupId', deactivateGroup);

export default router;
