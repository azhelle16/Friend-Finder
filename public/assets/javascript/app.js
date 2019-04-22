/*
 #######################################################################
 #
 #  FUNCTION NAME : 
 #  AUTHOR        : 
 #  DATE          : 
 #  MODIFIED BY   : 
 #  REVISION DATE : 
 #  REVISION #    : 
 #  DESCRIPTION   : 
 #  PARAMETERS    : 
 #
 #######################################################################
*/

/* GLOBAL VARIABLES */
var qidArr = [] //for question ids

$(document).ready(function() {

	$("#tts").on("click",function() {

		$.ajax({
			url: '/survey-html',
			method: 'GET'
		}).then(function(message){
			console.log(message)
			getQuestions();
		});

	})

	$(".flist").on("mouseenter", function () {
        $(".submenus").slideDown("fast")
    })

    $(".flist").on("click", function (e) {
        e.preventDefault()
    })

    $(".submenus").on("mouseleave", function () {
        $(this).slideUp('fast');
    })

    $(".submenus span:last-child").on("click", function (e) {

        e.preventDefault();
		$.ajax({
			url: '/api/friends',
			method: 'GET'
		}).then(function(results){
			$(".submenus").slideUp("fast")
			var img = $("<img>")
			img.attr("src","../assets/images/loading.gif")
			img.attr("width",50)
			img.attr("height",50)
			var br = $("<br>")
			var br2 = $("<br>")
			$("#friendModal .modal-body").empty().append(br)
			$("#friendModal .modal-body").append(img)
			$("#friendModal .modal-body").append(br2)
			createImages(results,"friendModal")
		});
 
    })
	

})

$(document).on("click", "button", function(e) {

	e.preventDefault()

	switch ($(this).attr("id").toLowerCase()) {
		case "submitbtn":
			var isOK = validateData()

			if (isOK) insertInfo()
			else {
				return
			}

		break;
	}

})

/*
 #######################################################################
 #
 #  FUNCTION NAME : getQuestions
 #  AUTHOR        : Maricel Louise Sumulong
 #  DATE          : April 08, 2019 PDT
 #  MODIFIED BY   : Maricel Louise Sumulong
 #  REVISION DATE : April 10, 2019 PDT
 #  REVISION #    : 1
 #  DESCRIPTION   : queries the database for the questions
 #  PARAMETERS    : none
 #
 #######################################################################
*/

function getQuestions() {

	$("#question-div").empty()
	var choices = ["Strongly Disagree","Disagree","Neutral","Agree","Strongly Agree"]

	$.ajax({
		url: '/show-question',
		method: 'GET'
	}).then(function(data){
		for (var m = 0; m < data.length; m++) {
			if (qidArr.indexOf(data[m].id) == -1 )
				qidArr.push(data[m].id)
			var sp = $("<h3>")
			sp.text("Question "+(m+1)+":")
			var p = $("<span>")
			p.append(data[m].question)
			p.attr("id","question-"+data[m].id)
			// SELECT
			var psel = $("<div>")
			var sel = $("<select>")
			sel.attr("id","sel-question-"+data[m].id)
			var op = $("<option>")
			op.text("Select An Option")
			op.attr("value","")
			sel.append(op)
			for (var n = 0; n < choices.length; n++) {
				var opt = $("<option>")
				opt.text(choices[n])
				opt.attr("value",parseInt(n+1))
				sel.append(opt)
			}
			psel.append(sel)
			var br = $("<br>")
			$("#question-div").append(sp)
			$("#question-div").append(p)
			$("#question-div").append(psel)
			$("#question-div").append(br)
		}
		//BUTTON
		var b = $("<button>")
		b.attr("class","btn btn-secondary btn-block")
		b.attr("type","button")
		b.text("Submit")
		b.attr("id","submitBtn")
		$("#question-div").append(b)
	});

}

/*
 #######################################################################
 #
 #  FUNCTION NAME : validateData
 #  AUTHOR        : Maricel Louise Sumulong
 #  DATE          : April 08, 2019 PDT
 #  MODIFIED BY   : Maricel Louise Sumulong
 #  REVISION DATE : April 10, 2019 PDT
 #  REVISION #    : 2
 #  DESCRIPTION   : validates form
 #  PARAMETERS    : none
 #
 #######################################################################
*/

function validateData() {

	var name = $("#name-input").val()
	var photo = $("#photo-input").val()
	var noAns = []

	if (photo == "" || name == "") {
		alertMsg("Please fill required (*) fields.")
		return
	}

	//PHOTO URL VALIDATION

	//CHECK IF ALL QUESTIONS ARE ANSWERED
	for (var t = 0; t < qidArr.length; t++) {
		if ($("#sel-question-"+qidArr[t]).val() == "") {
			$("#question-"+qidArr[t]).addClass("error")
			noAns.push(qidArr[t])
		} else if ($("#question-"+qidArr[t]).hasClass("error")) {
			$("#question-"+qidArr[t]).removeClass("error")
		  }
	}

	if (noAns.length > 0) {
		alertMsg("Please provide answer to the question/s marked in red.")
		$("#question-div").animate({
		    scrollTop: $(".error").first().offset().top
		}, 2000);
        return 0
	} else {
		$("#question-div span").each(function() {
			$(this).removeClass("error")
		})
	  }

	  return 1

}

/*
 #######################################################################
 #
 #  FUNCTION NAME : alertMsg
 #  AUTHOR        : Maricel Louise Sumulong
 #  DATE          : April 08, 2019 PDT
 #  MODIFIED BY   : 
 #  REVISION DATE : 
 #  REVISION #    : 
 #  DESCRIPTION   : alerts error message
 #  PARAMETERS    : message
 #
 #######################################################################
*/

