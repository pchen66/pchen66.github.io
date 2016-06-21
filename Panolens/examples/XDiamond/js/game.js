'use strict'

function PANOGAME( scene, camera, container, radius ){

	var scope = this,
		colors = ['blue', 'green', 'orange', 'red', 'yellow'],
		textureLoader;

	// Constants
	this.TARGET_DISTANCE = radius * 0.95;
	this.DIRECTION = {
		up: {row: -1, column: 0},
		right: {row: 0, column: 1},
		down: {row: 1, column: 0},
		left: {row: 0, column: -1}
	};
	this.ANIMATION_DURATION = 500;

	this.STONE_WIDTH = 15;
	this.STONE_GAP = 1;

	this.STONE = {
		'blue': { 
			score: 300
		},
		'green': {
			score: 200
		},
		'orange': {
			score: 200
		},
		'red': {
			score: 200
		},
		'yellow': {
			score: 200
		}
	};

	this.TEXTURES = {
		boom: THREE.ImageUtils.loadTexture( 'images/boom2.png', THREE.UVMapping, function(){ loadingManager.addLoadedAsset(); } ),
		bomb: THREE.ImageUtils.loadTexture('images/bomb.png', THREE.UVMapping, function(){ loadingManager.addLoadedAsset(); }),
		swap: THREE.ImageUtils.loadTexture('images/swap.png', THREE.UVMapping, function(){ loadingManager.addLoadedAsset(); })
	};

	for(var i in this.TEXTURES){
		loadingManager.addTotalAsset();
	}
	

	// Utilities
	this.raycaster = new THREE.Raycaster();
	this.sound = { enabled: true };
	this.frustum = new THREE.Frustum();
	this.projScreenMatrix = new THREE.Matrix4();

	// Variables
	this.scene = scene;
	this.camera = camera;
	this.container = container;

	this.targets = [];
	this.targetVerticallyAmount = 6;
	this.targetSphericallyAmount = 32;
	this.targetAmount = this.targetVerticallyAmount * this.targetSphericallyAmount;
	
	this.items = [];
	this.itemEffects = {};
	this.currentEffect = '';

	this.score = { total: 0 };

	this.initialSteps = 10;
	this.stepsdown = { steps: this.initialSteps };

	this.currentTarget = {};
	this.isAnimating = false;
	this.minMoveDelta = 0.05;

	// Load textures
	textureLoader = new THREE.TextureLoader();
	colors.map(function(color){
		textureLoader.load('images/'+color+'.png', function(texture){
			var spriteMaterial = new THREE.SpriteMaterial({map: texture, transparent: true, depthTest: false});
			scope.STONE[color].sprite = new THREE.Sprite(spriteMaterial);
			scope.STONE[color].sprite.scale.set(scope.STONE_WIDTH, scope.STONE_WIDTH, 1);
		});
	});
}

