"use strict";
var SPEC = require('./spec');
var TextParser = require('./text_parser');
var net = require('net');
var event = require('events');
var util = require('util');

var MESSAGE_MARKER = SPEC.MESSAGE_MARKER;
var CMD = SPEC.CMD;
var FLAGS = SPEC.FLAGS;

var TextProtocol = module.exports = function(port, host){
    event.EventEmitter.call(this);
    if(!port) port = '11211';
    if(!host) host = 'localhost';
    this.host = host;
    this.port = port;
    this.callbacks = [];
    this.cl = new net.Socket();
    this.sendq = [];
    this.encode = 'utf8';
    this.compress = FLAGS.UNCOMPRESS;
    this.isConnected = false;

    var self = this;
    this.cl.on('error', function(err){
        self.emit('error', err);
    });
    var parser = new TextParser();
    this.cl.on('data', function(chunk){
        self.emit('debug', chunk);
        try{
            parser.parse(chunk, self.callbacks);
        }catch(e){
            self.emit('error', e);
        }
    });
    this.cl.on('connect', function(){
        self.isConnected = true;
        self.emit('connect');
        console.log('connected');
    });
    this.cl.on('close', function(){
        self.isConnected = false;
        self.emit('close');
        console.log('cl-> connection is closed');
    });
}
util.inherits(TextProtocol, event.EventEmitter);

TextProtocol.prototype.connect = function(callback){
    this.cl.connect(this.port, this.host, callback);
}
TextProtocol.prototype.end = function(){
    this.cl.end();
}
TextProtocol.prototype._sendtext = function(text){
    this.sendq.push(new Buffer(text));
}
TextProtocol.prototype._sendbinary = function(buffer){
    this.sendq.push(buffer);
}
TextProtocol.prototype.send = function(){
    var sendq = Buffer.concat(this.sendq);
    this.emit('send', sendq);
    this.sendq = [];
    return this.cl.write(sendq);
}

TextProtocol.prototype.set = function( key, val, expire, callback ){
    switch(arguments.length){
    case 2: expire = 0; break;
    case 3:
        if(expire instanceof Function){
             callback = expire;
             expire = 0;
        }
        break;
    default:
        break;
    }
    if(!Buffer.isBuffer(val)){
        val = new Buffer(val.toString());
    }
    var cmd = [CMD.SET, key, this.compress, expire, val.length].
        map(function(v){return v.toString()}).
        join(MESSAGE_MARKER.SPLIT);
    this.callbacks.push(function(err, val){
        if(callback) callback(err, val);
    });
    this._sendtext(cmd);
    this._sendtext(MESSAGE_MARKER.END);
    this._sendbinary(val);
    this._sendtext(MESSAGE_MARKER.END);
    this.send();
}

TextProtocol.prototype.get = function(key, callback ){
    var self = this;
    var cmd = [CMD.GET, key].
        map(function(v){return v.toString()}).
        join(MESSAGE_MARKER.SPLIT);
    this.callbacks.push(function(err, val){
        if(!callback) return;
        if(err) return callback(err);
        if(self.encode === 'utf8') callback(err, val.toString(self.encode));
        else callback(err, val);
    });
    this._sendtext(cmd);
    this._sendtext(MESSAGE_MARKER.END);
    this.send();
}
TextProtocol.prototype.delete = function(key, callback ){
    var self = this;
    var cmd = [CMD.DELETE, key].
        map(function(v){return v.toString()}).
        join(MESSAGE_MARKER.SPLIT);
    this.callbacks.push(function(err, val){
        if(callback) callback(err, val);
    });
    this._sendtext(cmd);
    this._sendtext(MESSAGE_MARKER.END);
    this.send();
}
TextProtocol.prototype.inc = function(key, val, callback ){
    var self = this;
    var cmd = [CMD.INC, key, val].
        map(function(v){return v.toString()}).
        join(MESSAGE_MARKER.SPLIT);
    this.callbacks.push(function(err, val){
        if(callback) callback(err, val);
    });
    this._sendtext(cmd);
    this._sendtext(MESSAGE_MARKER.END);
    this.send();
}
TextProtocol.prototype.dec = function(key, val, callback ){
    var self = this;
    var cmd = [CMD.DEC, key, val].
        map(function(v){return v.toString()}).
        join(MESSAGE_MARKER.SPLIT);
    this.callbacks.push(function(err, val){
        if(callback) callback(err, val);
    });
    this._sendtext(cmd);
    this._sendtext(MESSAGE_MARKER.END);
    this.send();
}
TextProtocol.prototype.stats = function( callback ){
    var self = this;
    var cmd = [CMD.STATS].
        map(function(v){return v.toString()}).
        join(MESSAGE_MARKER.SPLIT);
    this.callbacks.push(function(err,val){
        if(callback) callback(err, val);
    });
    this._sendtext(cmd);
    this._sendtext(MESSAGE_MARKER.END);
    this.send();
}