function alertMsg(msg) {

	$("#alertModal .modal-body").empty().append(msg)
 	$("#alertModal").modal("show")

}

/*
 #######################################################################
 #
 #  FUNCTION NAME : insertInfo
 #  AUTHOR        : Maricel Louise Sumulong
 #  DATE          : April 08, 2019 PDT
 #  MODIFIED BY   : Maricel Louise Sumulong
 #  REVISION DATE : April 10, 2019 PDT
 #  REVISION #    : 2
 #  DESCRIPTION   : submits query to insert the user's info to db
 #  PARAMETERS    : none
 #
 #######################################################################
*/

function insertInfo() {

	var name = $("#name-input").val()
	var photo = $("#photo-input").val()

	$.ajax({
		url: '/ff-info-insert',
		method: 'POST',
		data: {name_input : name, photo_input : photo}
	}).then(function(message){
		if ('error' in message) {
			alertMsg(message.error)
			return
		} else {
			insertAnswers(message.id,findBestMatch)
		  }
	});

}

/*
 #######################################################################
 #
 #  FUNCTION NAME : insertAnswers
 #  AUTHOR        : Maricel Louise Sumulong
 #  DATE          : April 10, 2019 PDT
 #  MODIFIED BY   : Maricel Louise Sumulong
 #  REVISION DATE : April 20, 2019 PDT
 #  REVISION #    : 1
 #  DESCRIPTION   : submits query to insert the user's answers to db
 #  PARAMETERS    : user id, callback
 #
 #######################################################################
*/

function insertAnswers(id,callback) {

	for (var a = 0; a < qidArr.length; a++) {

		var score = $("#sel-question-"+qidArr[a]).val()
		var qid = qidArr[a]

		$.ajax({
			url: '/ff-question-insert/' + id,
			method: 'POST',
			data: {question_id : qid, score : score},
			async: false
		}).done(function(message){
			if ('error' in message) {
				alertMsg(message.error)
				return
			} 
			//console.log("answers insert")
		});

	}

	//findBestMatch(id)
	callback(id)
	clearFormAndOtherData()
}

/*
 #######################################################################
 #
 #  FUNCTION NAME : createImages
 #  AUTHOR        : Maricel Louise Sumulong
 #  DATE          : April 10, 2019 PDT
 #  MODIFIED BY   : Maricel Louise Sumulong
 #  REVISION DATE : April 22, 2019 PDT
 #  REVISION #    : 1
 #  DESCRIPTION   : creates a human readable form of the friends list
 #  PARAMETERS    : json data, modal name
 #
 #######################################################################
*/

function createImages(results, modal) {

	//console.log(results)

	$("#"+modal+" .modal-body").empty()

	if (results.length == 0) {

		var msg = ""
		switch (modal.toLowerCase()) {
			case "friendmodal": msg = "No data on the database.\n"; break;
			case "matchmodal": msg = "No match found.\n"; break;
		}

		$("#"+modal+" .modal-body").append(msg)

	} else {

		for (var b = 0; b < results.length; b++) {
			var main_div = $("<div>")
			main_div.attr("class","media mb-3")
			var div1 = $("<div>")
			div1.attr("class","media-left align-self-center")
			var img = $("<img>")
			if (results[b].scores == undefined) {
				img.attr("class","matchsize media-object")
			} else {
				img.attr("class","imgsize media-object")
			}
			img.attr("src",results[b].picture_link)
			div1.append(img)
			var div2 = $("<div>")
			div2.attr("class","media-body ml-4")
			var hr = $("<h4>")
			hr.attr("class","media-heading text-justify")
			hr.text(results[b].name)
			var br = $("<br>")
			div2.append(hr)
			div2.append(br)
			if (results[b].scores != undefined) {
				var p = $("<p>")
				p.text("Scores: "+results[b].scores.join(", "))
				div2.append(p)
			}
			main_div.append(div1)
			main_div.append(div2)
			$("#"+modal+" .modal-body").append(main_div)
		}
	
	}
	//console.log(modal)

	$("#"+modal).modal("show")

 }

 /*
 #######################################################################
 #
 #  FUNCTION NAME : clearFormAndOtherData
 #  AUTHOR        : Maricel Louise Sumulong
 #  DATE          : April 10, 2019 PDT
 #  MODIFIED BY   : 
 #  REVISION DATE : 
 #  REVISION #    : 
 #  DESCRIPTION   : resets the data and questionnaires
 #  PARAMETERS    : none
 #
 #######################################################################
*/	

function clearFormAndOtherData() {

	qidArr = []
	$("#name-input").val("")
	$("#photo-input").val("")
	getQuestions()

}

 /*
 #######################################################################
 #
 #  FUNCTION NAME : findBestMatch
 #  AUTHOR        : Maricel Louise Sumulong
 #  DATE          : April 20, 2019 PDT
 #  MODIFIED BY   : 
 #  REVISION DATE : 
 #  REVISION #    : 
 #  DESCRIPTION   : resets the data and questionnaires
 #  PARAMETERS    : user id
 #
 #######################################################################
*/	

function findBestMatch(id) {

	$.ajax({
		url: '/match',
		method: 'POST',
		data: {id : id}
	}).then(function(message){
		if ('error' in message) {
			alertMsg(message.error)
			return
		} else if ('message' in message) {
			alertMsg(message.message) //No match or no entry
		} else {
			createImages(message, "matchModal")
		  }
	});

}
