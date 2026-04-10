const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const normalizeAttachment = (row) => ({
    id: row.id,
    member_id: row.member_id,
    document_type: row.document_type ?? null,
    file_name: row.file_name,
    file_path: row.file_path,
    uploaded_at: row.uploaded_at
});

const normalizeBudgetAttachment = (row) => ({
    id: row.id,
    budget_line_id: row.budget_line_id,
    file_name: row.file_name,
    file_path: row.file_path,
    uploaded_at: row.uploaded_at
});

const parsePositiveInt = (value) => {
    const parsedValue = Number.parseInt(value, 10);
    return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
};

const getStoredFilePath = (folder, fileName) => `uploads/${folder}/${fileName}`;

const removeStoredFile = (storedFilePath) => {
    if (!storedFilePath) {
        return;
    }

    const absolutePath = path.resolve(__dirname, '..', storedFilePath);
    if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
    }
};

const insertMemberAttachment = async ({ memberId, documentType, fileName, filePath }) => {
    const sql = `
        INSERT INTO member_attachments (member_id, document_type, file_name, file_path)
        VALUES (?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [memberId, documentType, fileName, filePath]);
    return result.insertId;
};

const insertBudgetAttachment = async ({ budgetLineId, fileName, filePath }) => {
    const sql = `
        INSERT INTO budget_attachments (budget_line_id, file_name, file_path)
        VALUES (?, ?, ?)
    `;

    const [result] = await db.execute(sql, [budgetLineId, fileName, filePath]);
    return result.insertId;
};

exports.getMemberAttachments = async (req, res) => {
    try {
        const memberId = parsePositiveInt(req.params.id);

        if (!memberId) {
            return res.status(400).json({
                message: 'Identifiant de membre invalide.'
            });
        }

        const [rows] = await db.execute(
            `
                SELECT id, member_id, document_type, file_name, file_path, uploaded_at
                FROM member_attachments
                WHERE member_id = ?
                ORDER BY uploaded_at DESC, id DESC
            `,
            [memberId]
        );

        return res.status(200).json({
            message: 'Documents du membre récupérés avec succès.',
            attachments: rows.map(normalizeAttachment)
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erreur serveur lors de la récupération des documents du membre.',
            error: error.message
        });
    }
};

exports.uploadMemberAttachment = async (req, res) => {
    try {
        const memberId = parsePositiveInt(req.params.id ?? req.body.member_id);
        const documentType = req.body.document_type || null;

        if (!memberId || !req.file) {
            return res.status(400).json({
                message: 'Les champs member_id et file sont requis.'
            });
        }

        if (!documentType) {
            return res.status(400).json({
                message: 'Le champ document_type est requis.'
            });
        }

        const fileName = req.file.originalname;
        const filePath = getStoredFilePath('members', req.file.filename);
        const insertedId = await insertMemberAttachment({
            memberId,
            documentType,
            fileName,
            filePath
        });

        return res.status(201).json({
            message: 'Document du membre enregistré avec succès.',
            attachment: {
                id: insertedId,
                member_id: memberId,
                document_type: documentType,
                file_name: fileName,
                file_path: filePath
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erreur serveur lors de l’enregistrement du document du membre.',
            error: error.message
        });
    }
};

exports.uploadBudgetAttachment = async (req, res) => {
    try {
        const budgetLineId = parsePositiveInt(req.body.budget_line_id);
        const documentType = req.body.document_type || null;

        if (!budgetLineId || !req.file) {
            return res.status(400).json({
                message: 'Les champs budget_line_id et file sont requis.'
            });
        }

        const fileName = req.file.originalname;
        const filePath = getStoredFilePath('budget', req.file.filename);
        const insertedId = await insertBudgetAttachment({
            budgetLineId,
            fileName,
            filePath
        });

        return res.status(201).json({
            message: 'Document budgétaire enregistré avec succès.',
            attachment: {
                id: insertedId,
                budget_line_id: budgetLineId,
                document_type: documentType,
                file_name: fileName,
                file_path: filePath
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erreur serveur lors de l’enregistrement du document budgétaire.',
            error: error.message
        });
    }
};

exports.getBudgetAttachments = async (req, res) => {
    try {
        const budgetLineId = parsePositiveInt(req.params.budget_line_id);

        if (!budgetLineId) {
            return res.status(400).json({
                message: 'Identifiant de ligne budgétaire invalide.'
            });
        }

        const [rows] = await db.execute(
            `
                SELECT id, budget_line_id, file_name, file_path, uploaded_at
                FROM budget_attachments
                WHERE budget_line_id = ?
                ORDER BY uploaded_at DESC, id DESC
            `,
            [budgetLineId]
        );

        return res.status(200).json({
            message: 'Documents de la ligne budgétaire récupérés avec succès.',
            attachments: rows.map(normalizeBudgetAttachment)
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erreur serveur lors de la récupération des documents budgétaires.',
            error: error.message
        });
    }
};

exports.deleteMemberAttachment = async (req, res) => {
    try {
        const memberId = parsePositiveInt(req.params.id);
        const attachmentId = parsePositiveInt(req.params.attachment_id);

        if (!memberId || !attachmentId) {
            return res.status(400).json({
                message: 'Identifiants de membre ou de pièce jointe invalides.'
            });
        }

        const [rows] = await db.execute(
            `
                SELECT id, file_path
                FROM member_attachments
                WHERE id = ? AND member_id = ?
                LIMIT 1
            `,
            [attachmentId, memberId]
        );

        const attachment = rows[0];

        if (!attachment) {
            return res.status(404).json({
                message: 'Pièce jointe introuvable pour ce membre.'
            });
        }

        await db.execute(
            'DELETE FROM member_attachments WHERE id = ? AND member_id = ?',
            [attachmentId, memberId]
        );

        try {
            removeStoredFile(attachment.file_path);
        } catch (fileError) {
            // If DB deletion succeeded but file cleanup failed, keep API success and log.
            console.error('Suppression du fichier physique échouée:', fileError.message);
        }

        return res.status(200).json({
            message: 'Pièce jointe supprimée avec succès.'
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erreur serveur lors de la suppression de la pièce jointe.',
            error: error.message
        });
    }
};

exports.deleteBudgetAttachment = async (req, res) => {
    try {
        const budgetLineId = parsePositiveInt(req.params.budget_line_id);
        const attachmentId = parsePositiveInt(req.params.attachment_id);

        if (!budgetLineId || !attachmentId) {
            return res.status(400).json({
                message: 'Identifiants de ligne budgétaire ou de pièce jointe invalides.'
            });
        }

        const [rows] = await db.execute(
            `
                SELECT id, file_path
                FROM budget_attachments
                WHERE id = ? AND budget_line_id = ?
                LIMIT 1
            `,
            [attachmentId, budgetLineId]
        );

        const attachment = rows[0];

        if (!attachment) {
            return res.status(404).json({
                message: 'Pièce jointe introuvable pour cette ligne budgétaire.'
            });
        }

        await db.execute(
            'DELETE FROM budget_attachments WHERE id = ? AND budget_line_id = ?',
            [attachmentId, budgetLineId]
        );

        try {
            removeStoredFile(attachment.file_path);
        } catch (fileError) {
            console.error('Suppression du fichier budget échouée:', fileError.message);
        }

        return res.status(200).json({
            message: 'Justificatif budgétaire supprimé avec succès.'
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Erreur serveur lors de la suppression du justificatif budgétaire.',
            error: error.message
        });
    }
};