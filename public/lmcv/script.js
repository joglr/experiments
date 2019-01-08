$(function() {
	$.getJSON('https://api.syfaro.net/minecraft/1.1/versions?callback=?', function(data) {
		console.log(data);

		var snapshot = data.latest.snapshot,
		release = data.latest.release,
		snapshotServer = 'https://s3.amazonaws.com/Minecraft.Download/versions/'+snapshot.id+'/minecraft_server.'+snapshot.id+'.jar',
		releaseServer = 'https://s3.amazonaws.com/Minecraft.Download/versions/'+release.id+'/minecraft_server.'+release.id+'.jar',
		snapshotTime = snapshot.niceTime,
		releaseTime = release.niceTime,
		snapshotClass = '',
		releaseClass = '';

		if(typeof localStorage != 'undefined') {

			if(localStorage.getItem('snapshot') != snapshot) snapshotClass = 'new';
			if(localStorage.getItem('release') != release) releaseClass = 'new';

		}

		$('a.snapshot.version').text(snapshot.id).attr('href', snapshotServer).addClass(snapshotClass);
		$('a.release.version').text(release.id).attr('href', releaseServer).addClass(releaseClass);

		$('.snapshot.time').text(' - '+snapshotTime);
		$('.release.time').text(' - '+releaseTime);

		for(var i = 0; i < data.versions.length; i++) {

			var version = data.versions[i];

			if(version.latest == 'true') {

				if(version.type == 'snapshot')	snapshotTime = version.niceTime;
				else if(version.type == 'release')	snapshotTime = version.niceTime;

				if(snapshotTime != '' && releaseTime != '') break;
			}

		}

		$('.snapshot.time').text(snapshotTime);
		$('.release.time').text(releaseTime);

		if(typeof localStorage != 'undefined') {

			localStorage.setItem('snapshot', snapshot);
			localStorage.setItem('release', release);

		}

	});
});