var memcache = require('memcache');

var cl = new memcache.Client(11211, 'localhost');

var obj = {
    name : 'hogehogehoge',
    param : {
        hp : 100,
        mp : 100,
        str : 120,
        def : 100,
    },
    memo : 'yorosiku-',
    equip : [
        1025,
        1223,
        3332,
        222
    ],
}

cl.on('connect', function(){
    console.log('connect');

    var begin = process.uptime();
    var n = 0;
    for(var i=0; i<100000; ++i){
        cl.set('hello'+Math.random(),JSON.stringify(obj), function(err){
            ++n;
            if(n === 100000){
                var end = process.uptime() - begin;
                console.log(end);
            }
        })
    }
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

