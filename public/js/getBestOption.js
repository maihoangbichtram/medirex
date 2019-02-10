
var bestStat = 0;
var bestOption = [];

var qKey = '1';
var mood = 'great';

getAnswers();
var answers = [];

function getAnswers() {
	var answersRef = ref.child('questions/' + mood)
	var numOfEvents;
	var index = 0;

	answersRef.once('child_added', snapshot => {
		answers = snapshot.val().answers;
		for(var i = 1; i < answers.length; i++) {
			getTotal(answers[i].answer, '' + i);
		}
		answersRef.off('child_added');
	});
}

function distributeAnswers() {	
	bestStat = 0;
	for(var i = 1; i < answers.length; i++) {
		getTotal(answers[i].answer, '' + i);
	}
}

function getTotal(answer, i) {
	var mood_answers = ref.child(answers_path + '/' + mood);
	mood_answers.once('value', snapshot => {
		var index = snapshot.numChildren();
		getStat(index, answer, i);
	});
}

function getStat(index, answer, key) {
	var mood_answers = ref.child(answers_path + '/' + mood);

	mood_answers.orderByChild(qKey).startAt(key).endAt(key + '\ufBff').once('value', snapshot => {
		if(index != 0) {
			var stat = snapshot.numChildren()/index;
				if(stat != 0) {
					if(stat > bestStat) {
						bestStat = stat;
						document.getElementById('bestOption').innerHTML = answer;
					} else if (stat == bestStat) {
						$('#bestOption').append(", " + answer);
					}
				}
		}
		//mood_answers.off('value');
	});
}

ref.child(answers_path).on('child_changed', snapshot => {
	distributeAnswers();
	console.log(snapshot.val());
});

