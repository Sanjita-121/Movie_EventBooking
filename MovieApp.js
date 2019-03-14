var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

const express=require('express')
 const app=express()

 app.set('view engine','ejs')

 app.use(express.static(__dirname+'/public'))
 app.set('port',process.env.PORT||3005)

 MongoClient.connect(url,function(err,db){

 	var dbo= db.db("mydb");
	app.get('/seat',function(req,res){

		res.render('seat');

	})



	// app.get('/trial',function(req,res){
	// 	var resultArray={
	// 		movies:[],
	// 		venue:[]
	// 	};
	// 	console.log(resultArray);

	// 	var cursor = dbo.collection("movies").find();
		
	// 	cursor.forEach(function(doc,err){
	// 		resultArray.movies.push(doc);
	// 	})
	// 	console.log(resultArray.movies);
	// })

	app.get('/book/:mvname',function(req,res){
		var resultArray = {
			movies : [],
			venue : []
		   };
		   
		   var cursor = dbo.collection('movie').find({mvname:req.params.mvname});
      cursor.forEach(function(doc, err) {
	//	 resultArray.movies.push(doc);
		console.log("document",doc);
		console.log("Error",err);
		resultArray.movies.push(doc);
		console.log("value here",resultArray.movies);
		var venue = dbo.collection('venue').find({more_id:resultArray.movies[0].mv_id});
		venue.forEach(function(doc,err){
			resultArray.venue.push(doc);
		 }, function() {
		   console.log(resultArray);
		   res.render('bookmovie', {movies: resultArray.movies, venue: resultArray.venue});
		});
	  })
	    
	})

	// app.get('/book/:mvname',function(req,res){
	// 		var resultArray={
	// 		movies:[],
	// 		venue:[]
	// 	};

	// 	dbo.collection("movies").find({mvname:req.params.mvname}).toArray(function(err, result) {
	// 		if (err) throw err
		
	// 			if(result.length!=0){
	// 				flag=1;
					
	// 				console.log('available');
					
					
					

	// 			}
	// 			else{
	// 				flag=0;
					
	// 			}
		
	// 		var a=result
	// 	console.log(a);	
				
	// 	res.render('bookmovie',{result:a});
		
					  
		
	// 	   })

		//    dbo.collection("venue").find({more_id:req.query.mvid}).toArray(function(err, result) {
		// 	if (err) throw err
		
		// 		if(result.length!=0){
		// 			flag=1;
					
		// 			console.log('available');
		
		// 		}
		// 		else{
		// 			flag=0;
					
		// 		}
		
		// 	var a=result
						
		// res.render('bookmovie',{result:a});
		// console.log(result);
		
		
				  
		
		//    })
	   

//	})

    app.get('/movie',function(req,res){
	
	dbo.collection("movie").find().toArray(function(err, result) {
    if (err) throw err

    	if(result.length!=0){
    		flag=1;
    		
    		console.log('available');

    	}
    	else{
    		flag=0;
    		
    	}

	var a=result
	
	
res.render('movie_landing',{result:a});
            
           //db.close();

   })


})

// app.get('/movie',function(req,res){

// 	var n=req.query.num;
// 	console.log('\n\n\n',n);
// 	//res.render('moviedetails');
  


// }) 

})

 app.listen(3005,function(){
	console.log('Port 3005')
})