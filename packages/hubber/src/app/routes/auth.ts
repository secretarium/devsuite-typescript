import { Router } from 'express';
// import passport from 'passport';
// import WebAuthnStrategy, { RegisteredFunction, SessionChallengeStore, VerifiedFunction } from 'passport-fido2-webauthn';
// import { PublicKeyCredential, User } from '../entities';
// // import base64url from 'base64url';
// // import { v4 as uuid } from 'uuid';
// // import db from '../../utils/db';

// const store = new SessionChallengeStore();

// passport.use(new WebAuthnStrategy(
//     { store: store },
//     (id: string, userHandle: Buffer, verified: VerifiedFunction) => {

//         PublicKeyCredential
//             .findOneBy({
//                 externalId: id
//             })
//             .then(publicKeyCredential => {
//                 if (!publicKeyCredential)
//                     return verified(null, false, { message: 'Invalid key. ' });
//                 const { publicKey, userId } = publicKeyCredential;
//                 return User.findOneBy({ id: userId })
//                     .then(user => {
//                         if (!user)
//                             return verified(null, false, { message: 'Invalid key. ' });
//                         const enc = new TextEncoder();
//                         if (Buffer.compare(enc.encode(user.handle), userHandle) != 0) {
//                             return verified(null, false, { message: 'Invalid key. ' });
//                         }
//                         return verified(null, user, publicKey);
//                     });
//             })
//             .catch(err => verified(err));

//     },
//     (user: any, id: string, publicKey: string, registered: RegisteredFunction) => {
//         User
//             .insert({
//                 username: user.name,
//                 name: user.displayName,
//                 handle: user.id
//             })
//             .then(() => {
//                 const newUser = {
//                     id: '',
//                     username: user.name,
//                     name: user.displayName
//                 };
//                 return PublicKeyCredential
//                     .insert({
//                         userId: newUser.id,
//                         externalId: id,
//                         publicKey
//                     })
//                     .then(() => registered(null, newUser));
//             })
//             .catch(err => registered(err));
//     }));

// // passport.serializeUser(function (user, cb) {
// //     process.nextTick(function () {
// //         cb(null, { id: user.id, username: user.username, name: user.name });
// //     });
// // });

// // passport.deserializeUser(function (user, cb) {
// //     process.nextTick(function () {
// //         return cb(null, user);
// //     });
// // });


const router = Router();

// router.get('/login', function (req, res, next) {
//     res.render('login');
// });

// router.post('/login/public-key', passport.authenticate('webauthn', {
//     failureMessage: true,
//     failWithError: true
// }), function (req, res, next) {
//     res.json({ ok: true, location: '/' });
// }, function (err, req, res, next) {
//     const cxx = Math.floor(err.status / 100);
//     if (cxx != 4) { return next(err); }
//     res.json({ ok: false, location: '/login' });
// });

// router.post('/login/public-key/challenge', function (req, res, next) {
//     store.challenge(req, function (err, challenge) {
//         if (err) { return next(err); }
//         res.json({ challenge: base64url.encode(challenge) });
//     });
// });

// router.post('/logout', function (req, res, next) {
//     req.logout(function (err) {
//         if (err) { return next(err); }
//         res.redirect('/');
//     });
// });

// router.get('/signup', function (req, res) {
//     res.render('signup');
// });

// router.post('/signup/public-key/challenge', function (req, res, next) {
//     let handle = Buffer.alloc(16);
//     handle = uuid({}, handle);
//     const user = {
//         id: handle,
//         name: req.body.username,
//         displayName: req.body.name
//     };
//     store.challenge(req, { user: user }, function (err, challenge) {
//         if (err) { return next(err); }
//         user.id = base64url.encode(user.id);
//         res.json({ user: user, challenge: base64url.encode(challenge) });
//     });
// });

module.exports = router;