// Click Interaction
PANOGAME.prototype.findIntersection = function( intersectPoint ){

	if( intersectPoint.isDown ){

		this.raycaster.setFromCamera( intersectPoint, this.camera );

		var intersects = this.raycaster.intersectObjects( this.scene.children );

		if ( intersects.length > 0 && intersects[ 0 ].object ) {
			intersectPoint.targetA = intersects[ 0 ].object;
		} else {
			intersectPoint.targetA = undefined;
		}

	} else if( !intersectPoint.isDown && intersectPoint.targetA && intersectPoint.targetA.category && intersectPoint.targetA.category === 'stone' ){

		var targetA = {};
		var targetB = {};

		if( this.isAnimating || this.stepsdown.steps <= 0 ){
			return;
		}

		var direction = { row: 0, column: 0 };

		if( Math.abs(intersectPoint.deltaX) > this.minMoveDelta && Math.abs(intersectPoint.deltaX) > Math.abs(intersectPoint.deltaY) ){
			direction.column = ( intersectPoint.deltaX > 0 ) ? 1 : -1;
		} else if ( Math.abs(intersectPoint.deltaY) > this.minMoveDelta && Math.abs(intersectPoint.deltaY) > Math.abs(intersectPoint.deltaX) ){
			direction.row = ( intersectPoint.deltaY > 0 ) ? -1 : 1;
		} else {
			intersectPoint.targetA.select();
			return;
		}

		// Get Next Direction Target
		targetA = intersectPoint.targetA;
		targetB = this.getConvertedTarget( targetA, direction );

		if( targetA === targetB ){
			intersectPoint.targetA.select();
			return;
		}

		if( targetB ){
			this.swapTargets( targetA, targetB );
		} else {
			return;
		}

		var affectedTargets = this.findSolution( [targetA, targetB] );

		this.isAnimating = true;

		// Cannot form a line
		if( affectedTargets.length === 0 ){
			this.swapTargets( targetA, targetB );
			this.animateSwapping( targetA, targetB, 200, true );
		} else {
			this.stepsdown.update( -1 );
			this.animateSwapping( targetA, targetB, 200 );
			this.animateMagic( affectedTargets, 500, 400 );
		}
	} else if( !intersectPoint.isDown && intersectPoint.targetA && intersectPoint.targetA.category && intersectPoint.targetA.category === 'item' ){
		intersectPoint.targetA.select();
	}

};

// Find Solution
PANOGAME.prototype.findSolution = function( targets, isDeeperLevel ) {

	var solutions = [];

	for( var t in targets ){

		var target = targets[t];

		// Find Next Target with 4 directions
		var affectedTargets = [];

		for( var i in this.DIRECTION ){

			// Initialization
			var targetNext = target;
			var lineMesh = [ target ];
			var line = { count: 1 };
			var lastTarget = {};

			// Find Staight Line if there's any
			while( targetNext && (targetNext.name === target.name) && lastTarget != targetNext ){
				
				lastTarget = targetNext;
				targetNext = this.getConvertedTarget( targetNext, this.DIRECTION[i] );

				if( targetNext && targetNext.name === target.name && lastTarget != targetNext ){
					line.count++;
					lineMesh.push( targetNext );
				}
			}

			// More than 2 in a row
			if( line.count >= 2 && !isDeeperLevel ){
				// In case of target is in the middle to form a row
				var newlineMesh = this.findSolution( [lineMesh[line.count-1]], true );
				if( newlineMesh.length > line.count ){
					lineMesh = newlineMesh;
				}

				// More than 3 in a row
				if( lineMesh.length >= 3 ){
					affectedTargets = affectedTargets.concat( lineMesh ) ;
				}
			} else if( line.count >= 2 && isDeeperLevel ){
				return lineMesh;
			}
		}
		if(affectedTargets.length){
			affectedTargets = this.uniqueArrays(affectedTargets);
			if( affectedTargets.length > 3 ){
				for(var m=0;m<affectedTargets.length;m++){
					affectedTargets[m].score *=  affectedTargets.length/3;
				}
			}
			solutions.push(affectedTargets);
		}
		
	}
	return solutions;
};

// Get Boundary-Checked Next Target
PANOGAME.prototype.getConvertedTarget = function( target, direction ) {
if(!target || !target.arrayIndex){debugger}
	if( target.arrayIndex.column == this.targetSphericallyAmount-1 && direction.column == 1 ){
		return undefined;
	} else if( target.arrayIndex.column == 0 && direction.column == -1){
		return undefined;
	} else if( target.arrayIndex.row == 0 && direction.row == -1 ){
		return undefined;
	} else if( target.arrayIndex.row == (this.targetAmount / this.targetSphericallyAmount)-1 && direction.row == 1 ){
		return undefined;
	} else {
		if(!this.targets[target.arrayIndex.row + direction.row][target.arrayIndex.column + direction.column]){
			return undefined;
		} else {
			return this.targets[target.arrayIndex.row + direction.row][target.arrayIndex.column + direction.column].object;
		}
	}
};

// Merge Duplicates
PANOGAME.prototype.uniqueArrays = function( array ) {
	
	var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};

