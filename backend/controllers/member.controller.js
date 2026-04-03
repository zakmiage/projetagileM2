const MemberService = require('../services/member.service');

exports.getAllMembers = async (req, res) => {
  try {
    const members = await MemberService.getAllMembers();
    res.status(200).json({ success: true, data: members });
  } catch (error) {
    console.error('Erreur getMembers:', error);
    res.status(500).json({ success: false, message: 'Erreur Serveur' });
  }
};

exports.getMember = async (req, res) => {
  try {
    const member = await MemberService.getMemberById(req.params.id);
    res.status(200).json({ success: true, data: member });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

exports.createMember = async (req, res) => {
  try {
    const newMember = await MemberService.createMember(req.body);
    res.status(201).json({ success: true, data: newMember });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const updatedMember = await MemberService.updateMember(req.params.id, req.body);
    res.status(200).json({ success: true, data: updatedMember });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    await MemberService.deleteMember(req.params.id);
    res.status(200).json({ success: true, message: 'Membre supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
