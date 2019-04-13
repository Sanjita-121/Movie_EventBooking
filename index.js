var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";

const express = require("express");
const app = express();
var bodyParser = require("body-parser");
app.set("view engine", "ejs");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(express.static(__dirname + "/public"));
app.set("port", process.env.PORT || 3005);

MongoClient.connect(url, function(err, db) {
	var dbo = db.db("mydb");
	app.get("/seat", function(req, res) {
		res.render("seating");
	});

	app.get("/book/:mvname/:userID", function(req, res) {
		var userID=req.params.userID;
		var resultArray = {
			movies: [],
			venue: []
		};

		var cursor = dbo
			.collection("movie")
			.find({ mvname: req.params.mvname });
		cursor.forEach(function(doc, err) {
			//	 resultArray.movies.push(doc);
			console.log("document", doc);
			console.log("Error", err);
			resultArray.movies.push(doc);
			console.log("value here", resultArray.movies);
			var venue = dbo
				.collection("venue")
				.find({ more_id: resultArray.movies[0].mv_id });
			venue.forEach(
				function(doc, err) {
					resultArray.venue.push(doc);
				},
				function() {
					console.log(resultArray);
					res.render("bookmovie", {
						movies: resultArray.movies,
						venue: resultArray.venue,
						userID:userID
					});
				}
			);
		});
	});

	app.get("/movie", function(req, res) {
		var userID=req.query.id;
		dbo.collection("movie")
			.find()
			.toArray(function(err, result) {
				if (err) throw err;

				if (result.length != 0) {
					flag = 1;

					console.log("available");
				} else {
					flag = 0;
				}

				var a = result;

				res.render("movie_landing", { result: a,userID:userID });

				//db.close();
			});
	});

	app.get("/checkout", function(req, res) {
		res.render("checkout");
	});

	app.get("/confirm/:userID", function(req, res) {
		var userID=req.params.userID;
		res.render("confirm_form",{userID:userID});
	});

	app.post("/formsubmit/:userID", urlencodedParser, function(req, res) {
		var userID=req.params.userID;
		var a = {
			cust_name: req.body.username,
			cust_password: req.body.pass,
			cust_email: req.body.email,
			cust_phone: req.body.phone
		};

		dbo.collection("customer")
			.find({ cust_email: req.body.email })
			.toArray(function(err, result) {
				if (err) throw err;

				if (result.length != 0) {
					flag = 1;

					console.log("available");
				} else {
					flag = 0;

					dbo.collection("customer").insertOne(a, function(err, res) {
						if (err) throw err;
						console.log("1 document inserted");
					});
				}
			});
		res.render("checkout",{userID:userID});
	});

	app.post("/event_reg/:userID", urlencodedParser, function(req, res) {

		var userID=req.params.userID;
		console.log(userID);
		res.render("event_register",{userID:userID});
	});

	app.get("/signup", function(req, res) {
		res.render("signup");
	});

	app.get("/events", function(req, res) {
		var userID = req.query.id;
		dbo.collection("inventory")
			.find({userID:userID})
			.toArray(function(err, result) {
				if (err) throw err;

				if (result.length != 0) {
					flag = 1;

					console.log("available");
				} else {
					flag = 0;
				}

				var a = result;

				res.render("events", { result: a, userID: userID });

				//db.close();
			});
	});

	app.post("/signin", urlencodedParser, function(req, res) {
		var a = req.body.user;
		var b = req.body.pass;
		console.log(a);
		dbo.collection("User")
			.find({ u_name: a, u_password: b })
			.toArray(function(err, result) {
				if (err) throw err;

				if (result.length != 0) {
					flag = 1;
					console.log("available in signin");
					console.log(result[0].u_type);
					if (
						result[0].u_type == req.body.customer &&
						result[0].u_type == "Event Manager"
					) {
						var a = result[0]._id;
						var string = encodeURIComponent(a);
						res.redirect("/events?id=" + string);
					} else if (
						result[0].u_type == req.body.customer &&
						result[0].u_type == "User"
					) {
						var a = result[0]._id;
						var string = encodeURIComponent(a);
						res.redirect("/movie?id="+string);
					} else {
						res.render("confirm_form");
					}
				} else {
					flag = 0;
					res.redirect("/movie");
				}
			});
	});

	app.post("/signupsubmit", urlencodedParser, function(req, res) {
		var a = {
			u_name: req.body.username,
			u_password: req.body.pass,
			u_email: req.body.email,
			u_phone: req.body.phone,
			u_city: req.body.city,
			u_type: req.body.customer
		};

		var apassword = req.body.pass;
		var cpassword = req.body.pass1;

		// if(apassword==cpassword){
		dbo.collection("User")
			.find({ u_email: req.body.email })
			.toArray(function(err, result) {
				if (err) throw err;

				if (result.length != 0) {
					flag = 1;

					console.log("available");
				} else {
					flag = 0;

					dbo.collection("User").insertOne(a, function(err, res) {
						if (err) throw err;
						console.log("1 document inserted");
					});
				}
			});
		res.redirect("/movie");
		// }
		// else{
		// 	console.log('wrong password');
		// 	res.render("signup");
		// }
	});

	app.post("/eventsubmit/:userID", urlencodedParser, function(req, res) {
		var userID = req.params.userID;
		var num = parseInt(req.body.eseats);
		console.log(num);
		var ecol = 10;
		var erow = parseInt(num / 10);
		console.log(ecol);
		console.log(erow);
		var ob = {
			userID:userID,
			ename: req.body.ename,
			elang: req.body.elang,
			etype: req.body.etype,
			etime: req.body.etime,
			evenue: req.body.evenue,
			eseats: req.body.eseats,
			ecity: req.body.ecity,
			edate: req.body.edate,
			ecol: ecol,
			erow: erow
		};
		dbo.collection("inventory").insertOne(ob, function(err, res) {
			if (err) throw err;
			console.log("1 document inserted");
		});

		dbo.collection("inventory")
			.find()
			.toArray(function(err, result) {
				if (err) throw err;

				if (result.length != 0) {
					flag = 1;

					console.log("available");
				} else {
					flag = 0;
				}

				var a = result;
				var string = encodeURIComponent(userID);
				// res.render("events", { result: a });
				res.redirect("/events?id=" + string);

				//db.close();
			});
	});

	app.post("/event_delete/:userID",urlencodedParser, function(req, res) {
		var myquery = { ename: req.body.edel,
						userID: req.params.userID
						 };
		
		var userID=req.params.userID;				

		dbo.collection("inventory").remove(myquery, function(err, obj) {
			if (err) throw err;
			console.log(obj.result.n + " document(s) deleted");
			
		});
		//res.redirect('/events');
		res.redirect("/events?id="+userID);
	});

	app.get("/profile/:userID",function(req,res){
		var userID=req.params.userID;
		

		// var id=decodeURIComponent(userID);
		// var o_id = new mongo.ObjectID(userID);
		
		dbo.collection("User")
			.find({_id:userID})
			.toArray(function(err, result) {
				if (err) throw err;

				if (result.length != 0) {
					flag = 1;

					console.log("available in profile");
				} else {
					flag = 0;
					console.log("not available in profile");
				}

				var a = result;

				res.render("event_profile", { result: a, userID: userID });

				
			});
		
	})
});

app.listen(3005, function() {
	console.log("Port 3005");
});
