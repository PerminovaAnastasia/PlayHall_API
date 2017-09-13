'use strict';

const Q = require('q');
const _ = require('lodash');
const AWS = require('aws-sdk');
let docClient = new AWS.DynamoDB.DocumentClient();

const USER_ROLE = {
  admin: 'admin',
  manager: 'manager',
  senseReviewer :'sense reviewer',
  spellingReviewer: 'spelling reviewer',
  supplier: 'supplier',
  deactivated: 'deactivated',
  user: 'user'
};

function userSorting(Users, sortedField, sortedOrder){

  let sortedItems = [];
  if(sortedField === 'amountQuestions' || sortedField === 'amountReviewedQuestions'){
    sortedItems = _.sortBy(Users, [ (user) => {
      if(user.role === USER_ROLE.supplier){
        return user.amountQuestions;
      } else if(user.role === USER_ROLE.senseReviewer || USER_ROLE.spellingReviewer){
        return user.amountReviewedQuestions;
      }
      return 0;
    }]);
  } else {
    sortedItems = _.sortBy(Users, sortedField);
  }

  return sortedOrder === 'asc' ? sortedItems : sortedItems.reverse();
}

function Dao(tableName) {
  this.tableName = tableName;
}

Dao.prototype.all = function daoAll(size) {
  let self = this;

  let result = {
    Items: []
  };

  return Q.Promise((resolve, reject) => {
    let query = {
      TableName: self.tableName
    };

    if (size) {
      query.Limit = size;
    }

    function cycleCheck(LastEvaluatedKey) {

      query.ExclusiveStartKey = LastEvaluatedKey;

      docClient.scan(query, function (err, data) {
        if (err) {
          return reject(err);
        }

        if (data.LastEvaluatedKey) {
          result.Items = result.Items.concat(data.Items);
          return cycleCheck(data.LastEvaluatedKey);
        } else if (data.Items) {
          result.Items = result.Items.concat(data.Items);
          return resolve(result.Items);
        } else {
          return resolve({});
        }
      });
    }

    cycleCheck();
  });
};

Dao.prototype.getAllNiknames = function daoGetAll(keys) {
  let self = this;

  return Q.all(keys.map(key => self.get({"nickname": key})));
};

Dao.prototype.getAllIds = function daoGetAll(keys) {
  let self = this;

  return Q.all(keys.map(key => self.get({"id": key})));
};

Dao.prototype.saveAll = function daoGetAll(objects) {
  let self = this;

  return Q.all(objects.map(object => self.save(object)));
};

Dao.prototype.save = function daoSave(item) {

  let self = this;

  let param = {
    TableName: self.tableName,
    Item: item
  };

  return Q.Promise((resolve, reject) => {
    docClient.put(param, function (err, data) {
      if (err) {
        reject(err);
      }

      resolve(data);
    });
  });
};

Dao.prototype.delete = function daoDelete(key) {

  let self = this;

  return Q.Promise((resolve, reject) => {

    let item = {
      TableName: self.tableName,
      Key: key,
      ReturnValues: 'ALL_OLD'
    };

    docClient.delete(item, function (err, data) {
      if (err) {
        return reject(err);
      }

      resolve(data.Attributes || data);
    });
  });
};

Dao.prototype.get = function daoGet(key) {
  let self = this;

  return Q.Promise((resolve, reject) => {

    let query = {
      TableName: self.tableName,
      Key: key
    };

    docClient.get(query, function (err, data) {
      if (err) {
        reject(err);
      }
      if (data) {
        resolve(data.Item || data);
      }
    });
  });
};

Dao.prototype.scanFilterCommon = function scanFilterCommon(filter) {
  let self = this;

  let result = {
    Items: []
  };

  filter.TableName = self.tableName;

  return Q.Promise((resolve, reject) => {

    function cycleCheck(LastEvaluatedKey) {

      filter.ExclusiveStartKey = LastEvaluatedKey;

      docClient.scan(filter, function (err, data) {
        if (err) {
          return reject(err);
        }

        result.Items = result.Items.concat(data.Items);

        if (data.LastEvaluatedKey) {
          return cycleCheck(data.LastEvaluatedKey);
        } else {
          return resolve(result.Items);
        }
      });
    }

    cycleCheck();
  });
};