// Swap Targets
PANOGAME.prototype.swapTargets = function( targetA, targetB ){

	this.targets[targetA.arrayIndex.row][targetA.arrayIndex.column].object = targetB;
	this.targets[targetB.arrayIndex.row][targetB.arrayIndex.column].object = targetA;	

	var temp = targetA.arrayIndex;
	targetA.arrayIndex = targetB.arrayIndex;
	targetB.arrayIndex = temp;

};

// Animate Swapping
PANOGAME.prototype.animateSwapping = function( targetA, targetB, duration, isSwapBack ) {

	var game = this;

	var targetAPosition = targetA.position.clone();
	var targetBPosition = targetB.position.clone();

	var targetARotation = targetA.rotation.clone();
	var targetBRotation = targetB.rotation.clone();	

	new TWEEN.Tween( targetA.position )
	.to( {x: targetBPosition.x, y: targetBPosition.y, z: targetBPosition.z}, duration )
	.easing( TWEEN.Easing.Exponential.Out )
	.start();

	new TWEEN.Tween( targetA.rotation )
	.to( {x: targetBRotation.x, y: targetBRotation.y, z: targetBRotation.z}, duration )
	.easing( TWEEN.Easing.Exponential.Out )
	.start();

	new TWEEN.Tween( targetB.position )
	.to( {x: targetAPosition.x, y: targetAPosition.y, z: targetAPosition.z}, duration )
	.easing( TWEEN.Easing.Exponential.Out )
	.start();

	new TWEEN.Tween( targetB.rotation )
	.to( {x: targetARotation.x, y: targetARotation.y, z: targetARotation.z}, duration )
	.easing( TWEEN.Easing.Exponential.Out )
	.start();

	new TWEEN.Tween()
	.to({}, duration)
	.onComplete(function(){
		if( isSwapBack ){
			game.animateSwapping( targetB, targetA, duration );
			
			new TWEEN.Tween()
			.to({}, duration)
			.onComplete(function(){ 
				game.isAnimating = false; 
			})
			.start();
		}
	})
	.start();

};

