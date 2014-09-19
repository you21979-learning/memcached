/*
 * STATE-MACHINE
 *  CMD -> VALUE -> VOID -> CMD
 *  CMD -> STATS -> CMD
 *  CMD -> CMD
 */
"use strict";
var SPEC = require('./spec');
var MESSAGE_MARKER = SPEC.MESSAGE_MARKER;

var CTX = {
    CMD : 0,
    VALUE : 1,
    STATS : 2,
    VOID : 3,
};

var strcmpleft = function(str, match){
    return (str.substr(0, match.length) === match);
}

var cmdparser = function(ctx, results, callback){
    var mark = MESSAGE_MARKER.END;
    var marklen = Buffer.byteLength(mark);
    for(var i=0; i < ctx.buff.length; ++i){
        var end = i + marklen;
        if( ctx.buff.slice(i, end).toString() === mark ){
            var line = ctx.buff.slice(0, end);
            ctx.buff = ctx.buff.slice(line.length);
            return callback(ctx, {
                data:line.toString().split(mark).shift(),
                results:results,
            });
        }
    }
    return ctx;
}
var valueparser = function(ctx, results, callback){
    var mark = MESSAGE_MARKER.END;
    var marklen = Buffer.byteLength(mark);
    if(ctx.size > ctx.buff.length){
        return ctx;
    }
    var data = ctx.buff.slice(0, ctx.size);
    ctx.buff = ctx.buff.slice(ctx.size + marklen);
    return callback(ctx, {
        data: data,
        results:results,
    });
}
var valuecallback = function(ctx, params){
    var f;
    if(f = params.results.shift()) f(null, params.data);
    ctx.state = CTX.VOID;
    return cmdparser(ctx, params.results, voidcallback);
}
var voidcallback = function(ctx, params){
    ctx.state = CTX.CMD;
    return cmdparser(ctx, params.results, cmdcallback);
}
var statscallback = function(ctx, params){
    var f;
    if(strcmpleft(params.data,'STAT')){
        var lists = params.data.split(MESSAGE_MARKER.SPLIT);
        ctx.stats[lists[1]] = lists[2];
        return cmdparser(ctx, params.results, statscallback);
    }else if(strcmpleft(params.data, 'END')){
        if(f = params.results.shift()) f(null, ctx.stats);
    }
    ctx.state = CTX.CMD;
    return cmdparser(ctx, params.results, cmdcallback);
}
var cmdcallback = function(ctx, params){
    var f;
    var w;
    if(strcmpleft(params.data,'VALUE')){
        w = params.data.split(MESSAGE_MARKER.SPLIT);
        ctx.state = CTX.VALUE;
        ctx.size = parseInt(w[3]);
        return valueparser(ctx, params.results, valuecallback);
    }else if(strcmpleft(params.data, 'STORED')){
        if(f = params.results.shift()) f(null, params.data);
    }else if(strcmpleft(params.data, 'DELETED')){
        if(f = params.results.shift()) f(null, params.data);
    }else if(strcmpleft(params.data, 'END')){
        if(f = params.results.shift()) f(null, params.data);
    }else if(strcmpleft(params.data, 'NOT_FOUND')){
        if(f = params.results.shift()) f(null, params.data);
    }else if(strcmpleft(params.data, 'STAT')){
        ctx.state = CTX.STATS;
        return cmdparser(ctx, params.results, statscallback);
    }else if(strcmpleft(params.data, 'CLIENT_ERROR')){
        w = params.data.split(MESSAGE_MARKER.SPLIT);
        w.shift();
        if(f = params.results.shift()) f(new Error(w.join(' ')));
    }else if(strcmpleft(params.data, 'ERROR')){
        throw new Error('Protocol Error');
    }
    ctx.state = CTX.CMD;
    return cmdparser(ctx, params.results, cmdcallback);
};

var Context = function(state, buff){
    this.state = state;
    this.buff = buff;
    this.size = 0;
    this.stats = {};
}
Context.prototype.run = function(results){
    switch(this.state){
    case CTX.CMD:
        cmdparser(this, results, cmdcallback);
        break;
    case CTX.VALUE:
        valueparser(this, results, valuecallback);
        break;
    case CTX.STAT:
        cmdparser(this, results, statscallback);
        break;
    case CTX.VOID:
        cmdparser(this, results, voidcallback);
        break;
    default:
        break;
    }
}

var Parser = module.exports = function(){
    this.ctx = new Context(CTX.CMD, new Buffer(''));
}
Parser.prototype.parse = function(chunk, results){
    this.ctx.buff = Buffer.concat([this.ctx.buff, chunk]);
    this.ctx.run(results);
}


//var buff = new Buffer('STORED\r\nVALUE aaa1 12346 11\r\nxxxxxxxxxxx\r\nEND\r\nSTORED\r\n');
//var buff = new Buffer('STORED\r\n');
//var buff = new Buffer('STORED\r\nVALUE aaa1 12346 11\r\nxxxxxxx');
//var p = new Parser();
//(p.parse(buff, [console.log, console.log, console.log]));
