import express from 'express';
import {
  addMember,
  createGroup,
  deactivateGroup,
  getGroupById,
  getGroups,
  removeMember,
  updateGroup,
} from '../controllers/group.controller.js';

const router = express.Router();

router.post('/', createGroup);
router.get('/', getGroups);
router.get('/:groupId', getGroupById);
router.patch('/:groupId', updateGroup);
router.post('/:groupId/members', addMember);
router.delete('/:groupId/members/:userId', removeMember);
router.delete('/:groupId', deactivateGroup);

export default router;
