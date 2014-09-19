var Memcached = require('./memcached');

var tp = new Memcached();
//tp.on('debug', function(c){console.log(c.toString())})
tp.on('error', function(c){console.log(c.toString())})
tp.connect(function(){
 //           tp.stats(console.log);
//            tp.set('aaa1', 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', console.log)
            tp.set('aaa1', 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb')
 //           tp.get('aaa1', console.log);
   //         tp.get('aaa1', console.log);
//    for(var i=0; i<10;++i)tp.set('a aa', 'aaa',console.log);
})