// Animate Magic
PANOGAME.prototype.animateMagic = function( targets, duration, delay, isRearranged ) {

	var game = this;

	var shiftedTargets = [];

	// Group Connected Targets
	for(var i = 0; i<targets.length; i++){
		for(var j = 0; j < targets[i].length; j++){
			for(var k = i+1; k < targets.length;k++){
				var removeIndex = targets[k].indexOf(targets[i][j]);
				if(removeIndex != -1){
					targets[i] = this.uniqueArrays( targets[i].concat( targets[k] ) );
					targets[k] = [];
					continue;
				}
			}
		}
	}

	if( game.sound.enabled ){
		game.sound.bingo.play();
	}

	new TWEEN.Tween()
	.to({}, 0 )
	.delay( delay )
	.onComplete(function(){

		var score = 0;

		// Eliminate Affected Targets
		for( var i = 0; i < targets.length; i++ ){
			for( var j = 0; j < targets[i].length; j++ ){	
				if( isRearranged ){
					targets[i][j].rearrange( duration, delay );
					
				} else {
					score += targets[i][j].score;
					targets[i][j].eliminateSelf( duration, delay );	
				}
				game.targets[targets[i][j].arrayIndex.row][targets[i][j].arrayIndex.column].object = undefined;

			}
		}

		// Initialize Column Stacks
		var columnStacks = [];
		for(var i=0;i<game.targetSphericallyAmount;i++){
			columnStacks[i] = [];
		}

		// Pile Up Each Column in Stacks
		for(var i=game.targets.length-1;i>=0;i--){
			for(var j=0;j<game.targets[i].length;j++){
				if( game.targets[i][j].object != undefined ){
					
					if( columnStacks[j].length != game.targetVerticallyAmount-i-1 ){
						game.targets[i][j].object.arrayIndex.row = game.targetVerticallyAmount - 1 - columnStacks[j].length;
						shiftedTargets.push( game.targets[i][j].object );
						game.targets[i][j].object.moveTo( game.targets[game.targets[i][j].object.arrayIndex.row][game.targets[i][j].object.arrayIndex.column].spot, duration, delay, TWEEN.Easing.Bounce.Out );

					}
					columnStacks[j].unshift( game.targets[i][j].object );
				}
			}
		}

		// Replenish 
		for(var i=0;i<columnStacks.length;i++){
			if(columnStacks[i].length < game.targetVerticallyAmount){
				var replenishAmount = game.targetVerticallyAmount-columnStacks[i].length;
				for(var j=0;j<replenishAmount;j++){
					var newTargetObject = game.generateRandomTarget();
					var newTarget = game.createTarget( newTargetObject, true );
					newTarget.arrayIndex = {
						row: game.targetVerticallyAmount-columnStacks[i].length-1,
						column: i
					};
					newTarget.position.copy(game.targets[newTarget.arrayIndex.row][newTarget.arrayIndex.column].spot.position);
					newTarget.rotation.copy(game.targets[newTarget.arrayIndex.row][newTarget.arrayIndex.column].spot.rotation);
					
					newTarget.position.y += game.TARGET_DISTANCE * 4;

					shiftedTargets.push( newTarget );

					columnStacks[i].unshift( newTarget );

					// Add Target To Scene
					game.scene.add( newTarget );

					// Move Down New Target
					newTarget.moveTo( game.targets[newTarget.arrayIndex.row][newTarget.arrayIndex.column].spot, duration, duration+delay, TWEEN.Easing.Quartic.Out );
				}
			}
		}

		// Assign Stacks to Game Board
		for(var i=0;i<columnStacks.length;i++){
			for(var j=0;j<columnStacks[i].length;j++){
				if(game.targets[j][i].object != columnStacks[i][j]){
					game.targets[j][i].object = columnStacks[i][j];
				}
				
			}
		}

		// After Moving Down, Find Connected Lines
		new TWEEN.Tween()
		.to({}, duration+duration+delay )
		.onComplete(function(){

			game.updateScore( score );

			var autoAffectedTargets = game.findSolution( shiftedTargets );
			if( autoAffectedTargets.length > 0 ){
				game.animateMagic( autoAffectedTargets, 500, 400 );
			} else {
				game.isAnimating = false;

				//Check if the not deadlock
				if( game.checkDeadlock() ){
					game.rearrangeTargets();
				}

				//Game Complete
				if( game.stepsdown.steps <= 0 ){
					if( game.sound.enabled ){
						game.sound.gamecomplete.play();
					}
					loadingManager.onGameComplete();
				}
			}

		})
		.start();
	})
	.start();
};

PANOGAME.prototype.rearrangeTargets = function(){

	var targetObjects = [];

	for(var i in this.targets){
		targetObjects[i] = [];
		for(var j in this.targets[i]){
			targetObjects[i].push(this.targets[i][j].object);
		}
	}

	this.animateMagic( targetObjects, 500, 400, true );
};

// Check If Deadlock Exists
PANOGAME.prototype.checkDeadlock = function(){

	for(var i in this.targets){
		for(var j in this.targets[i]){
			var neighbors = {};
			for(var x in this.DIRECTION){

				var neighbor = this.getConvertedTarget( this.targets[i][j].object, this.DIRECTION[x] );

				if(!neighbor){
					continue;
				}

				var testTarget = this.targets[i][j].object;
				var swappingTarget = neighbor;

				var temp  = neighbor.arrayIndex;
				neighbor.arrayIndex = testTarget.arrayIndex;
				testTarget.arrayIndex = temp;

				var result = this.findSolution( [testTarget, neighbor] );

				temp  = neighbor.arrayIndex;
				neighbor.arrayIndex = testTarget.arrayIndex;
				testTarget.arrayIndex = temp;

				if(result.length > 0){
					return false;
				}
			}
		}
	}
	return true;
};

