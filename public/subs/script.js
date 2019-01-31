$(function() {
	$.get('https://gdata.youtube.com/feeds/api/users/EthosLab', function(data) {

		console.log(data);

		$data = $(data);

		var subCount = $data.find('yt:channelStatistics').html();

		console.log(subCount);
	});
});
