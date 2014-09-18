var TextParser = require('./text_parser');
var net = require('net');
var event = require('events');
var util = require('util');

var port = 11211;
var host = 'localhost';

var _END_ = '\r\n';
var _SPLIT_ = ' ';

var CMD = {
    GET:'get',
    SET:'set',
    DELETE:'delete',
};

/*
STORED
DELETED
ERROR
END

STAT
END

VALUE
END

CLIENT_ERROR
ERROR
*/

var TextProtocol = module.exports = function( host, port ){
    event.EventEmitter.call(this);
    this.host = host;
    this.port = port;
    this.callbacks = [];
    this.cl = new net.Socket();
    this.encode = 'utf8';

    var self = this;
    this.cl.on('error', function(err){
        self.emit('error', err);
    });
    var parser = new TextParser();
    this.cl.on('data', function(chunk){
        self.emit('debug', chunk);
        parser.parse(chunk, self.callbacks);
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
    this.cl.connect(port, host, callback);
}

TextProtocol.prototype.set = function( key, val, expire, callback ){
    if(expire instanceof Function){
         callback = expire;
         expire = 0;
    }
    var buff = new Buffer(val);
    var flags = 12346;
    var cmd = [CMD.SET, key, flags, expire, buff.length].join(_SPLIT_);
    this.callbacks.push(callback);
    this.cl.write(cmd);
    this.cl.write(_END_);
    this.cl.write(buff);
    this.cl.write(_END_);
}

TextProtocol.prototype.get = function(key, callback ){
    var self = this;
    var cmd = [CMD.GET, key].join(_SPLIT_);
    this.callbacks.push(function(err, val){
        if(err) return callback(err);
        if(self.encode === 'utf8') callback(err, val.toString(self.encode));
        else callback(err, val);
    });
    this.cl.write(cmd);
    this.cl.write(_END_);
}
TextProtocol.prototype.delete = function(key, callback ){
    var self = this;
    var cmd = [CMD.DELETE, key].join(_SPLIT_);
    this.callbacks.push(callback);
    this.cl.write(cmd);
    this.cl.write(_END_);
}

