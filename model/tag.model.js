let db = require('../utils/db');
module.exports = {
    add: entity => {
        return db.add('tagskill', entity);
    },
    list: (offset, LIMIT) => {
        return db.load(`select * from tagskill limit ${LIMIT} offset ${offset} `);
    },
    singleById: (id) => {
        return db.load(`select * from tagskill where id='${id}'`);
    },
    update: entity => {
        db.update('tagskill', 'id', entity);
    },
    delete: id => {
        db.delete('tagskill', 'id', id);
    },
    countTotalPage: () => {
        return db.load(`select COUNT(*) as total from tagskill`)
    },
};
