let db = require('../utils/db');
module.exports = {
    add: entity => {
        return db.add("policy", entity);
    },
    list: (offset, LIMIT) => {
        return db.load(`select * from policy limit ${LIMIT} offset ${offset}`);
    },
    singleById: (id) => {
        return db.load(`select * from policy where id=${id}`);
    },
    update: entity => {
        db.update('policy', 'id', entity);
    },
    getByStatus: (status) => {
        return db.load(`select * from policy where status='${status}'`)
    },
    getByTutor: (idTutor) => {
        return db.load(`select * from policy where status='complete' and id_teacher=${idTutor}`)
    },
    getBySkill: (idSkill) => {
        return db.load(`SELECT * FROM policy WHERE status='complete' and id_teacher in ( SELECT id_teacher from tag_tutor WHERE id_tag='${idSkill}')`)
    },
    findPolicy: (limit, offset) => {
        let sql = `select P.id, P.status, P.register_date,P.price, P.hours_hire,P.payment_status, U.name, U.avatar as tutor_avatar
        from policy P join user U on P.id_teacher = U.id
         ORDER BY register_date desc `;
        if (limit !== 0) {
            sql = sql + ` limit ${limit}`
        }
        if (offset !== 0) {
            sql = sql + ` offset ${offset}`
        }
        console.log('----poli', sql);
        return db.load(sql);
    },
    countPolicy: () => {
        let sql = `select count(*) as count
        from policy P join user U on P.id_teacher = U.id
        `;
        console.log('----poli', sql);
        return db.load(sql);
    },
    findPolicyByPolicyId: (id) => {
        let sql = `select P.*,U1.name as student_name, U2.name as tutor_name, U1.address as student_address, U2.address as tutor_address, U1.avatar as student_avatar, U2.avatar as tutor_avatar
        from policy P join user U1 on P.id_student = U1.id join user U2 on P.id_teacher = U2.id
        where P.id = ${id}`;
        return db.load(sql);
    },
};
