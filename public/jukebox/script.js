$(function() {

	$(window)
		.keyup(function(e) { keyboardEvent(e); })
		.resize(function() { resize(true); })
		.bind("mousewheel", function(e, d) { console.log('scrolled'); setVolumeEvent(e, d) });

	$('.player-overlay').click(function() { toggleVideo(); });

});

WebFontConfig = {
	google: { families: [ 'Roboto::latin' ] }
};
(function() {
	var wf = document.createElement('script');
	wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
		'://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
	wf.type = 'text/javascript';
	wf.async = 'true';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(wf, s);
})();

var ls = window.localStorage || localStorage,
el = document.createElement('script'),
tag = document.getElementsByTagName('script')[0],
player, state;

window.shuffled = false,
el.src = "//www.youtube.com/iframe_api";

tag.parentNode.insertBefore(el, tag);

function toggleVideo() {

	if(state == 1) player.pauseVideo();
	else player.playVideo();
}

function setVolume(v) {

	player.setVolume(v);
	ls.setItem('v', v);
	resize(true);
}

function keyboardEvent(e) {

	switch(e.keyCode) {
		case 37:
		case 75:
			player.previousVideo();
			console.log('previousVideo');
			if(window.webkitNotifications.checkPermission() !== 0) window.webkitNotifications.requestPermission();
		break;

		case 39:
		case 74:
			player.nextVideo();
			console.log('nextVideo');
			if(window.webkitNotifications.checkPermission() !== 0) window.webkitNotifications.requestPermission();
		break;

		case 38:
			var v = player.getVolume();

			setVolume(v > 90 ? 100: v + 10);
		break;

		case 40:
			var v = player.getVolume();

			setVolume(v < 10 ? 0:v - 10);
		break;

		case 32:
			toggleVideo();
		break;
		case 27:
			window.close();
		break;
		default:
			console.log(e.keyCode);
		break;
	}
}

function resize(resize) {
	var h = $(window).height(),
	w = $(window).width(),
	mt = 0;

	if(h / 9 * 16 > w) {

		h = w / 16 * 9;
		mt = ($(window).height() - h) / 2;
		bsr = mt;

	}
	else {
		w = h / 9 * 16;
		bsr = $(window).width() - w;

	}

	var	s = {
		h: h,
		w: w,
		bsr: bsr
	}

	if(resize) {

		var v = player.getVolume(),
		shadow = '0 0 '+s.bsr*(v/100)+'px hsla(0, 0%, 50%, 1)';

		$('#music-player').attr('height', s.h).attr('width', s.w).css('box-shadow', shadow);

		$('.music-wrap').css({
			height: s.h+'px',
			width: s.w+'px',
			paddingTop: mt+'px'
		});

		console.log('Player resized to '+s.h+' by '+s.w);

		if(mt != 0) {
			console.log('margin-top: '+mt+'px')
		}


	}
	else return s;
}
function onYouTubeIframeAPIReady()  {
	var size = resize();
	// debugger
	player = new YT.Player('music-player', {
		videoId: 'lh6CiR8BSIc',
		height: 0,
		width: 0,
		events: {
			onReady: onPlayerReady,
			onStateChange: onPlayerStateChange
		}
	});
	// setTimeout(function() {

	// 	resize(true);

	// }, 1000);
}
function onPlayerReady(event) {
	var s = resize(),
	q = s.h > 720 ? 1080:720;

	if(window.location.hash.indexOf('#') > -1) {

		console.log('Share hash detected, playing the video..');

		window.shuffled = true;

		player.loadVideoById({
			videoId: window.location.hash.split('#')[1],
			suggestedQuality: 'hd'+q
		});

	}

	else {

		console.log('No share hash detected, cuing default playlist..')

		var playlist = 'PL9u63LDcrDGW2ov6Z2LuzmK2BmHygc1dZ';

		player.cuePlaylist({
			list: playlist,
			suggestedQuality: 'hd'+q,

		});

		setTimeout(function() {

			shufflePlaylist();

			window.shuffled = true;

		}, 500);

	}

	player.playVideo();

	console.log('Player Quality: '+q+'p HD');
}

function preparePlayer() {

	var v = ls.getItem('v') !== false ? ls.getItem('v'):player.getVolume();

	player.setLoop(true);

	setVolume(v);

}

function shufflePlaylist(q) {

	player.setShuffle(true);
	player.playVideoAt(0);
	window.shuffled = true;

	console.log('Shuffled songs');

}

function onPlayerStateChange(e) {

	preparePlayer();
	setUpShareUrl();

	if(e.data == 5 && window.shuffled == false) shufflePlaylist();


	if(window.Notification.permission !== 'denied') {

		var videoId = getVideoId(player.getVideoUrl());

		console.log(videoId);

		$.get('https://gdata.youtube.com/feeds/api/videos/'+videoId+'?v=2&alt=json', function(data) {

			console.log(data);

			document.title = data.entry.title.$t+' uploaded by '+data.entry.author[0].name.$t+' - Jonas Røssum';

			var notification = new window.Notification(
				'Now playing: ', {
					image: data.entry.media$group.media$thumbnail[0].url,
					body: data.entry.title.$t+' by '+data.entry.author[0].name.$t
				}
			);

			notification.onclick = function() { window.open(url); };
			notification.show();

			setTimeout(function() {
				notification.cancel();
			}, 5000);
		});
	} else new window.Notification.requestPermission()

	console.log('Player State: '+e.data);
	state = e.data;
}

function getVideoId(url) {

	var videoId = url.split('v=')[1],
	ampersand = videoId.indexOf('&');

	if(ampersand != -1) videoId = videoId.substring(0, ampersand);

	return videoId;

}


function setUpShareUrl() {

	var videoId = getVideoId(player.getVideoUrl());

	history.replaceState({ videoId: videoId }, '', '#'+videoId);

}

function setVolumeEvent(e, d) {
	var v = player.getVolume();

	d = d * 5;

	if(v + d > 100) v = 100;
	else if(v + d < 0) v = 0;
	else v = v + d;

	setVolume(v);

	console.log('Volume set to '+v);
	// return cancelEvent(e);
}

function load() {
	console.log('Google API Loaded');
}
function handleAPILoaded() {
	$('.q').attr('disabled', false);
	console.log('Youtube Data API Loaded');
}
