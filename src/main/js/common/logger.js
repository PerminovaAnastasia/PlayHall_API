'use strict';

/**
 * Bunyan logger implementation
 * @module logger
 */

const bunyan          = require('bunyan'),
      BunyanSlack     = require('bunyan-slack'),
      _               = require('lodash'),
      loggerConfig    = require('config').get("logger"),
      restifyErrors   = require('restify-errors'),
      packageJson     = require('../../../../package.json');
const PrettyStream = require('bunyan-prettystream');

var prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);

// create the base logger configuration
let loggerOpts = {
  name: packageJson.name,
  src: true,

  serializers: {
    req: function (req) {
      return {
        method: req.method,
        url: req.url,
        headers: req.headers
      };
    },
    res: bunyan.stdSerializers.res,
    err: restifyErrors.bunyanSerializer
  },

  streams: [{
      level: "debug",
      stream: prettyStdOut
    },
    {
      level: "trace",
      type: 'rotating-file',
      path: packageJson.name + '-' + packageJson.version + '.log',
      period: '1d',   // daily rotation
      count: 3        // keep 3 back copies
    }
  ]
};

if (loggerConfig.slack) {


  loggerConfig.slack.customFormatter = function(record){
    let req = record.req;
    let time = _.reduce(req.timers, (sum, v) => sum + v, 0) / 1000000.0;
    let message = req.method + " " +  req.headers.host + req.url;

    /*jshint -W106*/
    return {

      "attachments": [
        {
          //"color": "#ff0000",
          "fallback": message,
          "title": message,
          "title_url": req.headers.host + req.url,
          "author_name": req.user && req.user.nickname,
          "author_icon": req.user && req.user.avatar,
          "text": "```\n" + JSON.stringify(record.res.body, null, '\t').substr(0, 1000) + "\n```\n",
          "footer": "req id: " + record.req_id,
          "mrkdwn_in": ["text"],
          "fields": [
            {
              "title": "Time",
              "value": time + " sec",
              "short": true
            },
            /*{
              "title": "Method time",
              "value": (req.timers["handler-0"] / 1000000.0)  + " sec",
              "short": true
            },*/
            {
              "title": "Latency",
              "value": record.latency,
              "short": true
            },
            {
              "title": "Server",
              "value": record.hostname,
              "short": true
            }
          ],
        }/*,
        {
          "text": "```\n" + JSON.stringify(req.timers, null, '\t') + "\n```\n",
          "mrkdwn_in": ["text"]
        }*/
      ]
    };
    /*jshint +W106*/
  };

  loggerOpts.streams.push({
    type: "stream",
    stream: new BunyanSlack(loggerConfig.slack)
  });
}

let log = bunyan.createLogger(loggerOpts);
log.info("KoBro app started");

module.exports = log;
