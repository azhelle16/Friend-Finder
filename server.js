var express = require("express")
var mysql = require("mysql")
var path = require("path")
var app = express()
var bodyParser = require('body-parser')
var met = require("method-override")

con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "friend_finder"
});
 
con.connect(); 

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/survey', function (req, res) {
	res.sendFile(path.join(__dirname + '/public/survey.html'));	
})

app.get('/survey-html', function (req, res) {
	res.redirect("/survey")
})

app.get('/show-question', function(req, res){
	con.query('SELECT * FROM questions', function (error, results, fields) {
	  if (error) res.send(error)
	  else res.json(results);
	});
});

app.post('/ff-info-insert', function(req, res){
	con.query('INSERT INTO friends (name, picture_link) VALUES (?,?)', [req.body.name_input, req.body.photo_input],function (error, results, fields) {
	  if (error) res.json({error : error})
	  else 
	  	//res.j(results.insertId)
	  	res.json({
	  		id : results.insertId
	  	})
	});
});

app.post('/ff-question-insert/:id', function(req, res){
	con.query('INSERT INTO scores (question_id, friend_id, score) VALUES (?,?,?)', [req.body.question_id, req.params.id, req.body.score],function (error, results, fields) {
	  if (error) res.json({error : error})
	  else res.json({message : "success"})
	});
});

app.get("/api/friends", function(req, res) {
	var resArr = []
	con.query('SELECT DISTINCT friends.name, friends.picture_link, GROUP_CONCAT(scores.score ORDER BY scores.question_id SEPARATOR", ") as scores FROM friends LEFT JOIN scores on friends.id=scores.friend_id GROUP BY friends.id', function (error, results, fields) {
	  if (error) res.send(error)
	  else {
	  	for (var m = 0; m < results.length; m++) {
	  		var rJSON = {}
	  		rJSON["name"] = results[m].name
	  		rJSON["picture_link"] = results[m].picture_link
	  		rJSON["scores"] = results[m].scores.split(", ")
	  		resArr.push(rJSON)
	  	}
	  	res.json(resArr)
	  }
	});

});

app.listen(3000, function(){
	console.log('listening on 3000');
});