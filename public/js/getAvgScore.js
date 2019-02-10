window.onload = getAvgScore;

var count = 0;
var total = 0;

function getAvgScore() {
	var scores_ref = ref.child(scores_path);
	scores_ref.on('child_added', snapshot => {
		total += snapshot.val().score;
		count++;
		var percent = (total/count).toFixed(1);
		document.getElementById('avgScore').innerHTML = percent;
		var moodStatus = document.getElementById('moodStatus');
		var dayStatus = document.getElementById('dayStatus');
		if(percent < 50) {
			moodStatus.innerHTML = 'bad';
			dayStatus.innerHTML = 'bad';
		} else {
			moodStatus.innerHTML = 'well';
			dayStatus.innerHTML = 'good';
		}
		document.getElementById('avgScore_1').innerHTML = percent;
		document.getElementById('totalAnswer').innerHTML = count;
	});
}

var scores_ref_change = ref.child(scores_path);

scores_ref_change.on('child_changed', snapshot => {
	var changedPost = snapshot.val();
	var old_score = changedPost.old_score;
	var curScore = changedPost.score;
	total = total - old_score + curScore;
	document.getElementById('avgScore').innerHTML = total/count;
});







