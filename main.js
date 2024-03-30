const balls = $(".ball");
const pockets = $(".table__pockets span");

$(".reset").on("click", function () {
	$(".table__sunk .ball").appendTo(".table__inner");
	$(".ball").removeClass("sunk").attr("style", "").data("velocity", 0);
});

$(".primary").on("mousedown", function (e) {
	$(this).addClass("active");
	$(this).append('<div class="ball__aimer"><span></span></div>');
});

$(document).on("mousemove", function (e) {
	if ($(".ball__aimer").length) {
		const ballX = $(".primary").offset().left + 10;
		const ballY = $(".primary").offset().top + 10;
		const angle = calcAngle(e.pageX, e.pageY, ballX, ballY);
		$(".ball__aimer").css("transform", "rotate(" + angle + "deg)");
		const pull = Math.min(calcDistance(e.pageX, e.pageY, ballX, ballY) - 20, 60);
		$(".ball__aimer span").css("width", pull + "px");
	}
});

$(document).on("mouseup", function (e) {
	if ($(".ball__aimer").length) {
		const ballX = $(".primary").offset().left + 10;
		const ballY = $(".primary").offset().top + 10;
		const angle = calcAngle(e.pageX, e.pageY, ballX, ballY);
		const pull = Math.min(calcDistance(e.pageX, e.pageY, ballX, ballY) - 20, 60);
		$(".primary").removeClass("active");
		$(".ball__aimer").remove();

		$(".primary").data("velocity", pull).data("angle", angle);
		console.log("releasing ball!", pull, angle);
	}
});

function calcDistance(x1, y1, x2, y2) {
	const y = x2 - x1;
	const x = y2 - y1;

	return Math.sqrt(x * x + y * y);
}

function calcAngle(x1, y1, x2, y2) {
	return (Math.atan2(y1 - y2, x1 - x2) * 180) / Math.PI + 180;
}

function angleReflect(incidenceAngle, surfaceAngle) {
	var a = surfaceAngle * 2 - incidenceAngle;
	return a >= 360 ? a - 360 : a < 0 ? a + 360 : a;
}

function init() {
	balls.each(function () {
		$(this).data("velocity", 0).data("angle", 0);
	});
}

function moveTick() {
	balls.each(function (index) {
		if ($(this).hasClass("sunk")) return;

		const currVelocity = $(this).data("velocity");
		if (currVelocity != 0) {
			const ref = $(this);
			console.log("ball" + index + " speed", currVelocity);
			const currAngle = ref.data("angle");
			const currLeft = parseFloat(ref.css("left"));
			const currTop = parseFloat(ref.css("top"));
			const xVelocity = Math.cos((currAngle * Math.PI) / 180) * currVelocity;
			const yVelocity = Math.sin((currAngle * Math.PI) / 180) * currVelocity;
			let newLeft = currLeft + xVelocity;
			let newTop = currTop + yVelocity;
			let newAngle = currAngle;
			let sunk = false;
			let newVelocity = Math.max(0, currVelocity - 0.1);
			const bounds = $(".table__inner")[0].getBoundingClientRect();
			if (newTop < 0 || newTop + 20 > bounds.height) {
				// bounce against top/bottom
				newAngle = angleReflect(currAngle, 0);
				if (newTop < 0) {
					newTop = 0;
				}
				if (newTop + 20 > bounds.height) {
					newTop = bounds.height - 20;
				}
			}
			if (newLeft < 0 || newLeft + 20 > bounds.width) {
				// bounce against top/bottom
				newAngle = angleReflect(currAngle, 90);
				if (newLeft < 0) {
					newLeft = 0;
				}
				if (newLeft + 20 > bounds.width) {
					newLeft = bounds.width - 20;
				}
			}

			balls.each(function (index2) {
				if (index != index2) {
					// never compare against current ball
					const ballLeft = parseFloat($(this).css("left")) + 10;
					const ballTop = parseFloat($(this).css("top")) + 10;

					if (calcDistance(ballLeft, ballTop, newLeft + 10, newTop + 10) < 20) {
						const angleBetween = calcAngle(
							newLeft + 10,
							newTop + 10,
							ballLeft,
							ballTop
						);
						console.log(
							"angle between ball" + index + " and ball" + index2,
							angleBetween
						);

						newVelocity = currVelocity * 0.25;
						// newVelocity = 0;
						newLeft = currLeft;
						newTop = currTop;
						newAngle = angleReflect(angleBetween, 90);

						$(this).data("velocity", currVelocity * 0.75);
						$(this).data("angle", angleReflect(currAngle, angleBetween));
					}

					console.log(
						"setting new velocity for ball" + index + " to " + newVelocity
					);
				}
			});

			pockets.each(function (index2) {
				const pocketLeft = parseFloat($(this).css("left")) + 12.5;
				const pocketTop = parseFloat($(this).css("top")) + 12.5;

				if (calcDistance(pocketLeft, pocketTop, newLeft + 10, newTop + 10) < 20) {
					newVelocity = 0;
					newAngle = 0;
					sunk = true;
				}
			});

			if (sunk) {
				ref.addClass("sunk").appendTo(".table__sunk");
			} else {
				ref.data("velocity", newVelocity);
				ref.data("angle", newAngle);
				ref.css("left", newLeft + "px");
				ref.css("top", newTop + "px");
			}
		}
	});
	window.requestAnimationFrame(moveTick);
}

init();
window.requestAnimationFrame(moveTick);
