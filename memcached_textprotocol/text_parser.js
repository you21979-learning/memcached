var _END_ = '\r\n';
var _SPLIT_ = ' ';

var CTX = {
    NONE : 0,
    VALUE : 1,
};

var strcmpleft = function(str, match){
    return (str.substr(0, match.length) === match);
}

var cmdparser = function(ctx, results, callback){
    var mark = _END_;
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
    var mark = _END_;
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
    return cmdparser(ctx, params.results, cmdcallback);
}
var cmdcallback = function(ctx, params){
    var f;
    var w;
    if(strcmpleft(params.data,'VALUE')){
        w = params.data.split(_SPLIT_);
        ctx.state = CTX.VALUE;
        ctx.size = parseInt(w[3]);
        return valueparser(ctx, params.results, valuecallback);
    }else if(strcmpleft(params.data, 'END')){
        if(f = params.results.shift()) f(null, params.data);
    }else if(strcmpleft(params.data, 'STORED')){
        if(f = params.results.shift()) f(null, params.data);
    }else if(strcmpleft(params.data, 'DELETED')){
        if(f = params.results.shift()) f(null, params.data);
    }else if(strcmpleft(params.data, 'NOT_FOUND')){
        if(f = params.results.shift()) f(null, params.data);
    }else if(strcmpleft(params.data, 'CLIENT_ERROR')){
        w = params.data.split(_SPLIT_);
        if(f = params.results.shift()) f(new Error(w[0]));
    }
    ctx.state = CTX.NONE;
    return cmdparser(ctx, params.results, cmdcallback);
};

var Context = function(state, buff){
    this.state = state;
    this.buff = buff;
    this.size = 0;
}
Context.prototype.run = function(results){
    switch(this.state){
    case CTX.NONE:
        cmdparser(this, results, cmdcallback);
        break;
    case CTX.VALUE:
        valueparser(this, results, valuecallback);
        break;
    default:
        break;
    }
}

var Parser = module.exports = function(){
    this.ctx = new Context(CTX.NONE, new Buffer(''));
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
