var express = require('express');
var router = express.Router();
var userModel = require('../model/user.model');
var tagModel = require('../model/tag.model');
var policyModel = require('../model/policy.model');
var complainModel = require('../model/complain.model');
var moment = require('moment');
const passport = require('passport');
const passportJWT = require("passport-jwt");
const ExtractJWT = passportJWT.ExtractJwt;
const bcrypt = require('bcrypt');
const LIMIT = 10;

router.post('/loginFB', function (req, res) {
    passport.authenticate('user-facebook', { session: false }, (err, user) => {
      if (err || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user,
        });
      }
      req.login(user, { session: false }, (err) => {
        if (err) {
          res.send(err);
        }
        //generate a signed son web token with the contents of user object and return it in the response
        const token = jwt.sign({ name: user[0].name, userId: user[0].id, role: user[0].role }, 'your_jwt_secret');
        return res.json({ name: user[0].name, userId: user[0].id, role: user[0].role, token });
      });
    })(req, res);
  });

router.get('/listallUser', async function (req, res) {
    try {
        let page = req.query.page - 1;
        if (!req.query.page || parseInt(req.query.page) === 0) {
            console.log('hahahah');
            page = 0;
        }
        const offset = page * LIMIT;
        const listUser = await userModel.list(offset, LIMIT);
        console.log('listUser-----', listUser);
        res.status(200).json({ data: listUser });
    } catch (err) {
        res.status(400).json({ error: err });
    }

});

router.get('/infoUser', async function (req, res) {
    try {
        const idUser = req.query.id;
        const userData = await userModel.singleById(idUser);
        console.log('userData-----', userData);
        res.status(200).json({ data: userData });
    } catch (err) {
        res.status(400).json({ error: err });
    }

});

router.get('/listAllTag', async function (req, res) {
    try {
        const listTag = await tagModel.list();
        console.log('listTag--------', listTag);
        res.status(200).json({ data: listTag });
    } catch (err) {
        res.status(400).json({ error: err });
    }

});

router.post('/updateTag', async function (req, res) {
    try {
        console.log('req.body.id: ------', req.body.id);
        const tagData = await tagModel.singleById(req.body.id);
        console.log('tagDataBefore---------', tagData);
        tagData[0].name = req.body.name;
        await tagModel.update(tagData[0]);
        console.log('tagData---------', tagData);
        res.status(200).json({ message: 'update tag success' });
    } catch (err) {
        res.status(400).json({ error: err });
    }

});

router.post('/addNewTag', async function (req, res) {
    try {
        const newTag = {
            name: req.body.name,
        };
        await tagModel.add(newTag);
        res.status(200).json({ message: 'Add new tag success' });
    } catch (err) {
        res.status(400).json({ error: err });
    }

});

router.post('/deleteTag', async function (req, res) {
    try {
        await tagModel.delete(req.body.id);
        res.send('deleteTag');
        res.status(200).json({ message: 'detete Tag success' });
    } catch (err) {
        res.status(400).json({ error: err });
    }

});

router.get('/lockUser', async function (req, res) {
    try {
        const idUser = req.query.id;
        const userData = await userModel.singleById(idUser);
        console.log('userData-------', userData);
        userData[0].active = 'no';
        userModel.update(userData[0]);
        res.status(200).json({ message: 'Lock user success' });
    } catch (err) {
        res.status(400).json({ error: err });
    }
});

router.get('/unlockUser', async function (req, res) {
    try {
        const idUser = req.query.id;
        const userData = await userModel.singleById(idUser);
        console.log('userData-------', userData);
        userData[0].active = 'yes';
        userModel.update(userData[0]);
        res.status(200).json({ message: 'Unlock user success' });
    } catch (err) {
        res.status(400).json({ error: err });
    }
});

router.get('/listAllPolicy', async function (req, res) {
    try {
        console.log('req.query.page---', req.query.page);
        let page = req.query.page - 1;
        if (!req.query.page || parseInt(req.query.page) === 0) {
            console.log('hahahah');
            page = 0;
        }
        const offset = page * LIMIT;
        const listPolicy = await policyModel.list(offset, LIMIT);
        res.status(200).json({ data: listPolicy });
    } catch (err) {
        res.status(400).json({ err: err });
    }
});

router.put('/updateStatusPolicy', async function (req, res) {
    try {
        const policyId = req.body.id;
        const newStatus = req.body.status;
        const policy = await policyModel.singleById(policyId);
        policy[0].status = newStatus;
        await policyModel.update(policy[0])
        res.status(200).json({ message: 'Update status success!' });
    } catch (err) {
        res.status(400).json({ error: err });
    }
});
router.get('/listAllComplain', async function (req, res) {
    try {
        let page = req.query.page - 1;
        if (!req.query.page || parseInt(req.query.page) === 0) {
            console.log('hahahah');
            page = 0;
        }
        const offset = page * LIMIT;
        const listComplain = await complainModel.list(offset, LIMIT);
        res.status(200).json({ data: listComplain });
    } catch (err) {
        res.status(400).json({ err: err });
    }
});

