Date.prototype.getWeek = function() {
	var onejan = new Date(this.getFullYear(),0,1);
	return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
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

	loadWeatherData(window.city);
	localStorage.setItem('city', window.city);

	bindHandlers();

}

function loadWeatherData(city) {

	if(city == '') city = 'Roskilde';

	$('.city').text(city);

	$.getScript('https://api.openweathermap.org/data/2.5/weather?q='+city+'&callback=updateWeather&units=metric');
	console.log('Getting weather for city "'+city+'"..');
}

function updateTime() {

	var d = new Date(),
	hours = leadingZero(d.getHours()),
	minutes = leadingZero(d.getMinutes()),
	seconds = leadingZero(d.getSeconds()),
	week = leadingZero(d.getWeek()),
	date = leadingZero(d.getDate()),
	month = leadingZero(d.getMonth()+1),
	year = d.getFullYear().toString().substring(2),
	timeString = hours+':'+minutes+':'+seconds,
	dateString = 'w'+week+' '+date+'-'+month+'-'+year;

	$('.time').html(timeString);
	$('.date').html(dateString);

	dateTimeout = setTimeout(updateTime, 1000);
}

function updateWeather(data) {

	if(data.cod == '200') {

		console.log(data);

		$('.weather').fadeOut(function() {

			$('.temp').html(Math.round(data.main.temp*10)/10+'&deg;');
			$('.humid').html(data.main.humidity+'%');
			$('.pressure').html(data.main.pressure+'<sub>hPa</sub>');
			$('.wind-speed').html(data.wind.speed+'<sup>m</sup>/<sub>s</sub>');

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
							return '&ucirc;';
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

				console.log(icon);
				$('.weather-icon').html('');
				$('.weather-icon').append('<i data-icon="'+icon+'" title="'+data.weather[i].description+'"></i>')
			}

			weatherTimeout = setTimeout(function() { loadWeatherData(window.city) }, 15 * 1000);

			$(this).fadeIn(function() { $('.wind-deg').rotate(data.wind.deg - 180); });

		});

	} else { alert('Error '+data.cod); $('.weather').fadeIn(); }
}

$(function() {
	var lsc = window.localStorage.getItem('city'), weatherTimeout, dateTimeout;
	window.city = lsc != undefined ? lsc:'Roskilde';

	loadWeatherData(city);
	updateTime();
	bindHandlers();

});
