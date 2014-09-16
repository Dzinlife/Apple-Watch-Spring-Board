FastClick.attach(document.body);
$(document).on("touchmove", function(e) {
	e.preventDefault();
})

$.fn.extend({
	transform: function(_transform) {
		this.each(function(){
			var $this = $(this)
			if ($this.data("transform") === undefined) {
				$this.data("transform", {});
			}
			$.extend($this.data("transform"), _transform);

			var transformCSS,
					translate3d = ["0","0","0"],
					scale = "1";

			for (n in $this.data("transform")) {
				switch(n) {
					case "x" : 
						if (typeof($this.data("transform").x) === "number") {
							translate3d[0] = $this.data("transform").x + "px";
						}else{
							translate3d[0] = $this.data("transform").x;	
						}
						break;

					case "y" :
						if (typeof($this.data("transform").y) === "number") {
							translate3d[1] = $this.data("transform").y + "px";
						}else{
							translate3d[1] = $this.data("transform").y;	
						}
						break;

					case "z" :
						if (typeof($this.data("transform").z) === "number") {
							translate3d[2] = $this.data("transform").z + "px";
						}else{
							translate3d[2] = $this.data("transform").z;	
						}
						break;

					case "scale" :
						scale = $this.data("transform").scale;
						break;
				}
			}

			if (translate3d === ["0","0","0"]) {
				translate3d = "";
			}else{
				translate3d = "translate3d(" + translate3d + ")";
			}

			if (scale === "1") {
				scale = "";
			}else{
				scale = "scale(" + scale + ")"
			}
			transformCSS = translate3d + " " + scale;

			$this.css("transform", transformCSS);

		})
	},
})

var screenW,
		screenH,
		centerW,
		centerH;

!function(){
	screenW = $("#screen-container").outerWidth();
	screenH = $("#screen-container").outerHeight();
	centerW = screenW/2;
	centerH = screenH/2;

}();

hexCube = new Array();
for(var i = 0; i < 4; i++){
  for(var j = -i; j <= i; j++)
  for(var k = -i; k <= i; k++)
  for(var l = -i; l <= i; l++)
    if(Math.abs(j) + Math.abs(k) + Math.abs(l) == i*2 && j + k + l == 0)
    hexCube.push([j,k,l]);
}

