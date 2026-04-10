const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const fileController = require('../controllers/fileController');

const uploadRoot = path.join(__dirname, '..', 'uploads');
const memberUploadRoot = path.join(uploadRoot, 'members');
const budgetUploadRoot = path.join(uploadRoot, 'budget');

[uploadRoot, memberUploadRoot, budgetUploadRoot].forEach((directoryPath) => {
	fs.mkdirSync(directoryPath, { recursive: true });
});

const buildStorage = (targetFolder) => multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, path.join(uploadRoot, targetFolder));
	},
	filename: (req, file, callback) => {
		const extension = path.extname(file.originalname);
		const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		callback(null, `${uniqueSuffix}${extension}`);
	}
});

const uploadMember = multer({ storage: buildStorage('members') });
const uploadBudget = multer({ storage: buildStorage('budget') });

router.get('/members/:id/attachments', fileController.getMemberAttachments);
router.post('/members/:id/attachments', uploadMember.single('file'), fileController.uploadMemberAttachment);
router.delete('/members/:id/attachments/:attachment_id', fileController.deleteMemberAttachment);
router.post('/budget/upload', uploadBudget.single('file'), fileController.uploadBudgetAttachment);
router.get('/budget/:budget_line_id/attachments', fileController.getBudgetAttachments);
router.delete('/budget/:budget_line_id/attachments/:attachment_id', fileController.deleteBudgetAttachment);

module.exports = router;