// Generate Random Virtual Target 
PANOGAME.prototype.generateRandomTarget = function() {
	
	var typeIndex = Math.floor(Math.random()*9);

	var name, score;

	switch( typeIndex ){
		case 0:
			name = 'blue';
			break;
		case 1:
		case 2:
			name = 'green';
			break;
		case 3:
		case 4:
			name = 'orange';
			break;
		case 5:
		case 6:
			name = 'red';
			break;
		case 7:
		case 8:
			name = 'yellow';
			break;
	}

	return { name: name };

};

// Create Targets
PANOGAME.prototype.createTargets = function( total, divide ){

	// Initialize Targets Array
	this.targets = [];
	for( var i = 0; i < total / divide; i++ ){
		this.targets[ i ] = [];
	}

	for(var i = 0; i < total; i++){
		
		var target;
		var targetObject;
		var result = [];
		var row = Math.floor(i / divide);
		var column = i % divide;

		do{
			targetObject = this.generateRandomTarget();

			// Test Target Can Be Placed
			targetObject.arrayIndex = { row: row, column: column };

			result = this.findSolution( [targetObject] );
		}
		while( result.length !== 0 );

		target = this.createTarget( targetObject );

		// Add Target To Scene
		this.scene.add( target );

		// 2-Dimentional Array to Represent Game Board
		this.targets[target.arrayIndex.row][target.arrayIndex.column] = { 
			object: target, 
			spot: {
				position: target.position.clone(),
				rotation: target.rotation.clone()
			}
		};
	}

};

// Create A Single Target
PANOGAME.prototype.createTarget = function( targetObject, isReplenished ){

	var game = this;

	var target;

	var radian;

	target = this.STONE[targetObject.name].sprite.clone();

	// Set Target Attributes
	target.name = targetObject.name;
	target.category = 'stone';
	target.spinningSpeed = 0.05;
	target.score = this.STONE[targetObject.name].score;

	if( !isReplenished ){

		var theta = Math.PI / 18;

		radian = (Math.PI - this.targetSphericallyAmount * theta) / 2 + targetObject.arrayIndex.column * theta;

		//radian = targetObject.arrayIndex.column * ( Math.PI / this.targetSphericallyAmount ) / 1.7;

		target.arrayIndex = targetObject.arrayIndex;

		// Set Target Position
		target.position.set( 
			-this.TARGET_DISTANCE * Math.cos(radian), 
			-target.arrayIndex.row * ( this.STONE_WIDTH + this.STONE_GAP ) + (this.targetVerticallyAmount * (this.STONE_WIDTH + this.STONE_GAP) - this.STONE_WIDTH)/2, 
			-this.TARGET_DISTANCE * Math.sin(radian) 
		);

		// Make Target Facing Toward Center
		//target.rotation.set( -Math.PI/2, 0, Math.PI - radian );
		target.lookAt( game.scene.position );
	}

	target.update = function(){

	};

	// Select A Target
	target.select = function(){
		
		game.currentTarget = this;

		if(!game.currentEffect || !game.itemEffects[game.currentEffect] || game.itemEffects[game.currentEffect].amount <= 0){
			game.currentEffect = '';
			return;
		}

		switch( game.currentEffect ){

			case 'bomb':
				var blowTargets = [this];
				for(var dir in game.DIRECTION){
					var neighbor = game.getConvertedTarget(this, game.DIRECTION[dir]);
					if( neighbor ){
						blowTargets.push( neighbor );
					}
				}
				game.itemEffects[game.currentEffect].update( -1 );
				game.animateMagic( [blowTargets], 500, 400 );
				game.currentEffect = '';
			break;
		}
		
	};

	// Move Down
	target.moveTo = function( spot, duration, delay, timeFunction ){

		new TWEEN.Tween( this.position )
		.to({x: spot.position.x, y: spot.position.y, z: spot.position.z}, duration)
		.easing( timeFunction )
		.delay( delay )
		.start();

		new TWEEN.Tween( this.rotation )
		.to({x: spot.rotation.x, y: spot.rotation.y, z: spot.rotation.z}, duration)
		.easing( timeFunction )
		.delay( delay )
		.start();

	};

	// Rearrange
	target.rearrange = function( duration, delay ){

		var _target = this;

		// Remove From the Scene
		new TWEEN.Tween( this.position )
		.to({y: "-500"}, duration)
		.easing( TWEEN.Easing.Circular.In )
		.delay( delay )
		.onComplete(function(){
			game.scene.remove( _target );
			_target = null;
		})
		.start();

	};

	// Eliminate Self
	target.eliminateSelf = function( duration, delay ){

		var scale = 0.001;

		var _target = this;

		var scoreObject = game.makeTextSprite( 
			'+'+this.score.toFixed(0), 
			{ fontsize: 60, fontface: "Lato" } 
		);
		scoreObject.category = 'score';
		scoreObject.position.copy( this.position.clone().multiplyScalar(0.9) );
		scoreObject.position.x += 5;
		scoreObject.position.y += 5;
		scoreObject.lookAt( game.camera.position );
		game.scene.add( scoreObject );

		var boomMaterial = new THREE.SpriteMaterial( {
			map: game.TEXTURES.boom, 
			transparent: true, 
			opacity: 0.3, 
			blending: THREE.AdditiveBlending,
			depthTest: false
		} );
		var boom = new THREE.Sprite( boomMaterial );
		boom.position.z = 1;
		boom.scale.set(2,2,1);
		boom.lookAt(game.scene.position);
		this.add( boom );

		// Show Score
		new TWEEN.Tween( scoreObject.material )
		.to({opacity: 0}, (duration+delay)*6)
		.easing( TWEEN.Easing.Exponential.Out )
		.onComplete(function(){
			boom = null;
			game.scene.remove( scoreObject );
			scoreObject = null;
		})
		.start();
		
		// Scale Down and Remove From the Scene
		new TWEEN.Tween( this.scale )
		.to({x: scale, y: scale, z: scale}, duration)
		.easing( TWEEN.Easing.Exponential.Out )
		.delay( delay )
		.onComplete(function(){
			game.scene.remove( _target );
			_target = null;
		})
		.start();
	};

	return target;

};

