var Memcached = require('./memcached');

var tp = new Memcached('localhost', 11211);
//tp.on('debug', function(c){console.log(c.toString())})
tp.connect(function(){
//    tp.set('a aa', 'END', console.log);
var update = function(){
    setTimeout(function(){
        if(((Math.random() * 1000)|0) % 2 === 0){
            //tp.set('aaa1', 'xxxxxxxxxxx', function(err,val){
              //  console.log('set', val);
            //});
     //       tp.delete('aaa1', function(err, val){
 //               console.log('delete', val);
       //     });
//            tp.set('aaa3', 'xxxxxxxxxxx', console.log);
//            tp.set('aaa4', 'xxxxxxxxxxx', console.log);
//            tp.set('aaa5', 'xxxxxxxxxxx', console.log);
        }else{
            tp.get('aaa1', function(err, val){
                console.log('get', val);
            });
        }
        update();
    }, Math.random()*100 + 10);
}
update();
//    for(var i=0; i<10;++i)tp.get('a aa', console.log);
})


