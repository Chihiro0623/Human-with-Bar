"use strict";

var canvas;
var gl;
var program;

var x;
var y;
var MWscale = 50.0;
var atx = 0.0;
var aty = 0.0;
var eyetheta = 76.0;
var eyephi = 87.0;
var phiterm = 1;
var eyeVal = [0.0, 0.0, 1.0];
var ButtonView = false;

var LT = 0;
var LEtable = [true, false];

var initialColor = [ 0.0, 0.15, 0.05, 1.0 ];
var barinitialColor = [ 0.2, 0.2, 0.2, 1.0 ];

var lightPosition = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightAmbient = vec4( 0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var lightPosition2 = vec4( 1.0, 1.0, 1.0, 0.0 );
var lightAmbient2 = vec4( 0.2, 0.2, 0.2, 0.0 );
var lightDiffuse2 = vec4( 1.0, 1.0, 1.0, 0.0 );
var lightSpecular2 = vec4( 1.0, 1.0, 1.0, 0.0 );

var LPVal = [[100, 100, 100],[100, 100, 100]];
var LAVal = [[0.2, 0.2, 0.2],[0.2, 0.2, 0.2]];
var LDVal = [[0.8, 0.8, 0.8],[0.0, 1.0, 0.8]];
var LSVal = [[0.5, 0.5, 0.5],[1.0, 0.8, 0.0]];

var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 50.0;

var SliderUpdate = function() {};
var DataUpdate = function() {};

var CamPosUp = function() {
	if(eyetheta > 180.0) {
		eyetheta = -180.0;
	}
	var rotationRadians = eyetheta * (Math.PI / 180);
	var angleRadians = eyephi * (Math.PI / 180);
	var CPx = MWscale * Math.sin(angleRadians) * Math.sin(rotationRadians);
	var CPz = MWscale * Math.sin(angleRadians) * Math.cos(rotationRadians);
	var CPy = MWscale * Math.cos(angleRadians);
	return vec3(CPx, CPy, CPz);
};

var CPUF = function() {
	if(ButtonView) {
		var CX = MWscale * eyeVal[0];
		var CY = MWscale * eyeVal[1];
		var CZ = MWscale * eyeVal[2];
		eyephi = parseFloat((Math.acos(CY/MWscale) / (Math.PI / 180)).toFixed(2));
		eyetheta = parseFloat((MWscale * Math.atan(CX/CZ) / (Math.PI / 180)).toFixed(2));
		if(eyephi == 0 || isNaN(eyephi)) {
			if(CY <= 0) {
				eyephi = 179.99;
			} else {
				eyephi = 0.01;
			}
		}
	}
	if(!ButtonView) {
		var rotationRadians = eyetheta * (Math.PI / 180);
		var angleRadians = eyephi * (Math.PI / 180);
		eyeVal[0] = parseFloat((Math.sin(angleRadians) * Math.sin(rotationRadians)).toFixed(2));
		eyeVal[2] = parseFloat((Math.sin(angleRadians) * Math.cos(rotationRadians)).toFixed(2));
		eyeVal[1] = parseFloat((Math.cos(angleRadians)).toFixed(2));
	}
}

var projectionMatrix, modelViewMatrix, instanceMatrix, cameraMatrix;

var modelViewMatrixLoc, modelViewLoc, cameraMatrixLoc, projectionMatrixLoc;

var fieldOfViewRadians = 60;
var aspect;
var zNear = 1;
var zFar = 2000;
var fixview = false;
var firstview = false;

var eye = vec3(0, 15, 70);
var up = vec3(0, 1, 0);
var at = vec3(0, 0, 0);

var vertices = [

	vec4(  0.5, 0.5, 0, 1.0 ),
	vec4(  0.25, 0.5, -0.25*Math.sqrt(3), 1.0 ),
	vec4(  -0.25, 0.5, -0.25*Math.sqrt(3), 1.0 ),
	vec4(  -0.5, 0.5, 0, 1.0 ),
	vec4(  -0.25, 0.5, 0.25*Math.sqrt(3), 1.0 ),
	vec4(  0.25, 0.5, 0.25*Math.sqrt(3), 1.0 ),
	vec4(  0.5, -0.5, 0, 1.0 ),
	vec4(  0.25, -0.5, -0.25*Math.sqrt(3), 1.0 ),
	vec4(  -0.25, -0.5, -0.25*Math.sqrt(3), 1.0 ),
	vec4(  -0.5, -0.5, 0, 1.0 ),
	vec4(  -0.25, -0.5, 0.25*Math.sqrt(3), 1.0 ),
	vec4(  0.25, -0.5, 0.25*Math.sqrt(3), 1.0 ),
];

var normalsArray = [];
var vertexColors = [];
var texCoordsArray = [];

var texture;
var cylinderNum = 90;
var cylinderLength = 20;
var cylinderWidth = 0.6;
var cylinderDiff = 6;

var torsoUpperId = 0;
var torsoLowerId = 1;
var headId  = 2;
var head1Id = 2;
var head2Id = 2;
var leftUpperArmId = 3;
var leftLowerArmId = 4;
var rightUpperArmId = 5;
var rightLowerArmId = 6;
var leftUpperLegId = 7;
var leftLowerLegId = 8;
var rightUpperLegId = 9;
var rightLowerLegId = 10;
var leftHandId = 11;
var rightHandId = 12;
var leftFootId = 13;
var rightFootId = 14;
var barId = 15;
var platformId = 16;

var torsoHeight = 2.0;
var torsoWidth = 2.0;
var torsoThick = 0.8;
var upperArmHeight = 2.0;
var lowerArmHeight = 2.0;
var handHeight = 0.5;
var upperArmWidth  = 0.5;
var lowerArmWidth  = 0.5;
var handWidth  = 0.5;
var upperLegHeight = 2.4;
var lowerLegHeight = 2.0;
var footHeight = 0.5;
var upperLegWidth = 0.8;
var lowerLegWidth = 0.8;
var footWidth = 0.8;
var footDepth = 0.9;
var headHeight = 1.5;
var headWidth = 1.0;

var numNodes = 15;
var numAngles = 15;
var angle = 0;

var position = vec3(0, 6, 0);
var velocity = vec3(0, 0, 0);
var acceleration = vec3(0, 0, 0); //z is gravity
var theta = [0, 0, 0, 180, 0, 180, 0, 180, 0, 180, 0, 0, 0, 0, 0];
var rho = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var count = -1;
var chkmove = 0;
var barhold = 0;
var upId = 0;
var rightId = 1;
var downId = 2;
var leftId = 3;
var chkdirection = -1;

var stopId = -1;
var runId = 0;
var walkId = 1;
var jumpId = 2;
var barwork1Id = 3;
var barwork2Id = 4;
var runDirection = [0, 0, 0, 4, 4/2.43, -4, -4/2.43, 0, 0, 0, 0, 0, 0, 0, 0];

var numVertices = 24;

var stack = [];

var figure = [];

var textures = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null, null);

var cBuffer, nBuffer, vNormal, vBuffer, vPosition, vBufferSphere, sphere;
var numPointsSphere, lightmatTransform, matT, matS;

var pointsArray = [];
var barPointStart;
var barVerticeStart;
//-------------------------------------------

function scale4(a, b, c) {
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}

//--------------------------------------------

function configureTexture( image ) {
    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}

function barQuad(a, b, c, d) {
	var t2 = subtract(vertices[barVerticeStart+b], vertices[barVerticeStart+a]);
	var t1 = subtract(vertices[barVerticeStart+c], vertices[barVerticeStart+b]);
	var normal = cross(t1, t2);
	var normal = vec3(normal);
	pointsArray.push(vertices[barVerticeStart+a]);
	normalsArray.push(normal);
	vertexColors.push(vec4( barinitialColor[0], barinitialColor[1], barinitialColor[2], barinitialColor[3] ));
	texCoordsArray.push(vec2(1, 0));
	pointsArray.push(vertices[barVerticeStart+b]);
	normalsArray.push(normal);
	vertexColors.push(vec4( barinitialColor[0], barinitialColor[1], barinitialColor[2], barinitialColor[3] ));
	texCoordsArray.push(vec2(1, 0));
	pointsArray.push(vertices[barVerticeStart+c]);
	normalsArray.push(normal);
	vertexColors.push(vec4( barinitialColor[0], barinitialColor[1], barinitialColor[2], barinitialColor[3] ));
	texCoordsArray.push(vec2(1, 0));
	pointsArray.push(vertices[barVerticeStart+d]);
	normalsArray.push(normal);
	vertexColors.push(vec4( barinitialColor[0], barinitialColor[1], barinitialColor[2], barinitialColor[3] ));
	texCoordsArray.push(vec2(1, 0));
}

function barInit() {
	var centerVertice = vertices.length;
	vertices.push(vec4( 0.0, 0.5, 0.0, 1.0 ));
	barVerticeStart = vertices.length;
    for (var i = 0 ; i< cylinderNum + 1; i++){
        vertices.push(vec4( cylinderWidth * Math.cos(2* i * Math.PI / cylinderNum), cylinderLength, cylinderWidth * Math.sin(2* i * Math.PI / cylinderNum), 1.0 ));
        vertices.push(vec4( cylinderWidth * Math.cos(2* i * Math.PI / cylinderNum), 0, cylinderWidth * Math.sin(2* i * Math.PI / cylinderNum), 1.0 ));
    }
    for (var i = 0 ; i< cylinderNum; i++){
        barQuad( 2*i, 2*i+1, 2*i+3, 2*i+2 );
    }
	for (var i = 0 ; i< cylinderNum - 2; i++){
        barQuad( centerVertice, 2*i, 2*i+2, 2*i+4 );
    }
}