// Generate Items
PANOGAME.prototype.generateItem = function( type ) {
	
	var game = this;

	var item = {};

	var itemSize = 20;

	var imageRatio = 1.3/1.6;

	var radian = Math.PI / 2;

	var distanceScaleFactor = 0.9;

	var spriteMaterial;

	spriteMaterial = new THREE.SpriteMaterial({map: this.TEXTURES[type], transparent: true});

	item = new THREE.Sprite( spriteMaterial );

	item.category = 'item';
	item.effect = type;
	this.isAcquired = false;

	item.position.set( 
		this.TARGET_DISTANCE * distanceScaleFactor * Math.cos( radian ), 
		this.TARGET_DISTANCE * ( Math.random() - 0.5 ) * 0.1, 
		this.TARGET_DISTANCE * distanceScaleFactor * Math.sin( radian ) 
	);

	item.scale.x = itemSize * imageRatio;
	item.scale.y = itemSize;

	item.tweenSpeed = 1000 * Math.random() + 300;

	item.tweenUp = new TWEEN.Tween( item.position )
				.to({y: "+30"}, item.tweenSpeed)
				.easing( TWEEN.Easing.Linear.None );
	item.tweenDown = new TWEEN.Tween( item.position )
				.to({y: "-30"}, item.tweenSpeed)
				.easing( TWEEN.Easing.Linear.None );
	item.tweenUp.chain(item.tweenDown);
	item.tweenDown.chain(item.tweenUp);
	item.tweenUp.start();

	item.select = function(){

		if( this.isAcquired ){
			return;
		}

		this.isAcquired = true;
		game.itemEffects[this.effect].update(1);
		this.eliminateSelf();
	};

	item.eliminateSelf = function(){

		var _item = this;

		this.tweenUp.stop();

		new TWEEN.Tween( this.material )
		.to({opacity: 0}, 1000)
		.easing( TWEEN.Easing.Exponential.Out )
		.onComplete(function(){
			game.scene.remove( _item );
		})
		.start();

		game.items.splice( game.items.indexOf(this), 1 );
		
	};

	item.showFlashingIcon = function(){

		var _item = this;

		var iconElement = document.createElement( 'div' );
		iconElement.classList.add( 'item-search-icon', 'bgimage', 'flashing', this.effect );
		game.container.appendChild( iconElement );

		iconElement.eliminateSelf = function(){
			game.container.removeChild( iconElement );
		};
		this.flashingIconElement = iconElement;

		setTimeout(function(){
			iconElement.eliminateSelf();
			_item.flashingIconElement = undefined;
		}, 5000)
	};

	item.showFlashingIcon();

	item.lookAt( this.scene.position );

	this.scene.add( item );

	this.items.push( item );
};