Dao.prototype.scanFilter = function scanFilter(filter) {
  let self = this;

  let result = {
    Items: []
  };

  filter.TableName = self.tableName;

  return Q.Promise((resolve, reject) => {

    function cycleCheck(LastEvaluatedKey) {

      filter.ExclusiveStartKey = LastEvaluatedKey;

      docClient.scan(filter, function (err, data) {
        if (err) {
          return reject(err);
        }

        result.Items = result.Items.concat(data.Items);

        if (data.LastEvaluatedKey) {
          return cycleCheck(data.LastEvaluatedKey);
        } else {

          result.Count = result.Items.length;
          result.Items = _.slice(_.sortBy(result.Items, ['dateOfCreation']).reverse(), filter.start, filter.end);
          return resolve(result);
        }
      });
    }

    cycleCheck();
  });
};

Dao.prototype.scanFilterUsers = function scanFilterUsers(filter) {

  let self = this;
  let result = {
    Items: []
  };

  filter.TableName = self.tableName;

  return Q.Promise((resolve, reject) => {

    function cycleCheck(LastEvaluatedKey) {
      filter.ExclusiveStartKey = LastEvaluatedKey;

      docClient.scan(filter, function (err, data) {
        if (err) {
          return reject(err);
        }

        if (data.LastEvaluatedKey) {
          result.Items = result.Items.concat(data.Items);
          return cycleCheck(data.LastEvaluatedKey);
        } else if (data.Items) {

          result.Items = result.Items.concat(data.Items);
          result.Count = result.Items.length;

          if(filter.sort){
            result.Items = filter.sort.order === 'asc' ?
              _.slice(_.sortBy(result.Items, [filter.sort.field]), filter.start, filter.end) :
              _.slice(_.sortBy(result.Items, [filter.sort.field]).reverse(), filter.start, filter.end);
          } else {
            result.Items = _.slice(result.Items, filter.start, filter.end);
          }
          return resolve(result);

        } else {
          return resolve({Count: 0, Items: []});
        }
      });
    }

    cycleCheck();
  });
};

Dao.prototype.queryFilterUsers = function queryFilterUsers(filter) {

  let self = this;
  let result = {
    Items: []
  };

  filter.TableName = self.tableName;

  return Q.Promise((resolve, reject) => {

    function cycleCheck(LastEvaluatedKey) {
      filter.ExclusiveStartKey = LastEvaluatedKey;

      docClient.query(filter, function (err, data) {
        if (err) {
          return reject(err);
        }

        if (data.LastEvaluatedKey) {
          result.Items = result.Items.concat(data.Items);
          return cycleCheck(data.LastEvaluatedKey);
        } else if (data.Items) {

          result.Items = result.Items.concat(data.Items);
          result.Count = result.Items.length;

          if(filter.sort){
            result.Items =
              _.slice(userSorting(result.Items, filter.sort.field, filter.sort.order), filter.start, filter.end);
          } else {
            result.Items = _.slice(result.Items, filter.start, filter.end);
          }
          return resolve(result);

        } else {
          return resolve({Count: 0, Items: []});
        }
      });
    }

    cycleCheck();
  });
};

Dao.prototype.queryFilter = function scanFilter(filter) {
  let self = this;
  let result = {
    Items: []
  };

  return Q.Promise((resolve, reject) => {

    filter.TableName = self.tableName;

    function cycleCheck(LastEvaluatedKey) {
      filter.ExclusiveStartKey = LastEvaluatedKey;

      docClient.query(filter, function (err, data) {
        if (err) {
          return reject(err);
        }

        result.Items = result.Items.concat(data.Items);

        if (data.LastEvaluatedKey) {
          return cycleCheck(data.LastEvaluatedKey);
        } else if (data.Items) {

          result.Count = result.Items.length;
          result.Items = _.slice(result.Items, filter.start, filter.end);

          return resolve(result);

        } else {
          return resolve({Count: 0, Items: []});
        }
      });
    }

    cycleCheck();
  });
};

Dao.setCredentials = function(credentials) {
  AWS.config.update(credentials);
  docClient = new AWS.DynamoDB.DocumentClient();
};

module.exports = Dao;