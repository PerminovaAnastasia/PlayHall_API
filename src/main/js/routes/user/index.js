"use strict";

const _ = require('lodash');
const jwt = require('jsonwebtoken');
const Q = require('q');
const fs = require('fs');

const users = require('./dao');
const log = require('../../common/logger');
const factory = require('../../../js/common/factory');
const cert = fs.readFileSync('./src/main/resources/secrets/signing.key');


/**
 * User route implementation
 * @module routes/user
 */
module.exports = {

  authenticate: function (req, res, next) {

    let body = req.body;
    let userAppInfo = {
      lang: body.lang,
      codeCountry: body.codeCountry,
      androidId: body.androidId,
      iosId: body.iosId
    };

    if (!isAllParamsExists(userAppInfo)) {
      res.send(401, "There isn't any needless params from requests");
      return next();
    }

    let socialNetwork = factory.socialNetwork(body.typeSocial);
    if (!socialNetwork) {
      res.send(404, "Invalid query");
      return next();
    }

    return socialNetwork.authenticate(body.token)
      .then(user => {
        user.appInfo = userAppInfo;
        return Q.all([createOrUpdateUser(user), socialNetwork.getFriends(user.auth)]);
      })
      .then(userAndFriends => {
        let user = userAndFriends[0];
        user.friends[userAndFriends[1].type] = userAndFriends[1].data;
        req.userAdapter.userData.user = changeForAdapter(user, userAppInfo);
        return daoUser.save(user)
          .then(() => {
            res.send({
              nickname: user.nickname,
              isChangeNickname: user.isChangeNickname,
              jwt: jwt.sign(req.userAdapter.userData, cert, {algorithm: 'RS256'}),
            });
          });
      })
      .catch((err) => {
        log.error(err);
        if (err.message === 'Profanity not allowed') {
          res.send(400, err);
        } else {
          res.send(400, "Invalid OAuth access token");
        }

        return next();
      })
      .done();
  },


    // getFriends: (req, res, next) => {
    //
    //   loggerAws.info("--------------------Memory(USER, BEGIN GET /user/friends)----------------");
    //   loggerAws.info(convertTOMB(process.memoryUsage()));
    //
    //     let adapterUser = req.userAdapter.userData.user;
    //     let type = req.query.type;
    //
    //     return daoUser.get({nickname: adapterUser.nickname})
    //         .then(user => {
    //
    //             if (!user.nickname) {
    //                 res.send(404, `User with ${adapterUser.nickname} not found.`);
    //                 return;
    //             }
    //
    //             if (!user.friends[type]) {
    //                 res.send(400, "Invalid type of friend");
    //                 return;
    //             }
    //
    //            return self.refreshFriends(user, type, adapterUser.auth)
    //             .then(userFriends => {
    //
    //               user.friends[type] = userFriends;
    //               daoUser.save(user);
    //
    //               res.send(200, userFriends);
    //               loggerAws.info(convertTOMB(process.memoryUsage()));
    //               loggerAws.info("--------------------Memory(USER, END GET /user/friends), 200----------------");
    //
    //             });
    //         })
    //       .catch(err => {
    //         log.error(err);
    //         res.send(401, err);
    //
    //         loggerAws.info(convertTOMB(process.memoryUsage()));
    //         loggerAws.info("--------------------Memory(USER, END GET /user/friends, 401)----------------");
    //       })
    //         .done(next);
    // },



  // deleteFriend: function (req, res, next) {
  //
  //   loggerAws.info("--------------------Memory(USER, BEGIN DEL /user/friend/:nickname)----------------");
  //   loggerAws.info(convertTOMB(process.memoryUsage()));
  //   let nickname = req.userAdapter.userData.user.nickname;
  //   let friendNickname = req.params.nickname;
  //
  //   return Q.all([daoUser.get({nickname: nickname}), daoUser.get({nickname: friendNickname})])
  //     .then(users => {
  //
  //       let currentUser = users[0];
  //       let friendUser = users[1];
  //
  //       if (!currentUser.nickname || !friendUser.nickname) {
  //         let notExistNickname = currentUser.nickname ? friendNickname : nickname;
  //         return res.send(400, `The user ${notExistNickname} doesn't exist in DB`);
  //       }
  //
  //       if(!_.some(currentUser.friends.game, item => item.nickname === friendNickname) ||
  //           !_.some(friendUser.friends.game, item => item.nickname === nickname)){
  //         return res.send(404, "Not founded friend");
  //       }
  //
  //       currentUser.friends.game = currentUser.friends.game.filter(item => item.nickname !== friendNickname);
  //       friendUser.friends.game = friendUser.friends.game.filter(item => item.nickname !== nickname);
  //
  //       return daoUser.saveAll([currentUser, friendUser])
  //         .then(() => {
  //           loggerAws.info(convertTOMB(process.memoryUsage()));
  //           loggerAws.info("--------------------Memory(USER, END DEL /user/friend/:nickname)----------------");
  //           return res.send(200);
  //         });
  //     })
  //     .catch((err) => {
  //       log.error(err);
  //       res.send(403, err);
  //       loggerAws.info("--------------------Memory(USER, END DEL /user/friend/:nickname, 403)----------------");
  //     })
  //     .done(next);
  // },

  // addFriend: function (req, res) {
  //   loggerAws.info("--------------------Memory(USER, BEGIN POST /user/friend/:nickname)----------------");
  //   loggerAws.info(convertTOMB(process.memoryUsage()));
  //   let currentNickname = req.userAdapter.userData.user.nickname;
  //   let friendNickname = req.params.nickname;
  //
  //   Q.all([
  //     daoUser.get({nickname: currentNickname}),
  //     daoUser.get({nickname: friendNickname})
  //   ]).then(usersDB => {
  //     let currentUser = usersDB[0];
  //     let friendUser = usersDB[1];
  //
  //     if (!currentUser.nickname || !friendUser.nickname) {
  //       let nickname = currentUser.nickname ? friendNickname : currentNickname;
  //       return res.send(400, `User with ${nickname} doesn't exist in DB`);
  //     }
  //
  //     friendUser.friends.game = _.unionBy(friendUser.friends.game, [getBaseInfo(currentUser)], 'nickname');
  //     currentUser.friends.game = _.unionBy(currentUser.friends.game, [getBaseInfo(friendUser)], 'nickname');
  //     currentUser = new LogicUser(currentUser).removeUserFromInvitations('invitedBy', friendUser.nickname);
  //     friendUser = new LogicUser(friendUser).removeUserFromInvitations('inviting', currentUser.nickname);
  //
  //     return daoUser.saveAll([currentUser, friendUser])
  //       .then(() => {
  //         loggerAws.info(convertTOMB(process.memoryUsage()));
  //         loggerAws.info("--------------------Memory(USER, END POST /user/friend/:nickname, 200)----------------");
  //         return res.send(200, currentUser.friends.game);
  //       });
  //   }).catch((err) => {
  //     log.error(err);
  //
  //     loggerAws.info(convertTOMB(process.memoryUsage()));
  //     loggerAws.info("--------------------Memory(USER, END POST /user/friend/:nickname, 401)----------------");
  //     res.send(401, "Invalid param");
  //   });
  // },


};