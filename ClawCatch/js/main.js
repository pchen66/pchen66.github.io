'use strict';

Physijs.scripts.worker = 'js/physijs/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

var PRIZE_DISTANCE = 250;

var App = {
	
	initialTime: 90,
	
	timer: 0,
	
	score: 0,
	
	perToyScore: 100,
	
	maxScoreCount: 6,
	
	status: 'Initial',
	
	setInitialStates: function(){
	
		for( var model in App.prizeToys ){
			App.prizeToys[ model ].count = 0;
			App.toys[ model ].isCatched = false;
		}
		
		App.currentPrizeToy = App.prizeToys['AngryBird'];
		
		// Clear active star
		for(var i=0; i< document.getElementsByClassName( 'star' ).length; i++ ){
			document.getElementsByClassName( 'star' )[i].classList.remove( 'active' );
		}
		
		// Score
		App.score = 0;
		
		// Updates
		App.updateArrowUI();
		App.updateTextUI();
		App.updatePagination();
		App.prizecamera.position.set( 0, 0, 200 );

	},
	
	onAppStart: function(){
	
		App.timer = App.initialTime;
	
		App.status = 'Start';
		App.setClockRunning();
	},
	
	onAppResume: function(){
		App.status = 'Resume';
		App.setClockRunning();
	},
	
	onAppPause: function(){
		App.status = 'Pause';
		clearInterval( App.timeIntervalFunc );
	},
	
	onAppEnd: function(){
		App.status = 'End';
		
		var GameOverMenu = document.getElementById( 'GameOverMenu' ),
			stars = document.getElementsByClassName( 'star' );
		
		GameOverMenu.classList.add( 'open' );
		
		var activeStarPercentage = ( App.score / (App.perToyScore * App.maxScoreCount) );
		
		if( activeStarPercentage != 0 && activeStarPercentage < 1/stars.length ){
			activeStarPercentage = 1/stars.length;
		}
		
		for( var i=0; i < stars.length && i <= activeStarPercentage * stars.length - 1; i++ ){
			stars[i].classList.add( 'active' );
		}	
		
	},
	
	onAppRestart: function(){
		
		var GameOverMenu = document.getElementById( 'GameOverMenu' ),
			startContainer = document.getElementById( 'startContainer' ),
			loadingContainer = document.getElementById('loadingContainer'),
			controlInfo = document.getElementById( 'control-info' ),
			preGameContainer = document.getElementById( 'preGameContainer' ),
			prepareContainer = document.getElementById( 'prepareContainer' ),
			prepareText = document.getElementById( 'prepareText' );
		
		GameOverMenu.classList.remove( 'open' );
		prepareContainer.style.opacity = 0;
		prepareText.textContent = 3;
		loadingContainer.style.opacity = 1;
		preGameContainer.style.display = '';
		
		App.timer = App.initialTime;
		document.getElementById( 'countdownText' ).textContent = '01:30';
		
		App.generateSound('button');

		while( App.toysArray.length > 0 ){
			App.scene.remove( App.toysArray[App.toysArray.length-1] );
			App.toysArray.pop();
			App.leftAmount--;
			
		}
		
		var dropTimer = setInterval(function(){
			
			( App.leftAmount < App.initialItemCount ) ? App.dropToy( 1 ) : clearInterval( dropTimer );
			
			if( App.leftAmount >= 10 && prepareContainer.style.opacity != 1 ){
				prepareContainer.style.opacity = 1;
				var countdown = setInterval(function(){
					var number = parseInt(prepareText.textContent)-1;
					prepareText.textContent = number;
					if( prepareText.textContent <= 0 ){
						loadingContainer.style.opacity = 0;
						prepareText.textContent = 'GO';
						clearInterval( countdown );
						setTimeout( function(){
							preGameContainer.style.display = 'none';
							App.setInitialStates();
							App.onAppStart();
						}, 1001 );				
					}
				}, 1000);
			}
		}, 300);

	},
	
	timeIntervalFunc: '',
	
	setClockRunning: function(){
		App.timeIntervalFunc = setInterval(function(){
			App.timer--;
			var minute = '0' + parseInt( App.timer / 60 ), second = ( parseInt( App.timer % 60 ) < 10 ? '0' : '' ) + parseInt( App.timer % 60 );
			
			document.getElementById( 'countdownText' ).textContent = minute + ':' + second;
			if( App.timer <= 0 ){
				document.getElementById( 'countdownText' ).textContent = '00:00';
				clearInterval( App.timeIntervalFunc );
				App.onAppEnd();
			}
		}, 1000);
	},
	
	toysArray: [],
	
	toys: {
		AngryBird: {
			model_url: 'model/angrybird.dae',
			model: '',
			name: 'AngryBird',
			element_position: {x: 0, y: -20, z: 0},
			position: {x: 10, y: -30, z: 0},
			rotation: {x: 0, y: -Math.PI/2, z: 0},
			scale: 3.5,
			boundingBox: {width: 130, height: 100, depth: 90},
			progress: { loaded: 0, total: 0 },
			isCatched: false,
			wiki_url: 'http://en.m.wikipedia.org/wiki/Angry_Bird'
		},
		Pikachu: {
			model_url: 'model/pikachu.dae',
			model: '',
			name: 'Pikachu',
			element_position: {x: PRIZE_DISTANCE, y: -50, z: 0},
			position: {x: 0, y: -50, z: 10},
			rotation: {x: 0, y: -Math.PI/2, z: 0},
			scale: 14,
			boundingBox: {width: 100, height: 130, depth: 140},
			progress: { loaded: 0, total: 0 },
			isCatched: false,
			wiki_url: 'http://en.m.wikipedia.org/wiki/Pikachu'
		},
		Pokeball: {
			model_url: 'model/pokeball.dae',
			model: '',
			name: 'Pokeball',
			element_position: {x: PRIZE_DISTANCE*2, y: -5, z: 0},
			position: {x: 0, y: 0, z: 0},
			rotation: {x: 0, y: -Math.PI/2, z: 0},
			scale: 0.8,
			boundingBox: {width: 90, height: 90, depth: 90},
			progress: { loaded: 0, total: 0 },
			isCatched: false,
			wiki_url: 'http://en.m.wikipedia.org/wiki/Pokeball#Pok.C3.A9_Ball'
		},
		Maruko: {
			model_url: 'model/maruko.dae',
			model: '',
			name: 'Maruko',
			element_position: {x: PRIZE_DISTANCE*3, y: -60, z: 0},
			position: {x: 0, y: -60, z: 0},
			rotation: {x: 0, y: -Math.PI/2, z: 0},
			scale: 1.5,
			boundingBox: {width: 100, height: 140, depth: 80},
			progress: { loaded: 0, total: 0 },
			thumb_url: 'http://images5.fanpop.com/image/photos/30600000/maruko-maruko-chan-30624653-225-225.jpg', 
			isCatched: false,
			wiki_url: 'http://en.m.wikipedia.org/wiki/Maruko'
		},
		Kenny: {
			model_url: 'model/kenny.dae',
			model: '',
			name: 'Kenny',
			element_position: {x: PRIZE_DISTANCE*4, y: 0, z: 0},
			position: {x: 0, y: 0, z: 0},
			rotation: {x: 0, y: -Math.PI/2, z: 0},
			scale: 0.8,
			boundingBox: {width: 100, height: 120, depth: 80},
			progress: { loaded: 0, total: 0 },
			isCatched: false,
			wiki_url: 'http://en.m.wikipedia.org/wiki/Kenny_McCormick'
		},
		Gabumon: {
			model_url: 'model/gabumon.dae',
			model: '',
			name: 'Gabumon',
			element_position: {x: PRIZE_DISTANCE*5, y: -60, z: 0},
			position: {x: 0, y: -62, z: 34},
			rotation: {x: 0, y: -Math.PI/2, z: 0},
			scale: 3,
			boundingBox: {width: 80, height: 140, depth: 120},
			progress: { loaded: 0, total: 0 },
			isCatched: false,
			wiki_url: 'http://en.m.wikipedia.org/wiki/Gabumon#Gabumon'
		},
		Spongebob: {
			model_url: 'model/spongebob.dae',
			model: '',
			name: 'Spongebob',
			element_position: {x: PRIZE_DISTANCE*6, y: -80, z: -50},
			position: {x: 0, y: -80, z: 0},
			rotation: {x: 0, y: -Math.PI/2, z: 0},
			scale: 0.3,
			boundingBox: {width: 120, height: 165, depth: 80},
			progress: { loaded: 0, total: 0 },
			isCatched: false,
			wiki_url: 'http://en.m.wikipedia.org/wiki/SpongeBob_SquarePants_(character)'
		},
		Goku: {
			model_url: 'model/wukong.dae',
			model: '',
			name: 'Goku',
			element_position: {x: PRIZE_DISTANCE*7, y: -80, z: -50},
			position: {x: 0, y: -80, z: 0},
			rotation: {x: 0, y: -Math.PI/2, z: 0},
			scale: 0.6,
			boundingBox: {width: 100, height: 165, depth: 60},
			progress: { loaded: 0, total: 0 },
			isCatched: false,
			wiki_url: 'http://en.m.wikipedia.org/wiki/Goku'
		}	
		
	},

	renderer: '',
	prizerenderer: '',
	
	scene: new Physijs.Scene(),
	prizescene: new THREE.Scene(),
	
	camera: '',
	clawcamera: new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 ),
	prizecamera: '',
	
	leftAmount: 0,
	
	initialItemCount: 15,
	lowerlimitItemCount: 10,
	
	timeCounterss: { minute: 1, second: 30 },
	isGameStart: false,
	
	controls: '',
	
	prizeToys: {
		"AngryBird": '', 
		"Pikachu": '', 
		"Pokeball": '', 
		"Maruko": '', 
		"Kenny": '', 
		"Gabumon": '',
		"Spongebob": '',
		"Goku": ''
	},
	prizePlaceHolder: {},
	currentPrizeToy: '',
	
	glasscontainer: '',
	
	claw: '',
	clawbaseconstraint: '',
	clawconstraints: [],
	
	TopCar: '',
	topcarconstraint: '',
	topcarbaseconstraint: '',
	LineGeometry: '',
	
	PackageTexture: THREE.ImageUtils.loadTexture('img/question.png'),
	PackageMaterial: '',
	
	PressInterval: '',
	RotateInterval: '',
	
	MouseDownInterval: '',
	
	MINDISTANCE_TO_CONTAINER: 60,
	DROPDISTANCE: 400,
	
	MOVE_DISTANCE: 60,
	MOVE_INTERVAL_TIME: 600,
	
	isClawAnimating: false,
	isCameraAnimating: false,
	isCaptured: false,
	
	isMainCanvasMouseDown: false,
	MainCanvasMouseDownLocation: {x: 0, y: 0},
	
	containerTopBoxTextureX: undefined,
	containerTopBoxTextureZ: undefined,	
	
	loadingTotalCount: 0,
	loadingReadyCount: 0,
	
	preloadAssets: function(){
	
		var bgSound = document.getElementById( 'backgroundSound' );
		bgSound.volume = 0.5;

		for( var model in this.toys ){
		
			// Load Physics 3D Model
			this.loadToy3dModel( this.toys[model] );
			
			// Load Prize 3D Model
			this.loadPrize3dModel( this.toys[model] );
			
			// Count total loading objects
			this.loadingTotalCount += 2;
		}
		
	},
		
	loadToy3dModel: function( toyType ){
	
		var loader = new THREE.ColladaLoader();
		var isTotalAdded = false;
		var previousProgress = 0;
		loader.options.convertUpAxis = true;
		loader.load( toyType.model_url, function ( collada ) {

			var dae = collada.scene;
			dae.position.set( toyType.position.x, toyType.position.y, toyType.position.z );
			dae.scale.x = dae.scale.y = dae.scale.z = toyType.scale;
			dae.updateMatrix();
			
			dae.traverse( function( node ){
				if( node.material ){
					node.material.shading = 1;
				}
			});
			
			toyType.model = dae;
			toyType.model.name = toyType.name;
			
			App.loadingReadyCount++;
			
			if( App.loadingReadyCount === App.loadingTotalCount && !App.renderer ){
				App.onAssetLoaded();
			}
			
			
		},function( progress ){
			App.updateProgressBar();								
		});
	},
	
	loadPrize3dModel: function(object){

		var loader = new THREE.ColladaLoader();
		var isTotalAdded = false;
		var previousProgress = 0;
		loader.options.convertUpAxis = true;
		loader.load( object.model_url, function ( collada ) {
		
			var catchedToy;
		
			catchedToy = collada.scene;
			catchedToy.position.set( object.element_position.x, object.element_position.y, object.element_position.z );
			catchedToy.rotation.set( object.rotation.x, object.rotation.y + Math.PI/2, object.rotation.z );
			catchedToy.scale.x = catchedToy.scale.y = catchedToy.scale.z = object.scale;
			catchedToy.name = object.name;
			catchedToy.wiki_url = object.wiki_url;
			catchedToy.currentPrizeToyTargetRotation = 0;
			catchedToy.count = 0;
			
			catchedToy.visible = false;
			
			/*if(typeof(Storage) !== 'undefined' && localStorage[ catchedToy.name ] && localStorage[ catchedToy.name ] > 0) {
				catchedToy.count = parseInt( localStorage[ catchedToy.name ] );
			}*/
			
			App.prizeToys[catchedToy.name] = catchedToy;	
			App.prizescene.add( catchedToy );

			if( object.name === 'AngryBird' ){
				App.currentPrizeToy = catchedToy;
				App.updatePagination();
			}
			
			App.loadingReadyCount++;
			
			if( App.loadingReadyCount === App.loadingTotalCount && !App.renderer ){
				App.onAssetLoaded();
			}
			
		},function( progress ){
			App.updateProgressBar();							
		});
	},
	
	updateProgressBar: function(){
		var progressBar = document.getElementById( 'progressbar' ),
			bar = document.getElementById( 'bar' );
			
		bar.style.width = ( App.loadingReadyCount / App.loadingTotalCount ) * ( progressBar.clientWidth - 10 ) + 'px';
	},
	
	onAssetLoaded: function(){
	
		App.updateProgressBar();
	
		var startContainer = document.getElementById( 'startContainer' ),
			loadingContainer = document.getElementById('loadingContainer'),
			loadingBox = loadingContainer.children[0],
			controlInfo = document.getElementById( 'control-info' ),
			preGameContainer = document.getElementById( 'preGameContainer' ),
			prepareContainer = document.getElementById( 'prepareContainer' ),
			prepareText = document.getElementById( 'prepareText' );
		
		loadingBox.style.opacity = 0;
		
		controlInfo.style.opacity = 1;

		loadingContainer.style.background = 'rgba(0,0,0,0.8)';

		App.init();

		startContainer.style.opacity = 1;
		startContainer.style.zIndex = 10;
		startContainer.addEventListener( 'click', function(){
		
			App.generateSound('button');
			
			loadingContainer.style.background = 'rgba(0,0,0,0)';
			controlInfo.style.opacity = 0;
			startContainer.style.display = 'none';
								
			var dropTimer = setInterval(function(){
				if( App.leftAmount < App.initialItemCount ){
					App.dropToy( 1 );
				}else{
					clearInterval( dropTimer );
				}
				
				if( App.leftAmount >= 10 && prepareContainer.style.opacity != 1 ){
					prepareContainer.style.opacity = 1;
					var countdown = setInterval(function(){
						var number = parseInt(prepareText.textContent)-1;
						prepareText.textContent = number;
						if( prepareText.textContent <= 0 ){
							loadingContainer.style.opacity = 0;
							prepareText.textContent = 'GO';
							clearInterval( countdown );
							setTimeout( function(){
								preGameContainer.style.display = 'none';
								App.onAppStart();
							}, 1001 );				
						}
					}, 1000);
				}
			}, 300);
			
		}, false );
	
		
	},
	
	init: function(){
		// Scene
		this.scene.setGravity(new THREE.Vector3( 0, -250, 0 ));
		
		// Camera
		this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 10000 );
		this.camera.position.set( 0, 250, 1050 );
		this.camera.lookAt(new THREE.Vector3( 0, -50, 0 ));
		this.cameraTarget = new THREE.Object3D();
		this.cameraTarget.add( this.camera );
		
		this.scene.add( this.cameraTarget );
		
		this.clawcamera.rotation.x = -Math.PI/2;
		
		// Light
		
		var light = new THREE.PointLight(0xf0f0f0, 1);
		light.position.set(0, 2000, 0);
		this.scene.add( light );
		
		light = new THREE.PointLight(0xf0f0f0, 0.7);
		light.position.set(0, -600, 0);
		this.camera.add( light );		
		
		// Glass Container
		var CONTAINER_WIDTH = 600, CONTAINER_HEIGHT = 500, CONTAINER_DEPTH = 600;
		
		this.addEnviroment( CONTAINER_WIDTH*4, CONTAINER_HEIGHT*4, CONTAINER_DEPTH*4 );
		
		this.glasscontainer = this.addGlassContainer( CONTAINER_WIDTH, CONTAINER_HEIGHT, CONTAINER_DEPTH );		
		this.glasscontainer.rotation.x = -Math.PI/2;
		this.glasscontainer.position.y = -CONTAINER_HEIGHT/2;
		this.glasscontainer.receiveShadow = true;			
		this.glasscontainer.width = CONTAINER_WIDTH;
		this.glasscontainer.height = CONTAINER_HEIGHT;
		this.glasscontainer.depth = CONTAINER_DEPTH;
		this.glasscontainer.minX = -CONTAINER_WIDTH/2;
		this.glasscontainer.maxX = CONTAINER_WIDTH/2;
		this.glasscontainer.minZ = -CONTAINER_DEPTH/2;
		this.glasscontainer.maxZ = CONTAINER_DEPTH/2;
		this.scene.add( this.glasscontainer );
		
		// Claws (topRadius, bottomRadius, height, RadiusSegment, clawLength)
		var TOPRADIUS = 15, BOTTOMRADIUS = 20, CLAWHEIGHT = 15, RADIUSSEGMENT = 16, CLAWLENGTH = 40, CLAWFRONTLENGTH = 100;
		this.claw = this.addClaw( TOPRADIUS, BOTTOMRADIUS, CLAWHEIGHT, RADIUSSEGMENT, CLAWLENGTH, CLAWFRONTLENGTH );
		this.claw.position.set( -CONTAINER_WIDTH/2+this.MINDISTANCE_TO_CONTAINER*2, CONTAINER_HEIGHT/2-50, CONTAINER_DEPTH/2-this.MINDISTANCE_TO_CONTAINER*2 );
		//this.claw._physijs.collision_flags = 4;	// Set material insensitive to collision
		this.scene.add( this.claw );
		
		// Claw Limb
		for(var i=0;i<2;i++){			
			var limb = this.addClawLimb( CLAWLENGTH, CLAWFRONTLENGTH );
			limb.position.set( 1.2*BOTTOMRADIUS*Math.cos(2*Math.PI/2*i)+this.claw.position.x, this.claw.position.y, -1.2*BOTTOMRADIUS*Math.sin(2*Math.PI/2*i)+this.claw.position.z );
			limb.rotation.y = 2*Math.PI/2*i;
			this.scene.add(limb);
			
			// Constraint
			this.clawconstraints[i] = new Physijs.DOFConstraint(
				limb, 
				this.claw,
				new THREE.Vector3( 0.8*BOTTOMRADIUS*Math.cos(2*Math.PI/2*i)+this.claw.position.x, this.claw.position.y-10, -0.8*BOTTOMRADIUS*Math.sin(2*Math.PI/2*i)+this.claw.position.z ) // point in the scene to apply the constraint
			);
			this.scene.addConstraint( this.clawconstraints[i] );
			this.clawconstraints[i].setAngularLowerLimit( new THREE.Vector3( 0 ,0, 0 ) );
			this.clawconstraints[i].setAngularUpperLimit( new THREE.Vector3( 0 ,0, 0 ) );
		}
		
		// Top Car
		var topCarMaterial = new THREE.MeshPhongMaterial({color: 0x000000});
		this.TopCar = new Physijs.BoxMesh( new THREE.BoxGeometry(50,10,50), topCarMaterial, 90000000 );
		this.TopCar.position.set( this.claw.position.x, this.claw.position.y+50, this.claw.position.z );
		this.TopCar.targetPosition = this.TopCar.position.clone();
		this.TopCar.dropPosition = new THREE.Vector3(this.glasscontainer.minX+this.MINDISTANCE_TO_CONTAINER*2, this.TopCar.position.y, this.glasscontainer.maxZ-this.MINDISTANCE_TO_CONTAINER*2);

		this.scene.add( this.TopCar );
		
		// Top Car and Claw Base Constraint
		var AngleLimit = Math.PI/15;
		this.topcarconstraint = new Physijs.DOFConstraint(
			this.TopCar,
			this.claw, 
			new THREE.Vector3( this.TopCar.position.x, this.TopCar.position.y - 15, this.TopCar.position.z ) // point in the scene to apply the constraint
		);
		this.scene.addConstraint( this.topcarconstraint );
		this.topcarconstraint.setLinearLowerLimit( new THREE.Vector3( 0, 0, 0 ) ); 
		this.topcarconstraint.setLinearUpperLimit( new THREE.Vector3( 0, 0, 0 ) );
		this.topcarconstraint.setAngularLowerLimit( new THREE.Vector3( -AngleLimit , -AngleLimit, -AngleLimit ) );
		this.topcarconstraint.setAngularUpperLimit( new THREE.Vector3( AngleLimit, AngleLimit, AngleLimit ) );
		
		// Top Car and Ceiling Constraint
		this.topcarbaseconstraint = new Physijs.DOFConstraint(
			this.TopCar, 
			new THREE.Vector3( this.TopCar.position.x, this.TopCar.position.y+20, this.TopCar.position.z )
		);
		this.scene.addConstraint( this.topcarbaseconstraint );
		this.topcarbaseconstraint.setLinearLowerLimit( new THREE.Vector3( -CONTAINER_WIDTH*2, 0, -CONTAINER_DEPTH*2 ) ); 
		this.topcarbaseconstraint.setLinearUpperLimit( new THREE.Vector3( CONTAINER_WIDTH*2, 0, CONTAINER_DEPTH*2 ) );
		this.topcarbaseconstraint.setAngularLowerLimit( new THREE.Vector3( 0 ,0, 0 ) );
		this.topcarbaseconstraint.setAngularUpperLimit( new THREE.Vector3( 0 ,0, 0 ) );
		
		// Line Connection between Top Car and Claw
		var lineMaterial = new THREE.LineBasicMaterial({ color: 0x0f0f0f });

		this.LineGeometry = new THREE.Geometry();
		this.LineGeometry.vertices.push(
			this.TopCar.position,
			//this.TopCar.position.clone().add(this.TopCar.position.clone().sub( this.claw.position.clone() ).multiplyScalar(-0.5)),
			this.claw.position
		);

		var line = new THREE.Line( this.LineGeometry, lineMaterial );			
		this.scene.add( line );

		// WebGL Renderer
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		document.getElementById( 'container' ).appendChild( this.renderer.domElement );
		
		// Prize Setup
		this.setupPrizeContainer( 'prizeContainer', 'prizeCanvas' );
		
		// Close Container
		document.getElementById( 'PrizeButton' ).addEventListener( 'click', this.togglePrizeContainer, false );
		document.getElementById( 'viewPrizeButton' ).addEventListener( 'click', this.togglePrizeContainer, false);
		
		
		document.getElementById( 'restartButton' ).addEventListener( 'click', this.onAppRestart, false);
	
		// Dragging Event
		document.getElementById( 'container' ).addEventListener( 'mousedown', this.onMouseDownMain, false );
		document.getElementById( 'container' ).addEventListener( 'mouseup', this.onMouseMoveMain, false );
		document.getElementById( 'container' ).addEventListener( 'mouseup', this.onMouseUpMain, false );
		
		// Control Event
		document.getElementById( 'checkPrizeButton' ).addEventListener( 'click', this.togglePrizeContainer, false );
		document.getElementById( 'openWikiButton' ).addEventListener( 'click', this.toggleWikiPage, false );
	
		// Keyboard Event
		window.addEventListener( 'keydown', this.onKeyDown, false );

		// Window Resize Event
		window.addEventListener( 'resize', this.onWindowResize, false );
		
		requestAnimationFrame( this.render );
		this.scene.simulate();
	},
	
	toggleWikiPage: function(){
		var wikiContainer = document.getElementById( 'wikiContainer' );	
		var arrowSymbol = document.getElementById( 'arrowSymbol' );
		var wikiPage = document.getElementById( 'wikiPage' );

		wikiContainer.classList.toggle( 'open' );		
		arrowSymbol.innerHTML = wikiContainer.classList.contains( 'open' ) ? '&#x25B2' : '&#x25BC';
		wikiContainer.classList.contains( 'open' ) && ( wikiPage.src != App.currentPrizeToy.wiki_url ) ? (wikiPage.src = App.currentPrizeToy.wiki_url) : '';
		
	},
	
	onMouseDownMain: function( event ){
		App.isMainCanvasMouseDown = true;
		App.MainCanvasMouseDownLocation = {x: event.clientX, y: event.clientY};
	},
	
	onMouseMoveMain: function( event ){
		if( App.isMainCanvasMouseDown && !App.isCameraAnimating ){
			var tempZ = undefined;
			if( App.MainCanvasMouseDownLocation.x - event.clientX > 1){
				tempZ = App.cameraTarget.rotation.y + (Math.PI/2);				
			} else if( App.MainCanvasMouseDownLocation.x - event.clientX < -1 ){
				tempZ = App.cameraTarget.rotation.y - (Math.PI/2);		
			}
			if( tempZ !== undefined ){
				App.isMainCanvasMouseDown = false;
				new TWEEN.Tween( App.cameraTarget.rotation )
				.to({y: tempZ}, 200)
				.easing(TWEEN.Easing.Linear.None)
				.onStart(function(){ App.isCameraAnimating = true; })
				.onComplete(function(){ 
					App.isCameraAnimating = false; 
				})
				.start();
			}
		}
	},
	
	onMouseUpMain: function( event ){
		App.isMainCanvasMouseDown = false;
	},
	
	onMouseDown: function(event){
		if( App.isClawAnimating )
			return;
		if(this.id === 'moveright'){
			App.MouseDownInterval = setInterval(function(){
				App.onKeyDown({keyCode: 68});
			}, 200);
		}
	},
	
	onMouseUp: function(){
		clearInterval( App.MouseDownInterval );
	},
	
	dropToy: function( count ){
		var toysNameArray = Object.keys(App.toys);
		var itemCount = (count) ? count : 1;
		for(var i = 0; i < itemCount; i++){
			App.leftAmount++;
			App.generateToy( 1, App.toys[toysNameArray[Math.floor(Math.random()*toysNameArray.length)]], 'Box' );
		}
		
	},
	
	onViewButtonClick: function(){
	
		var viewtime = 2000;
		
		App.PackageMaterial.transparent = true;
	
		new TWEEN.Tween( App.PackageMaterial )
			.to({ opacity: 0.5 }, viewtime/2)
			.easing( TWEEN.Easing.Linear.None )
			.onComplete(function(){
				new TWEEN.Tween( App.PackageMaterial )
				.to({ opacity: 1 }, viewtime/2)
				.easing( TWEEN.Easing.Linear.None )
				.onComplete( function(){
					App.PackageMaterial.transparent = false;
				})
				.start();
			})
			.start();
		/*new TWEEN.Tween( App.PackageMaterial )
			.to({ opacity: 1 }, 6000)
			.delay( viewtime/2 )
			.easing( TWEEN.Easing.Linear.None )
			.onComplete( function(){
				App.PackageMaterial.transparent = false;
			})
			.start();*/
	
	},
	
	onKeyDown: function(event){
	
		if( App.isClawAnimating || App.status === 'Initial' || App.status === 'Pause' || App.status === 'End' )
			return;

		switch( event.keyCode ){
			case 39:
			case 68:	// Right
				App.onTopCarMove( App.MOVE_DISTANCE * Math.cos(-App.cameraTarget.rotation.y), App.MOVE_DISTANCE * Math.sin(-App.cameraTarget.rotation.y) );
				break;
			case 37:
			case 65:	// Left
				App.onTopCarMove( -App.MOVE_DISTANCE * Math.cos(-App.cameraTarget.rotation.y), -App.MOVE_DISTANCE * Math.sin(-App.cameraTarget.rotation.y) );
				break;
			case 40:
			case 83:	// Front
				App.onTopCarMove( App.MOVE_DISTANCE * Math.sin(App.cameraTarget.rotation.y), App.MOVE_DISTANCE * Math.cos(App.cameraTarget.rotation.y) );
				break;
			case 38:
			case 87:	// Back
				App.onTopCarMove( -App.MOVE_DISTANCE * Math.sin(App.cameraTarget.rotation.y), -App.MOVE_DISTANCE * Math.cos(App.cameraTarget.rotation.y) );
				break;
			case 32:	// Space (Catch)
				App.onCatch();
				break;
		}
			
	},
	isCarMoving: false,
	onTopCarMove: function(deltaX, deltaZ){
		
		if( App.isClawAnimating ){
			return
		}
		App.TopCar.targetPosition.set( App.TopCar.position.x + deltaX, App.TopCar.position.y, App.TopCar.position.z + deltaZ );
	},
	
	addEnviroment: function(width, height, depth){

		var envBox = new THREE.Mesh( new THREE.BoxGeometry(width,height,depth), new THREE.MeshLambertMaterial({color: 0xe3e3e3, side:THREE.DoubleSide, map: THREE.ImageUtils.loadTexture('img/bg.jpg')}) );
		envBox.position.y = height / 6;
		this.scene.add( envBox );
	},
	
	addEnivormentShelfs: function(){
		var benchWidth = 600, benchHeight = 10, benchDepth = 100;
		var bench = new THREE.Mesh( new THREE.BoxGeometry( benchWidth, benchHeight, benchDepth ), new THREE.MeshNormalMaterial() );	
		
	},
	
	addGlassContainer: function(width, height, depth){
	
		/*var BasePlaneMaterial = Physijs.createMaterial(
			new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture('img/grass.jpg') }),
			1.0, // high friction
			.5 // low restitution
		);
		BasePlaneMaterial.map.wrapS = BasePlaneMaterial.map.wrapT = THREE.RepeatWrapping;
		BasePlaneMaterial.map.repeat.set(4,4);*/
		
		var SidePlaneAppearanceGeometryX = new THREE.BoxGeometry(height, width, 10);
		var SidePlaneAppearanceGeometryZ = new THREE.BoxGeometry(width, height, 10);
		var SidePlaneAppearanceMaterial = new THREE.MeshPhongMaterial({color: 0xffffff, refractionRatio: 0.985, transparent: true, opacity: 0.3});
		var SidePlaneAppearanceMeshX = new THREE.Mesh( SidePlaneAppearanceGeometryX, SidePlaneAppearanceMaterial );
		var SidePlaneAppearanceMeshZ = new THREE.Mesh( SidePlaneAppearanceGeometryZ, SidePlaneAppearanceMaterial );
		
		var SidePlaneMaterial = Physijs.createMaterial(
			//new THREE.MeshNormalMaterial({transparent: true, opacity: 0.8}),
			new THREE.MeshBasicMaterial({transparent: true, opacity: 0}),
			.3, // high friction
			.1 // low restitution
		);
		
		var BasePlane = new Physijs.BoxMesh( new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color:0x000000}), 0 );
		
		var SidePlaneNegX =  new Physijs.PlaneMesh( new THREE.PlaneGeometry(height, depth), SidePlaneMaterial, 0 );	SidePlaneNegX.rotation.y = Math.PI/2; SidePlaneNegX.position.set(-width/2, 0, height/2);
		var SidePlanePosX =  new Physijs.PlaneMesh( new THREE.PlaneGeometry(height, depth), SidePlaneMaterial, 0 );	SidePlanePosX.rotation.y = -Math.PI/2; SidePlanePosX.position.set(width/2, 0, height/2);
		var SidePlaneNegZ =  new Physijs.PlaneMesh( new THREE.PlaneGeometry(width, height), SidePlaneMaterial, 0 );	SidePlaneNegZ.rotation.x = Math.PI/2; SidePlaneNegZ.position.set(0, depth/2, height/2);
		var SidePlanePosZ =  new Physijs.PlaneMesh( new THREE.PlaneGeometry(width, height), SidePlaneMaterial, 0 );	SidePlanePosZ.rotation.x = -Math.PI/2; SidePlanePosZ.position.set(0, -depth/2, height/2);
		var SidePlanePosY =  new Physijs.PlaneMesh( new THREE.PlaneGeometry(width, depth), SidePlaneMaterial, 0 ); SidePlanePosY.rotation.x =  -Math.PI; SidePlanePosY.position.set(0, 0, height+100);

		SidePlaneNegX.add(SidePlaneAppearanceMeshX.clone());
		SidePlanePosX.add(SidePlaneAppearanceMeshX.clone());
		SidePlaneNegZ.add(SidePlaneAppearanceMeshZ.clone());
		SidePlanePosZ.add(SidePlaneAppearanceMeshZ.clone());
		
		
		BasePlane.add(SidePlaneNegX);
		BasePlane.add(SidePlanePosX);
		BasePlane.add(SidePlaneNegZ);
		BasePlane.add(SidePlanePosZ);
		BasePlane.add(SidePlanePosY);
		
		// Destination Box
		var DestWidth = 200, DestHeight = 100;
		var DestinationBoxBack = new Physijs.BoxMesh( new THREE.BoxGeometry(DestWidth, 1, DestHeight), SidePlaneAppearanceMaterial, 0 ); DestinationBoxBack.position.set(-width/2+DestWidth/2, -depth/2+DestWidth, DestHeight/2);
		var DestinationBoxRight = new Physijs.BoxMesh( new THREE.BoxGeometry( 1, DestWidth, DestHeight ), SidePlaneAppearanceMaterial, 0 ); DestinationBoxRight.position.set(-width/2+DestWidth, -depth/2+DestWidth/2, DestHeight/2);
		var DestinationBoxBottom = new Physijs.BoxMesh(new THREE.BoxGeometry(DestWidth-5, 0.1, DestWidth-5), new THREE.MeshBasicMaterial({color: 0xff0000}), 0); DestinationBoxBottom.position.set(-width/2+DestWidth/2, -height/2-200, depth/2-DestWidth/2);
		var DestinationBoxBottomLook = new THREE.Mesh(new THREE.PlaneGeometry(DestWidth,DestWidth), new THREE.MeshBasicMaterial({color: 0x000000})); DestinationBoxBottomLook.position.set(-width/2+DestWidth/2, -depth/2+DestWidth/2, 0.2);
		
		BasePlane.add(DestinationBoxBack);
		BasePlane.add(DestinationBoxRight);
		
		DestinationBoxBottom.addEventListener( 'collision', this.onItemCollision );
		this.scene.add(DestinationBoxBottom);
		
		//BasePlane.add(DestinationBoxBottomLook);
		
		// Create Real Floor
		var BaseSolidPlane1 = new Physijs.BoxMesh( new THREE.BoxGeometry(width, depth-DestWidth, 1), new THREE.MeshBasicMaterial({color:0xE0E0E0}), 0 );
		BaseSolidPlane1.position.set( 0, DestWidth/2, 0 );
		var BaseSolidPlane2 = new Physijs.BoxMesh( new THREE.BoxGeometry(width-DestWidth, DestWidth, 1), new THREE.MeshBasicMaterial({color:0xE0E0E0}), 0 );
		BaseSolidPlane2.position.set( DestWidth/2, (-depth+DestWidth)/2, 0 );
		
		BasePlane.add( BaseSolidPlane1 );
		BasePlane.add( BaseSolidPlane2 );
		
		// Create Bottom Container
		var BottomContainerMaterials = [
			new THREE.MeshLambertMaterial({color:0xf0f0f0, ambient: 0xffffff, shininess: 50, shading: THREE.SmoothShading, side: THREE.DoubleSide, map: THREE.ImageUtils.loadTexture('img/cartoonbear.jpg')}),
			new THREE.MeshLambertMaterial({color:0xf0f0f0, ambient: 0xffffff, shininess: 50, shading: THREE.SmoothShading, side: THREE.DoubleSide, map: THREE.ImageUtils.loadTexture('img/pikachu.jpg')}),
			new THREE.MeshLambertMaterial({color:0xf0f0f0, ambient: 0xffffff, shininess: 50, shading: THREE.SmoothShading, side: THREE.DoubleSide, map: THREE.ImageUtils.loadTexture('img/yellowbird.jpg')}),
			new THREE.MeshLambertMaterial({color:0xf0f0f0, ambient: 0xffffff, shininess: 50, shading: THREE.SmoothShading, side: THREE.DoubleSide, map: THREE.ImageUtils.loadTexture('img/minion.png')}),
			new THREE.MeshBasicMaterial({transparent: true, opacity: 0}),
			new THREE.MeshBasicMaterial({transparent: true, opacity: 0})
		];
		var BoxHeight = 300;
		var BottomContainer = new THREE.Mesh( new THREE.BoxGeometry( width, depth, BoxHeight), new THREE.MeshFaceMaterial(BottomContainerMaterials));
		BottomContainer.position.set( 0, 0, -BoxHeight/2 );
		BasePlane.add( BottomContainer );
		
		// Create Top Container
		this.containerTopBoxTextureX = THREE.ImageUtils.loadTexture('img/stripescolor.png');
		this.containerTopBoxTextureX.wrapT = THREE.RepeatWrapping;
		this.containerTopBoxTextureX.wrapS = THREE.RepeatWrapping;
		this.containerTopBoxTextureX.repeat.set(1, 5);
		this.containerTopBoxTextureZ = THREE.ImageUtils.loadTexture('img/stripescolor.png');
		this.containerTopBoxTextureZ.wrapT = THREE.RepeatWrapping;
		this.containerTopBoxTextureZ.wrapS = THREE.RepeatWrapping;
		this.containerTopBoxTextureZ.repeat.set(5, 1);
		var TopContainerMaterials = [
			new THREE.MeshLambertMaterial({map: this.containerTopBoxTextureX, color:0xcfa149, shininess: 50, shading: THREE.SmoothShading}),
			new THREE.MeshLambertMaterial({map: this.containerTopBoxTextureX, color:0xfacd3c, shininess: 50, shading: THREE.SmoothShading}),
			new THREE.MeshLambertMaterial({map: this.containerTopBoxTextureZ, color:0xf0db20, shininess: 50, shading: THREE.SmoothShading}),
			new THREE.MeshLambertMaterial({map: this.containerTopBoxTextureZ, color:0xfbde62, shininess: 50, shading: THREE.SmoothShading}),
			new THREE.MeshBasicMaterial({transparent: true, opacity: 0}),
			new THREE.MeshBasicMaterial({transparent: true, opacity: 0})
		];
		BoxHeight = 100;
		var TopContainer = new THREE.Mesh( new THREE.BoxGeometry( width, depth, BoxHeight ), new THREE.MeshFaceMaterial( TopContainerMaterials ));
		TopContainer.position.set( 0, 0, height+BoxHeight/2 );
		BasePlane.add( TopContainer );

		return BasePlane;
	},
	
	onItemCollision: function( other_object, relative_velocity, relative_rotation, contact_normal ){
		if( other_object.category && other_object.category === 'claw' ){
			return;
		} else{
		
			if( App.status === 'Initial' ){
				return;
			}
			
			App.generateSound('prize');
		
			// Remove caught item
			App.scene.remove(other_object);
			
			// Update current prize
			var modelName = other_object.children[0].name;
			App.currentPrizeToy = App.prizeToys[ modelName ];
			
			if( App.prizePlaceHolder[ modelName ] ){
				App.prizePlaceHolder[ modelName ].visible = false;
			}
			App.currentPrizeToy.visible = true;
			
			// Add prize count 
			App.currentPrizeToy.count++;
			
			// Updates
			App.updateToyAmount();
			
			App.score += App.perToyScore;

			// for top container box texture animation
			App.isCaptured = true;
			setTimeout(function(){
				App.isCaptured = false;
			}, 3000);
			
			// Return if catched before
			/*if( App.toys[ modelName ].isCatched ){
				return;
			}*/
			
			// Flag the model has been catched
			App.toys[ modelName ].isCatched = true;
			
			// Open the prize container
			App.togglePrizeContainer( true );
			
			// Tween camera to the prize
			new TWEEN.Tween( App.prizecamera.position )
			.to({x: App.currentPrizeToy.position.x}, 3000)
			.easing( TWEEN.Easing.Exponential.Out )
			.start();
			
		}
	},
	
	generateToy: function( number, toyType, packageType ){
	
		for ( var i = 0; i < number; i++ ) {

			// Create Outer Package for Physics Simulation 
			var OutterPackage = this.generatePackage( packageType, toyType );
			
			// Load Toy Model binded to each package
			if( !toyType || !toyType.model ){
				console.log(toyType, toyType.model);
			}
			OutterPackage.add( toyType.model.clone() );
			
			var OutterPackagePositionX = (Math.random()-0.5) * (this.glasscontainer.width - 200),
				OutterPackagePositionY = -170,
				OutterPackagePositionZ = (Math.random()-0.5) * (this.glasscontainer.depth - 200);
				
			if( OutterPackagePositionX < -this.glasscontainer.width/2 + 200 ) OutterPackagePositionX = -this.glasscontainer.width/2 + 200;
			if( OutterPackagePositionZ > this.glasscontainer.depth/2 - 200 )OutterPackagePositionZ = this.glasscontainer.depth/2 - 200;
			
			// Randomize Toy Position/Rotation
			OutterPackage.position.set(
				OutterPackagePositionX,
				OutterPackagePositionY,
				OutterPackagePositionZ
			);			
			
			this.toysArray.push( OutterPackage );
			this.scene.add( OutterPackage );
		}
	},
	
	getPackageMaterial: function(toytype, axis){
		var material;
		var texture = new THREE.ImageUtils.loadTexture('img/question.png'); 			
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.anisotropy = 16;
		
		var scale = 2;
		
		switch(axis){
		case 'x':
			texture.repeat.set( toytype.boundingBox.depth/toytype.boundingBox.height/scale, 1/scale );
			break;
		case 'y':
			texture.repeat.set( 1/scale, toytype.boundingBox.depth/toytype.boundingBox.width/scale );
			break;
		case 'z':
			texture.repeat.set( toytype.boundingBox.width/toytype.boundingBox.height/scale, 1/scale );
			break;
		}
		
		material = new THREE.MeshLambertMaterial({color: 0xffffff, map: texture });
		
		return material;
	},
	
	generatePackage: function(type, toytype){
		
		var PackageMaterials = [
			this.getPackageMaterial(toytype, 'x'),
			this.getPackageMaterial(toytype, 'x'),
			this.getPackageMaterial(toytype, 'y'),
			this.getPackageMaterial(toytype, 'y'),
			this.getPackageMaterial(toytype, 'z'),
			this.getPackageMaterial(toytype, 'z')
		];

		var PackageMaterial = new THREE.MeshFaceMaterial( PackageMaterials );
		
		var objectMesh;

		// Create Package Physijs Mesh
		switch( type ){
		case 'Box':
			objectMesh = new Physijs.BoxMesh( 
				new THREE.BoxGeometry( toytype.boundingBox.width, toytype.boundingBox.height, toytype.boundingBox.depth ), 
				PackageMaterial,
				300
			);
			break;
		case 'Sphere':
			objectMesh = new Physijs.SphereMesh( 
				new THREE.SphereGeometry( toytype.boundingBox.width/2, 6, 6 ), 
				PackageMaterial,
				300
			);
			break;
		}
		
		return objectMesh;
	},

	addClaw: function(topRadius, bottomRadius, height, radiusSegment, clawLength, clawfrontLength){
	
		// Claw Base
		var baseFoundation = new Physijs.BoxMesh( 
			new THREE.CylinderGeometry( bottomRadius*1.5, bottomRadius*1.5, height, radiusSegment ), 
			new THREE.MeshBasicMaterial(),
			10000
		); 
		
		var baseFoundationAppearance = new THREE.Mesh( 
			new THREE.CylinderGeometry( bottomRadius*2, bottomRadius*2, height*2, radiusSegment ), 
			new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture('img/clawmaterial.jpg')})
		); 

		baseFoundation.add( baseFoundationAppearance );
		baseFoundation.claws = [];
		
		return baseFoundation;
	},

	addClawLimb: function(clawLength, clawfrontLength){
	
		// Claw Material
		var ClawLimbMaterial = Physijs.createMaterial(
			new THREE.MeshPhongMaterial({map: THREE.ImageUtils.loadTexture('img/clawmaterial.jpg')}),
			1.0, 
			.0
		);

		// Claw Components 
		var ClawArm = new Physijs.CylinderMesh( 
			new THREE.CylinderGeometry( 10, 50, clawLength-5, 2 ), 
			ClawLimbMaterial,
			400
		); 

		var ClawLimb = new Physijs.BoxMesh( 
			new THREE.BoxGeometry( 100, clawfrontLength, 5 ), 
			ClawLimbMaterial,
			200
		); 
		var ClawNail = new Physijs.BoxMesh( 
			new THREE.BoxGeometry( 100, 4, 10 ), 
			ClawLimbMaterial,
			200
		); 
		var ClawJoint = new THREE.Mesh( 
			new THREE.SphereGeometry( 5/2, 8, 4 ), 
			ClawLimbMaterial
		); 
		
		ClawNail.category = 'claw';
		ClawNail.position.set(-3/2,-clawfrontLength/2,-5);
		
		ClawLimb.category = 'claw';
		ClawLimb.add(ClawNail);
		ClawLimb.position.set( -clawfrontLength/2, -clawLength/2, 0 );
		ClawLimb.rotation.set( Math.PI/2, 0, -Math.PI/2 );
		
		ClawJoint.position.set( 0, -clawLength/2, 0 );
		
		ClawArm.category = 'claw';
		ClawArm.add(ClawLimb);
		ClawArm.add(ClawJoint);
		ClawArm.position.z = 5;
		ClawArm.rotation.z = Math.PI/1.5;

		return ClawArm;
	},
	
	onCatch: function(){
	
		if( App.isClawAnimating )
			return;
	
		var dropDelta = new THREE.Vector3(0,0,0);;
		new TWEEN.Tween(dropDelta)
		.to({y: -App.DROPDISTANCE}, 1800)
		.easing(TWEEN.Easing.Cubic.Out)
		.onStart(function(){
			App.onClawRelease();
			App.isClawAnimating = true;
		})
		.onUpdate(function(){
			App.topcarconstraint.setLinearLowerLimit( this ); 
		})
		.start();
		
		new TWEEN.Tween()
		.to({}, 1900)
		.onStart(function(){
			var descendingSound = new Audio("sound/down.mp3");
			descendingSound.volume = 0.2;
			descendingSound.play();
		})
		.onComplete(function(){
			App.onClawCatch();
			setTimeout(function(){
				App.onRetrive(true);
			}, 1000);
		})
		.start();
		
	},
	
	onRetrive:function(isAuto){
	
		if( !isAuto )
			return;
	
		var elevateDelta = new THREE.Vector3(0,-App.DROPDISTANCE,0);;
		new TWEEN.Tween(elevateDelta)
		.to({y: 0}, 2500)
		.easing(TWEEN.Easing.Linear.None)
		.onUpdate(function(){
			App.topcarconstraint.setLinearLowerLimit( this ); 
		})
		.onComplete(function(){
			App.onBringToDropZone();
		})
		.start();
		
		new TWEEN.Tween()
		.to({}, 500)
		.onComplete(function(){
			var ascendingSound = new Audio("sound/up.mp3");
			ascendingSound.volume = 0.2;
			ascendingSound.play();
		})
		.start();
	},
	
	onBringToDropZone: function(){
		new TWEEN.Tween(App.TopCar.position)
		.to({x: App.TopCar.dropPosition.x, z: App.TopCar.dropPosition.z}, 2000)
		.easing( TWEEN.Easing.Linear.None )
		.onUpdate(function(){
			App.TopCar.__dirtyPosition = true;
		})
		.onComplete(function(){
			App.TopCar.targetPosition = App.TopCar.position.clone();
			setTimeout(function(){
				App.onClawRelease();
				App.isClawAnimating = false;
			}, 200);
		})
		.start();
	},
	
	onClawCatch: function(){
		var clawRotate = Math.PI / 4;
		App.clawconstraints[0].configureAngularMotor( 2, -clawRotate, 0, -2, 1000000 ); 
		App.clawconstraints[0].enableAngularMotor( 2 );
		App.clawconstraints[1].configureAngularMotor( 2, 0, clawRotate, 2, 1000000 ); 
		App.clawconstraints[1].enableAngularMotor( 2 );
	},
	
	onClawRelease: function(){
		App.clawconstraints[0].setAngularLowerLimit( new THREE.Vector3( 0 ,0, 0 ) );
		App.clawconstraints[0].setAngularUpperLimit( new THREE.Vector3( 0 ,0, 0 ) );
		App.clawconstraints[0].disableAngularMotor( 2 );
		App.clawconstraints[1].setAngularLowerLimit( new THREE.Vector3( 0 ,0, 0 ) );
		App.clawconstraints[1].setAngularUpperLimit( new THREE.Vector3( 0 ,0, 0 ) );
		App.clawconstraints[1].disableAngularMotor( 2 );
	},
	
	onWindowResize: function() {

		App.camera.aspect = window.innerWidth / window.innerHeight;
		App.camera.updateProjectionMatrix();

		App.renderer.setSize( window.innerWidth, window.innerHeight );

	},

	render: function(){
	
		TWEEN.update();
		
		// Capture Animation
		if( App.isCaptured ){
			App.containerTopBoxTextureX.offset.y += 0.03;
			App.containerTopBoxTextureZ.offset.x -= 0.03;
		}
		
		// Update Line Vertice
		App.LineGeometry.verticesNeedUpdate = true;
		
		// Update Claw Position
		if( App.TopCar.targetPosition && !App.isClawAnimating ){
		
			App.TopCar.position.x += ( App.TopCar.targetPosition.x - App.TopCar.position.x ) * 0.05;
			App.TopCar.position.z += ( App.TopCar.targetPosition.z - App.TopCar.position.z ) * 0.05;
			App.TopCar.__dirtyPosition = true;
		
			if(parseFloat(App.TopCar.position.x-App.MINDISTANCE_TO_CONTAINER) < App.glasscontainer.minX) {App.TopCar.position.x = App.glasscontainer.minX+App.MINDISTANCE_TO_CONTAINER; App.TopCar.__dirtyPosition = true; }
			if(parseFloat(App.TopCar.position.x+App.MINDISTANCE_TO_CONTAINER) > App.glasscontainer.maxX) {App.TopCar.position.x = App.glasscontainer.maxX-App.MINDISTANCE_TO_CONTAINER; App.TopCar.__dirtyPosition = true; }
			if(parseFloat(App.TopCar.position.z-App.MINDISTANCE_TO_CONTAINER) < App.glasscontainer.minZ) {App.TopCar.position.z = App.glasscontainer.minZ+App.MINDISTANCE_TO_CONTAINER; App.TopCar.__dirtyPosition = true; }
			if(parseFloat(App.TopCar.position.z+App.MINDISTANCE_TO_CONTAINER) > App.glasscontainer.maxZ) {App.TopCar.position.z = App.glasscontainer.maxZ-App.MINDISTANCE_TO_CONTAINER; App.TopCar.__dirtyPosition = true; }

		}
		
		App.scene.simulate( undefined, 1 ); 
	
		App.renderer.render( App.scene, App.camera); 
		
		/*App.clawcamera.position.copy( App.claw.position );
		App.clawcamera.position.y += 50;
		App.renderer.render( App.scene, App.clawcamera); */
		
		if( !document.getElementById('prizeContainer').classList.contains('close') ){
			if( App.currentPrizeToy ){
				if( App.prizePlaceHolder[ App.currentPrizeToy.name ].visible ){
					var deltaRotation = ( App.currentPrizeToy.currentPrizeToyTargetRotation - App.prizePlaceHolder[ App.currentPrizeToy.name ].rotation.y ) * 0.05;
					App.prizePlaceHolder[ App.currentPrizeToy.name ].rotation.y += deltaRotation;
				}
				if( App.currentPrizeToy.visible ){
					var deltaRotation = ( App.currentPrizeToy.currentPrizeToyTargetRotation - App.currentPrizeToy.rotation.y ) * 0.05;
					App.currentPrizeToy.rotation.y += deltaRotation;
				}
			}
			App.prizerenderer.render( App.prizescene, App.prizecamera );
		}
		
		requestAnimationFrame( App.render );
	},
	
	setupPrizeContainer: function( containerId, canvasId ){
	
		var prizeContainer = document.getElementById( containerId );
		var prizeCanvas = document.getElementById( canvasId );

		// Scene
		//this.prizescene = new THREE.Scene();
		
		// Camera
		this.prizecamera = new THREE.PerspectiveCamera( 40, prizeCanvas.clientWidth / prizeCanvas.clientHeight, 0.1, 10000 );
		this.prizecamera.position.set( 0, 0, 200 );
		this.prizescene.add( this.prizecamera );
		
		// Light
		var pointLight = new THREE.PointLight( 0xffffff, 0.2 );
		pointLight.position.set( 0, 0, 300 );
		pointLight.name = 'light';
		this.prizescene.add( pointLight );
		
		var dirLight = new THREE.DirectionalLight( 0xffffff, 0.825 );
		dirLight.position.set( 1, 1, 1 ).normalize();
		dirLight.name = 'light';
		this.prizescene.add( dirLight );
		
		dirLight = new THREE.DirectionalLight( 0xffffff, 0.825 );
		dirLight.position.set( -1, -1, -1 ).normalize();
		dirLight.name = 'light';
		this.prizescene.add( dirLight );		
		
		// Prize Renderer		
		this.prizerenderer = new THREE.WebGLRenderer({alpha: true});
		this.prizerenderer.setClearColor( 0x000000, 0 );
		this.prizerenderer.setSize( prizeCanvas.clientWidth, prizeCanvas.clientHeight );
		prizeCanvas.appendChild( this.prizerenderer.domElement );
		
		// Load 3d models
		this.loadPrizes();
		
		// Set up events
		document.getElementsByClassName( 'PrizeArrow right' )[0].addEventListener( 'click', onArrowRight, false );
		document.getElementsByClassName( 'PrizeArrow left' )[0].addEventListener( 'click', onArrowLeft, false );
		
		function onArrowRight(){
			var ToyNameArray = Object.keys(App.toys);
			if( ToyNameArray.length <= ToyNameArray.indexOf(App.currentPrizeToy.name) + 1 ){
				return;
			}
			
			App.currentPrizeToy = App.prizeToys[ ToyNameArray[ ToyNameArray.indexOf(App.currentPrizeToy.name) + 1 ] ];
			TweenPrizeCamera( 1000 );
		}
		
		function onArrowLeft(){
			var ToyNameArray = Object.keys(App.toys);
			if( ToyNameArray.indexOf(App.currentPrizeToy.name) === 0 ){
				arrowLeftButton.classList.add( 'hide' );
				return;
			}
			
			App.currentPrizeToy = App.prizeToys[ ToyNameArray[ ToyNameArray.indexOf(App.currentPrizeToy.name) - 1 ] ];
			TweenPrizeCamera( 1000 );
		}
		
		function TweenPrizeCamera( time, targetPrizeToy ){
		
			App.updateArrowUI();
			App.updateTextUI();
			App.updatePagination();
		
			var target = targetPrizeToy ? targetPrizeToy : App.currentPrizeToy;
		
			new TWEEN.Tween( App.prizecamera.position )
			.to({x: target.position.x}, time)
			.easing( TWEEN.Easing.Elastic.Out )
			.start();
		}
		
		// Setup pagination
		for( var model in this.prizeToys ){
			var pageContainer = document.getElementById( 'pageContainer' );
			var pageDot = document.createElement( 'div' );
			pageDot.classList.add( 'pageDot' );
			pageDot.name = model;
			pageDot.addEventListener( 'click', function(){	
				App.currentPrizeToy = App.prizeToys[ this.name ];
				TweenPrizeCamera( 1000, App.currentPrizeToy );
			}, false );
			pageContainer.appendChild( pageDot );
		}
		
		prizeCanvas.addEventListener( 'mousedown', onDocumentMouseDown, false );

		var mouseX = 0;
		var mouseXOnMouseDown = 0;
		var targetRotationOnMouseDown = 0;
		
		function onDocumentMouseDown( event ) {

			event.preventDefault();

			document.addEventListener( 'mousemove', onDocumentMouseMove, false );
			document.addEventListener( 'mouseup', onDocumentMouseUp, false );
			document.addEventListener( 'mouseout', onDocumentMouseOut, false );
			
			mouseXOnMouseDown = event.clientX - ( window.innerWidth / 2 + prizeCanvas.clientWidth / 2 );
			if( App.currentPrizeToy ){
				targetRotationOnMouseDown = App.currentPrizeToy.currentPrizeToyTargetRotation;
			}

		}

		function onDocumentMouseMove( event ) {

			mouseX = event.clientX - ( window.innerWidth / 2 + prizeCanvas.clientWidth / 2 );

			App.currentPrizeToy.currentPrizeToyTargetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;

		}

		function onDocumentMouseUp( event ) {

			document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
			document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
			document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

		}

		function onDocumentMouseOut( event ) {

			document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
			document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
			document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

		}
		
	},
	
	generateSound: function(soundName){
		var audio;
		switch(soundName){
		case 'button':
			audio = document.getElementById('buttonSound');
			break;
		case 'prize':
			audio = document.getElementById('prizeSound');
			break;
		}
		audio.play();
	},
	
	updateArrowUI: function(){
		var ToyNameArray = Object.keys(App.toys);
		var arrowRightButton = document.getElementsByClassName( 'PrizeArrow right' )[0];
		var arrowLeftButton = document.getElementsByClassName( 'PrizeArrow left' )[0];
		
		arrowRightButton.classList.remove( 'hide' );
		arrowLeftButton.classList.remove( 'hide' );
		
		if( ToyNameArray.indexOf(App.currentPrizeToy.name) >= ToyNameArray.length - 1 ){
			arrowRightButton.classList.add( 'hide' );
		}
			
		if( ToyNameArray.indexOf(App.currentPrizeToy.name) <= 0 ){
			arrowLeftButton.classList.add( 'hide' );
		}
		
	},
	
	updateTextUI: function(){
		var textContainer = document.getElementById( 'textContainer' );
		var wikiContainer = document.getElementById( 'wikiContainer' );	
		var textName = document.getElementById('openWikiButton');
		var arrowSymbol = document.getElementById('arrowSymbol');
		var textCount = textContainer.getElementsByClassName( 'text count' )[0];
		var textMultiply = textContainer.getElementsByClassName( 'text multiply' )[0];
		
		wikiContainer.classList.remove( 'open' );
		
		if( App.currentPrizeToy && App.currentPrizeToy.count > 0 ){			
			arrowSymbol.innerHTML = wikiContainer.classList.contains( 'open' ) ? '&#x25B2' : '&#x25BC';
			textName.style.display = 'block';
			textName.textContent = App.currentPrizeToy.name;
			textCount.textContent = App.currentPrizeToy.count;
			textMultiply.textContent = 'X';
			textContainer.classList.add( 'show' );
		} else {
			textName.style.display = 'none';
			textName.textContent = '';
			textCount.textContent = '';
			textMultiply.textContent = '';
			textContainer.classList.remove( 'show' );
		}
	},
	
	updatePagination: function(){
		var pages = document.getElementsByClassName('pageDot');
		for( var i = 0; i < pages.length; i++ ){
			
			if( pages[i].classList.contains( 'active' ) ){
				pages[i].classList.remove( 'active' );
			}			
			if( pages[i].name === App.currentPrizeToy.name){
				pages[i].classList.add( 'active' );
				if( !pages[i].classList.contains('acquired') && App.currentPrizeToy.count > 0){
					pages[i].classList.add('acquired');
				}
			}
		}
	},
	
	updateToyAmount: function(){
		App.leftAmount--;
	},
	
	loadPrizes: function(){
	
		// Load Question Mark
		var loader = new THREE.ColladaLoader();
		loader.options.convertUpAxis = true;
		loader.load( 'model/question.dae', function ( collada ) {
			for( var model in App.toys ){
				var placeholder = collada.scene.clone();
				placeholder.position.x = App.toys[model].element_position.x;
				placeholder.position.y = -80;
				placeholder.scale.multiplyScalar(40);
				var questionMarkMaterial = new THREE.MeshLambertMaterial({color:0xf0f0f0});
				placeholder.traverse(function(node){
					if( node.material ){
						node.material = questionMarkMaterial;
					}
				});
				
				App.prizePlaceHolder[ model ] = placeholder;
				App.prizescene.add( placeholder );
			}				
		});
	},
	
	togglePrizeContainer: function( openOnly ){
	
		openOnly === true ? '' : App.generateSound('button');
	
		var prizeContainer = document.getElementById( 'prizeContainer' ),
			checkPrizeButton = document.getElementById( 'checkPrizeButton' );
	
		if( openOnly === true ){
			prizeContainer.classList.remove( 'close' );
		} else {
			prizeContainer.classList.toggle( 'close' );
			
			if( prizeContainer.classList.contains('close') && App.leftAmount < parseInt(App.initialItemCount*2/3) ){
				App.dropToy( parseInt(App.initialItemCount/3) );
			}
		}
		
		if( App.status === 'End' ){
			var GameOverMenu = document.getElementById( 'GameOverMenu' );
			if( !prizeContainer.classList.contains('close') ){
				GameOverMenu.classList.remove( 'open' );
				checkPrizeButton.style.opacity = 0;
			} else {
				GameOverMenu.classList.add( 'open' );
				checkPrizeButton.style.opacity = 1;
			}
			return;
		}
		
		if( !prizeContainer.classList.contains('close') ){
			App.onAppPause();
			checkPrizeButton.style.opacity = 0;
		} else{
			App.onAppResume();
			checkPrizeButton.style.opacity = 1;
		}
		
		App.updateArrowUI();
		App.updateTextUI();
		App.updatePagination();
	}
	
};

window.onload = App.preloadAssets();

window.console = {};
window.console.error = window.console.log = window.console.warn = function(){};