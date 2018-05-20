$(document).ready(function () {
	var liArr = [];
	$(".nav-menu>li").each(function(index) {
		let str = $(this).css("width");
		let res = str.slice(0, str.length - 2)
		liArr.push(parseFloat(res));
	});
	var maxvalue = (Math.max(...liArr));
	$(".nav-menu>li").css("width", maxvalue);

	// var headerHeight = $("header").css("height"),
	// 		bodyHeight = $("body").css("height");
	// headerHeight = parseFloat(String(headerHeight.slice(0, headerHeight.length - 2)));
	// bodyHeight = parseFloat(String(bodyHeight.slice(0, bodyHeight.length - 2)));
	// $("main").css("height", bodyHeight - headerHeight);

	$("#nav-button").on("click", function() {
		if (!$(this).hasClass("open")) {
			$(this).addClass("open");
			$(".nav-mobile-menu").css("display", "flex");
			$(".nav-mobile-menu").hide();
			$(".nav-mobile-menu").slideToggle();
		} else {
			$(this).removeClass("open");
			$(".nav-mobile-menu").slideToggle();
		}
	});

	if ($(window).width() <= 768) {
		$("#question-form-textarea").attr("rows", "10");
		$("#answers-section").removeClass("scroll");
		$("#statistic-section").removeClass("scroll");
	};

	$("form").on("submit", function(e) {
		e.preventDefault();
	});

	$("#question-form").on("submit", function() {
		showPopUp();
	});

	$("#pop-up-show-form").on("click", function() {
		$("#pop-up-hight-buttons").hide();
		$(".pop-up>h3").html("Enter your answer");
		$(".pop-up-hidden").fadeIn();
	});

	$(".pop-up-hide").on("click", function() {
		$(".pop-up-back").css("display", "none");
	});

	function showPopUp() {
		$("#pop-up-hight-buttons").css("display", "flex");
		$(".pop-up>h3").html("Would you like to answer it?");
		$(".pop-up-hidden").css("display", "none");
		$("#pop-up-form-textarea").val("");
		$("#pop-up-div").css("display", "flex");
	};

	$("#close-pop-up-new-answer").on('click', function () {
		$("#pop-up-new-answer").hide();
	});
});