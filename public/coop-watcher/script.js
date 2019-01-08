$(function() {

	window.views = [];

	bindHandlers();

});

function entities(s) {
	var e = {
		'"' : '"',
		'&' : '&',
		'<' : '<',
		'>' : '>'
	};
	return s.replace(/["&<>]/g, function (m) {
		return e[m];
	});
}


function onYouTubeIframeAPIReady() {

	console.log('onYouTubeIframeAPIReady');

	loadViews();
}

function getVideoList() {
	var videoList = [];

	for(view in views) {
		videoList.push(views[view].videoId);
	}

	return videoList;
}

function saveViews() {

	var videoList = getVideoList();

	localStorage.setItem('views', JSON.stringify(videoList));


}

function removeViews() {

	console.log('Removing Players..');

	for(view in views) {
		views.splice(view, 1);
	}

	$('.view-grid').html('');

	localStorage.setItem('views', '');

}

function loadViews() {

	if(localStorage.getItem('views') == '') return;

	var videoList = JSON.parse(localStorage.getItem('views'));

	console.log(videoList);
	console.log('Loading videos..');

	for(video in videoList) { window.views.push(new View(videoList[video])); console.log('Loaded video with id '+videoList[video]) }

	setTimeout(function() { resizeViews(); }, 2000);

	resizeViews();
}

function bindHandlers() {

	$('body').on('drop', function(e) { onDrop(e); e.preventDefault(); });

	function onDrop(event) {
		event = event.originalEvent;

		event.stopPropagation(); event.preventDefault();
		var link = event.dataTransfer.getData('URL');

		console.log(getVideoId(link));
	}
	document.getElementById('drop').addEventListener('drop', onDrop, false);


	$('.add-view-form').submit(function(e) { e.preventDefault(); addView(); });
	$('.toggle-fullscreen-btn').click(function()	{ toggleFullscreen(); });
	$('.remove-views-btn').click(function() 		{ removeViews(); });
	$(window).resize(function() 					{ resizeViews(); });

	setOfButtonsHandler('quality-btn', function(el) { setQuality($(el).attr('data-quality')); });
	playButtonHandler();

	Mousetrap.bind('space', function() {
		$('.play-btn, .pause-btn').click();
	});


}

function setOfButtonsHandler(buttonClass, handler) {


	$('.'+buttonClass).click(function() {
		$('.'+buttonClass).removeClass('btn-primary');
		$(this).addClass('btn-primary');

		handler(this);

	});

}

function playButtonHandler() {

	$('.play-btn').one('click', function() {

		playVideos();

		$(this).removeClass('play-btn').addClass('pause-btn btn-primary');

		$(this).find('.glyphicon').removeClass('glyphicon-play').addClass('glyphicon-pause');

		playButtonHandler();
	});
	$('.pause-btn').one('click', function() {

		pauseVideos();

		$(this).removeClass('pause-btn btn-primary').addClass('play-btn');

		$(this).find('.glyphicon').removeClass('glyphicon-pause').addClass('glyphicon-play');

		playButtonHandler();
	});

	document.addEventListener(screenfull.raw.fullscreenchange, function () {

		if(screenfull.isFullscreen) $('.toggle-fullscreen-btn').addClass('btn-primary');
		else $('.toggle-fullscreen-btn').removeClass('btn-primary');

	});
}

function View(videoId) {

	var first = views.length == 0;

	var el = $(document.createElement('div'));

	this.videoId = videoId;
	el.attr('id', this.videoId);

	$('.view-grid').append(el);

	var count = views.length + 1;

	var size = calcPlayerSize(count);

	this.ytplayer = new YT.Player(videoId, {
		height: size.height,
		width: size.width,
/* https://developers.google.com/youtube/player_parameters?playerVersion=HTML5#Parameters */
		playerVars: { 
			controls: 1, // Show player controls
			autohide: 1,
			fs: 0, // Full screen button
			iv_load_policy: 3, // Annotations, 1: on, 3: off
			modestbranding: 0, /* Show youtube logo in corner, 0: disable, 1: enable */
			rel: 0,
			showinfo: 0
		},
		videoId: videoId/*,
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange
		}*/
	});

	$('iframe#'+videoId).appendTo($('div#'+videoId));

	var classForFirst = '';

	if(views.length == 1) classForFirst = 'primary-btn';

	$('div#'+videoId).append('\
	<button class="btn volume-btn'+classForFirst+'"></button>\
	');
}

function addView() {
	var url = $('.video-url').val();

	if(url != '') {

		var id = getVideoId(url);

		window.views.push(new View(id));

		saveViews();
		resizeViews();

		$('.video-url').val('');
	}

	var replaceUrl = '/cw#'+getVideoList().join(',');

	console.log(replaceUrl);

	history.replaceState(document.title, null, replaceUrl);

	resizeViews();

}

function playVideos() {

	for(view in views) {
		views[view].ytplayer.playVideo();
	}

}

function pauseVideos() {

	for(view in views) {
		views[view].ytplayer.pauseVideo();
	}

}

function setQuality(quality) {

	for(view in views) {
		views[view].ytplayer.setPlaybackQuality(quality);
	}

}

function toggleFullscreen() {
	if (screenfull.enabled) screenfull.toggle();
}

function calcPlayerSize(count) {	

	var widthDivider;

	if(count == 1) widthDivider = 1; 
	else if(count > 1 && count <= 4) widthDivider = 2; 
	else if(count > 5 && count <= 9) widthDivider = 3; 
	else if(count > 9 && count <= 16) widthDivider = 4; 

	var rows = Math.sqrt(count);

	var windowWidth = $(window).innerWidth(),
	windowHeight = $(window).innerHeight(),
	gridWidth = $('.view-grid').innerWidth(),
	gridHeight = $('.view-grid').innerHeight()
	playerWidth = gridWidth / widthDivider,
	playerHeight = playerWidth / 16 * 9,
	marginTop = (windowHeight - gridHeight) / 2;

	console.log({
		'wH': windowHeight,
		'wW': windowWidth,
		'gH': gridHeight,
		'gW': gridWidth,
		'mT': marginTop
	});

	return {
		width: playerWidth,
		height: playerHeight,
		marginTop: marginTop
	}
}

function resizeViews() {

	var size = calcPlayerSize(views.length);

	for(view in views) {

		views[view].ytplayer.setSize(size.width, size.height);

	}

	$('.view-grid').css('margin-top', size.marginTop+'px');

}

function getVideoId(url) {
	var video_id = url.split('v=')[1];
	var ampersandPosition = video_id.indexOf('&');
	if(ampersandPosition != -1) video_id = video_id.substring(0, ampersandPosition);

	return video_id;
}