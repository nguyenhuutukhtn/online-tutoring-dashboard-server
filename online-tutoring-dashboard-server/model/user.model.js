let db = require('../utils/db');
module.exports = {
    add: entity => {
        return db.add("user", entity);
    },
    list: (offset, LIMIT) => {
        return db.load(`select * from user limit ${LIMIT} offset ${offset}`);
    },
    singleById: (id) => {
        return db.load(`select * from user where id=${id}`);
    },
    update: entity => {
        db.update('user', 'id', entity);
    },
};