router.get('/solveComplain', async function (req, res) {
    try {
        const complainId = req.query.id;
        const newStatus = req.query.status;
        if (!newStatus || newStatus !== 'solved' || newStatus !== 'unsolved') {
            return res.status(400).json({ error: 'status not correct' });
        }
        const complain = complainModel.singleById(complainId);
        if (!complain[0]) {
            return res.status(400).json({ error: 'can not find complain' });
        }
        complain[0].status = newStatus;
        complainModel.update(complain[0]);
        res.status(200).json({ message: 'Solved complain success' });
    } catch (err) {
        console.log('err', err);
        res.status(400).json({ err: err });
    }
});

router.get('/getAllProfit', async function (req, res) {
    try {
        const listPolicy = await policyModel.getByStatus('complete');
        console.log('listPolicy------', listPolicy);
        const staticBy = req.query.staticBy;
        const dayCompare = req.query.dayCompare;
        let total = 0;
        listPolicy.forEach(element => {
            console.log('element.complete_day-----', element.complete_date);
            if (!element.complete_date) {
                return;
            }
            const dayFormat = moment(element.complete_date).format('DD/MM/YYYY');
            console.log('dayFormat----', dayFormat);
            const dayArray = dayFormat.split('/');
            console.log('dayArray--------', dayArray);

            if (staticBy === 'day' && parseInt(dayCompare) === parseInt(dayArray[0])) {
                total += element.price;
            } else if (staticBy === 'month' && parseInt(dayCompare) === parseInt(dayArray[1])) {
                total += element.price;
            } else if (staticBy === 'year' && parseInt(dayCompare) === parseInt(dayArray[2])) {
                total += element.price;
            }
        });
        res.status(200).json({ data: total });
    } catch (err) {
        console.log('err-----', err);
        res.status(400).json({ error: err });
    }
});

router.get('/getTopProfitByTutor', async function (req, res) {
    try {
        const idTutor = req.query.idTutor;
        const listPolicy = await policyModel.getByTutor(idTutor);
        console.log('listPolicy---------', listPolicy);
        const staticBy = req.query.staticBy;
        const dayCompare = req.query.dayCompare;
        let total = 0;
        listPolicy.forEach(element => {
            console.log('element.complete_day-----', element.complete_date);
            if (!element.complete_date) {
                return;
            }
            const dayFormat = moment(element.complete_date).format('DD/MM/YYYY');
            console.log('dayFormat----', dayFormat);
            const dayArray = dayFormat.split('/');
            console.log('dayArray--------', dayArray);

            if (staticBy === 'day' && parseInt(dayCompare) === parseInt(dayArray[0])) {
                total += element.price;
            } else if (staticBy === 'month' && parseInt(dayCompare) === parseInt(dayArray[1])) {
                total += element.price;
            } else if (staticBy === 'year' && parseInt(dayCompare) === parseInt(dayArray[2])) {
                total += element.price;
            }
        });
        res.status(200).json({ data: total });
    } catch (err) {
        console.log('err-----', err);
        res.status(400).json({ error: err });
    }
});

router.get('/getTopProfitBySkill', async function (req, res) {
    try {
        const idSkill =  req.query.idSkill ? parseInt(req.query.idSkill) : '';
        console.log('idSkill------', idSkill);
        const listPolicy = await policyModel.getBySkill(idSkill);
        console.log('listPolicy---------', listPolicy);
        const staticBy = req.query.staticBy;
        const dayCompare = req.query.dayCompare;
        let total = 0;
        listPolicy.forEach(element => {
            console.log('element.complete_day-----', element.complete_date);
            if (!element.complete_date) {
                return;
            }
            const dayFormat = moment(element.complete_date).format('DD/MM/YYYY');
            console.log('dayFormat----', dayFormat);
            const dayArray = dayFormat.split('/');
            console.log('dayArray--------', dayArray);

            if (staticBy === 'day' && parseInt(dayCompare) === parseInt(dayArray[0])) {
                total += element.price;
            } else if (staticBy === 'month' && parseInt(dayCompare) === parseInt(dayArray[1])) {
                total += element.price;
            } else if (staticBy === 'year' && parseInt(dayCompare) === parseInt(dayArray[2])) {
                total += element.price;
            }
        });
        res.status(200).json({ data: total });
    } catch (err) {
        console.log('err-----', err);
        res.status(400).json({ error: err });
    }
});
module.exports = router;