function platform() {
	gl.bindTexture(gl.TEXTURE_2D, textures[platformId][0]);
	
	instanceMatrix = mult(modelViewMatrix, translate(0, -0.5, 0) );
	instanceMatrix = mult(instanceMatrix, scale4(10000, 1, 10000) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<10; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function bar() {
	gl.bindTexture(gl.TEXTURE_2D, textures[barId][0]);

    var m = mult(modelViewMatrix, translate(cylinderDiff, -5.6, 0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(m) );
    for(var i =0; i<2*cylinderNum-2; i++) gl.drawArrays(gl.TRIANGLE_FAN, barPointStart + 4*i, 4);

    var m = mult(modelViewMatrix, translate(-cylinderDiff, -5.6, 0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(m) );
    for(var i =0; i<2*cylinderNum-2; i++) gl.drawArrays(gl.TRIANGLE_FAN, barPointStart + 4*i, 4);

    var m = mult(modelViewMatrix, rotateZ(90));
    m = mult(m, scalem(vec3(0.3, 0.6, 0.1)));
    m = mult(m, translate(40, -10, 0));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(m) );
    for(var i =0; i<2*cylinderNum-2; i++) gl.drawArrays(gl.TRIANGLE_FAN, barPointStart + 4*i, 4);
}


function createNode(transform, render, sibling, child){
    var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
    }
    return node;
}

function configureTexture( image ) {
	console.log(image);
    var texture = gl.createTexture();

    gl.bindTexture( gl.TEXTURE_2D, texture );
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB,
         gl.RGB, gl.UNSIGNED_BYTE, image );
    gl.generateMipmap( gl.TEXTURE_2D );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);

	return texture;
}

function initImages(Id, links) {
	if (textures[Id] === null){
		var newtextures = [
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
		];

		var image1 = new Image();
		image1.onload = function() {
			newtextures[0] = configureTexture( image1 );
		}
		image1.src = links[0];

		var image2 = new Image();
		image2.onload = function() {
			newtextures[1] = configureTexture( image2 );
		}
		image2.src = links[1];

		var image3 = new Image();
		image3.onload = function() {
			newtextures[2] = configureTexture( image3 );
		}
		image3.src = links[2];

		var image4 = new Image();
		image4.onload = function() {
			newtextures[3] = configureTexture( image4 );
		}
		image4.src = links[3];

		var image5 = new Image();
		image5.onload = function() {
			newtextures[4] = configureTexture( image5 );
		}
		image5.src = links[4];

		var image6 = new Image();
		image6.onload = function() {
			newtextures[5] = configureTexture( image6 );
		}
		image6.src = links[5];

		var image7 = new Image();
		image7.onload = function() {
			newtextures[6] = configureTexture( image7 );
		}
		image7.src = links[6];

		var image8 = new Image();
		image8.onload = function() {
			newtextures[7] = configureTexture( image8 );
		}
		image8.src = links[7];

		var image9 = new Image();
		image9.onload = function() {
			newtextures[8] = configureTexture( image9 );
		}
		image9.src = links[8];

		var image10 = new Image();
		image10.onload = function() {
			newtextures[9] = configureTexture( image10 );
		}
		image10.src = links[9];

		textures[Id] = newtextures;
		console.log(newtextures.length);
	}
}


function initNodes(Id) {

    var m = mat4();

    switch(Id) {

	case barId:
	case platformId:

	break;
	
    case torsoUpperId:

    m = translate(position[0], position[1] + 0.5*torsoHeight, position[2]);
    m = mult(m, rotate(theta[torsoUpperId], 1, 0, 0 ));
    m = mult(m, rotate(rho[torsoUpperId], 0, 1, 0 ));
    figure[torsoUpperId] = createNode( m, uptorso, null, headId );
    break;

    case headId:
    case head1Id:
    case head2Id:

    m = translate(0.0, torsoHeight+0.5*headHeight, 0.0);
	m = mult(m, rotate(theta[headId], 1, 0, 0));
	m = mult(m, rotate(rho[headId], 0, 1, 0));
    m = mult(m, translate(0.0, -0.5*headHeight, 0.0));
    figure[headId] = createNode( m, head, leftUpperArmId, null);
    break;


    case leftUpperArmId:

    m = translate(-(torsoWidth+upperArmWidth)/2, torsoHeight, 0.0);
	m = mult(m, rotate(theta[leftUpperArmId], 1, 0, 0));
	m = mult(m, rotate(rho[leftUpperArmId], 0, 1, 0));
    figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
    break;

    case rightUpperArmId:

    m = translate((torsoWidth+upperArmWidth)/2, torsoHeight, 0.0);
	m = mult(m, rotate(theta[rightUpperArmId], 1, 0, 0));
	m = mult(m, rotate(rho[rightUpperArmId], 0, 1, 0));
    figure[rightUpperArmId] = createNode( m, rightUpperArm, torsoLowerId, rightLowerArmId );
    break;
	
	case torsoLowerId:

    m = rotate(theta[torsoLowerId], 1, 0, 0 );
    m = mult(m, rotate(rho[torsoLowerId], 1, 0, 0 ));
    m = mult(m, translate(0, -torsoHeight, 0));
    figure[torsoLowerId] = createNode( m, downtorso, null, leftUpperLegId );
    break;

    case leftUpperLegId:

    m = translate(-(torsoWidth+upperLegWidth)/5, 0.0, 0.0);
	m = mult(m , rotate(theta[leftUpperLegId], 1, 0, 0));
	m = mult(m, rotate(rho[leftUpperLegId], 0, 1, 0));
    figure[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
    break;

    case rightUpperLegId:

    m = translate((torsoWidth+upperLegWidth)/5, 0.0, 0.0);
	m = mult(m, rotate(theta[rightUpperLegId], 1, 0, 0));
	m = mult(m, rotate(rho[rightUpperLegId], 0, 1, 0));
    figure[rightUpperLegId] = createNode( m, rightUpperLeg, null, rightLowerLegId );
    break;

    case leftLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerArmId], 1, 0, 0));
	m = mult(m, rotate(rho[leftLowerArmId], 0, 1, 0));
    figure[leftLowerArmId] = createNode( m, leftLowerArm, null, leftHandId );
    break;

    case rightLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerArmId], 1, 0, 0));
	m = mult(m, rotate(rho[rightLowerArmId], 0, 1, 0));
    figure[rightLowerArmId] = createNode( m, rightLowerArm, null, rightHandId );
    break;

    case leftLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerLegId], 1, 0, 0));
	m = mult(m, rotate(rho[leftLowerLegId], 0, 1, 0));
    figure[leftLowerLegId] = createNode( m, leftLowerLeg, null, leftFootId );
    break;

    case rightLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerLegId], 1, 0, 0));
	m = mult(m, rotate(rho[rightLowerLegId], 0, 1, 0));
    figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, rightFootId );
    break;

    case leftHandId:

    m = translate(0.0,0.7*lowerArmHeight + handHeight, 0.0);
    m = mult(m, rotate(theta[leftHandId], 1, 0, 0));
	m = mult(m, rotate(rho[leftHandId], 0, 1, 0));
    figure[leftHandId] = createNode( m, leftHand, null, null );
    break;

    case rightHandId:

    m = translate(0.0,0.7*lowerArmHeight + handHeight, 0.0);
    m = mult(m, rotate(theta[rightHandId], 1, 0, 0));
	m = mult(m, rotate(rho[rightHandId], 0, 1, 0));
    figure[rightHandId] = createNode( m, rightHand, null, null );
    break;

    case leftFootId:

    m = translate(0.0,0.7*lowerLegHeight + footHeight, 0.0);
    m = mult(m, rotate(theta[leftFootId], 1, 0, 0));
	m = mult(m, rotate(rho[leftFootId], 0, 1, 0));
    figure[leftFootId] = createNode( m, leftFoot, null, null );
    break;

    case rightFootId:

    m = translate(0.0,0.7*lowerLegHeight + footHeight, 0.0);
    m = mult(m, rotate(theta[rightFootId], 1, 0, 0));
	m = mult(m, rotate(rho[rightFootId], 0, 1, 0));
    figure[rightFootId] = createNode( m, rightFoot, null, null );
    break;

    }

}

function traverse(Id) {

	if(Id == null) return;
	stack.push(modelViewMatrix);
	modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
	figure[Id].render();
	if(figure[Id].child != null) traverse(figure[Id].child);
	modelViewMatrix = stack.pop();
	if(figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function uptorso() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( torsoWidth, torsoHeight, torsoThick));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<10; i++) {
		gl.bindTexture(gl.TEXTURE_2D, textures[torsoUpperId][i]);
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
	}
}

function downtorso() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    instanceMatrix = mult(instanceMatrix, scale4( torsoWidth, torsoHeight, torsoThick));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<10; i++) {
		gl.bindTexture(gl.TEXTURE_2D, textures[torsoLowerId][i]);
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
	}
}

function head() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale4(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<10; i++) {
		gl.bindTexture(gl.TEXTURE_2D, textures[headId][i]);
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
	}
}

function leftUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(-upperArmWidth, -upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<10; i++) {
		gl.bindTexture(gl.TEXTURE_2D, textures[leftUpperArmId][i]);
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
	}
}

function leftLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(-lowerArmWidth, -lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<10; i++) {
		gl.bindTexture(gl.TEXTURE_2D, textures[leftLowerArmId][i]);
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
	}
}

function leftHand() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * handHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(-handWidth, -handHeight, handWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<10; i++) {
		gl.bindTexture(gl.TEXTURE_2D, textures[leftHandId][i]);
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
	}
}

function rightUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(-upperArmWidth, -upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<10; i++) {
		gl.bindTexture(gl.TEXTURE_2D, textures[rightUpperArmId][i]);
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
	}
}

function rightLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(-lowerArmWidth, -lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<10; i++) {
		gl.bindTexture(gl.TEXTURE_2D, textures[rightLowerArmId][i]);
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
	}
}

function rightHand() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * handHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(handWidth, -handHeight, handWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<10; i++) {
		gl.bindTexture(gl.TEXTURE_2D, textures[rightHandId][i]);
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
	}
}

function leftUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(-upperLegWidth, -upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<10; i++) {
		gl.bindTexture(gl.TEXTURE_2D, textures[ leftUpperLegId][i]);
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
	}
}

function leftLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(-lowerLegWidth, -lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<10; i++) {
		gl.bindTexture(gl.TEXTURE_2D, textures[leftLowerLegId][i]);
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
	}
}

function leftFoot() {

    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * footHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(-footWidth, -footHeight, footDepth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<10; i++) {
		gl.bindTexture(gl.TEXTURE_2D, textures[leftFootId][i]);
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
	}
}

function rightUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(-upperLegWidth, -upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<10; i++) {
		gl.bindTexture(gl.TEXTURE_2D, textures[rightUpperLegId][i]);
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
	}
}

function rightLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(-lowerLegWidth, -lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<10; i++) {
		gl.bindTexture(gl.TEXTURE_2D, textures[rightLowerLegId][i]);
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
	}
}

function rightFoot() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * footHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale4(-footWidth, -footHeight, footDepth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for(var i =0; i<10; i++) {
		gl.bindTexture(gl.TEXTURE_2D, textures[rightFootId][i]);
		gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
	}
}


function quad(a, b, c, d) {
     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);
     var normal = vec3(normal);
	 
     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
	 vertexColors.push(vec4( initialColor[0], initialColor[1], initialColor[2], initialColor[3] ));
     pointsArray.push(vertices[b]);
     normalsArray.push(normal);
	 vertexColors.push(vec4( initialColor[0], initialColor[1], initialColor[2], initialColor[3] ));
     pointsArray.push(vertices[c]);
     normalsArray.push(normal);
	 vertexColors.push(vec4( initialColor[0], initialColor[1], initialColor[2], initialColor[3] ));
     pointsArray.push(vertices[d]);
	 normalsArray.push(normal);
	 vertexColors.push(vec4( initialColor[0], initialColor[1], initialColor[2], initialColor[3] ));

	 texCoordsArray.push(vec2(0, 1));
	 texCoordsArray.push(vec2(0, 0));
	 texCoordsArray.push(vec2(1, 0));
	 texCoordsArray.push(vec2(1, 1));
}

function triangle(points, a, b, c) {
  points.push(a);
  points.push(b);
  points.push(c);
}

function divideTriangle(points, a, b, c, count) {
  if ( count > 0 ) {
    var ab = mix( a, b, 0.5);
    var ac = mix( a, c, 0.5);
    var bc = mix( b, c, 0.5);

    ab = normalize(ab, true);
    ac = normalize(ac, true);
    bc = normalize(bc, true);

    divideTriangle(points, a, ab, ac, count-1);
    divideTriangle(points, ab, b, bc, count-1);
    divideTriangle(points, bc, c, ac, count-1);
    divideTriangle(points, ab, bc, ac, count-1);
  }
  else {
    triangle(points, a, b, c);
  }
}

function unitSphere() {
  var divisions = 5;
  var sphere = [];

  var va = vec4(0.0, 0.0, -1.0);
  var vb = vec4(0.0, 0.942809, 0.333333);
  var vc = vec4(-0.816497, -0.471405, 0.333333);
  var vd = vec4(0.816497, -0.471405, 0.333333);

  divideTriangle(sphere, va, vb, vc, divisions);
  divideTriangle(sphere, vd, vc, vb, divisions);
  divideTriangle(sphere, va, vd, vb, divisions);
  divideTriangle(sphere, va, vc, vd, divisions);

  return sphere;
}

function cube()
{

  quad( 4, 10, 11, 5);
  quad( 5, 11, 6, 0);  
  quad( 0, 6, 7, 1);  
  quad( 1, 7, 8, 2);  
  quad( 2, 8, 9, 3);  
  quad( 4, 10, 9, 3);  
  quad( 3, 4, 5, 0);  
  quad( 2, 3, 0, 1);  
  quad( 9, 10, 11, 6);  
  quad( 8, 9, 6, 7);  
}

function do_initNodes() {
	for (var i = 0; i < 16; i++) initNodes(i);
	initImages(barId, [
		"textures/bar.jpg",
		"textures/bar.jpg",
		"textures/bar.jpg",
		"textures/bar.jpg",
		"textures/bar.jpg",
		"textures/bar.jpg",
		"textures/bar.jpg",
		"textures/bar.jpg",
		"textures/bar.jpg",
		"textures/bar.jpg",
	]);
	initImages(platformId, [
		"textures/platform.jpg",
		"textures/platform.jpg",
		"textures/platform.jpg",
		"textures/platform.jpg",
		"textures/platform.jpg",
		"textures/platform.jpg",
		"textures/platform.jpg",
		"textures/platform.jpg",
		"textures/platform.jpg",
		"textures/platform.jpg",
	]);
	initImages(torsoUpperId, [
		"textures/torso/front.jpg",
		"textures/torso/logo.jpg",
		"textures/torso/bottom.jpg",
		"textures/torso/top.jpg",
		"textures/torso/back.jpg",
		"textures/torso/side.jpg",
		"textures/torso/side.jpg",
		"textures/torso/side.jpg",
		"textures/torso/side.jpg",
		"textures/torso/side.jpg",
	]);
	initImages(torsoLowerId, [
		"textures/torso/front.jpg",
		"textures/torso/side.jpg",
		"textures/torso/bottom.jpg",
		"textures/torso/top.jpg",
		"textures/torso/back.jpg",
		"textures/torso/side.jpg",
		"textures/torso/side.jpg",
		"textures/torso/side.jpg",
		"textures/torso/side.jpg",
		"textures/torso/side.jpg",
	]);
	initImages(headId, [
		"textures/head/front.jpg",
		"textures/head/side.jpg",
		"textures/head/top.jpg",
		"textures/head/top.jpg",
		"textures/head/back.jpg",
		"textures/head/side.jpg",
		"textures/head/top.jpg",
		"textures/head/top.jpg",
		"textures/head/bottom.jpg",
		"textures/head/bottom.jpg",
	]);
	initImages(leftUpperArmId, [
		"textures/upperarm/side.jpg",
		"textures/upperarm/side.jpg",
		"textures/upperarm/side.jpg",
		"textures/upperarm/side.jpg",
		"textures/upperarm/side.jpg",
		"textures/upperarm/side.jpg",
		"textures/upperarm/top.jpg",
		"textures/upperarm/top.jpg",
		"textures/upperarm/bottom.jpg",
		"textures/upperarm/bottom.jpg",
	]);
	initImages(leftLowerArmId, [
		"textures/lowerarm/side.jpg",
		"textures/lowerarm/side.jpg",
		"textures/lowerarm/side.jpg",
		"textures/lowerarm/side.jpg",
		"textures/lowerarm/side.jpg",
		"textures/lowerarm/side.jpg",
		"textures/lowerarm/side.jpg",
		"textures/lowerarm/side.jpg",
		"textures/lowerarm/side.jpg",
		"textures/lowerarm/side.jpg",
	]);
	initImages(rightUpperArmId, [
		"textures/upperarm/side.jpg",
		"textures/upperarm/side.jpg",
		"textures/upperarm/side.jpg",
		"textures/upperarm/side.jpg",
		"textures/upperarm/side.jpg",
		"textures/upperarm/side.jpg",
		"textures/upperarm/top.jpg",
		"textures/upperarm/top.jpg",
		"textures/upperarm/bottom.jpg",
		"textures/upperarm/bottom.jpg",
	]);
	initImages(rightLowerArmId, [
		"textures/lowerarm/side.jpg",
		"textures/lowerarm/side.jpg",
		"textures/lowerarm/side.jpg",
		"textures/lowerarm/side.jpg",
		"textures/lowerarm/side.jpg",
		"textures/lowerarm/side.jpg",
		"textures/lowerarm/side.jpg",
		"textures/lowerarm/side.jpg",
		"textures/lowerarm/side.jpg",
		"textures/lowerarm/side.jpg",
	]);
	initImages(leftUpperLegId, [
		"textures/upperleg/side.jpg",
		"textures/upperleg/side.jpg",
		"textures/upperleg/side.jpg",
		"textures/upperleg/side.jpg",
		"textures/upperleg/side.jpg",
		"textures/upperleg/side.jpg",
		"textures/upperleg/side.jpg",
		"textures/upperleg/side.jpg",
		"textures/upperleg/side.jpg",
		"textures/upperleg/side.jpg",
	]);
	initImages(leftLowerLegId, [
		"textures/lowerleg/side.jpg",
		"textures/lowerleg/side.jpg",
		"textures/lowerleg/side.jpg",
		"textures/lowerleg/side.jpg",
		"textures/lowerleg/side.jpg",
		"textures/lowerleg/side.jpg",
		"textures/lowerleg/side.jpg",
		"textures/lowerleg/side.jpg",
		"textures/lowerleg/side.jpg",
		"textures/lowerleg/side.jpg",
	]);
	initImages(rightUpperLegId, [
		"textures/upperleg/side.jpg",
		"textures/upperleg/side.jpg",
		"textures/upperleg/side.jpg",
		"textures/upperleg/side.jpg",
		"textures/upperleg/side.jpg",
		"textures/upperleg/side.jpg",
		"textures/upperleg/side.jpg",
		"textures/upperleg/side.jpg",
		"textures/upperleg/side.jpg",
		"textures/upperleg/side.jpg",
	]);
	initImages(rightLowerLegId, [
		"textures/lowerleg/side.jpg",
		"textures/lowerleg/side.jpg",
		"textures/lowerleg/side.jpg",
		"textures/lowerleg/side.jpg",
		"textures/lowerleg/side.jpg",
		"textures/lowerleg/side.jpg",
		"textures/lowerleg/side.jpg",
		"textures/lowerleg/side.jpg",
		"textures/lowerleg/side.jpg",
		"textures/lowerleg/side.jpg",
	]);
	initImages(leftHandId, [
		"textures/hand/front.jpg",
		"textures/hand/side.jpg",
		"textures/hand/bottom.jpg",
		"textures/hand/top.jpg",
		"textures/hand/back.jpg",
		"textures/hand/side.jpg",
		"textures/hand/side.jpg",
		"textures/hand/side.jpg",
		"textures/hand/side.jpg",
		"textures/hand/side.jpg",
	]);
	initImages(rightHandId, [
		"textures/hand/front.jpg",
		"textures/hand/side.jpg",
		"textures/hand/bottom.jpg",
		"textures/hand/top.jpg",
		"textures/hand/back.jpg",
		"textures/hand/side.jpg",
		"textures/hand/side.jpg",
		"textures/hand/side.jpg",
		"textures/hand/side.jpg",
		"textures/hand/side.jpg",
	]);
	initImages(leftFootId, [
		"textures/foot/side.jpg",
		"textures/foot/side.jpg",
		"textures/foot/side.jpg",
		"textures/foot/side.jpg",
		"textures/foot/side.jpg",
		"textures/foot/side.jpg",
		"textures/foot/side.jpg",
		"textures/foot/side.jpg",
		"textures/foot/side.jpg",
		"textures/foot/side.jpg",
	]);
	initImages(rightFootId, [
		"textures/foot/side.jpg",
		"textures/foot/side.jpg",
		"textures/foot/side.jpg",
		"textures/foot/side.jpg",
		"textures/foot/side.jpg",
		"textures/foot/side.jpg",
		"textures/foot/side.jpg",
		"textures/foot/side.jpg",
		"textures/foot/side.jpg",
		"textures/foot/side.jpg",
	]);
}

