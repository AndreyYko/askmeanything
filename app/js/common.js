$(document).ready(function () {
	var liArr = [];
	$(".nav-menu>li").each(function(index) {
		let str = $(this).css("width");
		let res = str.slice(0, str.length - 2)
		liArr.push(parseFloat(res));
	});
	var maxvalue = (Math.max(...liArr));
	$(".nav-menu>li").css("width", maxvalue);

	$("#nav-button").on("click", function() {
		if (!$(this).hasClass("open")) {
			$(this).addClass("open");
		} else {
			$(this).removeClass("open");
		}
	});
});