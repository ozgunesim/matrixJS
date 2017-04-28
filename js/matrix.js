(function ( $ ) {

	var canvas, ctx;
	var w,h, maxChar;
	var _interval;
	var size;
	var blocks = [];
	var isFullscreen = false;
	var parent;

	$.fn.matrix = function( options ) {

		var settings = $.extend({
      //defaults
      density: 100,
      color: "#005900",
      backgroundColor: "#000000",
      fontSize: "12px",
      fontFamily: "Courier",
      width: "320",
      height: "240",
      fps: 30
    }, options );


		canvas = $(this);
		parent = $(this).parent();


    init();


		function init(){
			stop();
			ctx = $(canvas)[0].getContext("2d");
	    //ctx.canvas.style.width ='100%';
		  //ctx.canvas.style.height='100%';
		  // ...then set the internal size to match

		  if(!isFullscreen){
		  	ctx.canvas.width  = settings.width;
		  	ctx.canvas.height = settings.height;

		  }else{
		  	ctx.canvas.width = screen.width;
        ctx.canvas.height = screen.height;
		  }
		  

		  ctx.font = settings.fontSize + ' ' + settings.fontFamily;
		  ctx.textAlign = 'center';
		  ctx.textBaseline = 'middle';

		  w = $(canvas).width();
		  h = $(canvas).height();
		  console.log("w :" + w + " , h:" + h);
		  size = parseInt(settings.fontSize.replace("px",""));

		  maxChar = Math.floor(h/size);
		  blocks = [];

	    /*
      .
      .
      [x	y    color     chars    blockHeight]
      .
      .
      */


      start();

    }


    $('body').keyup(function(e){
    	if(e.keyCode == 32){	//space
				stop();
	   	}
    });
    

    $(canvas).click(function(){
    	if(!isFullscreen){

    		fullscreen($(canvas)[0]);

    		ctx.canvas.width = $(window).width();
        ctx.canvas.height = $(window).height();

    		$(canvas).css({
    			'position' : 'absolute'
    		});


    		isFullscreen = true;
    	}else{
    		
    		exitFullscreen();

    		$(canvas).css({
    			'position' : ''
    		});

    		isFullscreen = false;
    	}


    	init();

    });



    function fullscreen(element) {
		  if(element.requestFullscreen) {
		    element.requestFullscreen();
		  } else if(element.mozRequestFullScreen) {
		    element.mozRequestFullScreen();
		  } else if(element.webkitRequestFullscreen) {
		    element.webkitRequestFullscreen();
		  } else if(element.msRequestFullscreen) {
		    element.msRequestFullscreen();
		  }
		}

		function exitFullscreen() {
		  if(document.exitFullscreen) {
		    document.exitFullscreen();
		  } else if(document.mozCancelFullScreen) {
		    document.mozCancelFullScreen();
		  } else if(document.webkitExitFullscreen) {
		    document.webkitExitFullscreen();
		  }
		}


    function start(){
      //create blocks
      //set monochromatic colors

      var colors = tinycolor(settings.color).monochromatic();	//size: 6
      var blockCount = parseInt((w / size) * (settings.density / 100));
      for(var i=0; i<blockCount; i++){
      	//var x = (Math.floor(i/2) * size) + parseInt(Math.random() * size*3);
      	var x = Math.floor(Math.random() * w);
      	var y = parseInt(Math.random() * h) - h;
      	y -= y%size;
      	var blockHeight = 3 + parseInt(Math.random() * Math.floor(maxChar*1.7));
      	var color;// = colors[parseInt(Math.random() * colors.length)];
      	var chars = [];
      	var rnd = Math.floor(Math.random() * 2);
      	if(rnd == 1){
      		color = tinycolor(settings.color).brighten(10 + Math.floor(Math.random() * 26)).toHexString();
      	}else{
      		color = tinycolor(settings.color).darken(10 + Math.floor(Math.random() * 5)).toHexString();
      	}

      	var block = {
      		"x"	: x,
      		"y" : y,
      		"color" : color,
      		"chars" : chars,
      		"blockHeight" : blockHeight,
      		"frameLen" : 1 +  parseInt(Math.random() * 3),
      		"frame": 0
      	};
      	block.chars.unshift(getRandomChar());	
      	blocks.push(block);
      }

      _interval = setInterval(function() {
      	update();
      	draw();
        //afterDraw();
      }, 1000/settings.fps);

      console.log(blocks);

    }

    function update(){
      //add new chars to blocks
      //check overflows
      //change some chars randomly

      for(var i=0; i<blocks.length; i++){
      	var block = blocks[i];

      	if(block.y - (block.chars.length*size) > h){
      		//var x = (i * size) + parseInt(Math.random() * size*3);
      		var x = Math.floor(Math.random() * w);
      		var y = -(parseInt(Math.random() * h));
      		y -= y%size;
      		block.x = x;
      		block.y = y;
      		block.chars = [];
      	}

      	block.frame++;

      	if((block.frame % block.frameLen) == 0){
      		block.y += size;
      		block.frame = 0;
      		block.chars.unshift(getRandomChar());		//new char added to the top of the array
      	}

      	

      	if(block.chars.length > block.blockHeight)
      		block.chars.splice(block.chars.length -1 , 1);

      	blocks[i] = block;
      }

    }

    function draw(){

      ctx.fillStyle = settings.backgroundColor;
      ctx.fillRect(0, 0, w, h);

      for(var i=0; i<blocks.length; i++){
      	var block = blocks[i];
      	
      	for(var j=0; j<block.chars.length; j++){
      		var rnd = Math.floor(Math.random() * 20);
      		if(rnd == 0){
      			block.chars[j] = getRandomChar();
      			blocks[i] = block;
      		}
      		if(j == 0){
      			var brightenColor = tinycolor(block.color).brighten(45).toString();
      			var darkenColor = tinycolor(brightenColor).darken(25).setAlpha(.4).toString();

      			var grd=ctx.createRadialGradient(block.x, block.y, 0 , block.x, block.y, size);
      			grd.addColorStop(0, darkenColor);
      			grd.addColorStop(1, "transparent");


						// Fill with gradient
						ctx.fillStyle = grd;
						ctx.fillRect(block.x-size, block.y-size, size*4, size*4);

						ctx.fillStyle = brightenColor;
						ctx.fillText(block.chars[j], block.x, block.y - (j * size));



					}else{
      			ctx.fillStyle = block.color; //settings.color;
      			ctx.fillText(block.chars[j], block.x, block.y - (j * size));
      		}
      		
      	}
      	
      }
      
    }

    function stop(){
    	clearInterval(_interval);
    }

    function getRandomChar(){
    	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    	return possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return canvas;

  };

  

}( jQuery ));