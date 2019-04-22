require("dotenv").config();
var express = require("express")
var mysql = require("mysql")
var path = require("path")
var app = express()
var bodyParser = require('body-parser')
var met = require("method-override")

var mysql = require('mysql');
var con

if (process.env.JAWSDB_URL) {
  con = mysql.createConnection(process.env.JAWSDB_URL)

} else {
  con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });
}
 
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

app.post('/match', function(req, res){
	//console.log(`SELECT friends.name, friends.picture_link, matched.otherId FROM friends LEFT JOIN (SELECT them otherId, SUM(diff)-COUNT(*) score FROM (SELECT  their.friend_id them, ABS(their.score-my.score) diff FROM scores their LEFT JOIN scores my ON their.question_id=my.question_id WHERE their.friend_id!=my.friend_id AND my.friend_id=${req.body.id}) t1 GROUP BY them ORDER BY score )matched ON friends.id = matched.otherId WHERE friends.id = matched.otherId`)
	con.query(`SELECT f.name, f.picture_link, them otherId, SUM(diff)-COUNT(*) score 
				FROM (
					SELECT  their.friend_id them, ABS(their.score-my.score) diff 
					FROM scores their 
					LEFT JOIN scores my ON their.question_id=my.question_id 
					WHERE their.friend_id!=my.friend_id AND my.friend_id=?) t1
				LEFT JOIN friends f ON them = f.id GROUP BY them ORDER BY score
				LIMIT 1`, 
			  [req.body.id],function (error, results, fields) {
			  	//console.log(results)
	  if (error) res.json({error : error})
	  else {
	  	if (results.length == 0) {
	  		res.json({message:"No friends available to match yet. You're the first one to take the survey! :)"})
	  	} else { 
	  		res.json(results)
	  	  }
	  }
	});
});

app.listen(process.env.PORT || 3001, function() {
  var port = process.env.PORT || 3001
  console.log('listening on '+port);
});