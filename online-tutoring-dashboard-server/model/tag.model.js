let db = require('../utils/db');
module.exports = {
    add: entity => {
        return db.add('tagskill', entity);
    },
    list: () => {
        return db.load('select * from tagskill');
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
};
