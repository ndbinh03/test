//Chỉnh cho bản đồ vừa kín màn hình
$( window ).resize(function() {
  var mapPageHeader = $("#container #header").eq(0);
  if(mapPageHeader.length > 0) {
    var headerHeight = mapPageHeader.outerHeight();
    $("#googleMap").css({
        'height': ($(window).height() - headerHeight + 1) + 'px',
        'top': headerHeight
    });
  }
});
$( window ).ready(function(){
  var mapPageHeader = $("#container #header").eq(0);
  if(mapPageHeader.length > 0) {
    var headerHeight = mapPageHeader.outerHeight();
    $("#googleMap").css({
        'height': ($(window).height() - headerHeight + 1) + 'px',
        'top': headerHeight
    });
  }
})
///-Hiện menu------------------------
function hien_layers(e){
	var x=document.getElementsByClassName("mucchinh");
	var y=document.getElementsByClassName("muccon");
    var targ;
	if (!e) e = window.event; // old IE
    for(var i=0;i<x.length;i++)
    {
    	targ = e.target || e.srcElement;
        if(targ==x[i])
        {	
            if(y[i].style.display=="none")
                y[i].style.display="block";
            else
                y[i].style.display="none";
        }
    }
};
$(".fa").click(function(){
	$(this).closest('.title').find('i').toggleClass('fa-caret-down fa-caret-up');
	var div = $(this).closest('.title').siblings();
	if(div.css('display') == 'block') {
		$(this).closest('.title').siblings().css( "display", "none" );
	}
	else
	{
		$(this).closest('.title').siblings().css( "display", "block" );
	}
});
