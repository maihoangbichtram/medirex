var ref = firebase.database().ref();
var answers_path;
var scores_path;

var great_path = 'questions/great';
var poorly_path = 'questions/poorly';

getNumOfEvents(great_path + '/*/', printQuestions, "great");
getNumOfEvents(poorly_path + '/*/', printQuestions, "poorly");

var questionMap = new Map();
var answerMapGreat = new Map();
var answerMapPoorly = new Map();
var openEndMap = new Map();

function getNumOfEvents(pathRef, fnc, mood) {
	var arr = pathRef.split("/*/");
	var path = arr[0];
	ref.child(path).once('value', function(snap) {
		fnc(arr[1], snap.numChildren(), mood);
		if(pathRef.indexOf('answers') == -1)
			questionMap.set(mood, snap.numChildren());
		else
			mood == 'great' ? answerMapGreat.set(arr[1], snap.numChildren()) : answerMapPoorly.set(arr[1], snap.numChildren());
		ref.child(path).off('value');
	});
}

function printQuestions(key, numEvent, mood) {
	var index = 0;
	var moodRef = ref.child('questions/' + mood);
	moodRef.on('child_added', snapshot => {
		index++;
		if(index <= numEvent) {
			var spancol;
			var adding;
			if(snapshot.key == 1) {
				spancol = 1;
				adding = '<th class="centerText">Answers</th><th class="centerText">Probability</th>';
			} else {
				spancol = 3;
				adding = '';
			}
			var appendVal = '<tr><td spancol="' + spancol + '"><p style="font-weight: bold">' + snapshot.val().question + '<p></td>' + adding + '</tr>';
			$('#tbody' + mood).append(appendVal);
			getNumOfEvents('questions/' + mood + "/" + snapshot.key + '/answers/*/' + snapshot.key, printAnswers, mood);
		} 
		if(index == numEvent) {
			moodRef.off('child_added');
		}
	});
}

function printAnswers(key, numEvent, mood) {
	var answersRef = ref.child('questions/' + mood + "/" + key + '/answers')
	var numOfEvents;
	var index = 0;

	answersRef.on('child_added', snapshot => {
		index++;
		var id = key + snapshot.key + mood;
		if(index <= numEvent) {
			$('#tbody' + mood).append('<tr><td id="' + id + 'q">' + snapshot.val().answer + '</td><td id="' + key + snapshot.key + mood + 'ans" class="centerText">_</td><td id="' + key + snapshot.key + mood + '" class="centerText">_</td></tr>');
			if(snapshot.val().open_ended) { 
				openEndMap.set(key, snapshot.key);
			}
		} 
		if(index == numEvent) {
			answersRef.off('child_added');
		}
	});
}

function init() {
	answers_path = 'user_answers/' + dateStamp + '/answers';
	getQA('great');
	getQA('poorly');
	setTimeout(displayHeadDiv,1500);
}

function displayHeadDiv() {
	$('#loading').hide();
	$('#printStat').show();
}

function getQA(mood) {
	for(var i = 1; i <= questionMap.get(mood); i++) {
		var answerMap = (mood == 'great' ? answerMapGreat : answerMapPoorly);
		for(var h = 1; h <= answerMap.get('' + i); h++) {
			getStat('' + i,'' + h,mood);
		}
	}
}

function getStat(qKey, aKey, mood) {
	var dateRef = ref.child(answers_path + '/' + mood);
	dateRef.once('value', snapshot => {
		var num = snapshot.numChildren();
		var dateRef_2 = dateRef;
		dateRef_2.orderByChild(qKey).startAt(aKey).endAt(aKey + '\\ufBff').once('value', snap => {
			console.log(snap.val());
			if(num != 0) {
				document.getElementById(qKey + aKey + mood).innerHTML = (snap.numChildren()/num).toFixed(2);
				document.getElementById(qKey + aKey + mood + "ans").innerHTML = snap.numChildren();
			} else {
				document.getElementById(qKey + aKey + mood).innerHTML = 0;
				document.getElementById(qKey + aKey + mood + "ans").innerHTML = 0;
			}
		});
		if(qKey == 1 && aKey == 1)
			document.getElementById('totalAns_'+mood).innerHTML = num;
		//dateRef.off('value');
	});
}