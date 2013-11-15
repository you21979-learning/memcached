var memjs = require('memjs');

var cl = new memjs.Client.create('localhost');

cl.set('hello', new Buffer('fuga'), function(){
    cl.get('hello', function(err, val){
        console.log(val.toString());
    })
});

