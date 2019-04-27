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
                var a = {   $set:{
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
                 } };
                 dbo.collection("Inventory").updateOne(myquery, a, function(err, res) {
                    if (err) throw err;
                    console.log("1 document updated");
                    db.close();
                  });

                res.redirect("/events?id=" + userID);
            }
        );
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