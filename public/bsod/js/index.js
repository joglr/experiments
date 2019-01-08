$(function() {
  $(window).resize(function() {
    $("pre").css({
      
        marginTop: $("pre").height() / -2,
        marginLeft: $("pre").width() / -2
        
      });
  }).resize();
  
  $("body").click(function() {
    if (screenfull.enabled) {
      screenfull.toggle();
    }
  }).click();
});