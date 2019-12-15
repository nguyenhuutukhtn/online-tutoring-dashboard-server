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
};
