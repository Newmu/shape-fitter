var original, best, current, oCtx, bCtx, cCtx, eCtx, bestErr, oPixs, width, height, shapes, bestshapes, diagLen, loop, numPixs, ePixs, eImgData;

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

$(window).load(function(){
	original = document.getElementById('original');
	best = document.getElementById('best');
	current = document.getElementById('current');
	error = document.getElementById('error');
	oCtx = original.getContext('2d');
	bCtx = best.getContext('2d');
	cCtx = current.getContext('2d');
	eCtx = error.getContext('2d');
	var img = new Image();
	img.onload = function() {
		width = img.width;
		height = img.height;
		original.width = width;
		original.height = height;
		best.width = width;
		best.height = height;
		current.width = width;
		current.height = height;
		error.width = width;
		error.height = height;
		oCtx.drawImage(this, 0, 0);
		init(400);
		bestErr = 1000000000;
		loop = 0;
		numPixs = width*height;
		bestshapes = shapes.slice(0);
		oPixs = oCtx.getImageData(0,0, width, height).data;
		eImgData = eCtx.getImageData(0,0, width, height);
		ePixs = eImgData.data;
		setInterval(render,16);
	};
	img.src = 'me.jpg';
});

function render(){
	var oldErr = getError(oCtx,cCtx);
	shapes = JSON.parse(JSON.stringify(bestshapes));
	mutate();
	draw(cCtx);
	var newErr = getError(oCtx,cCtx);
	if (newErr < bestErr){
		bestErr = newErr;
		bestshapes = JSON.parse(JSON.stringify(shapes));
		draw(bCtx);
	}
	if (loop % 10 == 0){console.log(loop,bestErr);}
	loop++;
}

function init(amnt){
	shapes = [];
	diagLen = Math.sqrt(Math.pow(width,2)+Math.pow(height,2))/2;
	for (var i = 0; i < amnt; i++){
		var shape = {};
		var x1 = randInt(0,width);
		var y1 = randInt(0,height);
		var x2 = randInt(0,width);
		var y2 = randInt(0,height);
		var x3 = randInt(0,width);
		var y3 = randInt(0,height);
		var r = randInt(0,255).toString();
		var g = randInt(0,255).toString();
		var b = randInt(0,255).toString();
		var a = (Math.random()/3).toString();
		shapes.push([x1,y1,x2,y2,x3,y3,r,g,b,a]);
	}
}

function draw(ctx){
	ctx.clearRect(0,0,width,height);
	for (var c = 0; c < shapes.length; c++){
		var shape = shapes[c];
		var x1 = shape[0];
		var y1 = shape[1];
		var x2 = shape[2];
		var y2 = shape[3];
		var x3 = shape[4];
		var y3 = shape[5];
		var r = shape[6];
		var g = shape[7];
		var b = shape[8];
		var a = shape[9]
		ctx.beginPath();
		ctx.moveTo(x1,y1);
		ctx.lineTo(x2,y2);
		ctx.lineTo(x3,y3);
		ctx.fillStyle = 'rgba('+r+','+g+','+b+','+a+')';
		ctx.fill();
	}
}

function mutate(){
	var c = randInt(0,shapes.length-1);
	var prop = randInt(0,9);
	if (prop == 0 || prop == 2 || prop == 4){
		shapes[c][prop] = randInt(0,width);
	}
	else if (prop == 1 || prop == 3 || prop == 5){
		shapes[c][prop] = randInt(0,height);
	}
	else if (prop >= 6 && prop <= 8){
		shapes[c][prop] = randInt(0,255).toString();
	}
	else{
		shapes[c][prop] = (Math.random()/3).toString();
	}
}

// function init(amnt){
// 	shapes = [];
// 	diagLen = Math.sqrt(Math.pow(width,2)+Math.pow(height,2))/2;
// 	for (var i = 0; i < amnt; i++){
// 		var shape = {};
// 		shape.x = randInt(0,width);
// 		shape.y = randInt(0,height);
// 		shape.radius = randInt(0,diagLen/3);
// 		shape.r = randInt(0,255).toString();
// 		shape.g = randInt(0,255).toString();
// 		shape.b = randInt(0,255).toString();
// 		shape.a = (Math.random()/2).toString();
// 		shapes.push(shape);
// 	}
// }

// function draw(ctx){
// 	ctx.clearRect(0,0,width,height);
// 	for (var c = 0; c < shapes.length; c++){
// 		var shape = shapes[c];
// 		ctx.beginPath();
// 		ctx.arc(shape.x,shape.y,shape.radius,0,Math.PI*2,false);
// 		ctx.closePath();
// 		ctx.fillStyle = 'rgba('+shape.r+','+shape.g+','+shape.b+','+shape.a+')';
// 		ctx.fill();
// 	}
// }

// function mutate(){
// 	var c = randInt(0,shapes.length-1);
// 	var propNames = Object.keys(shapes[0]);
// 	var prop = propNames[randInt(0,propNames.length-1)];
// 	if (prop == 'x'){
// 		shapes[c][prop] = randInt(0,width);
// 	}
// 	else if (prop == 'y'){
// 		shapes[c][prop] = randInt(0,height);
// 	}
// 	else if (prop == 'radius'){
// 		shapes[c][prop] = randInt(0,diagLen/3);
// 	}
// 	else if (prop == 'r' || prop == 'g' || prop == 'b'){
// 		shapes[c][prop] = randInt(0,255).toString();
// 	}
// 	else{
// 		shapes[c][prop] = (Math.random()/2).toString();
// 	}
// }

function getError(oCtx,cCtx){
	var cPixs = cCtx.getImageData(0,0, width, height).data;
	var errSum = 0;
	for (var p = 0; p < numPixs; p++){
		var err = 0;
		err += Math.abs(oPixs[p*4]-cPixs[p*4]); // R error
		err += Math.abs(oPixs[p*4+1]-cPixs[p*4+1]); // G error
		err += Math.abs(oPixs[p*4+2]-cPixs[p*4+2]); // B error
		// ePixs[p*4] = err;
		// ePixs[p*4+1] = err;
		// ePixs[p*4+2] = err;
		// ePixs[p*4+3] = 255;
		errSum += err;
	}
	// eCtx.putImageData(eImgData,0,0);
	return errSum;
}

function randInt(min,max){
	return Math.floor(Math.random()*(max - min + 1))+min;
}
