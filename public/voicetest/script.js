requirejs.config({

  baseUrl: '//cdnjs.cloudflare.com/ajax/libs',

  paths: {

    jquery: "jquery/2.0.3/jquery.min",
    annyang: "annyang/1.0.0/annyang.min",
    prefixfree: "prefixfree/1.0.7/prefixfree.min",

    gapi: "https://apis.google.com/js/client.js?onload=gapiLoaded",
    player: "https://www.youtube.com/iframe_api?stahp"

  }

});

requirejs(['jquery', 'prefixfree', 'annyang', 'player', 'gapi'], function() {

function gapiLoaded() {
  console.log('Google Client API Loaded, Loading YouTube Data API..');

  gapi.client.load('youtube', 'v3', onYouTubeApiLoad);

}
$(function() {

  var player;
  window.windows = [];

  init();

});

function init() {


  if (annyang) {
    // Let's define our first command. First the text we expect, and then the function it should call
    var commands = {
      'text *text': writeText,
      'empty': remove,
      'remove last': removeLast,
      'remove first': removeFirst,
      'reset (styles)': resetStyles,
      'background (color) :color': backgroundColor,
      'color :color': color,
      'size :size': size,
      '(search) youtube for *term': searchYT,
      '(search) google for *term': searchG,
      '(search) google images for *term': searchGIMG,
      'fit': resizeWindows,
      'reveal': function() { $('.wrapper').removeClass('hidden') },
      'escape': function() { $('.wrapper').addClass('hidden'); closeWindows(); },
      'swap': function() { $('.wrapper').toggleClass('hidden'); }
    };

    // Initialize annyang with our commands
    annyang.init(commands);

    // Start listening. You can call this here, or attach this call to an event, button, etc.
    annyang.start();
  }
}

function newWindow(url) {
  var W = $(window).width(),
  H = $(window).height();

  window.windows.push(window.open(url, 'Search', 'height='+H+',width='+W));


}

function closeWindows() {

  for(var i = 0; i < window.windows.length; i++) {

    window.windows[i].close();

  }

}

function resizeWindows() {


  for(var i = 0; i < window.windows.length; i++) {

    windows[i].resizeTo(W, H);

  }

}

function onYouTubeApiLoad() {

  console.log('YouTube Data API Loaded');

  gapi.client.setApiKey('AIzaSyC0xJuz8KUdoxO-0JXzyqpAwfeTj4heEw8');

}

function showResponse(response) {

  console.log(response);

    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: response.items[0].videoId,
        playerVars: {

          autoplay: true

        }
    });

}

function resetStyles() {

  $('.wrapper').removeAttr('style');

}

function writeText(text) {
  $('.wrapper').append('<div>'+text+'</div>');
}

function remove() {
  $('.wrapper').empty();
}

function removeLast() {
  $('.wrapper :last-child').remove();
}
function removeFirst() {
  $('.wrapper :first-child').remove();
}

function color(color) {

  $('.wrapper').css('color', color);

}

function backgroundColor(color) {

  $('.wrapper').css('background-color', color);

}

function size(size) {
  $('.wrapper').css('font-size', size+'rem');
}

function searchGIMG(term) {
  newWindow('https://www.google.com/search?site=imghp&tbm=isch&q='+term)
}

function searchG(term) {
  newWindow('https://google.com/search?q='+term);
}


function searchYT(term) {

    console.log('Searching YouTube for '+term+'...');

    // Use the JavaScript client library to create a search.list() API call.
    var request = window.gapi.client.youtube.search.list({
        part: 'id',
        q: term
    });

    // Send the request to the API server,
    // and invoke onSearchRepsonse() with the response.
    request.execute(onSearchResponse);
}

// Called automatically with the response of the YouTube API request.
function onSearchResponse(response) {
    showResponse(response);
}

});