PANOGAME.prototype.setupScatteredItems = function(){

	var time = 10 * 1000;

	var game = this;

	var timeoutFunction = function(){
	    
	    clearInterval(interval);

	    time = Math.random() * time + time;
	  
	    // Remove Old Item
		if( game.items.length > 0 ){
			for(var i=0;i<game.items.length;i++){
				game.items[i].eliminateSelf();
			}
		}

		var index = Math.floor(Math.random() * 2);
		var effect;
		switch( index ){
		case 0:
			effect = 'bomb';
			break;
		case 1:
			effect = 'swap';
			break;
		default:
			effect = 'bomb';
			break;
		}
		game.generateItem( effect );
		//console.log(index, 'generate Item : ', effect, time);

	    interval = setInterval(timeoutFunction, time);
	}
	var interval = setInterval(timeoutFunction, time);
};

PANOGAME.prototype.makeTextSprite = function( message, parameters ){
	if ( parameters === undefined ) parameters = {};
	
	var fontface = parameters.hasOwnProperty("fontface") ? 
		parameters["fontface"] : "Lato";
	
	var fontsize = parameters.hasOwnProperty("fontsize") ? 
		parameters["fontsize"] : 18;
	
	var borderThickness = parameters.hasOwnProperty("borderThickness") ? 
		parameters["borderThickness"] : 4;
	
	var borderColor = parameters.hasOwnProperty("borderColor") ?
		parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
	
	var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
		parameters["backgroundColor"] : { r:255, g:255, b:255, a:0.0 };
		
	var canvas = document.createElement('canvas');
	
	var context = canvas.getContext('2d');
	context.font = fontsize + "px " + fontface;
    
	// get size data (height depends only on font size)
	var metrics = context.measureText( message );
	var textWidth = metrics.width;
	
	// background color
	context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
								  + backgroundColor.b + "," + backgroundColor.a + ")";
	// border color
	context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
								  + borderColor.b + "," + borderColor.a + ")";

	context.lineWidth = borderThickness;
	
	// text color
	context.fillStyle = "rgba(255, 255, 255, 1.0)";

	context.fillText( message, borderThickness, fontsize + borderThickness);
	
	// canvas contents will be used for a texture
	var texture = new THREE.Texture(canvas) 
	texture.needsUpdate = true;
	texture.minFilter = THREE.NearestFilter;

	var spriteMaterial = new THREE.SpriteMaterial( 
		{ map: texture} );
	var sprite = new THREE.Sprite( spriteMaterial );
	sprite.scale.set(20,10,1.0);
	return sprite;	
};

PANOGAME.prototype.setupUIElements = function(){
	this.bindStepsdownElementById( 'stepsdownText' );
	this.bindScoreElementById( 'scoreText' );

	var effectElements = document.getElementsByClassName('item');
	for( var i = 0; i < effectElements.length; i++ ){
		this.itemEffects[ effectElements[i].getAttribute('data-name') ] = {amount: 0};
		this.bindEffectElement( effectElements[i] );	
	}
};

