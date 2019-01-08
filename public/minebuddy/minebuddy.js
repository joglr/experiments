require.config({

	basePath: 'http://cdnjs.cloudflare.com/ajax/libs',

	paths: {

		jquery: 'jquery/2.0.3/jquery.min',
		prefixfree: 'prefixfree/1.0.7/prefixfree.min'

	}

});

require(["prefixfree"], function() {

$(function() {

	console.log(wikiCall("squid"))

});

/*
* Get first entry.
*/
function getFirstEntry(pages) {

	for(var x in pages) 
		if(squid.query.pages.hasOwnProperty(x)) 
			return pages[x];
}

/*
* WikiPedia Call
*/
function wikiCall(query) {

	var url = 'http://minecraft.gamepedia.com/api.php',
	params = {
		"titles": query,
		"format": "json",
		"action": "query",
		"prop": "revisions",
		"rvprop": "content",
		"rvsection": 0
	}

	$.getJSON(url, params, function(data) {

		console.log(data);

	});

}

/*
* Process user input.
*/
var userInput = "how do i make a cake?";

function processInput(input) {

	var questionFormats = [

		{

			matchString: /^(minebuddy, )?what (?:is|are) (.*)\?+$/,
			wikipediaSection: "main"

		},

		{

			matchString: /^(minebuddy, )?how do (?:i|you) (?:make|craft) ?(?:a|an)? (.*)\?+$/,
			wikipediaSection: "crafting"

		}

	];

	var matches = [];

	for(var i = 0; i < questionFormats.length; i++) {

		console.log({
			Search: questionFormats[i].matchString,
			Found: userInput.match(questionFormats[i].matchString)
		});

		matches.push(userInput.match(questionFormats[i].matchString));

	}

	return matches;

}

}); // require