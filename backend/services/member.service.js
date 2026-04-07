const Member = require('../models/member.model');

class MemberService {
  static async getAllMembers() {
    return await Member.findAll();
  }

  static async getMemberById(id) {
    if (!id) throw new Error('ID manquant');
    const member = await Member.findById(id);
    if (!member) throw new Error('Membre non trouvé');
    return member;
  }

  static async createMember(data) {
    if (!data.first_name || !data.last_name || !data.email) {
      throw new Error('Les champs Nom, Prénom et Email sont obligatoires');
    }
    return await Member.create(data);
  }

  static async updateMember(id, data) {
    if (!id) throw new Error('ID manquant');
    await Member.update(id, data);
    return { id, ...data };
  }

  static async deleteMember(id) {
    return await Member.delete(id);
  }
}

module.exports = MemberService;