// Bind Countdown Element By Id
PANOGAME.prototype.bindStepsdownElementById = function( elementId ){

	var game = this;

	var textElement = document.getElementById( elementId );

	textElement.textContent = this.stepsdown.steps;

	this.stepsdown.update = function( delta ){
		game.stepsdown.steps += delta;

		// Use Up All Steps
		if( game.stepsdown.steps <= 0 ){
			game.stepsdown.steps = 0;

		}
		textElement.textContent = game.stepsdown.steps;
	};

};

//Bind Score Element By Id
PANOGAME.prototype.bindScoreElementById = function( elementId ){

	var game = this;

	var textElement = document.getElementById( elementId );

	textElement.textContent = this.score.total;

	this.score.update = function( score ){
		game.score.total += score;
		textElement.textContent = parseInt(game.score.total);
	};

};

// Bind Effect Item
PANOGAME.prototype.bindEffectElement = function( element ){

	var game = this;

	var effect = element.getAttribute('data-name');

	var textElement = element.getElementsByClassName( 'itemCounterText' )[0];

	textElement.textContent = this.itemEffects[effect].amount;

	this.itemEffects[effect].update = function( delta ){
		game.itemEffects[effect].amount += delta;
		textElement.textContent = game.itemEffects[effect].amount;
	};

	element.addEventListener('click', clickHandler, false);
	element.addEventListener('touchend', clickHandler, false);

	function clickHandler( event ){

		event.preventDefault();
		event.stopPropagation();

		game.currentEffect = effect;

		if(!game.itemEffects[game.currentEffect] || game.itemEffects[game.currentEffect].amount <= 0){
			game.currentEffect = '';
			return;
		}

		switch(effect){
			case 'swap':
				game.itemEffects[game.currentEffect].update( -1 );
				game.rearrangeTargets();
				game.currentEffect = '';
				break;
		}
	}
};

// Setup Game Sound
PANOGAME.prototype.setupSound = function( enabled ){
	this.sound.enabled = enabled;
	this.sound.bingo = new Audio( 'sound/bingo.mp3' );
	this.sound.bingo.preload = true;
	this.sound.gamecomplete = new Audio( 'sound/gamecomplete.mp3' );
	this.sound.gamecomplete.preload = true;
};

// Initialize
PANOGAME.prototype.init = function(){
	this.setupSound( true );
	this.setupUIElements();

	this.createTargets( this.targetAmount, this.targetSphericallyAmount );

	this.setupScatteredItems();

	this.start();
};

// Start
PANOGAME.prototype.start = function(){

};


// Restart
PANOGAME.prototype.restart = function() {

	var targets = this.targets;

	for( var i = 0; i < this.targets.length; i++ ){
		for( var j = 0; j < this.targets[i].length; j++ ){	
			this.scene.remove( this.targets[i][j].object );
			this.targets[i][j].object = undefined;
		}
	}

	this.createTargets( this.targetAmount, this.targetSphericallyAmount );

	for( var i in this.itemEffects ){
		this.itemEffects[i].amount = 0;
		this.itemEffects[i].update( 0 );
	}

	this.currentEffect = '';

	this.score.total = 0;
	this.score.update( 0 );

	this.stepsdown.steps = this.initialSteps;
	this.stepsdown.update( 0 );

	this.currentTarget = {};
	this.isAnimating = false;
};

// Update Game Score
PANOGAME.prototype.updateScore = function( score ){
	this.score.update( score );
};

// Update Target
PANOGAME.prototype.update = function(){

	// Targets
	var targets = this.targets;
	for( var i in targets ){
		for( var j in targets[i] ){
			var object = targets[i][j].object;
			object.update();
			if( object === this.currentTarget ){
				//object.rotateOnAxis( new THREE.Vector3(0,1,0), object.spinningSpeed*2 );
			}
		}
	}

	// Check if Object is in the Camera View
	/*this.projScreenMatrix.multiplyMatrices( this.camera.projectionMatrix, this.camera.matrixWorldInverse );
	this.frustum.setFromMatrix( new THREE.Matrix4().multiplyMatrices( this.camera.projectionMatrix, this.camera.matrixWorldInverse ) );
	console.log(this.frustum.intersectsObject( this.targets[0][0].object ));*/

};