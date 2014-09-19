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
    this.encode = 'utf8';
    this.compress = FLAGS.UNCOMPRESS;

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
        self.emit('connect');
        console.log('connected');
    });
    this.cl.on('close', function(){
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
        val = new Buffer(val);
    }
    var cmd = [CMD.SET, key, this.compress, expire, val.length].join(MESSAGE_MARKER.SPLIT);
    this.callbacks.push(function(err, val){
        if(callback) callback(err, val);
    });
    var buff = new Buffer(cmd + MESSAGE_MARKER.END);
    this.cl.write(Buffer.concat([
        new Buffer(cmd + MESSAGE_MARKER.END),
        val,
        new Buffer(MESSAGE_MARKER.END)
    ]));
}

TextProtocol.prototype.get = function(key, callback ){
    var self = this;
    var cmd = [CMD.GET, key].join(MESSAGE_MARKER.SPLIT);
    this.callbacks.push(function(err, val){
        if(!callback) return;
        if(err) return callback(err);
        if(self.encode === 'utf8') callback(err, val.toString(self.encode));
        else callback(err, val);
    });
    this.cl.write(cmd);
    this.cl.write(MESSAGE_MARKER.END);
}
TextProtocol.prototype.delete = function(key, callback ){
    var self = this;
    var cmd = [CMD.DELETE, key].join(MESSAGE_MARKER.SPLIT);
    this.callbacks.push(function(err, val){
        if(callback) callback(err, val);
    });
    this.cl.write(cmd);
    this.cl.write(MESSAGE_MARKER.END);
}
TextProtocol.prototype.stats = function( callback ){
    var self = this;
    var cmd = [CMD.STATS].join(MESSAGE_MARKER.SPLIT);
    this.callbacks.push(function(err,val){
        if(callback) callback(err, val);
    });
    this.cl.write(cmd);
    this.cl.write(MESSAGE_MARKER.END);
}

