requirejs.config({

	baseUrl: '//cdnjs.cloudflare.com/ajax/libs/',

	paths: {

		'jquery-color': 'jquery-color/2.1.2/jquery.color.min',
		'jquery-rotate': '//cdn.jsdelivr.net/jquery.animate-css-rotate-scale/0.2/jquery-animate-css-rotate-scale.min',
		'prefixfree': 'prefixfree/1.0.7/prefixfree.min',
		'modernizr': 'modernizr/2.7.1/modernizr.min',
		'fittext': 'FitText.js/1.1/jquery.fittext.min',
		'plus-one': 'https://apis.google.com/js/plusone',
		'comp': '/js/comp.min'

	}

});

requirejs(['jquery-color', 'jquery-rotate', 'prefixfree', 'modernizr', 'fittext', 'plus-one', 'comp'], function() {

	$(function() {

		init();

	});

	function init() {

		getCity();
		updateWeather();
		updateTime();
		bindHandlers();

	}

	/* Weather bar */

	function getCity() {

		var lsc = window.localStorage.getItem('city'), weatherTimeout, dateTimeout;
		window.city = lsc != undefined ? lsc:'Roskilde';

	}

	function getWeek(thus) {
		var onejan = new Date(thus.getFullYear(),0,1);
		return Math.ceil((((thus - onejan) / 8.64e7) + onejan.getDay()+1)/7);
	}

	function leadingZero(num) {

		return num < 10 ? '0'+num:num;

	}
	function bindHandlers() {

		$('div.city').click(function() {

			$(this).replaceWith('<input type="text" class="city input" value="'+$(this).text()+'" />');
			bindHandlers();

		});

		$('.city.input').blur(function() { changeCity(this); });

		$('.city.input').keypress(function(e) {

			if(e.which == 13) changeCity(this);

		});

	}

	function changeCity(el) {
		var city = encodeURIComponent($(el).val()),
		replace = {
			'%C3%A6': 'ae',
			'%C3%B8': 'oe',
			'%C3%A5': 'aa'
		};

		for(val in replace) {

			city = city.replace(new RegExp(val, 'g'), replace[val]);

		}

		window.city = decodeURIComponent(city);
		$(el).replaceWith('<div class="city">'+window.city+'</div>');

		if(typeof weatherTimeout != 'undefined') clearTimeout(weatherTimeout);

		updateWeather();
		localStorage.setItem('city', window.city);

		bindHandlers();

	}

	function updateWeather() {

		if(window.city == '') window.city = 'Roskilde';

		$('.city').text(window.city);

		window.fetchAttemps = 0;

		contactWeatherServer();

		console.log('Getting weather for city "'+window.city+'"..');
	}


	function contactWeatherServer() {

		$('.weather').fadeIn();

		var apiKey = '21d0532e47c34617290c7e73f96601ac'
		var url = 'http://api.openweathermap.org/data/2.5/weather?q='+window.city+'&callback=window.processWeather&units=metric&appid=' + apiKey;

		$.getScript(url)

			.done(function(data) {

				console.log('Sucessfully fetched weather data');

			})
			.fail(function(jqxhr) {

				console.log('Failed fetching weather data');
				console.log(jqxhr);

				retryWeatherFetch();

			});

	}

	function retryWeatherFetch() {

		window.fetchAttemps++;

		if(window.fetchAttemps < 3) {

			console.log('Error: Couldn\'t fetch weather data. Trying again in 2 seconds..');

			setTimeout(contactWeatherServer, 2e3);

		}
		else {

			$('.weather').text('Could not load weather info');

		}
	}

	function updateTime() {

		var d = new Date(),
		hours = leadingZero(d.getHours()),
		minutes = leadingZero(d.getMinutes()),
		seconds = leadingZero(d.getSeconds()),
		week = leadingZero(getWeek(d)),
		date = leadingZero(d.getDate()),
		month = leadingZero(d.getMonth()+1),
		year = d.getFullYear().toString().substring(2),
		timeString = hours+':'+minutes+':'+seconds,
		dateString = 'w'+week+' '+date+'-'+month+'-'+year;

		$('.time').html(timeString);
		$('.date').html(dateString);

		dateTimeout = setTimeout(updateTime, 1e3);
	}

	window.processWeather = function(data) {

		if(data.cod == '200') {

			console.log(data);

			$('.weather').fadeOut(function() {

				$('.temp').html(Math.round(data.main.temp*10)/10+'&deg;');
				$('.humid').html(data.main.humidity+'%');
				$('.pressure').html(data.main.pressure+'<sub>hPa</sub>');
				$('.wind-speed').html(data.wind.speed+'<sub>m/s</sub>');

				for(var i = 0; i < data.weather.length; i++) {

					function wIcon(data) {
						switch(data) {

							case 'Clear':
								return '&ograve;';
							break;

							case 'Drizzle':
							case 'Rain':
								return '&otilde;';
							break;

							case 'Thunderstorm':
								return '&uacute;';
							break;

							case 'Snow':
								return '&ugrave;'; // return '&ucirc;';
							break;

							case 'Clouds':
								return '&ouml;';
							break;

							default:
								return '&ouml;';
							break;

						}
					};
					var icon = wIcon(data.weather[i].main);

					$('.weather-icon').html('');
					$('.weather-icon').append('<i class="sosa" data-icon="'+icon+'" title="'+data.weather[i].description+'"></i>')
				}

				weatherTimeout = setTimeout(function() { updateWeather() }, 30 * 1e3);

				$(this).fadeIn(function() { $('.wind-deg').rotate(data.wind.deg - 180); });

			});

		} else retryWeatherFetch();
	}

});
