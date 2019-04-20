var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

const express = require('express')
const app = express()

app.set('view engine', 'ejs')

app.use(express.static(__dirname + '/public'))
app.set('port', process.env.PORT || 3000)

MongoClient.connect(url, function (err, db) {

  var dbo = db.db("mydb1");
  var student = [];
  var student1=[];
  
  app.get('/student', function (req, res) {
   
dbo.collection("student").find().toArray(function (err, result) {
      if (err) {
        console.log(err);
      }
      else {
        for (i = 0; i < result.length; i++) {
          student[i] = result[i];
        }
      }
     res.render('student_landing', { student:student });
})

  })
   
  app.get("/add", function (req, res) {
    var name=req.query.name;
    var status=req.query.status;
    var myobj = { mv_name: name, status: status };
    dbo.collection("student").insertOne(myobj, function(err, res){
      if (err) throw err;
    console.log("1 document inserted");
    }
  )
dbo.collection("student").find().toArray(function (err, result) {
      if (err) {
        console.log(err);
      }
      else {
        for (i = 0; i < result.length; i++) {
          student[i] = result[i];
        }
      }
     res.render('student_landing', { student:student });
})

  })

  app.get('/display', function (req, res) {
    var query=req.query.stname;
    console.log(query);
    dbo.collection("student").find({mv_name:query}).toArray(function (err, result) {
      if (err) {
        console.log(err);
      }
      else {
        for (i = 0; i < result.length; i++) {
          student1[i] = result[i];
        }
      }
     res.render('student_input', { student1:student1 });
})

  })
})
app.listen(3005, function () {
    console.log('Port 3000')
  })
