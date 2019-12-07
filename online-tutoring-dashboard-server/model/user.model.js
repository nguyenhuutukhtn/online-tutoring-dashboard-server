let db = require('../utils/db');
module.exports = {
    add: entity => {
        return db.add("user", entity);
    },
    list: () => {
        return db.load('select * from user');
    },
    singleById: (id) => {
        return db.load(`select * from user where id=${id}`);
    },
};