function rotateVector(vec, angle) {
    angle = -angle * (Math.PI / 180);
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    var x = Math.round(10000 * (vec[0] * cos - vec[1] * sin)) / 10000;
    var y = Math.round(10000 * (vec[0] * sin + vec[1] * cos)) / 10000;
    return vec2(x, y);
};

function humanAnimating(Id) {
	var movemod = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	var moveset = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
	var movechk = [0, 0];
	switch(Id) {
	
    case runId:
		movechk = [270, 100];
		movemod = [0, 0, 0, -4, -4/2.43, 4, 4/2.43, 4/0.92, 4/1.7, -4/0.92, -4/1.7, 0, 0, -4/3.4, 4/3.4];
		moveset = [0, 0, 0, 0, -100, 0, -100, 70, 0, 70, 0, 0, 0, 20, 20];
		if (count == 0) {
			theta = [0, 0, 0, 208, -126.3374, 152, -146.0905, 139.5652, 37.6471, 191.7391, 65.8824, 0, 0, 1.1765, -12.9412];
			runDirection[leftUpperArmId] = movemod[leftUpperArmId];
			runDirection[rightUpperArmId] = movemod[rightUpperArmId];
			runDirection[leftLowerArmId] = movemod[leftLowerArmId];
			runDirection[rightLowerArmId] = movemod[rightLowerArmId];
			runDirection[leftUpperLegId] = movemod[leftUpperLegId];
			runDirection[rightUpperLegId] = movemod[rightUpperLegId];
			runDirection[leftLowerLegId] = movemod[leftLowerLegId];
			runDirection[rightLowerLegId] = movemod[rightLowerLegId];
			runDirection[leftFootId] = movemod[leftFootId];
			runDirection[rightFootId] = movemod[rightFootId];
			count++;
		}
		else if (count <= 80) {
			count++;
		}
		else {
			position[1] = 6;
			movemod = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
			theta = [0, 0, 0, 180, 0, 180, 0, 180, 0, 180, 0, 0, 0, 0, 0];
			count = -1;
			chkmove = stopId;
			initNodes(torsoUpperId);
			initNodes(torsoLowerId);
			initNodes(headId);
			initNodes(leftUpperArmId);
			initNodes(leftLowerArmId);
			initNodes(rightUpperArmId);
			initNodes(rightLowerArmId);
			initNodes(leftUpperLegId);
			initNodes(leftLowerLegId);
			initNodes(rightUpperLegId);
			initNodes(rightLowerLegId);
			initNodes(leftHandId);
			initNodes(rightHandId);
			initNodes(leftFootId);
			initNodes(rightFootId);
			break;
		}
		if (!(theta[leftUpperArmId] <= movechk[0])){
			runDirection[leftUpperArmId] = movemod[leftUpperArmId];
			runDirection[rightUpperArmId] = movemod[rightUpperArmId];
			runDirection[leftLowerArmId] = movemod[leftLowerArmId];
			runDirection[rightLowerArmId] = movemod[rightLowerArmId];
			runDirection[leftUpperLegId] = movemod[leftUpperLegId];
			runDirection[rightUpperLegId] = movemod[rightUpperLegId];
			runDirection[leftLowerLegId] = movemod[leftLowerLegId];
			runDirection[rightLowerLegId] = movemod[rightLowerLegId];
			runDirection[leftFootId] = movemod[leftFootId];
			runDirection[rightFootId] = movemod[rightFootId];
			theta[leftLowerArmId] = moveset[leftLowerArmId];
			theta[leftUpperLegId] = moveset[leftUpperLegId];
			theta[leftLowerLegId] = moveset[leftLowerLegId];
			theta[leftFootId] = moveset[leftFootId];
		}
		else if (!(theta[leftUpperArmId] >= movechk[1])){
			runDirection[leftUpperArmId] = -movemod[leftUpperArmId];
			runDirection[rightUpperArmId] = -movemod[rightUpperArmId];
			runDirection[leftLowerArmId] = -movemod[leftLowerArmId];
			runDirection[rightLowerArmId] = -movemod[rightLowerArmId];
			runDirection[leftUpperLegId] = -movemod[leftUpperLegId];
			runDirection[rightUpperLegId] = -movemod[rightUpperLegId];
			runDirection[leftLowerLegId] = -movemod[leftLowerLegId];
			runDirection[rightLowerLegId] = -movemod[rightLowerLegId];
			runDirection[leftFootId] = -movemod[leftFootId];
			runDirection[rightFootId] = -movemod[rightFootId];
			theta[rightLowerArmId] = moveset[rightLowerArmId];
			theta[rightUpperLegId] = moveset[rightUpperLegId];
			theta[rightLowerLegId] = moveset[rightLowerLegId];
			theta[rightFootId] = moveset[rightFootId];
		}
		theta[leftUpperArmId] += runDirection[leftUpperArmId];
		theta[rightUpperArmId] += runDirection[rightUpperArmId];
		theta[leftLowerArmId] += runDirection[leftLowerArmId];
		theta[rightLowerArmId] += runDirection[rightLowerArmId];
		theta[leftUpperLegId] += runDirection[leftUpperLegId];
		theta[rightUpperLegId] += runDirection[rightUpperLegId];
		theta[leftLowerLegId] += runDirection[leftLowerLegId];
		theta[rightLowerLegId] += runDirection[rightLowerLegId];
		theta[leftFootId] += runDirection[leftFootId];
		theta[rightFootId] += runDirection[rightFootId];
		initNodes(torsoUpperId);
		initNodes(torsoLowerId);
		initNodes(headId);
		initNodes(leftUpperArmId);
		initNodes(leftLowerArmId);
		initNodes(rightUpperArmId);
		initNodes(rightLowerArmId);
		initNodes(leftUpperLegId);
		initNodes(leftLowerLegId);
		initNodes(rightUpperLegId);
		initNodes(rightLowerLegId);
		initNodes(leftHandId);
		initNodes(rightHandId);
		initNodes(leftFootId);
		initNodes(rightFootId);
		break;
	case walkId:
		movechk = [190, 170];//(190-170)/0.5
		movemod = [0, 0, 0, -0.5, 0.5/3, 0.5, -0.5/3, -0.5, 0.5/2, 0.5, -0.5/2, 0, 0, 0, 0];
		moveset = [0, 0, 0, 0, -20, 0, -20, -170, 0, -170, 0, 0, 0, 0, 0];
		if (count == 0) {
			theta = [0, 0, 0, 180, -20, 180, -20, 180, 0, 180, 0, 0, 0, 0, 0];
			runDirection[leftUpperArmId] = movemod[leftUpperArmId];
			runDirection[rightUpperArmId] = movemod[rightUpperArmId];
			runDirection[leftLowerArmId] = movemod[leftLowerArmId];
			runDirection[rightLowerArmId] = movemod[rightLowerArmId];
			runDirection[leftUpperLegId] = movemod[leftUpperLegId];
			runDirection[rightUpperLegId] = movemod[rightUpperLegId];
			runDirection[leftLowerLegId] = movemod[leftLowerLegId];
			runDirection[rightLowerLegId] = movemod[rightLowerLegId];
			runDirection[leftFootId] = movemod[leftFootId];
			runDirection[rightFootId] = movemod[rightFootId];
			count++;
		}
		else if (count <= 80) {
			count++;
		}
		else {
			position[1] = 6;
			theta = [0, 0, 0, 180, 0, 180, 0, 180, 0, 180, 0, 0, 0, 0, 0];
			count = -1;
			chkmove = stopId;
		}
		if ((theta[leftUpperArmId] >= movechk[0])){
			runDirection[leftUpperArmId] = movemod[leftUpperArmId];
			runDirection[rightUpperArmId] = movemod[rightUpperArmId];
			runDirection[leftLowerArmId] = movemod[leftLowerArmId];
			runDirection[rightLowerArmId] = movemod[rightLowerArmId];
			runDirection[leftUpperLegId] = movemod[leftUpperLegId];
			runDirection[rightUpperLegId] = movemod[rightUpperLegId];
			runDirection[leftLowerLegId] = movemod[leftLowerLegId];
			runDirection[rightLowerLegId] = movemod[rightLowerLegId];
			runDirection[leftFootId] = movemod[leftFootId];
			runDirection[rightFootId] = movemod[rightFootId];
			theta[leftLowerArmId] = moveset[leftLowerArmId];
			theta[leftUpperLegId] = moveset[leftUpperLegId];
			theta[leftLowerLegId] = moveset[leftLowerLegId];
			theta[leftFootId] = moveset[leftFootId];
		}
		else if ((theta[leftUpperArmId] <= movechk[1])){
			runDirection[leftUpperArmId] = -movemod[leftUpperArmId];
			runDirection[rightUpperArmId] = -movemod[rightUpperArmId];
			runDirection[leftLowerArmId] = -movemod[leftLowerArmId];
			runDirection[rightLowerArmId] = -movemod[rightLowerArmId];
			runDirection[leftUpperLegId] = -movemod[leftUpperLegId];
			runDirection[rightUpperLegId] = -movemod[rightUpperLegId];
			runDirection[leftLowerLegId] = -movemod[leftLowerLegId];
			runDirection[rightLowerLegId] = -movemod[rightLowerLegId];
			runDirection[leftFootId] = -movemod[leftFootId];
			runDirection[rightFootId] = -movemod[rightFootId];
			theta[rightLowerArmId] = moveset[rightLowerArmId];
			theta[rightUpperLegId] = moveset[rightUpperLegId];
			theta[rightLowerLegId] = moveset[rightLowerLegId];
			theta[rightFootId] = moveset[rightFootId];
		}
		theta[leftUpperArmId] += runDirection[leftUpperArmId];
		theta[rightUpperArmId] += runDirection[rightUpperArmId];
		theta[leftLowerArmId] += runDirection[leftLowerArmId];
		theta[rightLowerArmId] += runDirection[rightLowerArmId];
		theta[leftUpperLegId] += runDirection[leftUpperLegId];
		theta[rightUpperLegId] += runDirection[rightUpperLegId];
		theta[leftLowerLegId] += runDirection[leftLowerLegId];
		theta[rightLowerLegId] += runDirection[rightLowerLegId];
		theta[leftFootId] += runDirection[leftFootId];
		theta[rightFootId] += runDirection[rightFootId];
		initNodes(torsoUpperId);
		initNodes(torsoLowerId);
		initNodes(headId);
		initNodes(leftUpperArmId);
		initNodes(leftLowerArmId);
		initNodes(rightUpperArmId);
		initNodes(rightLowerArmId);
		initNodes(leftUpperLegId);
		initNodes(leftLowerLegId);
		initNodes(rightUpperLegId);
		initNodes(rightLowerLegId);
		initNodes(leftHandId);
		initNodes(rightHandId);
		initNodes(leftFootId);
		initNodes(rightFootId);
		break;
	case jumpId:
		if ( count < 20 ) {
			movemod = [0, 5, -2, 7, -11, 7, -11, -15.5, 10.5, -15.5, 10.5, 0, 0, -1.5, -1.5];
			position[1] -= Math.sin(count*((Math.PI)/180));
			count++;
		}
		else if (count < 40) {
			movemod = [0, -5, 2, -25, 11, -25, 11, 15.5, -10.5, 15.5, -10.5, 0, 0, 1.5, 1.5];
			position[1] += 2.5*Math.sin((count-19)*((Math.PI)/180));
			count++;
		}
		else if (count < 60) {
			movemod = [0, 5, -2, 25, -11, 25, -11, -15.5, 10.5, -15.5, 10.5, 0, 0, -1.5, -1.5];
			position[1] -= 2.5*Math.sin((count-39)*((Math.PI)/180));
			count++;
		}
		else if ( count < 80 ) {
			movemod = [0, -5, 2, -7, 11, -7, 11, 15.5, -10.5, 15.5, -10.5, 0, 0, 1.5, 1.5];
			position[1] += Math.sin((count-59)*((Math.PI)/180));
			if (count == 79) {
				position[1] = 6;
			}
			count++;
		}
		else {
			position[1] = 6;
			movemod = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
			theta = [0, 0, 0, 180, 0, 180, 0, 180, 0, 180, 0, 0, 0, 0, 0];
			count = -1;
			chkmove = stopId;
		}
		runDirection[headId] = movemod[headId];
		runDirection[torsoLowerId] = movemod[torsoLowerId];
		runDirection[torsoUpperId] = movemod[torsoUpperId];
		runDirection[leftUpperArmId] = movemod[leftUpperArmId];
		runDirection[rightUpperArmId] = movemod[rightUpperArmId];
		runDirection[leftLowerArmId] = movemod[leftLowerArmId];
		runDirection[rightLowerArmId] = movemod[rightLowerArmId];
		runDirection[leftUpperLegId] = movemod[leftUpperLegId];
		runDirection[rightUpperLegId] = movemod[rightUpperLegId];
		runDirection[leftLowerLegId] = movemod[leftLowerLegId];
		runDirection[rightLowerLegId] = movemod[rightLowerLegId];
		runDirection[leftFootId] = movemod[leftFootId];
		runDirection[rightFootId] = movemod[rightFootId];
		theta[headId] += runDirection[headId]/2;
		theta[torsoLowerId] += runDirection[torsoLowerId]/2;
		theta[torsoUpperId] += runDirection[torsoUpperId]/2;
		theta[leftUpperArmId] += runDirection[leftUpperArmId]/2;
		theta[rightUpperArmId] += runDirection[rightUpperArmId]/2;
		theta[leftLowerArmId] += runDirection[leftLowerArmId]/2;
		theta[rightLowerArmId] += runDirection[rightLowerArmId]/2;
		theta[leftUpperLegId] += runDirection[leftUpperLegId]/2;
		theta[rightUpperLegId] += runDirection[rightUpperLegId]/2;
		theta[leftLowerLegId] += runDirection[leftLowerLegId]/2;
		theta[rightLowerLegId] += runDirection[rightLowerLegId]/2;
		theta[leftFootId] += runDirection[leftFootId]/2;
		theta[rightFootId] += runDirection[rightFootId]/2;
		initNodes(torsoUpperId);
		initNodes(torsoLowerId);
		initNodes(headId);
		initNodes(leftUpperArmId);
		initNodes(leftLowerArmId);
		initNodes(rightUpperArmId);
		initNodes(rightLowerArmId);
		initNodes(leftUpperLegId);
		initNodes(leftLowerLegId);
		initNodes(rightUpperLegId);
		initNodes(rightLowerLegId);
		initNodes(leftHandId);
		initNodes(rightHandId);
		initNodes(leftFootId);
		initNodes(rightFootId);
		break;
    case barwork1Id:
		if ((count == 0)&&(barhold == 0)) {
			position[0] = 0;
			position[2] = -1.1;
			theta[torsoUpperId] = 0;
			rho[torsoUpperId] = 0;
			theta = [0, 0, 0, 180, 0, 180, 0, 180, 0, 180, 0, 0, 0, 0, 0];
			count++;
		}
		else if ((count <= 20)&&(barhold == 0)) {
			movemod = [0, 0, 0, -6, -4, -6, -4, 0, 0, 0, 0, 2, 2, 0, 0];
			count++;
		}
		else if ((count <= 40)&&(barhold == 0)) {
			movemod = [0, 0, 0, -1, -0.5, -1, -0.5, -7, 4.5, -7, 4.5, 2, 2, 0, 0];
			position[2] += 0.055;
			count++;
		}
		else if ((count > 40)&&(barhold == 0)) {
			movemod = [0, 0, 0, -1, -0.5, -1, -0.5, -7, 4.5, -7, 4.5, 2, 2, 0, 0];
			count = -1;
			barhold = 1;
		}
		else if ((count == 0)&&(barhold == 1)) {
			position[0] = 0;
			position[2] = 0;
			theta = [0, 0, 0, 40, -90, 40, -90, 40, 95, 40, 95, 80, 80, 0, 0];
			count++;
		}
		else if ((count <= 20)&&(barhold == 1)) {
			movemod = [0, 0, 0, 7.5, -3, 7.5, -3, 0, 0, 0, 0, 0.5, 0.5, 0, 0];
			position[1] += 0.19;
			position[2] = -(1.95*(Math.sin((count)/(26/Math.PI))))+0.1;
			count++;
		}
		else if ((count <= 40)&&(barhold == 1)) {
			movemod = [0, 0, 0, -7.5, 3, -7.5, 3, 0, 0, 0, 0, -0.5, -0.5, 0, 0];
			position[1] -= 0.19;
			position[2] = -(1.95*(Math.sin((count)/(26/Math.PI)-((14*Math.PI)/26))))-0.1;
			count++; 
		}
		else {
			position[1] = 6;
			position[2] = 0;
			theta = [0, 0, 0, 40, -90, 40, -90, 40, 95, 40, 95, 80, 80, 0, 0];
			count = -1;
			chkmove = stopId;
		}
		runDirection[leftUpperArmId] = movemod[leftUpperArmId];
		runDirection[rightUpperArmId] = movemod[rightUpperArmId];
		runDirection[leftLowerArmId] = movemod[leftLowerArmId];
		runDirection[rightLowerArmId] = movemod[rightLowerArmId]
		runDirection[leftHandId] = movemod[leftHandId];
		runDirection[rightHandId] = movemod[rightHandId];;
		runDirection[leftUpperLegId] = movemod[leftUpperLegId];
		runDirection[rightUpperLegId] = movemod[rightUpperLegId];
		runDirection[leftLowerLegId] = movemod[leftLowerLegId];
		runDirection[rightLowerLegId] = movemod[rightLowerLegId];
		theta[leftUpperArmId] += runDirection[leftUpperArmId];
		theta[rightUpperArmId] += runDirection[rightUpperArmId];
		theta[leftLowerArmId] += runDirection[leftLowerArmId];
		theta[rightLowerArmId] += runDirection[rightLowerArmId];
		theta[leftHandId] += runDirection[leftHandId];
		theta[rightHandId] += runDirection[rightHandId];
		theta[leftUpperLegId] += runDirection[leftUpperLegId];
		theta[rightUpperLegId] += runDirection[rightUpperLegId];
		theta[leftLowerLegId] += runDirection[leftLowerLegId];
		theta[rightLowerLegId] += runDirection[rightLowerLegId];
		initNodes(torsoUpperId);
		initNodes(leftUpperArmId);
		initNodes(rightUpperArmId);
		initNodes(leftLowerArmId);
		initNodes(rightLowerArmId);
		initNodes(leftHandId);
		initNodes(rightHandId);
		initNodes(leftUpperLegId);
		initNodes(rightUpperLegId);
		initNodes(leftLowerLegId);
		initNodes(rightLowerLegId);
		break;
    case barwork2Id:
		if ((count == 0)&&(barhold == 1)) {
			position[0] = 0;
			position[2] = 0;
			theta = [0, 0, 0, 40, -90, 40, -90, 40, 95, 40, 95, 80, 80, 0, 0];
			count++;
		}
		else if ((count <= 20)&&(barhold == 1)) {
			movemod = [0, 0, 0, 1, 0.5, 1, 0.5, 7, -4.5, 7, -4.5, -2, -2, 0, 0];
			position[2] -= 0.055;
			count++;
		}
		else if ((count <= 40)&&(barhold == 1)) {
			movemod = [0, 0, 0, 6, 4, 6, 4, 0, 0, 0, 0, -2, -2, 0, 0];
			count++;
		}
		else if ((count > 40)&&(barhold == 0)) {
			movemod = [0, 0, 0, -1, -0.5, -1, -0.5, -7, 4.5, -7, 4.5, 2, 2, 0, 0];
			count = -1;
			barhold = 0;
		}
		
		else {
			position[1] = 6;
			position[2] = -1.1;
			theta = [0, 0, 0, 180, 0, 180, 0, 180, 0, 180, 0, 0, 0, 0, 0];
			count = -1;
			chkmove = stopId;
			barhold = 0;
		}
		runDirection[leftUpperArmId] = movemod[leftUpperArmId];
		runDirection[rightUpperArmId] = movemod[rightUpperArmId];
		runDirection[leftLowerArmId] = movemod[leftLowerArmId];
		runDirection[rightLowerArmId] = movemod[rightLowerArmId]
		runDirection[leftHandId] = movemod[leftHandId];
		runDirection[rightHandId] = movemod[rightHandId];;
		runDirection[leftUpperLegId] = movemod[leftUpperLegId];
		runDirection[rightUpperLegId] = movemod[rightUpperLegId];
		runDirection[leftLowerLegId] = movemod[leftLowerLegId];
		runDirection[rightLowerLegId] = movemod[rightLowerLegId];
		theta[leftUpperArmId] += runDirection[leftUpperArmId];
		theta[rightUpperArmId] += runDirection[rightUpperArmId];
		theta[leftLowerArmId] += runDirection[leftLowerArmId];
		theta[rightLowerArmId] += runDirection[rightLowerArmId];
		theta[leftHandId] += runDirection[leftHandId];
		theta[rightHandId] += runDirection[rightHandId];
		theta[leftUpperLegId] += runDirection[leftUpperLegId];
		theta[rightUpperLegId] += runDirection[rightUpperLegId];
		theta[leftLowerLegId] += runDirection[leftLowerLegId];
		theta[rightLowerLegId] += runDirection[rightLowerLegId];
		initNodes(torsoUpperId);
		initNodes(leftUpperArmId);
		initNodes(rightUpperArmId);
		initNodes(leftLowerArmId);
		initNodes(rightLowerArmId);
		initNodes(leftHandId);
		initNodes(rightHandId);
		initNodes(leftUpperLegId);
		initNodes(rightUpperLegId);
		initNodes(leftLowerLegId);
		initNodes(rightLowerLegId);
		break;
	}
}

