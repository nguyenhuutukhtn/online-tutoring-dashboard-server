let db = require('../utils/db');
module.exports = {
    add: entity => {
        return db.add("complain", entity);
    },
    list: (offset, LIMIT) => {
        return db.load(`select * from complain limit ${LIMIT} offset ${offset}`);
    },
    singleById: (id) => {
        return db.load(`select * from complain where id=${id}`);
    },
    update: entity => {
        db.update('complain', 'id', entity);
    },
};
