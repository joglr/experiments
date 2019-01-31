requirejs.config({

	baseUrl: '//cdnjs.cloudflare.com/ajax/libs',

	paths: {

		'jquery': 'jquery/2.0.3/jquery.min',
		'annyang': 'annyang/1.0.0/annyang.min',
		'prefixfree': 'prefixfree/1.0.7/prefixfree.min',
		'gapi': 'https://apis.google.com/js/client.js?onload=onGAPILoaded',
		'google-js-api': 'https://www.google.com/jsapi?noext',
		'youtube-player-api': 'https://www.youtube.com/iframe_api?noext',
		'screenfull': 'screenfull.js/1.0.4/screenfull.min'

	}

});

var player, Ice, onYouTubeIframeAPILoaded;

function shuffle(o) {
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

function onGAPILoaded() {

	console.log('Google Client API Loaded, Loading YouTube Data API..');

	gapi.client.load('youtube', 'v3', onYouTubeIframeAPILoaded);

}

function onYouTubeIframeAPIReady() {
	player = new YT.Player('video-player', {
		height: '720',
		width: '1280',
		suggestedQuality: 'hd1080',
		events: {

			onStateChange: function(e) {

				Ice.States.Player = e.data;
				console.log({ STATE: Ice.States.Player });

			}

		}
	});
}

requirejs(['jquery', 'annyang', 'prefixfree', 'gapi', 'youtube-player-api', 'google-js-api', 'screenfull'], function() {

	Ice = new ice();
	Ice.init();

	function ice() {

		/*
		 * Variables of Ice
		 */

		this.$Player = $('.video-player')

		this.SearchSettings = {

		    order: 'viewCount',
	        part: 'snippet',
	        type: 'video',
	        maxResults: 50,
	        q: '',
	        channelId: '',

	    }

	    this.S = {

	    	defaultWidth: 1280,
	    	defaultHeight: 720,
	    	volumeDelta: 25,
	    	searchType: 'search'

	    };

	    this.States = {

	    	isFullscreen: false,
	    	Player: false

	    };

		this.commands = {

			'(play) search (for) *exp': function(param) {	Ice.execute('playSearch', param); },
			'(play) channel *exp': function(param) {		Ice.execute('playChannel', param); },
			'type search': function() {						Ice.execute('playSearch', prompt('Search:', 'edm')); },
			'type channel': function() {					Ice.execute('playChannel', prompt('Channel:', 'EthosLab')); },

			'switch': function() {							Ice.execute('toggleVideo'); },
			'play': function() {							Ice.execute('playVideo'); },
			'go': function() {								Ice.execute('playVideo'); },
			'start': function() {							Ice.execute('playVideo'); },
			'pulse': function() {							Ice.execute('pauseVideo'); },
			'stop': function() {							Ice.execute('pauseVideo'); },

			'volume increase :amount': function(delta) {	Ice.execute('volumeUp', delta); },
			'volume decrease :amount': function(delta) {	Ice.execute('volumeDown', delta); },

			'mute': function() {							Ice.execute('toggleMute'); },
			'on mute': function() {							Ice.execute('toggleMute', false); },
			'volume up': function() {						Ice.execute('volumeUp', Ice.S.volumeDelta); },
			'volume down': function() {						Ice.execute('volumeDown', Ice.S.volumeDelta); },

			'next': function() {							Ice.execute('nextVideo'); },

			'back': function() {							Ice.execute('previousVideo'); },
			'previous': function() {						Ice.execute('previousVideo'); },

			'full screen': function() {				 		Ice.execute('toggleFullscreen');  },

			'test *exp': function(param) {					Ice.log(param); }

		};

		this.commandNames = {

			'playSearch': 'play results',
			'playChannel': 'channel',

			'playVideo': 'played video',
			'pauseVideo': 'paused video',
			'toggleVideo': 'toggled play/pause',

			'nextVideo': 'played next video',
			'previousVideo': 'played previous video',
			'toggleFullscreen': 'toggled fullscreen',

			'volumeUp': 'volume increased',
			'volumeDown': 'volume decreased',
			'toggleMute': 'toggled mute',

		};

		/*
		 * Functions of Ice
		 */

		this.init = function() {

			onYouTubeIframeAPILoaded = function() {

				console.log('YouTube Data API Loaded');

				gapi.client.setApiKey('AIzaSyBt4dZrv29ut8U0xeYTRFrgH_rB8zil9_M');

				console.log('Authenticated');

				Ice.toggleFullscreen(true);

			}



			if(annyang) {

				annyang.init(Ice.commands);
				annyang.start();

			}

			Ice.$Player.hide();

			$(window).resize(function() {

				if(Ice.States.isFullscreen == true)	Ice.toggleFullscreen(false);

			});

		}

		/* Debug Functions */

		this.execute = function(func, param) {

			Ice.log(Ice.commandNames[func]+(typeof param !== 'undefined'?': '+param:''));

			Ice[func](param);

			return param;


		};

		this.log = function(term) {

			var oldColor = $('h1').css('color');

			$('.command')
				.clearQueue()
				.fadeOut()
				.text(term)
				.fadeOut(1e3)
				.fadeIn(1e3)
				.delay(10e3)
				.fadeOut(1e3, function() {

					$(this).text('');
				}
			);

		};

		/* Video Functions */

		this.playVideo = function() { player.playVideo(); }
		this.pauseVideo = function() { player.pauseVideo(); }
		this.toggleVideo = function() { player[(Ice.States.Player == 1 ? 'pause':'play')+'Video'](); };

		this.nextVideo = function() { player.nextVideo(); };
		this.previousVideo = function() { player.previousVideo(); };

		this.volumeUp = function(delta) {

			var newVolume = player.getVolume() + (delta ? delta:Ice.S.volumeDelta);

			player.setVolume(newVolume > 100 ? 100:newVolume);

			console.log(Ice.S.volume = player.getVolume());

		}

		this.volumeDown = function(delta) {

			var newVolume = player.getVolume() - (delta ? delta:Ice.S.volumeDelta);

			player.setVolume(newVolume < 0 ? 0:newVolume);

			console.log(Ice.S.volume = player.getVolume());

		}

		this.toggleMute = function(doMute) {

			/*

			Ice.toggleMute(): Normal toggle
			Ice.toggleMute(false): Forces unmute
			Ice.toggleMute(true): Forces mute

			*/

			if(player.getVolume() == 0 || doMute === false) { /* The sound is off, turn it on */

				if(Ice.S.volume == 0) player.setVolume(Ice.S.volume = 50);

				else player.setVolume(Ice.S.volume);

			}
			else player.setVolume(0); /* The sound is on, turn it off */

		}

		this.toggleFullscreen = function(param) {

			if(typeof param !== 'undefined') Ice.States.isFullscreen = param;

			if(Ice.States.isFullscreen == false) {

				Ice.States.isFullscreen = true;

				var W = $(window).innerWidth(),
				H = $(window).innerHeight();

				Ice.$Player.addClass('fullscreen').css({
					'width': W,
					'height': H,
					'margin-left': 0
				});

				player.setSize(W, H);

				$(document).one({
					'keyup': function() { screenfull.request(); },
					'click': function() { screenfull.request(); }
				});

			}

			else {

				Ice.States.isFullscreen = false;
				Ice.$Player.removeClass('fullscreen').css({
					'width': Ice.S.defaultWidth+'px',
					'height': Ice.S.defaultHeight+'px',
					'margin-left': Ice.S.defaultWidth / -2 +'px'
				});

				player.setSize(Ice.S.defaultWidth, Ice.S.defaultHeight);

				$(document).unbind('keyup').unbind('click');

				screenfull.exit();

			}
		};

		this.playChannel = function(channel) {

			Ice.SearchSettings.channelId = Ice.playChannelFromUsername(channel.replace(/\s+/g, ' '));
			Ice.SearchSettings.order = 'date';
			Ice.playVideos();

		}

		this.playSearch = function(q) {

			Ice.SearchSettings.q = q;
			Ice.SearchSettings.order = 'relevance';
			Ice.playVideos();

		}

		this.playVideos = function() {

		    Ice.makeRequest('search', Ice.SearchSettings, function(response) {

		    		console.log('Response:')
				console.log(response);

				videoList = [];

				if(typeof response.items !== 'undefined')

				for(var i = 0; i < response.items.length; i++) {

					videoList.push(response.items[i].id.videoId);

				}

				else Ice.log('No videos found');

				// videoList = shuffle(videoList);

				console.log('Video List:');
				console.log({ videoList: videoList });

				player.loadPlaylist(videoList);
				Ice.$Player.fadeIn();

		    });

	    };

	    /* YouTube functions */

	    this.makeRequest = function(where, settings, callback) {

			function onSearchResponse(response) {

				console.log('Response:')
				console.log(response);

				if(typeof response.items !== 'undefined') {

					callback(response);

				}
				else {

					Ice.log('no results found');

				}

			}

		    var request = window.gapi.client.youtube[where].list(settings);

			request.execute(onSearchResponse);

		}

		this.playChannelFromUsername = function(username) {

			Ice.makeRequest('channels', {

				part: 'snippet',
				forUsername: username,

			}, function(response) {

				var channelId = response.items[0].id;

				Ice.SearchSettings.channelId = channelId;
				Ice.playVideos();

			});

		};

	}

});
