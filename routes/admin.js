var express = require('express');
var router = express.Router();
var userModel = require('../model/user.model');
var tagModel = require('../model/tag.model');
var policyModel = require('../model/policy.model');
var complainModel = require('../model/complain.model');
var messageModel = require('../model/Message');
var moment = require('moment');
const passport = require('passport');
const passportJWT = require("passport-jwt");
const jwt = require('jsonwebtoken');
const LIMIT = 10;

/* POST login. */
router.post('/login', function (req, res) {
    passport.authenticate('user-local', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: info.message,
            });
        }
        req.login(user, { session: false }, (err) => {
            if (err) {
                res.send(err);
            }
            //generate a signed son web token with the contents of user object and return it in the response
            const token = jwt.sign({ name: user[0].name, userId: user[0].id }, 'your_jwt_secret');
            return res.json({ name: user[0].name, userId: user[0].id, token });
        });
    })(req, res);
});

router.get('/listallUser', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
        let page = req.query.page - 1;
        if (!req.query.page || parseInt(req.query.page) === 0) {
            page = 0;
        }
        const offset = page * LIMIT;
        const listUser = await userModel.list(offset, LIMIT);
        const count = await userModel.countTotalPage();
        const totalPage = Math.ceil(count[0].total / LIMIT);
        res.status(200).json({ data: listUser, totalPage });
    } catch (err) {
        res.status(400).json({ error: err });
    }

});

router.get('/infoUser', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
        const idUser = req.query.id;
        const userData = await userModel.singleById(idUser);
        console.log('userData-----', userData);
        res.status(200).json({ data: userData });
    } catch (err) {
        res.status(400).json({ error: err });
    }

});

router.get('/listAllTag', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
        let page = req.query.page - 1;
        if (!req.query.page || parseInt(req.query.page) === 0) {
            page = 0;
        }
        const offset = page * LIMIT;
        const listTag = await tagModel.list(offset, LIMIT);
        const count = await tagModel.countTotalPage();
        const totalPage = Math.ceil(count[0].total / LIMIT);
        res.status(200).json({ data: listTag, totalPage });
    } catch (err) {
        res.status(400).json({ error: err });
    }

});

