var express = require('express');
var router = express.Router();
var userModel = require('../model/user.model');
var tagModel = require('../model/tag.model');

router.get('/listalluser', async function (req, res, next) {
    const listUser = await userModel.list();
    console.log('listUser-----', listUser);
    res.send('listalluser');
});

router.get('/infoUser', async function (req, res, next) {
    const idUser = req.query.id;
    const userData = await userModel.singleById(idUser);
    console.log('userData-----', userData);
    res.send('infoUser');
});

router.get('/listAllTag', async function (req, res, next) {
    const listTag = await tagModel.list();
    console.log('listTag--------', listTag);
    res.send('listAllTag');
});

router.post('/updateTag', async function (req, res, next) {
    console.log('req.body.id: ------', req.body.id);
    const tagData = await tagModel.singleById(req.body.id);
    console.log('tagDataBefore---------', tagData);
    tagData[0].name = req.body.name;
    await tagModel.update(tagData[0]);
    console.log('tagData---------', tagData);
    res.send('updateTag');
});

router.post('/addNewTag', async function (req, res, next) {
    const newTag = {
        name: req.body.name,
    };
    await tagModel.add(newTag);
    res.send('addNewTag');
});

router.post('/deleteTag', async function (req, res, next) {
    await tagModel.delete(req.body.id);
    res.send('deleteTag');
});
module.exports = router;
