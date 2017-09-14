"use strict";

const _ = require('lodash');
const jwt = require('jsonwebtoken');
const Q = require('q');
const fs = require('fs');

const users = require('./dao');
const log = require('../../common/logger');
const factory = require('../../../js/common/factory');
const cert = fs.readFileSync('./src/main/resources/secrets/signing.key');

let userTemplate = {

  reservations: [
    {
    id: Date.now(),
    userId: Date.now(),
    appId: Date.now(),
    gameId: Date.now(),
    reservedBalance: 100
  },
    {
    id: Date.now(),
    userId: Date.now(),
    appId: Date.now(),
    gameId: Date.now(),
    reservedBalance: 200
  }, {
    id: Date.now(),
    userId: Date.now(),
    appId: Date.now(),
    gameId: Date.now(),
    reservedBalance: 300
  }],

  apps: [
    {
      appId: Date.now(),
      appSecret: "string",
      name: "Name App",
      logo: "https://s3-eu-west-1.amazonaws.com/kobro.dev.avatar/Bazz-1501146656766.png",
      domen: "www.sudo.com",
      status: "enable"
    },
    {
      appId: Date.now(),
      appSecret: "string",
      name: "Name Application",
      logo: "https://s3-eu-west-1.amazonaws.com/kobro.dev.avatar/BettyAbro-1495705337834.png",
      domen: "www.sudo2.com",
      status: "enable"
    },
    {
      appId: Date.now(),
      appSecret: "string",
      name: "Name Application - 2",
      logo: "https://s3-eu-west-1.amazonaws.com/kobro.dev.avatar/Fbtest1-1504259702027.png",
      domen: "www.sudo2.com",
      status: "disable"
    },
    {
      appId: Date.now(),
      appSecret: "string",
      name: "Name App - 2",
      logo: "https://s3-eu-west-1.amazonaws.com/kobro.dev.avatar/Bazz-1501146656766.png",
      domen: "www.sudo.com",
      status: "enable"
    },

  ],
  transactions: [
    {
      id: Date.now(),
      userId: Date.now(),
      appId: Date.now(),
      description: "description",
      date: new Date(),
      balance: 200,
      type: "reserved"
    },
    {
      id: Date.now(),
      userId: Date.now(),
      appId: Date.now(),
      description: "description2",
      date: new Date(),
      balance: 300,
      type: "refunded"
    },
    {
      id: Date.now(),
      userId: Date.now(),
      appId: Date.now(),
      description: "description ..... description",
      date: new Date(),
      balance: 400,
      type: "reserved"
    }
  ]
};

/**
 * User route implementation
 * @module routes/user
 */
module.exports = {

  authorize: function (req, res, next) {

    let typeSocial = req.body.typeSocial;
    let token = req.body.token;

    if (!typeSocial) {
      res.send(401, "There isn't needless parameter: 'typeSocial' in request");
      return next();
    }

    let socialNetwork = factory.socialNetwork(typeSocial);
    if (!socialNetwork) {
      res.send(402, `We can't authorize such social network '${typeSocial}'`);
      return next();
    }

    return socialNetwork.authenticate(token)
      .then(user => {

        _.merge(user, userTemplate);
        res.send({
          user: user,
          jwt: jwt.sign({user: user}, cert, {algorithm: 'RS256'}),
        });
      })
      .catch((err) => {
        log.error(err);
        res.send(400, err);
      })
      .done(next);
  },

  getCurrentUser: function (req, res, next) {

    res.send(200, userTemplate);
    return next();
  }
};