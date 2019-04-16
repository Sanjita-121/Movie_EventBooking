var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var ObjectID = require("mongodb").ObjectID;
const express = require('express')
const app = express()
var bodyParser = require("body-parser");
app.set('view engine', 'ejs')
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(express.static(__dirname + '/public'))
app.set('port', process.env.PORT || 3000)

MongoClient.connect(url, function (err, db) {

	var dbo = db.db("mydb");
	var mov = [];
	var movdata = [];
	var pro = [];
	app.get('/home', function (req, res) {
		var userID = req.query.id;
		dbo.collection("movies").find().toArray(function (err, result) {
			if (err) {
				console.log(err);
			}
			else {
				for (i = 0; i < result.length; i++) {
					mov[i] = result[i];
				}
			}
			res.render('movie_landing', { mov: mov, userID: userID });
		})

	})

	app.get("/checkout", function (req, res) {
		res.render("checkout");
	});
	app.get("/confirm/:userID", function (req, res) {
		var userID = req.params.userID;
		res.render("confirm_form", { userID: userID });
	});
	app.post("/event_reg/:userID", urlencodedParser, function (req, res) {

		var userID = req.params.userID;


		dbo.collection("venue").find({ v_type: "event" }).toArray(function (err, result) {
			if (err) {
				console.log(err);
			}
			else {
				for (i = 0; i < result.length; i++) {
					ven[i] = result[i];
				}
			}

			res.render('event_register', { venue: ven, userID: userID });
		})


	});

	app.get("/signup", function (req, res) {
		res.render("signup");
	});

	app.get("/events", function (req, res) {
		var userID = req.query.id;
		var resultArray = {
			movies: [],
			venue: []
		};
		dbo.collection("inventory")
			.find({ userID: userID })
			.toArray(function (err, result) {
				if (err) throw err;

				if (result.length != 0) {
					flag = 1;

					console.log("available");
				} else {
					
				}

				var a = result;
				var cursor = dbo.collection("movies").find({ mvname: req.params.mvname });
				cursor.forEach(function (doc, err) {
					//	 resultArray.movies.push(doc);
					console.log("document", doc);
					console.log("Error", err);
					resultArray.movies.push(doc);
					console.log("value here", resultArray.movies);
					var venue = dbo.collection('inventory').find({ ename: req.params.mvname });
					venue.forEach(
						function (doc, err) {
							resultArray.venue.push(doc);
						},
						function () {
							console.log(resultArray);
							res.render("bookmovie", {
								movies: resultArray.movies,
								venue: resultArray.venue,
								userID: userID
							});
						}
					);
				});

				res.render("events", { result: a, userID: userID });

				//db.close();
			});

	
	});

	app.post("/signin", urlencodedParser, function (req, res) {
		var a = req.body.user;
		var b = req.body.pass;
		console.log(a);
		dbo.collection("User")
			.find({ u_name: a, u_password: b })
			.toArray(function (err, result) {
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
						res.redirect("/home?id=" + string);
					} else {
						res.render("confirm_form");
					}
				} else {
					flag = 0;
					res.redirect("/home");
				}
			});
	});

	app.post("/signupsubmit", urlencodedParser, function (req, res) {
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
			.toArray(function (err, result) {
				if (err) throw err;

				if (result.length != 0) {
					flag = 1;

					console.log("available");
				} else {
					flag = 0;

					dbo.collection("User").insertOne(a, function (err, res) {
						if (err) throw err;
						console.log("1 document inserted");
					});
				}
			});
		res.redirect("/home");
		// }
		// else{
		// 	console.log('wrong password');
		// 	res.render("signup");
		// }
	});


	app.post("/formsubmit/:userID", urlencodedParser, function (req, res) {
		var userID = req.params.userID;
		var a = {
			u_name: req.body.username,
			u_password: req.body.pass,
			u_email: req.body.email,
			u_phone: req.body.phone
		};

		dbo.collection("User")
			.find({ u_email: req.body.email })
			.toArray(function (err, result) {
				if (err) throw err;

				if (result.length != 0) {
					flag = 1;

					console.log("available");
				} else {
					flag = 0;

					dbo.collection("User").insertOne(a, function (err, res) {
						if (err) throw err;
						console.log("1 document inserted");
					});
				}
			});
		res.render("checkout", { userID: userID });
	});

	app.post("/eventsubmit/:userID", urlencodedParser, function (req, res) {
		var resultArray = {
			movies: [],
			venue: []
		};
		var userID = req.params.userID;
		var num = parseInt(req.body.eseats);
		var myven = {
			v_name: req.body.evenue,
		};
		var ecol = 10;
		var erow = parseInt(num / 10);
		var query = {
			mvname: req.body.ename,
			mv_type:"events",
			mv_lang:req.body.elang,
			mv_desc:req.body.edesc,
			mv_rating:req.body.erating,
			mv_image:req.body.eimg
		}
		dbo.collection("movies").insertOne(query, function (err, res) {
			if (err) throw err;
			console.log("1 document inserted");

		});
		var res1;
		var res2;
		var check={
			mvname: req.body.ename,
			mv_type:"events",
			mv_lang:req.body.elang,
			mv_desc:req.body.edesc,
			mv_rating:req.body.erating,
			mv_image:req.body.eimg
		}

		var cursor = dbo.collection("movies").find(check);
		cursor.forEach(function (doc, err) {
			//	 resultArray.movies.push(doc);
			console.log("document", doc);
			console.log("Error", err);
			resultArray.movies.push(doc);
			console.log("value here", resultArray.movies);
			var venue = dbo.collection('venue').find(myven);
			venue.forEach(
				function (doc, err) {
					resultArray.venue.push(doc);
				},
				function () {
					console.log(resultArray);
					var resmov = resultArray.movies;
					var resven = resultArray.venue;
					var a = {
						userID: userID,

						more_id: resmov[0]._id,
						ven_id: resven[0]._id,
						ename: req.body.ename,
						etime: req.body.etime,
						evenue: req.body.evenue,
						
						
						eseats: req.body.eseats,
						eprice: req.body.eprice,
						edate: req.body.edate,
						ecol: ecol,
						erow: erow
}
					dbo.collection("Inventory").insertOne(a, function (err, res) {
						if (err) throw err;
						console.log("1 document inserted");

					});

					res.redirect("/events?id=" + userID);
				});

		});
	});
	// 	dbo.collection("movies").find(check).toArray(function (err, result) {
	// 		if (err) {
	// 			console.log(err);
	// 		}
	// 		else {
	// 			console.log("in else");
			
	// 	 res1=result;
	// 	 res2=res1[0]._id;
	// 	 console.log("total",res1);
	// 	 console.log("id is here",res2);

	// 	 var ins={
	// 		ename:req.body.ename,
	// 		more_id:res2,
	
	// 		etime:req.body.etime,
	// 		edate:req.body.edate,
	// 		eseats:req.body.eseats,
	// 		eprice:req.body.eprice,
	// 		userID:userID,
	// 		ecol:ecol,
	// 		erow:erow
			
	// 	}
		
	// 	dbo.collection("Inventory").insertOne(ins, function (err, res) {
	// 		if (err) throw err;
	// 		console.log("1 document inserted");

		
	
	// });

	// 		}
	// 		res.redirect("/events?id=" + userID);
	// 	})




		// 	var ins={
		// 		ename:req.body.ename,
		// 		more_id:res2,
		// 		etime:req.body.etime,
		// 		edate:req.body.edate,
		// 		eseats:req.body.eseats,
		// 		eprice:req.body.eprice,
		// 		userID:userID,
		// 		ecol:ecol,
		// 		erow:erow
				
		// 	}
			
		// 	dbo.collection("Inventory").insertOne(ins, function (err, res) {
		// 		if (err) throw err;
		// 		console.log("1 document inserted");

			
		// 	res.redirect("/events?id=" + userID);
		// });


		
		// dbo.collection("venue").find(myven).toArray(function (err, result) {
		// 	if (err) {
		// 		console.log(err);
		// 	}
		// 	else {
		// 		for (i = 0; i < result.length; i++) {
		// 			mov[i] = result[i];
		// 		}
		// 	}
		// 	res.render('movie_landing', { mov: mov });
		// })



	app.post("/eventmodify/:userID", urlencodedParser, function (req, res) {
		var userID = req.params.userID;

		var num = parseInt(req.body.eseats);
		console.log(num);
		var ecol = 10;
		var erow = parseInt(num / 10);
		console.log(ecol);
		console.log(erow);
		var my_id = {}
		var myquery = { _id: ObjectID(req.body.uid) };
		var idnew = req.body.uid;
		console.log("idnew" + idnew);
		var newvalues = {
			$set: {
				userID: userID,
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
			}
		};

		dbo.collection("inventory").updateOne(myquery, newvalues, function (err, res) {
			if (err) throw err;
			console.log("1 document updated");

		});
		res.redirect("/events?id=" + userID);
	});

	app.post("/event_delete/:userID", urlencodedParser, function (req, res) {
		var myquery = {
			ename: req.body.edel,
			userID: req.params.userID,
			evenue: req.body.edelvenue
		};

		var userID = req.params.userID;

		dbo.collection("inventory").remove(myquery, function (err, obj) {
			if (err) throw err;
			console.log(obj.result.n + " document(s) deleted");

		});
		//res.redirect('/events');
		res.redirect("/events?id=" + userID);
	});


	app.post("/event_modify/:userID", urlencodedParser, function (req, res) {
		var userID = req.params.userID;
		var myquery = {
			ename: req.body.emod,
			userID: req.params.userID,
			evenue: req.body.emodvenue
		};

		dbo.collection("inventory")
			.find(myquery)
			.toArray(function (err, result) {
				if (err) throw err;

				if (result.length != 0) {
					flag = 1;

					console.log("available in profile");
				} else {
					flag = 0;
					console.log("not available in profile");
				}

				var a = result;

				res.render("event_modify", { result: a, userID: userID });


			});

	});
	var ven = [];
	var movi = [];

	app.get('/addmovie/:userID', function (req, res, next) {
		var userID = req.params.userID;



		dbo.collection("movies").find({ mv_type: "movies" }).toArray(function (err, result) {
			if (err) {
				console.log(err);
			}
			else {
				for (i = 0; i < result.length; i++) {
					movi[i] = result[i];
				}
			}
		});
		dbo.collection("venue").find({ v_type: "movie" }).toArray(function (err, result) {
			if (err) {
				console.log(err);
			}
			else {
				for (i = 0; i < result.length; i++) {
					ven[i] = result[i];
				}
			}

			res.render('addmovie', { movies: movi, venue: ven, userID: userID });
		})


	})







	app.post("/addmoviesubmit/:userID", urlencodedParser, function (req, res) {
		var resultArray = {
			movies: [],
			venue: []
		};
		var userID = req.params.userID;
		var num = parseInt(req.body.eseats);
		var myven = {
			v_name: req.body.evenue,
		};
		var myquery = {
			mvname: req.body.ename,
		};
		var ecol = 10;
		var erow = parseInt(num / 10);
		var cursor = dbo.collection("movies").find(myquery);
		cursor.forEach(function (doc, err) {
			//	 resultArray.movies.push(doc);
			console.log("document", doc);
			console.log("Error", err);
			resultArray.movies.push(doc);
			console.log("value here", resultArray.movies);
			var venue = dbo.collection('venue').find(myven);
			venue.forEach(
				function (doc, err) {
					resultArray.venue.push(doc);
				},
				function () {
					console.log(resultArray);
					var resmov = resultArray.movies;
					var resven = resultArray.venue;
					var a = {
						userID: userID,

						more_id: resmov[0]._id,
						ven_id: resven[0]._id,
						ename: req.body.ename,
						etime: req.body.etime,
						
						evenue: req.body.evenue,
						eseats: req.body.eseats,
						
						eprice: req.body.eprice,
						edate: req.body.edate,
						ecol: ecol,
						erow: erow
					}
					dbo.collection("Inventory").insertOne(a, function (err, res) {
						if (err) throw err;
						console.log("1 document inserted");

					});

					res.redirect("/events?id=" + userID);
				});

		});

	});

	app.get("/profile/:userID", function (req, res) {
		var userID = req.params.userID;
		var myquery = { _id: ObjectID(userID) };

		// var id=decodeURIComponent(userID);
		// var o_id = new mongo.ObjectID(userID);

		dbo.collection("User")
			.find(myquery)
			.toArray(function (err, result) {
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


	app.post("/profilemodify/:userID", urlencodedParser, function (req, res) {
		var userID = req.params.userID;



		var myquery = { _id: ObjectID(userID) };


		var newvalues = {
			$set: {
				u_name: req.body.uname,
				u_email: req.body.umail,
				u_phone: req.body.uphone,
				u_city: req.body.ucity,
			}
		};

		dbo.collection("User").updateOne(myquery, newvalues, function (err, res) {
			if (err) throw err;
			console.log("1 document updated");

		});
		res.redirect("/profile/" + userID);
	});


	app.post("/passwordmodify/:userID", urlencodedParser, function (req, res) {
		var userID = req.params.userID;



		var myquery = { _id: ObjectID(userID) };


		var newvalues = {
			$set: {
				u_password: req.body.newpass
			}
		};

		dbo.collection("User").updateOne(myquery, newvalues, function (err, res) {
			if (err) throw err;
			console.log("1 document updated");

		});
		res.redirect("/profile/" + userID);
	});




	app.get('/home/:location', function (req, res) {
		dbo.collection("movies").find().toArray(function (err, result) {
			if (err) {
				console.log(err);
			}
			else {
				for (i = 0; i < result.length; i++) {
					mov[i] = result[i];
				}
			}
			res.render('movie_landing',{mov:mov});
		})

	})
	app.get('/search', function (req, res) {
		var query = req.query.search;
		console.log("query", query);
		var cursor1 = dbo.collection("movies").find({ $text: { $search: query } });
		movdata = [];
		cursor1.forEach(function (doc1, err1) {

			movdata.push(doc1);
		},
			function () {
				console.log("movie", movdata);
				res.render('search', { movdata: movdata });
			})
	})




	app.get('/profile', function (req, res) {
		var username = "vadlasushma";
		dbo.collection("user").find({ username: username }).toArray(function (err, result) {
			if (err) {
				console.log(err);
			}
			else {
				for (i = 0; i < result.length; i++) {
					pro[i] = result[i];
				}
			}
			res.render('user_profile', { pro: pro });

		})
	})

	app.get('/edit', function (req, res) {
		var username = req.query.username;
		var name = req.query.name;
		var email = req.query.email;
		var mobile = req.query.mobile;
		console.log(username);
		var myquery = { username: "vadlasushma" };
		var newvalues = { $set: { username: username, name: name, email: email, mobile: mobile } };
		dbo.collection("user").updateOne(myquery, newvalues, function (err, res) {
			if (err) throw err;
			console.log("1 document updated");
		})
		var query = "vadlasushma";
		dbo.collection("user").find({ username: query }).toArray(function (err, result) {
			if (err) {
				console.log(err);
			}
			else {
				for (i = 0; i < result.length; i++) {
					pro[i] = result[i];
				}
			}
			res.render('user_profile', { pro: pro });
		})

	})


	app.get('/update', function (req, res) {
		var username = "vadlasushma";
		dbo.collection("user").find({ username: username }).toArray(function (err, result) {
			if (err) {
				console.log(err);
			}
			else {
				for (i = 0; i < result.length; i++) {
					pro[i] = result[i];
				}
			}
			res.render('update_profile', { pro: pro });

		})

	})
	app.get('/complaint', function (req, res) {

		res.render('complaint_profile');



	})
	app.get('/history', function (req, res) {

		res.render('history_profile');



	})

	// app.get('/book/:mvname/:userID', function (req, res) {
	// 	var userID=req.params.userID;
	//   var resultArray = {
	//     movies: [],
	//     venue: []
	//   };

	//   var cursor = dbo.collection('movies').find({ mvname: req.params.mvname });
	//   cursor.forEach(function (doc, err) {
	//     //	 resultArray.movies.push(doc);
	//     //console.log("document",doc);
	//     //console.log("Error",err);
	//     resultArray.movies.push(doc);
	//     //console.log("value here",resultArray.movies);
	//     var venue = dbo.collection('inventory').find({ ename:req.params.mvname});
	//     venue.forEach(function (doc, err) {
	//       resultArray.venue.push(doc);
	//     }, function () {
	//       //console.log(resultArray);
	//       res.render('bookmovie', { movies: resultArray.movies, venue: resultArray.venue, userID:userID });
	//     })
	//   })
	// })
	//

	app.get("/book/:mvname/:userID", function (req, res) {
		var userID = req.params.userID;
		var resultArray = {
			movies: [],
			venue: []
		};

		var cursor = dbo.collection("movies").find({ mvname: req.params.mvname });
		cursor.forEach(function (doc, err) {
			//	 resultArray.movies.push(doc);
			console.log("document", doc);
			console.log("Error", err);
			resultArray.movies.push(doc);
			console.log("value here", resultArray.movies);
			var venue = dbo.collection('inventory').find({ ename: req.params.mvname });
			venue.forEach(
				function (doc, err) {
					resultArray.venue.push(doc);
				},
				function () {
					console.log(resultArray);
					res.render("bookmovie", {
						movies: resultArray.movies,
						venue: resultArray.venue,
						userID: userID
					});
				}
			);
		});
		// dbo.collection("movies").find({ mvname: req.params.mvname }).toArray(function (err, result) {
		//   if (err) {
		//     console.log(err);
		//   }
		//   else {
		//     for (i = 0; i < result.length; i++) {
		// 			movi[i] = result[i];
		// 			console.log(movi[i]);
		//     }
		// 	}
		// })
		// console.log(req.params.mvname);

		// dbo.collection("inventory").find({ ename:req.params.mvname}).toArray(function (err, result) {
		//   if (err) {
		//     console.log(err);
		//   }
		//   else {
		//     for (i = 0; i < result.length; i++) {
		// 			ven[i] = result[i];
		// 			console.log(ven[i]);
		// 			window.alert(ven[i]);
		//     }
		// 	}

		// 		res.render('bookmovie', { movies:movi, venue: ven, userID:userID });





		// });


	})
})


app.listen(3000, function () {
	console.log('Port 3000')
})