function walkingfunc(turn, sign) {
	var rotatedVector = rotateVector(vec2(0, 0.05), turn);
	position[0] += rotatedVector[0]*sign;
	position[2] += rotatedVector[1]*sign;
	humanAnimating(walkId);
}

function runfunc(turn, sign) {
	var rotatedVector = rotateVector(vec2(0, 0.5), turn);
	position[0] += rotatedVector[0]*sign;
	position[2] += rotatedVector[1]*sign;
	humanAnimating(runId);
}

function drawBox(gl, n, viewProjMatrix, u_VpMatrix, u_NormalMatrix, u_BoneMatrix0, u_BoneMatrix1, g_BoneMatrix0, g_BoneMatrix1, weights, texture) {
    if (!initArrayBuffer(gl, 'a_Weight', weights, gl.FLOAT, 2)) return -1;

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
	
    g_VpMatrix.set(viewProjMatrix);
    gl.uniformMatrix4fv(u_VpMatrix, false, g_VpMatrix.elements);
	
    gl.uniformMatrix4fv(u_BoneMatrix0, false, g_BoneMatrix0.elements);	
    gl.uniformMatrix4fv(u_BoneMatrix1, false, g_BoneMatrix1.elements);	
	
    g_normalMatrix.setInverseOf(g_BoneMatrix0);
    g_normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, g_normalMatrix.elements);
	
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

	gl.enable(gl.DEPTH_TEST);
	
    program = initShaders( gl, "vertex-shader", "fragment-shader");

    gl.useProgram( program );

    instanceMatrix = mat4();

    modelViewMatrix = mat4();

	aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

    projectionMatrix = perspective(fieldOfViewRadians, aspect, zNear, zFar);
	
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

    cube();
	barPointStart = pointsArray.length;
    barInit();
	
    cameraMatrix = lookAt(eye, at, up);
    
	cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW );

	nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );
	
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
	
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	vBufferSphere = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBufferSphere);
	sphere = unitSphere();
	numPointsSphere = sphere.length;
	gl.bufferData(gl.ARRAY_BUFFER, flatten(sphere), gl.STATIC_DRAW);
	
	cameraMatrixLoc = gl.getUniformLocation( program, "cameraMatrix" );
	modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
	
	gl.uniform1i(gl.getUniformLocation(program, "LE1"), LEtable[0]);
	gl.uniform1i(gl.getUniformLocation(program, "LE2"), LEtable[1]);
	
	var Lcontrol = document.getElementById("light-list");
	var LEcontrol = document.getElementById("light-enabled");
	var FEcontrol = document.getElementById("1st_enabled");
	var XEcontrol = document.getElementById("fix_enabled");
	
	Lcontrol.onchange = function(event) {
		LT = Lcontrol[Lcontrol.selectedIndex].value;
		LEcontrol.checked = LEtable[LT];
		LXslide.value = LPVal[LT][0];
		LYslide.value = LPVal[LT][1];
		LZslide.value = LPVal[LT][2];
		ARslide.value = LAVal[LT][0]*100;
		AGslide.value = LAVal[LT][1]*100;
		ABslide.value = LAVal[LT][2]*100;
		DRslide.value = LDVal[LT][0]*100;
		DGslide.value = LDVal[LT][1]*100;
		DBslide.value = LDVal[LT][2]*100;
		SRslide.value = LSVal[LT][0]*100;
		SGslide.value = LSVal[LT][1]*100;
		SBslide.value = LSVal[LT][2]*100;
	};
	
	LEcontrol.onclick = function(event) {
		LEtable[LT] = event.target.checked;
		gl.uniform1i(gl.getUniformLocation(program, "LE1"), LEtable[0]);
		gl.uniform1i(gl.getUniformLocation(program, "LE2"), LEtable[1]);
	};
	FEcontrol.onclick = function(event) {
		firstview = event.target.checked;
	};
	XEcontrol.onclick = function(event) {
		fixview = event.target.checked;
	};
	
	document.getElementById( "CReButton" ).onclick = function () {
		ButtonView = true;
		eyeVal = [0.0, 0.0, 1.0];
		MWscale = 2;
		eyetheta = 0.0;
		eyephi = 90.0;
		CPXslide.value = 0;
		CPYslide.value = 0;
		CPZslide.value = 100;
		CPTHslide.value = 0;
		CPPHslide.value = 9000;
		CPZoomslide.value = 200;
    };
	document.getElementById( "LReButton" ).onclick = function () {
		LEtable = [true, false];
		LXslide.value = 100;
		LYslide.value = 100;
		LZslide.value = 100;
		ARslide.value = 20;
		AGslide.value = 20;
		ABslide.value = 20;
		DRslide.value = 0;
		DGslide.value = 100;
		DBslide.value = 80;
		SRslide.value = 100;
		SGslide.value = 80;
		SBslide.value = 0;
		LPVal = [[100, 100, 100],[100, 100, 100]];
		LAVal = [[0.2, 0.2, 0.2],[0.2, 0.2, 0.2]];
		LDVal = [[0.0, 1.0, 0.8],[0.0, 1.0, 0.8]];
		LSVal = [[1.0, 0.8, 0.0],[1.0, 0.8, 0.0]];
		materialShininess = 20;
    };
	document.getElementById( "ReButton" ).onclick = function () {
		ButtonView = true;
		LEtable = [true, false];
		eyeVal = [0.0, 0.0, 1.0];
		MWscale = 50;
		eyetheta = 76.0;
		eyephi = 87.0;
		CPXslide.value = 0;
		CPYslide.value = 0;
		CPZslide.value = 100;
		CPTHslide.value = 0;
		CPPHslide.value = 9000;
		CPZoomslide.value = 200;
		LXslide.value = 100;
		LYslide.value = 100;
		LZslide.value = 100;
		ARslide.value = 20;
		AGslide.value = 20;
		ABslide.value = 20;
		DRslide.value = 0;
		DGslide.value = 100;
		DBslide.value = 80;
		SRslide.value = 100;
		SGslide.value = 80;
		SBslide.value = 0;
		gl.uniform1i(gl.getUniformLocation(program, "LE1"), LEtable[0]);
		gl.uniform1i(gl.getUniformLocation(program, "LE2"), LEtable[1]);
		LPVal = [[100, 100, 100],[100, 100, 100]];
		LAVal = [[0.2, 0.2, 0.2],[0.2, 0.2, 0.2]];
		LDVal = [[0.8, 0.8, 0.8],[0.0, 1.0, 0.8]];
		LSVal = [[0.5, 0.5, 0.5],[1.0, 0.8, 0.0]];
		materialShininess = 20;
    };
	document.getElementById( "CPTHButton" ).onclick = function () {
		ButtonView = false;
		CPUF();
    };
	document.getElementById( "CPPHButton" ).onclick = function () {
		ButtonView = false;
		CPUF();
    };
	
	var cpxlog = document.querySelector("#CPXDATA");
	var cpylog = document.querySelector("#CPYDATA");
	var cpzlog = document.querySelector("#CPZDATA");
	var cpthlog = document.querySelector("#CPTHDATA");
	var cpphlog = document.querySelector("#CPPHDATA");
	var CPZoomlog = document.querySelector("#CPZOOMDATA");
	
	var SHIlog = document.querySelector("#SHIDATA");
	var LXlog = document.querySelector("#LXDATA");
	var LYlog = document.querySelector("#LYDATA");
	var LZlog = document.querySelector("#LZDATA");
	var ARlog = document.querySelector("#ARDATA");
	var AGlog = document.querySelector("#AGDATA");
	var ABlog = document.querySelector("#ABDATA");
	var DRlog = document.querySelector("#DRDATA");
	var DGlog = document.querySelector("#DGDATA");
	var DBlog = document.querySelector("#DBDATA");
	var SRlog = document.querySelector("#SRDATA");
	var SGlog = document.querySelector("#SGDATA");
	var SBlog = document.querySelector("#SBDATA");
	
	canvas.addEventListener("wheel", MWCPZoom);
	document.addEventListener("keydown", keyPressEvent, false);
	
	var CPXslide = document.querySelector("#CPXslider");
	CPXslide.addEventListener('input', CPXHC);
	var CPYslide = document.querySelector("#CPYslider");
	CPYslide.addEventListener('input', CPYHC);
	var CPZslide = document.querySelector("#CPZslider");
	CPZslide.addEventListener('input', CPZHC);
	var CPTHslide = document.querySelector("#CPTHslider");
	CPTHslide.addEventListener('input', CPTHHC);
	var CPPHslide = document.querySelector("#CPPHslider");
	CPPHslide.addEventListener('input', CPPHHC);
	var CPZoomslide = document.querySelector("#CPZoomslider");
	CPZoomslide.addEventListener('input', CPZoomHC);
	var SHIslide = document.querySelector("#SHIslider");
	SHIslide.addEventListener('input', SHIHC);
	var LXslide = document.querySelector("#LXslider");
	LXslide.addEventListener('input', LXHC);
	var LYslide = document.querySelector("#LYslider");
	LYslide.addEventListener('input', LYHC);
	var LZslide = document.querySelector("#LZslider");
	LZslide.addEventListener('input', LZHC);
	var ARslide = document.querySelector("#ARslider");
	ARslide.addEventListener('input', ARHC);
	var AGslide = document.querySelector("#AGslider");
	AGslide.addEventListener('input', AGHC);
	var ABslide = document.querySelector("#ABslider");
	ABslide.addEventListener('input', ABHC);
	var DRslide = document.querySelector("#DRslider");
	DRslide.addEventListener('input', DRHC);
	var DGslide = document.querySelector("#DGslider");
	DGslide.addEventListener('input', DGHC);
	var DBslide = document.querySelector("#DBslider");
	DBslide.addEventListener('input', DBHC);
	var SRslide = document.querySelector("#SRslider");
	SRslide.addEventListener('input', SRHC);
	var SGslide = document.querySelector("#SGslider");
	SGslide.addEventListener('input', SGHC);
	var SBslide = document.querySelector("#SBslider");
	SBslide.addEventListener('input', SBHC);
	
	SliderUpdate = function() {
		CPXslide.value = eyeVal[0]*100;
		CPYslide.value = eyeVal[1]*100;
		CPZslide.value = eyeVal[2]*100;
		CPTHslide.value = eyetheta*100;
		CPPHslide.value = eyephi*100;
		CPZoomslide.value = MWscale*100;
	};
	DataUpdate = function() {
		cpxlog.textContent = `${eyeVal[0].toFixed(2)}`;
		cpylog.textContent = `${eyeVal[1].toFixed(2)}`;
		cpzlog.textContent = `${eyeVal[2].toFixed(2)}`;
		cpthlog.textContent = `${parseFloat(eyetheta).toFixed(2)}`;
		cpphlog.textContent = `${parseFloat(eyephi).toFixed(2)}`;
		CPZoomlog.textContent = `${MWscale.toFixed(2)}`;
		SHIlog.textContent = `${parseFloat(materialShininess).toFixed(0)}`;
		LXlog.textContent = `${parseFloat(LPVal[LT][0]).toFixed(2)}`;
		LYlog.textContent = `${parseFloat(LPVal[LT][1]).toFixed(2)}`;
		LZlog.textContent = `${parseFloat(LPVal[LT][2]).toFixed(2)}`;
		ARlog.textContent = `${parseFloat(LAVal[LT][0]).toFixed(2)}`;
		AGlog.textContent = `${parseFloat(LAVal[LT][1]).toFixed(2)}`;
		ABlog.textContent = `${parseFloat(LAVal[LT][2]).toFixed(2)}`;
		DRlog.textContent = `${parseFloat(LDVal[LT][0]).toFixed(2)}`;
		DGlog.textContent = `${parseFloat(LDVal[LT][1]).toFixed(2)}`;
		DBlog.textContent = `${parseFloat(LDVal[LT][2]).toFixed(2)}`;
		SRlog.textContent = `${parseFloat(LSVal[LT][0]).toFixed(2)}`;
		SGlog.textContent = `${parseFloat(LSVal[LT][1]).toFixed(2)}`;
		SBlog.textContent = `${parseFloat(LSVal[LT][2]).toFixed(2)}`;
		
	};
	function CPXHC(event) {
		ButtonView = true;
		eyeVal[0] = event.target.value/100;
		if (eyeVal[0]+eyeVal[1]+eyeVal[2] == 0 && eyeVal[0] == 0 && eyeVal[1] == 0 ){
			eyeVal[0] = 0.01;
		}
		CPUF();
    }
	function CPYHC(event) {
		ButtonView = true;
		eyeVal[1] = event.target.value/100;
		if (eyeVal[0]+eyeVal[1]+eyeVal[2] == 0 && eyeVal[1] == 0 && eyeVal[2] == 0 ){
			eyeVal[1] = 0.01;
		}
		CPUF();
    }
	function CPZHC(event) {
		ButtonView = true;
		eyeVal[2] = event.target.value/100;
		if (eyeVal[0]+eyeVal[1]+eyeVal[2] == 0 && eyeVal[2] == 0 && eyeVal[0] == 0 ){
			eyeVal[2] = 0.01;
		}
		CPUF();
    }
	function CPTHHC(event) {
		ButtonView = false;
		eyetheta = event.target.value/100;
		CPUF();
    }
	function CPPHHC(event) {
		ButtonView = false;
		eyephi = event.target.value/100;
		CPUF();
    }
	function CPZoomHC(event) {
		MWscale = event.target.value;
		CPUF();
    }
	function SHIHC(event) {
		materialShininess = event.target.value;
    }
	function LXHC(event) {
		LPVal[LT][0] = event.target.value;
    }
	function LYHC(event) {
		LPVal[LT][1] = event.target.value;
    }
	function LZHC(event) {
		LPVal[LT][2] = event.target.value;
    }
	function ARHC(event) {
		LAVal[LT][0] = event.target.value/100;
    }
	function AGHC(event) {
		LAVal[LT][1] = event.target.value/100;
    }
	function ABHC(event) {
		LAVal[LT][2] = event.target.value/100;
    }
	function DRHC(event) {
		LDVal[LT][0] = event.target.value/100;
    }
	function DGHC(event) {
		LDVal[LT][1] = event.target.value/100;
    }
	function DBHC(event) {
		LDVal[LT][2] = event.target.value/100;
    }
	function SRHC(event) {
		LSVal[LT][0] = event.target.value/100;
    }
	function SGHC(event) {
		LSVal[LT][1] = event.target.value/100;
    }
	function SBHC(event) {
		LSVal[LT][2] = event.target.value/100;
    }
	function mouseMoveHandler(e){
		x = e.clientX - canvas.offsetLeft - 512;
		y = e.clientY - canvas.offsetTop - 512;
	} 
	function keyPressEvent(e) {
		if (count == -1){
		if (!event.ctrlKey) {
			if (e.keyCode == 37) {//left
				chkmove = walkId;
				chkdirection = leftId;
				if (barhold == 0){
					count = 0;
				}
			}
			if (e.keyCode == 38) {//up
				chkmove = walkId;
				chkdirection = upId;
				if (barhold == 0){
					count = 0;
				}
			}	
			if (e.keyCode == 39) {//right
				chkmove = walkId;
				chkdirection = rightId;
				if (barhold == 0){
					count = 0;
				}
			}
			if (e.keyCode == 40) {//down
				chkmove = walkId;
				chkdirection = downId;
				if (barhold == 0){
					count = 0;
				}
			}
		}
		if (e.keyCode == 37 && event.ctrlKey) {//left
			chkmove = runId;
			chkdirection = leftId;
			if (barhold == 0){
				count = 0;
			}
		}
		if (e.keyCode == 38 && event.ctrlKey) {//up
			chkmove = runId;
			chkdirection = upId;
			if (barhold == 0){
				count = 0;
			}
		}	
		if (e.keyCode == 39 && event.ctrlKey) {//right
			chkmove = runId;
			chkdirection = rightId;
			if (barhold == 0){
				count = 0;
			}
		}
		if (e.keyCode == 40 && event.ctrlKey) {//down
			chkmove = runId;
			chkdirection = downId;
			if (barhold == 0){
				count = 0;
			}
		}
		if (e.keyCode == 32) {//spacebar
			chkmove = jumpId;
			if (barhold == 0){
				count = 0;
			}
		}
		if (e.keyCode == 66) {//B-barwork
			chkmove = barwork1Id;
			if (barhold == 0){
				count = 0;
			}
		}
		if (e.keyCode == 82) {//R-barwork done
			chkmove = barwork2Id;
			if (barhold == 1){
				count = 0;
			}
		}
		}
	}
	function MWCPZoom(event){
		event.preventDefault();
		MWscale += event.deltaY * -0.01;
		if (MWscale == 0) {
			MWscale = 0.01;
		}
		CPUF();
	}
	
	do_initNodes();

    render();
}

