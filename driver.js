var tiles = [];
var ctx;
var playState = false;
var buffer;
var cursor;
var animId;

var playBtn = document.getElementById("playBtn");

function isPrime(b) {
    var res = [2];

    for(var i = 2; i < b; i++) {
        for(var j = 2; j < i; j++) {
            if(i % j == 0) {
                break;
            }

            if(j == i - 1) {
                res.push(i);
            }
        }
    }

    return res;
}

document.addEventListener('DOMContentLoaded', () => {
    ctx = document.getElementById("mainCanvas");
    ctx.width = window.innerWidth;
    ctx.height = window.innerHeight;

    var ctxContext = ctx.getContext("2d");

    //find the correct size for each paths

    //gcd
    var a = (ctx.width > ctx.height) ? ctx.width : ctx.height;
    var b = (ctx.width > ctx.height) ? ctx.height : ctx.width;
    var hld = 0;

    while(a % b != 0) {
        hld = a % b;
        a = b;
        b = hld;
    }

    //find prime up to n put it in array as divisor
    var arr = isPrime(b);

    while(ctx.width / b < 250) {
        var nvr = true;

        for(var i = 0; i < arr.length; i++) {
            if(b % arr[i] == 0) {
                b /= arr[i];
                nvr = false;
                break;
            }
        }

        if(nvr) {
            break;
        }
    }

    //b is now width of the individual squares
    //clamp the width to minimize minimum width in
    //the case of small gcds
    b = Math.max(b, ctx.width / 120);
    cursor = b;
    cursor = cursor / 2;

    //build the grid and buffer
    ctxContext.strokeStyle = '#FFFFFF'; 
    ctxContext.fillStyle = '#303234';
    ctxContext.lineWidth = Math.ceil(b * 0.04); 

    for(var i = 0; i < ctx.height; i += b) {
        var row = [];
        for(var j = 0; j < ctx.width; j += b) {
            var curr = new Path2D();
            
            curr.rect(j, i, b, b);
            ctxContext.stroke(curr);
            ctxContext.fill(curr);

            row.push(curr);
        }

        tiles.push(row);
    }

    buffer = Array.from({ length: tiles.length }, () => new Array(tiles[0].length).fill(false));
});

document.addEventListener('click', function(event) {
    var ctxContext = ctx.getContext("2d");
    ctxContext.strokeStyle = '#FFFFFF'; 

    if(!playState) {
        for(var i = 0; i < tiles.length; i++) {
            for(var j = 0; j < tiles[i].length; j++) {
                if(ctxContext.isPointInPath(tiles[i][j], event.clientX, event.clientY)) {
                    var s = ctxContext.getImageData(event.clientX, event.clientY, 1, 1).data;

                    if((s[0] == 48) && (s[1] == 50) && (s[2] == 52)) {
                        ctxContext.fillStyle = '#FFFFFF';
                        ctxContext.stroke(tiles[i][j]);
                        ctxContext.fill(tiles[i][j]);
                    }
                    else if((s[0] == 255) && (s[1] == 255) && (s[2] == 255)) {
                        ctxContext.fillStyle = '#303234';
                        ctxContext.stroke(tiles[i][j]);
                        ctxContext.fill(tiles[i][j]);
                    }
                }
            }
        }
    }
});

playBtn.addEventListener('click', function(event) {
     if(!playState) {
        playState = true;
        animId = window.requestAnimationFrame(play);
    }
    else {
        //cancel animation request
        window.cancelAnimationFrame(animId);

        var ctxContext = ctx.getContext("2d");
        playState = false;
        ctxContext.fillStyle = '#303234';
        ctxContext.strokeStyle = '#FFFFFF'; 

        //Reset automaton
        for(var i = 0; i < tiles.length; i++) {
            for(var j = 0; j < tiles[0].length; j++) {
                buffer[i][j] = false;
                ctxContext.stroke(tiles[i][j]);
                ctxContext.fill(tiles[i][j]);
            }
        }
    }
});

function play() {
    var ctxContext = ctx.getContext("2d");
    var x = cursor, y = cursor;
    var s;

    for(var i = 0; i < tiles.length; i++) {
        y = cursor + ((cursor * 2) * i);
        for(var j = 0; j < tiles[0].length; j++) {
            x = cursor + ((cursor * 2) * j);
            var neighCount = 0;

            for(var k = -1; k < 2; k++) {
                for(var l = -1; l < 2; l++) {
                    if(k == 0 && l == 0) {}
                    else {
                        if((i + k >= 0) && (i + k < tiles.length) && (l + j >= 0) && (l + j < tiles[0].length)) {                        
                            s = ctxContext.getImageData(x + (cursor * 2) * l, y + (cursor * 2) * k, 1, 1).data;
                            if(s[0] == 255 && s[1] == 255 && s[2] == 255) {
                                neighCount++;
                            }
                        }
                    }
                }
            }

            s = ctxContext.getImageData(x, y, 1, 1).data;
            if(neighCount < 2) {
                buffer[i][j] = false;
            }
            else if(neighCount > 3) {
                buffer[i][j] = false;
            }
            else if(neighCount == 3 && (s[0] == 48 && s[1] == 50 && s[2] == 52)) {
                buffer[i][j] = true;
            }
            else {
                if(s[0] == 255 && s[1] == 255 && s[2] == 255) {
                    buffer[i][j] = true;
                }
            }
        }
    }

    ctxContext.strokeStyle = '#FFFFFF';
    for(var i = 0; i < tiles.length; i++) {
        for(var j = 0; j < tiles[0].length; j++) {
           if(buffer[i][j]) {
                ctxContext.fillStyle = '#FFFFFF';
                ctxContext.stroke(tiles[i][j]);
                ctxContext.fill(tiles[i][j]);
           }
           else {
                ctxContext.fillStyle = '#303234';
                ctxContext.stroke(tiles[i][j]);
                ctxContext.fill(tiles[i][j]);
           }
        }
    }

    console.log(buffer);
    buffer = Array.from({ length: tiles.length }, () => new Array(tiles[0].length).fill(false));

    animId = window.requestAnimationFrame(play);
}