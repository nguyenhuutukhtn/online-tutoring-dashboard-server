const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const UserModel = require('./model/user.model')
const bcrypt = require('bcrypt');

passport.use('user-local', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
},
    function (username, password, cb) {
        //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT
        console.log('username----------', username);
        console.log('password----------', password);
        return UserModel.getbyUsername(username)
            .then(user => {
                console.log('user---', user);
                if (user.length === 0) {
                    return cb(null, false, { message: 'Incorrect email.' });
                }
                let ret = bcrypt.compareSync(password, user[0].password);

                if (ret) {
                    return cb(null, user, { message: 'Logged In Successfully' });
                }
                return cb(null, false, { message: 'Incorrect password.' });
            })
            .catch(err => cb(err));
    }
));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
},
    function (jwtPayload, cb) {
        //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
        return UserModel.singleById(jwtPayload.userId)
            .then(user => {
                //console.log('-----user', user);
                return cb(null, user);
            })
            .catch(err => {
                return cb(err);
            });
    }
));
