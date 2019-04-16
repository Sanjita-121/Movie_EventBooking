app.post("/eventsubmit/:userID", urlencodedParser, function (req, res) {
    var userID = req.params.userID;
    var num = parseInt(req.body.eseats);
    console.log(num);
    var ecol = 10;
    var erow = parseInt(num / 10);
    console.log(ecol);
    console.log(erow);
    // var ob = {
    // 	userID: userID,
    // 	ename: req.body.ename,
    // 	elang: req.body.elang,
    // 	etype: "events",
    // 	etime: req.body.etime,
    // 	evenue: req.body.evenue,
    // 	eseats: req.body.eseats,
    // 	ecity: req.body.ecity,
    // 	edate: req.body.edate,
    // 	ecol: ecol,
    // 	erow: erow
    // };
    // dbo.collection("inventory").insertOne(ob, function (err, res) {
    // 	if (err) throw err;
    // 	console.log("1 document inserted");
    // });

    dbo.collection("inventory")
        .find()
        .toArray(function (err, result) {
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