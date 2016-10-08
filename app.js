/**
 * Created by wander on 9/14/2016.
 */
var express = require('express');
var app = express();
app.use(express.static(__dirname + '/static'));

app.get('/',function(req,res){
    res.sendFile(__dirname+'/static/view/index.html');


});

app.listen('8081');
console.log('Program is active on port 8081');