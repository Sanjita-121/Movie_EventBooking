var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

const express=require('express')
 const app=express()

 app.set('view engine','ejs')

 app.use(express.static(__dirname+'/public'))
 app.set('port',process.env.PORT||3000)

 MongoClient.connect(url,function(err,db){

 	var dbo= db.db("mydb");
// var cursor = dbo.collection('movie').find();

//     cursor.each(function(err, doc) {

//         console.log(doc);



//  })

    app.get('/movie',function(req,res){
	
	dbo.collection("movies").find().toArray(function(err, result) {
    if (err) throw err

    	if(result.length!=0){
    		flag=1;
    		
    		console.log('available');

    	}
    	else{
    		flag=0;
    		//res.render('trackex')
    		//window.alert("Wrong Entry. Try again!");
    		
    		//bootbox.alert("Wrong entry")
    		
    	}
//  MongoClient.connect(url,{
// 	reconnectTries: Number.MAX_VALUE,
// 	reconnectInterval: 1000
// });   	
    //var a=result[0].mvname;
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