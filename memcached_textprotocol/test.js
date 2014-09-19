var Memcached = require('./memcached');

var tp = new Memcached();
//tp.on('debug', function(c){console.log(c.toString())})
tp.on('error', function(c){console.log(c.toString())})
tp.on('send', function(c){console.log(c.toString())})
tp.connect(function(){
 //           tp.stats(console.log);
//            tp.set('aaa1', 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', console.log)
//            tp.set('aaa1', 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', console.log)
//            tp.get('aaa1', console.log);
console.time('aaa');
for(var i=0; i<10000;++i)tp.set('hoge', JSON.stringify([0,1,2,3,4,5,6,7,8,9,10]));
console.timeEnd('aaa');
   //         tp.get('aaa1', console.log);
//    for(var i=0; i<10;++i)tp.set('a aa', 'aaa',console.log);
})


