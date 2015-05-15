/* by Oratio.io */

//Modules
var child_process = require('child_process');
var path = require('path');
var fs = require('fs');
var Promise = require('bluebird');

function Pool(size, commandType){
  this.size = size;

  this._processes = [];
  this._handlers = {};

  function handler(message){
    var handlerFunction = this._handlers[message.id];
    if(handlerFunction !== null){
      handlerFunction(null, message.userMessage);
    }else{
      throw new Error('No handler specified for this message.');
    }
  }

  var childFile = path.join(__dirname, 'child.js');
  for(var i = 0; i < size; i++){
    var child = child_process.spawn(commandType, [childFile, 'pool'], { stdio: ['pipe', 'pipe', 'pipe', 'ipc']});
    child.on('message', handler);
    this._processes[i] = {process: child, id: i, inUse: false};
  }
}

Pool.prototype.getProcess = function(){
  for(var i = 0; i < this.size; i++){
    if(this._processes[i].inUse === false)
      return this._processes[i];
  }

  return null;
}

exports.Pool = Pool;

function Child(code, timeout){
  this.encoding = 'utf8';
  this.commandType = 'node';
  this.timeout = timeout || 60; //Defaults to 60 seconds
  this.logs = true;
  this.code = code;
  this.pool = null;

  //Private Properties
  this._messageHandler = {};
  this._errorHandler = {};
}

Child.prototype.setPool = function(pool){
  this.pool = pool;
}

Child.prototype.start = function(){
  var timeout = this.timeout.toString();
  var childProcess = this.pool.getProcess();

  childProcess.process.send({code: code, timeout: timeout})
  this.process = childProcess;
  return this.process;
}

Child.prototype.contact = function(messageType, message){
  return new Promise(function(resolve, reject){
    var requestId = getRandomInt(10001, 99999);

    var self = this;
    var handler = function(error, message){
      self.pool.inUse = false;
      if(error){
        return reject(error);
      }
      return resolve(message)
    }

    child.pool._handlers[requestId] = handler;
    this.process.send({messageType: message, id: requestId});
  })
}

module.exports = Child;

Child.prototype.loadScript = function(){
  if(!this.isFile){
    throw new Error('No need to load script when script is given as a string.');
  }

  var self = this;
  return new Promise(function(resolve, reject){
    fs.readFile(path.resolve(self.fileLocation), self.encoding, function(error, file){
      if(error)
        throw error;

      self.file = file;
      self._isReady = true;
      resolve();
    });
  });
}

//Utility Methods
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}