function iconMapRefresh(sphereR, hexR, scroll, _option) {
	// console.log("before " + Date.parse(new Date()))
	hexCubeOrtho = new Array(),
	hexCubePolar = new Array(),
	hexCubeSphere = new Array();
	
	var option = {
		iconZoom : 1,
		edgeZoom : true,
	}

	$.extend(option, _option || {});

	if (scroll === undefined) {
		var scrollX = 0,
				scrollY = 0;
	}else{
		var scrollX = scroll.x,
				scrollY = scroll.y;
	}

	function polar2ortho (r, rad) {
		var x = r * Math.cos(rad);
		var y = r * Math.sin(rad);
		return {
			"x"	: x,
			"y"	: y,
		}
	}

	function ortho2polar (x, y) {
		var r = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
		var rad = Math.atan2(y, x);
		return {
			"r"		: r,
			"rad"	: rad,
		}
	}

	for (i in hexCube) {
		hexCubeOrtho[i] = {
			"x": (hexCube[i][1] + hexCube[i][0] / 2) * hexR + scrollX,
			"y": Math.sqrt(3) / 2 * hexCube[i][0] * hexR + scrollY,
		}
	}

	for (i in hexCubeOrtho) {
		hexCubePolar[i] = ortho2polar(hexCubeOrtho[i].x, hexCubeOrtho[i].y);
	}

	for (i in hexCubePolar) {
		var rad = hexCubePolar[i].r / sphereR;
		if (rad < Math.PI/2) {
			var r = hexCubePolar[i].r * $.easing["swing"](null, rad / (Math.PI/2), 1.5, -0.5, 1);
			var deepth = $.easing["easeInOutCubic"](null, rad / (Math.PI/2), 1, -0.5, 1);
		}else{
			var r = hexCubePolar[i].r;
			var deepth = $.easing["easeInOutCubic"](null, 1, 1, -0.5, 1);
		}

		hexCubeSphere[i] = {
			"r" : r,
			"deepth" : deepth,
			"rad" : hexCubePolar[i].rad, 
		}
	}

	for (i in hexCubeSphere) {
		hexCubeOrtho[i] = polar2ortho(hexCubeSphere[i].r, hexCubeSphere[i].rad);
	}

	for (i in hexCubeOrtho) {
			hexCubeOrtho[i].x = Math.round(hexCubeOrtho[i].x * 10) / 10;
			hexCubeOrtho[i].y = Math.round(hexCubeOrtho[i].y * 10) / 10 *1.14;
	}

	if (option.edgeZoom === true) {
		var edge = 12;
		for (i in hexCubeOrtho) {
			if (Math.abs(hexCubeOrtho[i].x) > screenW/2 - edge || Math.abs(hexCubeOrtho[i].y) > screenH/2 - edge) {
				hexCubeOrtho[i].scale = hexCubeSphere[i].deepth * 0.4;
			}else if(Math.abs(hexCubeOrtho[i].x) > screenW/2 - 2 * edge && Math.abs(hexCubeOrtho[i].y) > screenH/2 - 2 * edge){
				hexCubeOrtho[i].scale = Math.min(hexCubeSphere[i].deepth * $.easing["easeInOutSine"](null, screenW/2 - Math.abs(hexCubeOrtho[i].x) - edge, 0.4, 0.6, edge), hexCubeSphere[i].deepth * $.easing["easeInOutSine"](null, screenH/2 - Math.abs(hexCubeOrtho[i].y) - edge, 0.3, 0.7, edge) );
			}else if(Math.abs(hexCubeOrtho[i].x) > screenW/2 - 2 * edge){
				hexCubeOrtho[i].scale = hexCubeSphere[i].deepth * $.easing["easeOutSine"](null, screenW/2 - Math.abs(hexCubeOrtho[i].x) - edge, 0.4, 0.6, edge);
			}else if(Math.abs(hexCubeOrtho[i].y) > screenH/2 - 2 * edge){
				hexCubeOrtho[i].scale = hexCubeSphere[i].deepth * $.easing["easeOutSine"](null, screenH/2 - Math.abs(hexCubeOrtho[i].y) - edge, 0.4, 0.6, edge);
			}else{
				hexCubeOrtho[i].scale = hexCubeSphere[i].deepth;
			}
		}

		for (i in hexCubeOrtho){
			if (hexCubeOrtho[i].x < -screenW/2 + 2 * edge) {
				hexCubeOrtho[i].x += $.easing["easeInSine"](null, screenW/2 - Math.abs(hexCubeOrtho[i].x) - 2 * edge, 0, 6, 2 * edge);
			}else if(hexCubeOrtho[i].x > screenW/2 - 2 * edge) {
				hexCubeOrtho[i].x += $.easing["easeInSine"](null, screenW/2 - Math.abs(hexCubeOrtho[i].x) - 2 * edge, 0, -6, 2 * edge);
			};
			if(hexCubeOrtho[i].y < -screenH/2 + 2 * edge) {
				hexCubeOrtho[i].y += $.easing["easeInSine"](null, screenH/2 - Math.abs(hexCubeOrtho[i].y) - 2 * edge, 0, 8, 2 * edge);
			}else if(hexCubeOrtho[i].y > screenH/2 - 2 * edge) {
				hexCubeOrtho[i].y += $.easing["easeInSine"](null, screenH/2 - Math.abs(hexCubeOrtho[i].y) - 2 * edge, 0, -8, 2 * edge);
			}
		}
	};

	

	!function() {
		for (var i = 0; i < $(".appicon").length; i++){
			$(".appicon").eq(i).transform({
				"x": hexCubeOrtho[i].x,
				"y": hexCubeOrtho[i].y,
				"scale": hexCubeOrtho[i].scale,
			});
		}
	}()

	// console.log("after " + Date.parse(new Date()))

}


var scrollX = 0,
		scrollY = 0,
		scrollMoveX = 0,
		scrollMoveY = 0,
		lastX,
		lastY,
		deltaX,
		deltaY,
		scrollRangeX = 30,
		scrollRangeY = 10,
		inertia,
		inertiaX,
		inertiaY,
		scrollAvailable = true;

