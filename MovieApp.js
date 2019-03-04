var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

const express=require('express')
 const app=express()

 app.set('view engine','ejs')

 app.use(express.static(__dirname+'/public'))
 app.set('port',process.env.PORT||3000)

 MongoClient.connect(url,function(err,db){

 	var dbo= db.db("mydb");


    app.get('/movie',function(req,res){
	
	dbo.collection("movies").find().toArray(function(err, result) {
    if (err) throw err

    	if(result.length!=0){
    		flag=1;
    		
    		console.log('available');

    	}
    	else{
    		flag=0;
    		
    	}

    var a=result
    console.log(flag);
    console.log(result[0].mvname);
    console.log(result[0]);
    console.log(a.length);
	
res.render('movie_landing',{result:a});
            
           //db.close();

   })


})

   

})

 app.listen(3000,function(){
	console.log('Port 3000')
})