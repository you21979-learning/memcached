var memcache = require('memcache');

var cl = new memcache.Client(11211, 'localhost');

cl.on('connect', function(){
    console.log('connect');
    cl.set('hello','hoge', function(err){
        cl.get('hello', console.log);
        cl.close();
    })
});
cl.on('close', function(){
    console.log('close');
});
cl.on('error', function(e){
    console.log('error');
});
cl.on('timeout', function(){
    console.log('timeout');
});
cl.connect();

