var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://localhost:27017/";
var ObjectID = require("mongodb").ObjectID;
const express = require("express");
const app = express();
var bodyParser = require("body-parser");
var async = require("async");
app.set("view engine", "ejs");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true
	})
);
app.use(express.static(__dirname + "/public"));
app.set("port", process.env.PORT || 3000);

MongoClient.connect(url, function(err, db) {
	var dbo = db.db("mydb");
	var mov = [];
	var user = [];
	var movdata = [];
	var pro = [];
	var leng;
	app.get("/", function(req, res) {
		res.redirect("/home");
	});
	app.post("/loginCheck", function(req, res) {
		console.log("Req body in login ", req.body);
		dbo.collection("User").findOne({ u_name: req.body.username }, function(
			err,
			user
		) {
			console.log("User found ");
			// In case the user not found
			if (err) {
				console.log("THIS IS ERROR RESPONSE");
				res.json(err);
			}
			if (user && user.u_password === req.body.password) {
				console.log("User and password is correct");
				res.json(user);
			} else {
				console.log("Credentials wrong");
				res.json({ data: "Login invalid" });
			}
		});
	});
	app.get("/home", function(req, res) {
		var userID = req.query.id;
		dbo.collection("movies")
			.find()
			.toArray(function(err, result) {
				if (err) {
					console.log(err);
				} else {
					for (i = 0; i < result.length; i++) {
						mov[i] = result[i];
					}

					res.render("movie_landing", {
						mov: mov,
						userID: userID
					});
				}
				//	res.render("movie_landing", { mov: mov, userID: userID });
			});
	});

	app.get("/checkout", function(req, res) {
		res.render("checkout");
	});
	app.get("/confirm/:userID", function(req, res) {
		var userID = req.params.userID;
		res.render("confirm_form", { userID: userID });
	});
	app.post("/event_reg/:userID", urlencodedParser, function(req, res) {
		var userID = req.params.userID;

		dbo.collection("venue")
			.find({ v_type: "event" })
			.toArray(function(err, result) {
				if (err) {
					console.log(err);
				} else {
					for (i = 0; i < result.length; i++) {
						ven[i] = result[i];
					}
				}

				res.render("event_register", { venue: ven, userID: userID });
			});
	});

	app.get("/signup", function(req, res) {
		res.render("signup");
	});

	app.get("/loadevent/:userID", function(req, res) {
		var userID = req.params.userID;
		res.render("events?id=" + userID);
	});

	app.get("/events", function(req, res) {
		var userID = req.query.id;
		
		var venue = [];
		var movies = [];
		var flag1 = 0;
		var flag2 = 0;
		var count1 = 0;
		var count = 0;
		var element = [];
		var element1 = [];
		var result1;
		var tasks = [
			function(callback) {
				dbo.collection("Inventory")
					.find({ userID: userID })
					.toArray(function(err, result) {
						if (err) return callback(err);
						if (result.length != 0) {
							result1 = result;
							
							callback();
							
						} else {
							result1 = [];
							
							callback();
						}
					});
			},
			function(callback) {
				dbo.collection("Inventory")
					.find({ userID: userID })
					.toArray(function(err, result) {
						if (err) throw err;
						if (result.length != 0) {
							console.log('in movie');
							for (var i = 0; i < result.length; i++) {
								var movie = dbo
									.collection("movies")
									.find({ _id: result[i].more_id });

								movie.forEach(function(doc, err) {
									element = doc;
									movies.push(element);

									count++;

									if (count == result.length) {
										flag1 = 1;
										if (flag1) {
											callback();
										}
									}
								});
							}
						} else {
							movies = [];
							callback();
						}
					});
			},

			function(callback) {
				dbo.collection("Inventory")
					.find({ userID: userID })
					.toArray(function(err, result) {
						if (err) throw err;
						console.log('in venuer');
						if (result.length != 0) {
							for (var i = 0; i < result.length; i++) {
								var venues = dbo
									.collection("venue")
									.find({ _id: result[i].ven_id });

								venues.forEach(function(doc, err) {
									element1 = doc;
									venue.push(element1);

									count1++;

									if (count1 == result.length) {
										flag2 = 1;
										if (flag2) {
											callback();
										}
									}
								});
							}
							
						} else {
							//do nothing
							venue = [];
							callback();
						}

						
					});
			}
		];
		async.parallel(tasks, function(err) {
			if (err) return next(err);
		
			console.log('in render');
			res.render("events", {
				movies: movies,
				venue: venue,
				userID: userID,
				result: result1
			});
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
		res.redirect("/home");
		// }
		// else{
		// 	console.log('wrong password');
		// 	res.render("signup");
		// }
	});

	app.post("/formsubmit/:userID", urlencodedParser, function(req, res) {
		var userID = req.params.userID;
		var a = {
			u_name: req.body.username,
			u_password: req.body.pass,
			u_email: req.body.email,
			u_phone: req.body.phone
		};

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
		res.render("checkout", { userID: userID });
	});

	app.post("/eventsubmit/:userID", urlencodedParser, function(req, res) {
		var resultArray = {
			movies: [],
			venue: []
		};
		var userID = req.params.userID;
		var num = parseInt(req.body.eseats);
		var myven = {
			v_name: req.body.evenue
		};
		var ecol = 10;
		var erow = parseInt(num / 10);
		var query = {
			mvname: req.body.ename,
			mv_type: "events",
			mv_lang: req.body.elang,
			mv_desc: req.body.edesc,
			mv_rating: req.body.erating,
			mv_image: req.body.eimg
		};
		dbo.collection("movies").insertOne(query, function(err, res) {
			if (err) throw err;
			console.log("1 document inserted");
		});
		var res1;
		var res2;
		var check = {
			mvname: req.body.ename,
			mv_type: "events",
			mv_lang: req.body.elang,
			mv_desc: req.body.edesc,
			mv_rating: req.body.erating,
			mv_image: req.body.eimg
		};

		var cursor = dbo.collection("movies").find(check);
		cursor.forEach(function(doc, err) {
			//	 resultArray.movies.push(doc);
			console.log("document", doc);
			console.log("Error", err);
			resultArray.movies.push(doc);
			console.log("value here", resultArray.movies);
			var venue = dbo.collection("venue").find(myven);
			venue.forEach(
				function(doc, err) {
					resultArray.venue.push(doc);
				},
				function() {
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
					};
					dbo.collection("Inventory").insertOne(a, function(
						err,
						res
					) {
						if (err) throw err;
						console.log("1 document inserted");
					});

					res.redirect("/events?id=" + userID);
				}
			);
		});
	});

	// app.post("/eventmodify/:userID", urlencodedParser, function(req, res) {
	// 	var userID = req.params.userID;

	// 	var num = parseInt(req.body.eseats);
	// 	console.log(num);
	// 	var ecol = 10;
	// 	var erow = parseInt(num / 10);
	// 	console.log(ecol);
	// 	console.log(erow);
	// 	var my_id = {};
	// 	var myquery = { _id: ObjectID(req.body.uid) };
	// 	var idnew = req.body.uid;
	// 	console.log("idnew" + idnew);
	// 	var newvalues = {
	// 		$set: {
	// 			userID: userID,
	// 			ename: req.body.ename,
	// 			elang: req.body.elang,
	// 			etype: req.body.etype,
	// 			etime: req.body.etime,
	// 			evenue: req.body.evenue,
	// 			eseats: req.body.eseats,
	// 			ecity: req.body.ecity,
	// 			edate: req.body.edate,
	// 			ecol: ecol,
	// 			erow: erow
	// 		}
	// 	};

	// 	dbo.collection("inventory").updateOne(myquery, newvalues, function(
	// 		err,
	// 		res
	// 	) {
	// 		if (err) throw err;
	// 		console.log("1 document updated");
	// 	});
	// 	res.redirect("/events?id=" + userID);
	// });

	app.post("/eventmodify/:userID", urlencodedParser, function(req, res) {
		var userID = req.params.userID;
		var resultArray = {
			movies: [],
			venue: []
		};
		var num = parseInt(req.body.eseats);
		console.log(num);
		var ecol = 10;
		var erow = parseInt(num / 10);
		var myven = {
			v_name: req.body.evenue
		};
		var myquery1 = {
			mvname: req.body.ename
		};

		var myquery = { _id: ObjectID(req.body.uid) };
		var idnew = req.body.uid;
		console.log("idnew" + idnew);

		var cursor = dbo.collection("movies").find(myquery1);
		cursor.forEach(function(doc, err) {
			resultArray.movies.push(doc);
			console.log("value here", resultArray.movies);
			var venue = dbo.collection("venue").find(myven);
			venue.forEach(
				function(doc, err) {
					resultArray.venue.push(doc);
				},
				function() {
					console.log(resultArray);
					var resmov = resultArray.movies;
					var resven = resultArray.venue;
					var a = {
						$set: {
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
					};
					dbo.collection("Inventory").updateOne(myquery, a, function(
						err,
						res
					) {
						if (err) throw err;
						console.log("1 document updated");
					});

					res.redirect("/events?id=" + userID);
				}
			);
		});
	});

	app.post("/modify_eventnew/:userID", urlencodedParser, function(req, res) {
		var userID = req.params.userID;
		var evename = req.body.emodevent;
		var evevenue = req.body.emodvenueevent;
		console.log("\n\n\nname", evename);
		console.log("\n\n\nvenue", evevenue);
		var myquery = { ename: evename, evenue: evevenue };
		var tasks = [
			function(callback) {
				dbo.collection("Inventory")
					.find(myquery)
					.toArray(function(err, result) {
						if (err) return callback(err);
						if (result.length != 0) {
							result1 = result;
							console.log(result1);
							callback();
							console.log("available");
						} else {
							result1 = [];
							console.log("not available");
							callback();
						}
					});
			},

			function(callback) {
				dbo.collection("movies")
					.find({ mvname: evename })
					.toArray(function(err, result) {
						if (err) return callback(err);
						if (result.length != 0) {
							movies = result;
							console.log(result1);
							callback();
							console.log("available");
						} else {
							movies = [];
							console.log("not available");
							callback();
						}
					});
			},

			function(callback) {
				dbo.collection("venue")
					.find({})
					.toArray(function(err, result) {
						if (err) return callback(err);
						if (result.length != 0) {
							venue = result;
							console.log(result1);
							callback();
							console.log("available");
						} else {
							venue = [];
							console.log("not available");
							callback();
						}
					});
			}
		];
		async.parallel(tasks, function(err) {
			if (err) return next(err);
			console.log("Inside render");

			res.render("modify_eventnew", {
				movies: movies,
				venue: venue,
				userID: userID,
				result: result1
			});
		});
	});

	app.post("/modeventsubmit/:userID", urlencodedParser, function(req, res) {
		var userID = req.params.userID;
		var iid=req.body.iid;
		var uid=req.body.uid;
		var eid=req.body.eid;
		
		var myquery = { _id: ObjectID(eid) };
		var myquery1 = { _id: ObjectID(iid),
						userID:uid};
						console.log(ObjectID(iid));
		var newevent={$set:{
			mvname:req.body.ename,
			mv_type:"events",
			mv_lang:req.body.elang,
			mv_desc:req.body.edesc,
			mv_rating:req.body.erating,
			mv_image:req.body.eimg
		}};
		
		dbo.collection("movies").updateOne(myquery, newevent, function(
			err,
			res
		) {
			if (err) throw err;
			console.log("1 document updated");
			console.log(myquery);
		});

		dbo.collection("venue").findOne({v_name:req.body.evenue}, function(err, result) {
			if (err) throw err;
			if(result.length!=0){
				console.log("present in venue")
				console.log(result._id);
				var invent={$set:{
					ename:req.body.ename,
					ven_id:result._id,
					evenue:req.body.evenue,
					eseats:req.body.eseats,
					edate:req.body.edate,
					eprice:req.body.eprice,
					etime:req.body.etime
				}};
				dbo.collection("Inventory").updateOne(myquery1,invent,function(err,res){
					if(err)throw err;
					console.log("1 doc updated");
					console.log(myquery1);
				})
			}
			else{
				//do nothing
			}
			

			
		  });
		  res.redirect("/events?id=" + userID);
	});

	app.post("/event_delete/:userID", urlencodedParser, function(req, res) {
		var myquery = {
			ename: req.body.edel,
			userID: req.params.userID,
			evenue: req.body.edelvenue
		};

		var userID = req.params.userID;

		dbo.collection("Inventory").remove(myquery, function(err, obj) {
			if (err) throw err;
			console.log(obj.result.n + " document(s) deleted");
		});
		//res.redirect('/events');
		res.redirect("/events?id=" + userID);
	});

	app.post("/event_modify/:userID", urlencodedParser, function(req, res) {
		var userID = req.params.userID;
		var count = 0,
			count1 = 0;
		var flag1 = 0,
			flag2 = 0;
		var myquery = {
			ename: req.body.emod,
			userID: req.params.userID,
			evenue: req.body.emodvenue
		};
		var result1, movies, venue;
		var tasks = [
			function(callback) {
				dbo.collection("Inventory")
					.find(myquery)
					.toArray(function(err, result) {
						if (err) return callback(err);
						if (result.length != 0) {
							result1 = result;
							console.log(result1);
							callback();
							console.log("available");
						} else {
							result1 = [];
							console.log("not available");
							callback();
						}
					});
			},
			function(callback) {
				dbo.collection("movies")
					.find({})
					.toArray(function(err, result) {
						if (err) return callback(err);
						if (result.length != 0) {
							movies = result;
							console.log(result1);
							callback();
							console.log("available");
						} else {
							movies = [];
							console.log("not available");
							callback();
						}
					});
			},

			function(callback) {
				dbo.collection("venue")
					.find({})
					.toArray(function(err, result) {
						if (err) return callback(err);
						if (result.length != 0) {
							venue = result;
							console.log(result1);
							callback();
							console.log("available");
						} else {
							venue = [];
							console.log("not available");
							callback();
						}
					});
			}
		];
		async.parallel(tasks, function(err) {
			if (err) return next(err);
			console.log("Inside render");

			res.render("event_modify", {
				movies: movies,
				venue: venue,
				userID: userID,
				result: result1
			});
		});
	});
	var ven = [];
	var movi = [];

	app.get("/addmovie/:userID", function(req, res, next) {
		var userID = req.params.userID;

		dbo.collection("movies")
			.find({ mv_type: "movies" })
			.toArray(function(err, result) {
				if (err) {
					console.log(err);
				} else {
					for (i = 0; i < result.length; i++) {
						movi[i] = result[i];
					}
				}
			});
		dbo.collection("venue")
			.find({ v_type: "movie" })
			.toArray(function(err, result) {
				if (err) {
					console.log(err);
				} else {
					for (i = 0; i < result.length; i++) {
						ven[i] = result[i];
					}
				}

				res.render("addmovie", {
					movies: movi,
					venue: ven,
					userID: userID
				});
			});
	});

	app.post("/addmoviesubmit/:userID", urlencodedParser, function(req, res) {
		var resultArray = {
			movies: [],
			venue: []
		};
		var userID = req.params.userID;
		var num = parseInt(req.body.eseats);
		var myven = {
			v_name: req.body.evenue
		};
		var myquery = {
			mvname: req.body.ename
		};
		var ecol = 10;
		var erow = parseInt(num / 10);
		var cursor = dbo.collection("movies").find(myquery);
		cursor.forEach(function(doc, err) {
			//	 resultArray.movies.push(doc);
			console.log("document", doc);
			console.log("Error", err);
			resultArray.movies.push(doc);
			console.log("value here", resultArray.movies);
			var venue = dbo.collection("venue").find(myven);
			venue.forEach(
				function(doc, err) {
					resultArray.venue.push(doc);
				},
				function() {
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
					};
					dbo.collection("Inventory").insertOne(a, function(
						err,
						res
					) {
						if (err) throw err;
						console.log("1 document inserted");
					});

					res.redirect("/events?id=" + userID);
				}
			);
		});
	});

	app.get("/profile/:userID", function(req, res) {
		var userID = req.params.userID;
		var myquery = { _id: ObjectID(userID) };

		// var id=decodeURIComponent(userID);
		// var o_id = new mongo.ObjectID(userID);

		dbo.collection("User")
			.find(myquery)
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
	});

	app.post("/profilemodify/:userID", urlencodedParser, function(req, res) {
		var userID = req.params.userID;

		var myquery = { _id: ObjectID(userID) };

		var newvalues = {
			$set: {
				u_name: req.body.uname,
				u_email: req.body.umail,
				u_phone: req.body.uphone,
				u_city: req.body.ucity
			}
		};

		dbo.collection("User").updateOne(myquery, newvalues, function(
			err,
			res
		) {
			if (err) throw err;
			console.log("1 document updated");
		});
		res.redirect("/profile/" + userID);
	});

	app.post("/passwordmodify/:userID", urlencodedParser, function(req, res) {
		var userID = req.params.userID;

		var myquery = { _id: ObjectID(userID) };

		var newvalues = {
			$set: {
				u_password: req.body.newpass
			}
		};

		dbo.collection("User").updateOne(myquery, newvalues, function(
			err,
			res
		) {
			if (err) throw err;
			console.log("1 document updated");
		});
		res.redirect("/profile/" + userID);
	});

	app.get("/home/:location", function(req, res) {
		dbo.collection("movies")
			.find()
			.toArray(function(err, result) {
				if (err) {
					console.log(err);
				} else {
					for (i = 0; i < result.length; i++) {
						mov[i] = result[i];
					}
				}
				res.render("movie_landing", { mov: mov });
			});
	});
	app.get("/search", function(req, res) {
		var query = req.query.search;
		console.log("query", query);
		var cursor1 = dbo
			.collection("movies")
			.find({ $text: { $search: query } });
		movdata = [];
		cursor1.forEach(
			function(doc1, err1) {
				movdata.push(doc1);
			},
			function() {
				console.log("movie", movdata);
				res.render("search", { movdata: movdata });
			}
		);
	});

	app.get("/profile", function(req, res) {
		var username = "vadlasushma";
		dbo.collection("user")
			.find({ username: username })
			.toArray(function(err, result) {
				if (err) {
					console.log(err);
				} else {
					for (i = 0; i < result.length; i++) {
						pro[i] = result[i];
					}
				}
				res.render("user_profile", { pro: pro });
			});
	});

	app.get("/edit", function(req, res) {
		var username = req.query.username;
		var name = req.query.name;
		var email = req.query.email;
		var mobile = req.query.mobile;
		console.log(username);
		var myquery = { username: "vadlasushma" };
		var newvalues = {
			$set: {
				username: username,
				name: name,
				email: email,
				mobile: mobile
			}
		};
		dbo.collection("user").updateOne(myquery, newvalues, function(
			err,
			res
		) {
			if (err) throw err;
			console.log("1 document updated");
		});
		var query = "vadlasushma";
		dbo.collection("user")
			.find({ username: query })
			.toArray(function(err, result) {
				if (err) {
					console.log(err);
				} else {
					for (i = 0; i < result.length; i++) {
						pro[i] = result[i];
					}
				}
				res.render("user_profile", { pro: pro });
			});
	});

	app.get("/update", function(req, res) {
		var username = "vadlasushma";
		dbo.collection("user")
			.find({ username: username })
			.toArray(function(err, result) {
				if (err) {
					console.log(err);
				} else {
					for (i = 0; i < result.length; i++) {
						pro[i] = result[i];
					}
				}
				res.render("update_profile", { pro: pro });
			});
	});
	app.get("/complaint", function(req, res) {
		res.render("complaint_profile");
	});
	app.get("/history", function(req, res) {
		res.render("history_profile");
	});

	app.get("/book/:mvname/:userID", function(req, res) {
		var userID = req.params.userID;
		var resultArray = {
			movies: [],
			venue: []
		};

		var cursor = dbo
			.collection("movies")
			.find({ mvname: req.params.mvname });
		cursor.forEach(function(doc, err) {
			//	 resultArray.movies.push(doc);
			console.log("document", doc);
			console.log("Error", err);
			resultArray.movies.push(doc);
			console.log("value here", resultArray.movies);
			var venue = dbo
				.collection("inventory")
				.find({ ename: req.params.mvname });
			venue.forEach(
				function(doc, err) {
					resultArray.venue.push(doc);
				},
				function() {
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
	});
});

app.listen(3000, function() {
	console.log("Port 3000");
});
