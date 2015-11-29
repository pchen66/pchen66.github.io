var container;

var camera, scene, renderer, controls;

var Skybox;

var Game;

var TouchPoint = new THREE.Vector2();

window.onload = function(){
	init();
};

function init() {

	container = document.getElementById( 'game-container' );

	Game = new PANOGAME();
	loadingManager.setGame( Game );

	container.addEventListener( 'mousedown', onDocumentMouseDown, false );
	container.addEventListener( 'mousemove', onDocumentMouseMove, false );
	container.addEventListener( 'mouseup', onDocumentMouseUp, false );

	container.addEventListener( 'touchstart', onDocumentTouchStart, false );
	container.addEventListener( 'touchmove', onDocumentTouchMove, false );
	container.addEventListener( 'touchend', onDocumentTouchEnd, false );

}

function onDocumentMouseDown( event ) {

	TouchPoint.x = event.clientX / container.clientWidth * 2 - 1;
	TouchPoint.y = - event.clientY / container.clientHeight * 2 + 1;
	TouchPoint.isDown = true;
	TouchPoint.isMovingStone = false;

	Game.findIntersection( TouchPoint );

	if( TouchPoint.targetA && TouchPoint.targetA.category === 'stone' ){
		TouchPoint.isMovingStone = true;
		if ( viewer ) {
			viewer.getControl().enabled = false;
		}
		event.stopPropagation();
	}

}

function onDocumentMouseMove( event ){

	event.preventDefault();

}

function onDocumentMouseUp( event ) {


	if( TouchPoint.isDown ){

		var PointX = event.clientX / container.clientWidth * 2 - 1,
			PointY = - event.clientY / container.clientHeight * 2 + 1;
	
		TouchPoint.deltaX = PointX - TouchPoint.x;
		TouchPoint.deltaY = PointY - TouchPoint.y;

		TouchPoint.x = PointX;
		TouchPoint.y = PointY;
		TouchPoint.isDown = false;

		Game.findIntersection( TouchPoint );

		if ( TouchPoint.isMovingStone && viewer ) {
			viewer.getControl().enabled = true;
		}
	}
	
}

function onDocumentTouchStart( event ) {

	if ( event.changedTouches.length == 1 ) {

		event.preventDefault();
		event.stopPropagation();

		TouchPoint.x = event.changedTouches[0].clientX / container.clientWidth * 2 - 1,
		TouchPoint.y = - event.changedTouches[0].clientY / container.clientHeight * 2 + 1;		
		TouchPoint.isDown = true;
		TouchPoint.isMovingStone = false;

		Game.findIntersection( TouchPoint );

		if( TouchPoint.targetA && TouchPoint.targetA.category === 'stone' ){
			TouchPoint.isMovingStone = true;
			if ( viewer ) {
				viewer.getControl().enabled = false;
			}
			event.stopPropagation();
		}

	}

}

function onDocumentTouchMove( event ) {

	event.preventDefault();

}

function onDocumentTouchEnd( event ){

	if ( event.changedTouches.length == 1 ) {

		event.preventDefault();
		event.stopPropagation();

		if( TouchPoint.isDown ){
			
			var PointX = event.changedTouches[0].clientX / container.clientWidth * 2 - 1,
				PointY = - event.changedTouches[0].clientY / container.clientHeight * 2 + 1;	
		
			TouchPoint.deltaX = PointX - TouchPoint.x;
			TouchPoint.deltaY = PointY - TouchPoint.y;

			TouchPoint.x = PointX;
			TouchPoint.y = PointY;
			TouchPoint.isDown = false;

			Game.findIntersection( TouchPoint );

			if ( TouchPoint.isMovingStone && viewer ) {
				viewer.getControl().enabled = true;
			}
		}
	}	
}