function render() {
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	
	for(var i = 0; i < 2; ++i) {
		if(LEtable[i]) {
			matT = translate(LPVal[i][0], LPVal[i][1], LPVal[i][2]);
			matS = scalem(0.25, 0.25, 0.25);
			lightmatTransform = mult(matT, matS);
			gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(lightmatTransform));
			//gl.uniform4fv(vColor, flatten(vec4( 1.0, 1.0, 0.0, 1.0 )));
			gl.bindBuffer(gl.ARRAY_BUFFER, vBufferSphere);
			gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.TRIANGLES, 0, numPointsSphere);
		}
	}
	cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW );

	nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );
	
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
	
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	// Texture
	var tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );

    var vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

	var chkx = normalize(cross(subtract(at, eye), up));
	var chkz = normalize(cross(chkx, subtract(at, eye)));
	
	if (!ButtonView){
		eye = CamPosUp();
	}
	else {
		eye = vec3(MWscale * eyeVal[0], MWscale * eyeVal[1], MWscale * eyeVal[2]);
	}
	
	
	if (firstview) {
		var firstat = vec3(position[0], position[1]+4, position[2]);
		var viewpoint = rotateVector(vec2(0, 2), rho[torsoUpperId]);
		firstat[0] += viewpoint[0];
		firstat[2] += viewpoint[1];
		cameraMatrix = lookAt([position[0], position[1]+4, position[2]], firstat , up);
	}
	else if (fixview) {
		cameraMatrix = lookAt(eye, position, up);
	}
	else {
		cameraMatrix = lookAt(eye, at, up);
	}
	
	gl.uniform4fv(gl.getUniformLocation(program, "cameraPosition"), flatten(vec4(eye)));
	
	lightPosition = vec4( LPVal[0][0], LPVal[0][1], LPVal[0][2], 1.0 );
	lightAmbient = vec4( LAVal[0][0], LAVal[0][1], LAVal[0][2], 1.0 );
	lightDiffuse = vec4( LDVal[0][0], LDVal[0][1], LDVal[0][2], 1.0 );
	lightSpecular = vec4( LSVal[0][0], LSVal[0][1], LSVal[0][2], 1.0 );
	
	var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
	
	gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );
	gl.uniform1f(gl.getUniformLocation(program, "shininess"),materialShininess);
	
	lightPosition2 = vec4( LPVal[1][0], LPVal[1][1], LPVal[1][2], 0.0 );
	lightAmbient2 = vec4( LAVal[1][0], LAVal[1][1], LAVal[1][2], 0.0 );
	lightDiffuse2 = vec4( LDVal[1][0], LDVal[1][1], LDVal[1][2], 0.0 );
	lightSpecular2 = vec4( LSVal[1][0], LSVal[1][1], LSVal[1][2], 0.0 );
	
	var ambientProduct2 = mult(lightAmbient2, materialAmbient);
    var diffuseProduct2 = mult(lightDiffuse2, materialDiffuse);
    var specularProduct2 = mult(lightSpecular2, materialSpecular);
	
	gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct2"), flatten(ambientProduct2));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct2"), flatten(diffuseProduct2) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct2"), flatten(specularProduct2) );
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition2"), flatten(lightPosition2) );
	
	gl.uniformMatrix4fv( cameraMatrixLoc, false, flatten(cameraMatrix) );
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
	
	SliderUpdate();
	DataUpdate();
	bar();
	platform();
	traverse(torsoUpperId);
	
	if ((chkmove == jumpId)&&(barhold == 0)){
		humanAnimating(jumpId);
	}
	else if ((chkmove == walkId)&&(barhold == 0)){
		switch (chkdirection){
			case upId:
				walkingfunc(rho[torsoUpperId], 1);
				break;
			case rightId:
				walkingfunc(rho[torsoUpperId], 1);
				rho[torsoUpperId] -= 1;
				break;
			case downId:
				walkingfunc(rho[torsoUpperId], -1);
				break;
			case leftId:
				walkingfunc(rho[torsoUpperId], 1);
				rho[torsoUpperId] += 1;
				break;
		}
	}
	else if ((chkmove == runId)&&(barhold == 0)){
		switch (chkdirection){
			case upId:
				runfunc(rho[torsoUpperId], 1);
				break;
			case rightId:
				runfunc(rho[torsoUpperId], 1);
				rho[torsoUpperId] -= 1;
				break;
			case downId:
				runfunc(rho[torsoUpperId], -1);
				break;
			case leftId:
				runfunc(rho[torsoUpperId], 1);
				rho[torsoUpperId] += 1;
				break;
		}
	}
	else if (chkmove == barwork1Id) {
		if ((Math.abs(position[0]) <= 6)&&(Math.abs(position[2]) <= 3)){
			humanAnimating(barwork1Id);
		}
		else {
			count = -1;
		}
	}else if (chkmove == barwork2Id) {
		if (barhold == 1){
			humanAnimating(barwork2Id);
		}
	}
	
	requestAnimFrame(render);
}