$("#screen-container").on("touchstart mousedown", function(e) {
	if (scrollAvailable === false) {
		return;
	};

	if (e.originalEvent.touches !== undefined) {	
		if (e.originalEvent.touches.length === 2) {
			e.preventDefault();
			return;
		};
	};
	
	if (e.originalEvent.touches !== undefined) {
		e.originalEvent = e.originalEvent.touches[0];
	};

	$(window).off("touchmove mousemove");
	lastX = e.originalEvent.pageX;
	lastY = e.originalEvent.pageY;
	deltaX = e.originalEvent.pageX - lastX;
	deltaY = e.originalEvent.pageY - lastY;
	scrollMoveX += deltaX;
	scrollMoveY += deltaY;
	scrollX = scrollMoveX;
	scrollY = scrollMoveY;

	clearInterval(inertia);

	$(window).on('touchmove mousemove', function(e){
		e.preventDefault();
		e.stopPropagation();

	if (e.originalEvent.touches !== undefined) {
		e.originalEvent = e.originalEvent.touches[0];
	};

		deltaX = e.originalEvent.pageX - lastX;
		deltaY = e.originalEvent.pageY - lastY;

		lastX = e.originalEvent.pageX;
		lastY = e.originalEvent.pageY;

		scrollMoveX += deltaX;
	  scrollMoveY += deltaY;

	  scrollX = scrollMoveX;
	  scrollY = scrollMoveY;

	  if(scrollMoveX > scrollRangeX) {
			scrollX = scrollRangeX + (scrollMoveX - scrollRangeX)/2;
		}else if (scrollX < -scrollRangeX) {
			scrollX = -scrollRangeX + (scrollMoveX + scrollRangeX)/2;
		}

		if(scrollMoveY > scrollRangeY) {
			scrollY = scrollRangeY + (scrollMoveY - scrollRangeY)/2;
		}else if (scrollY < -scrollRangeY) {
			scrollY = -scrollRangeY + (scrollMoveY + scrollRangeY)/2;
		}

	  iconMapRefresh(100, 43, {x : scrollX, y: scrollY})
	});
	$(window).on("touchend mouseup" ,function(e) {
		$(window).off("touchmove mousemove touchend mouseup");
		var step = 1,
				steps = 36,
				veloX = deltaX,
				veloY = deltaY,
				distanceX = veloX * 10,
				distanceY = veloY * 10;

		inertia = setInterval(function() {
			if (step > steps) {
				clearInterval(inertia);
			};

			scrollMoveX = scrollX;
		  scrollMoveY = scrollY;

			inertiaX = $.easing["easeOutCubic"](null, step, 0, distanceX, steps) - $.easing["easeOutCubic"](null, (step - 1), 0, distanceX, steps);
			inertiaY = $.easing["easeOutCubic"](null, step, 0, distanceY, steps) - $.easing["easeOutCubic"](null, (step - 1), 0, distanceY, steps);

			scrollX += inertiaX;
			scrollY += inertiaY;

			if(scrollX > scrollRangeX) {
				scrollX -= (scrollX - scrollRangeX)/4;
			}else if (scrollX < -scrollRangeX) {
				scrollX -= (scrollX + scrollRangeX)/4;
			}

			if(scrollY > scrollRangeY) {
				scrollY -= (scrollY - scrollRangeY)/4;
			}else if (scrollY < -scrollRangeY) {
				scrollY -= (scrollY + scrollRangeY)/4;
			}

			iconMapRefresh(100, 43, {x : scrollX, y: scrollY});
			step++;
		},16)
	})
})




homeOpening ();
$(".home-button").on("click", homeOpening);

function homeOpening (){
	scrollAvailable = false;
	$("#home").css({
		"transform"	: "scale(1)",
		"opacity"		: 0,
		"transition"	: "300ms cubic-bezier(0.19, 1, 0.22, 1)",
	});
	setTimeout(function(){
		$("#home").css({
			"transform"	: "scale(4)",
			"opacity"		: 0,
			"transition"	: "0s",
		});

		scrollX = 0;
		scrollY = 0;
		scrollMoveX = 0;
		scrollMoveY = 0;

		iconMapRefresh(100, 100, {x : 0, y: 0});
		var openingStep = 0;
		var openingTimer = setInterval(function() {
			if (openingStep > 36) {
				clearInterval(openingTimer);
				scrollAvailable = true;
			};

			iconMapRefresh(100, $.easing["easeOutCubic"](null, openingStep, 100, -57, 36), {x : 0, y: 0})

			openingStep++;
		},16)

		setTimeout(function(){
			$("#home").css({
				"transform"		: "scale(1)",
				"opacity"		: 1,
				"transition"	: "600ms cubic-bezier(0.19, 1, 0.22, 1)",
			});
		})
	},600);
	
}

