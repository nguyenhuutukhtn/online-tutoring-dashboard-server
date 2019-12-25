let db = require('../utils/db');
module.exports = {
    add: entity => {
        return db.add("complain", entity);
    },
    list: (offset, LIMIT) => {
        return db.load(`select *, complain.status as complain_status, complain.id as complain_id from complain inner join policy on complain.id_policy=policy.id inner join user on user.id=policy.id_student limit ${LIMIT} offset ${offset}`);
    },
    singleById: (id) => {
        return db.load(`select * from complain where id=${id}`);
    },
    update: entity => {
        db.update('complain', 'id', entity);
    },
    countTotalPage: () => {
        return db.load(`select COUNT(*) as total from complain`)
    },
};