router.post('/updateTag', passport.authenticate('jwt', { session: false }), async function (req, res) {
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

router.post('/addNewTag', passport.authenticate('jwt', { session: false }), async function (req, res) {
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

router.post('/deleteTag', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
        await tagModel.delete(req.body.id);
        res.send('deleteTag');
        res.status(200).json({ message: 'detete Tag success' });
    } catch (err) {
        res.status(400).json({ error: err });
    }

});

router.get('/lockUser', passport.authenticate('jwt', { session: false }), async function (req, res) {
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

router.get('/unlockUser', passport.authenticate('jwt', { session: false }), async function (req, res) {
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

router.get('/listAllPolicy', passport.authenticate('jwt', { session: false }), async function (req, res) {
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

router.get('/policy', passport.authenticate('jwt', { session: false }), function (req, res) {
    const page = req.query.p || 1;

    let limit = 9;
    let offset = limit * (page - 1);
    let listPolicy = policyModel.findPolicy(limit, offset);
    let countPolicy = policyModel.countPolicy();
    Promise.all([countPolicy, listPolicy])
        .then(values => {
            return res.status(200).json({ count: values[0][0].count, data: values[1] });
        })
        .catch(err => {
            return res.status(500).json({ error: err })
        })
});

router.get('/policy/:policyId', passport.authenticate('jwt', { session: false }), function (req, res) {
    let policyId = req.params.policyId;
    policyModel.findPolicyByPolicyId(policyId)
        .then(policy => {
            if (policy.length === 0) {
                return res.status(400).json({ message: "Policy invalid" })
            }
            return res.status(200).json({ data: policy[0] })
        })
        .catch(err => {
            return res.status(500).json({ error: err.toString() });
        })
});

router.put('/updateStatusPolicy', passport.authenticate('jwt', { session: false }), async function (req, res) {
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
router.get('/listAllComplain', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
        let page = req.query.page - 1;
        if (!req.query.page || parseInt(req.query.page) === 0) {
            console.log('hahahah');
            page = 0;
        }
        const offset = page * LIMIT;
        const listComplain = await complainModel.list(offset, LIMIT);
        const count = await complainModel.countTotalPage();
        const totalPage = Math.ceil(count[0].total / LIMIT);
        res.status(200).json({ data: listComplain, totalPage });
    } catch (err) {
        res.status(400).json({ err: err });
    }
});

router.get('/getDetailComplain', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
        let idComplain = req.query.id;
        if (!idComplain) {
            res.status(400).json({ err: 'invalid Id' });
        }
        const complain = await complainModel.singleById(idComplain);
        const policyData = await policyModel.findPolicyByPolicyId(complain[0].id_policy);
        const allMessage = await messageModel.getAllMessageById(policyData[0].id_student, policyData[0].id_teacher);
        complain[0].policyData = policyData;
        complain[0].allMessage = allMessage;
        res.status(200).json({ data: complain });
    } catch (error) {
        res.status(400).json({ err: error });
    }
})

router.post('/solveComplain', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
        const complainId = req.body.id;
        const newStatus = req.body.newStatus;
        if (!newStatus || newStatus !== 'solved' && newStatus !== 'unsolved') {
            return res.status(400).json({ error: 'status not correct' });
        }
        const complain = await complainModel.singleById(complainId);
        if (!complain[0]) {
            return res.status(400).json({ error: 'can not find complain' });
        }
        complain[0].status = newStatus;
        complainModel.update(complain[0]);
        const policy = await policyModel.singleById(req.body.idPolicy);
        const policyUpdate = policy[0];
        if (req.body.action === 'complete') {
            policyUpdate.status = 'complete';
            const tutor = await userModel.singleById(req.body.idTutor);
            const tutorUpdate = tutor[0];
            tutorUpdate.balance += policyUpdate.price;
            userModel.update(tutorUpdate);
        }
        else {
            policyUpdate.status = 'cancel';
            const student = await userModel.singleById(req.body.idStudent);
            const studentUpdate = student[0];
            studentUpdate.balance += policyUpdate.price;
            userModel.update(studentUpdate);

        }
        policyModel.update(policyUpdate);
        res.status(200).json({ message: 'Solved complain success' });
    } catch (err) {
        console.log('err', err);
        res.status(400).json({ err: err });
    }
});

router.get('/getAllProfit', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
        const listPolicy = await policyModel.getByStatus('complete');

        const totalByDay = Array(32).fill(0);
        const totalByMonth = Array(13).fill(0);
        const totalByYear = Array(11).fill(0);
        listPolicy.forEach(element => {
            console.log('element.complete_day-----', element.complete_date);
            if (!element.complete_date) {
                return;
            }
            const dayFormat = moment(element.complete_date).format('DD/MM/YYYY');
            console.log('dayFormat----', dayFormat);
            const dayArray = dayFormat.split('/');
            console.log('dayArray--------', dayArray);
            totalByDay[parseInt(dayArray[0]) - 1] += element.price*1000;
            totalByMonth[parseInt(dayArray[1]) - 1] += element.price*1000;
            let year = parseInt(dayArray[2]);
            year = year%2010 - 1;
            totalByYear[year] += element.price*1000;
            // if (staticBy === 'day' && parseInt(dayCompare) === parseInt(dayArray[0])) {
            //     total += element.price;
            // } else if (staticBy === 'month' && parseInt(dayCompare) === parseInt(dayArray[1])) {
            //     total += element.price;
            // } else if (staticBy === 'year' && parseInt(dayCompare) === parseInt(dayArray[2])) {
            //     total += element.price;
            // }
        });

        res.status(200).json({ totalByDay, totalByMonth, totalByYear });
    } catch (err) {
        console.log('err-----', err);
        res.status(400).json({ error: err });
    }
});

router.get('/getTopProfitByTutor', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {

        const listPolicy = await policyModel.groupByTutor('complete');
        console.log('listPolicy---------', listPolicy);
        // listPolicy.forEach(element => {
        //     console.log('element.complete_day-----', element.complete_date);
        //     if (!element.complete_date) {
        //         return;
        //     }
        //     const dayFormat = moment(element.complete_date).format('DD/MM/YYYY');
        //     console.log('dayFormat----', dayFormat);
        //     const dayArray = dayFormat.split('/');
        //     console.log('dayArray--------', dayArray);


        // });
        res.status(200).json({ listTutor: listPolicy });
    } catch (err) {
        console.log('err-----', err);
        res.status(400).json({ error: err });
    }
});

router.get('/getTopProfitBySkill', async function (req, res) {
    try {
        const idSkill = req.query.idSkill ? parseInt(req.query.idSkill) : '';
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
