const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys')

const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
  this.useCache = true;
  this.useKey = JSON.stringify(options.key || "default key string");
  console.log("USE KEY:", this.useKey)
  return this;
};

mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }
  //   var z = Date.now();
  //   console.log('Query call: ', z);
  //   console.log(this.getQuery())
  // console.log(this.mongooseCollection.name);

  const key = JSON.stringify(
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name,
    })
  );

  const cacheValue = await client.hget(this.useKey, key);

  if (cacheValue) {
    console.log("serving from Redis")
    const doc = JSON.parse(cacheValue);
    console.log("CACHE VALUE:", doc);
    return Array.isArray(doc)
      ? doc.map((i) => new this.model(i))
      : new this.model(doc);
  }

  const result = await exec.apply(this, arguments);
  client.hset(this.useKey, key, JSON.stringify(result), "EX", 10);
  console.log('RESULT:', result)
  return result;
};

module.exports = {
  clearHash(useKey){
    client.del(JSON.stringify(useKey))
  }
}
