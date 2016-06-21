var loadingManager = {

	game: undefined,

	totalAssets: 0,

	loadedAssets: 0,

	splashElement: document.getElementById('splash'),

	loadingBoxElement: document.getElementById('loadingBox'),

	loadingBarElement: document.getElementById('loadingBar'),

	gameContainerElement: document.getElementById('game-container'),

	canvasContainerElement: document.getElementById('container'),

	gameLogoElement: document.getElementById('game-logo'),

	gameTitleElement: document.getElementById('game-title'),

	gameSubTitleElement: document.getElementById('game-subtitle'),

	diamondSwappingRight: document.getElementById('diamondSwappingRight'),

	arrowRight: document.getElementById('arrowRight'),

	diamondSwappingLeft: document.getElementById('diamondSwappingLeft'),

	tutorialDiamonds: document.getElementsByClassName('tutorial-diamond'),

	gameCompleteElement: document.getElementById('postgame-container'),

	replayButtonElement: document.getElementById('playagain-button'),

	ScoreElement: document.getElementById('your-score'),

	bestScoreElement: document.getElementById('best-score'),

	statsScoreElements: document.getElementsByClassName('stats-score'),

	setGame: function( game ){
		this.game = game;
	},

	addTotalAsset: function(){
		this.totalAssets++;
	},

	addLoadedAsset: function(){
		this.loadedAssets++;
		this.loadingBarElement.style. width= this.showProgress() + '%';

		if( this.showProgress() >= 100 ){
			this.onLoad();
		}
	},

	showProgress: function(){
		this.percentage = this.loadedAssets / this.totalAssets * 100;
		return this.percentage;
	},

	onLoad: function(){
		this.gameContainerElement.style.display = 'block';
		this.loadingBoxElement.style.height = '50px';

		this.gameLogoElement.classList.add('moveLeft');
		this.gameTitleElement.classList.add('moveLeft');
		this.gameSubTitleElement.classList.add('moveLeft');

		this.diamondSwappingRight.classList.add('active');
		this.diamondSwappingLeft.classList.add('active');
		this.arrowRight.classList.add('active');

		var diamonds = this.tutorialDiamonds;

		setTimeout(function(){
			for(var i = 0; i < diamonds.length; i++){
				if( i === 2 ){
					diamonds[i].classList.add('oneSecDelay');
					diamonds[i].classList.remove('active');
					diamonds[i].classList.add('swing');
					
				} else {
					diamonds[i].classList.add('fadeOut');
					diamonds[i].classList.add('noDelay');
				}
				
			}
		}, 5000);
		
	},

	init: function(){

		var loadingmanager = this;

		var diamonds = this.tutorialDiamonds;

		// Game Start Button Event
		this.loadingBoxElement.addEventListener( 'click', function(){
			loadingmanager.splashElement.style.opacity = 0;
			diamonds[2].classList.remove('swing');
			setTimeout(function(){
				loadingmanager.splashElement.style.display = 'none';
			},500);

			var panorama, viewer;
			panorama = new PANOLENS.ImagePanorama( 'images/nebula2.png' );
			viewer = new PANOLENS.Viewer( { container: loadingmanager.canvasContainerElement } );
			viewer.add( panorama );

			window.panorama = panorama;
			window.viewer = viewer;

			Game = Game || {};

			Game.scene = viewer.getScene();
			Game.camera = viewer.getCamera();
			Game.camera.fov = 90;
			Game.camera.updateProjectionMatrix();
			Game.container = loadingmanager.canvasContainerElement;
			Game.TARGET_DISTANCE = 100;

			Game.init && Game.init();

		}, false );

		// Game Replay Button Event
		this.replayButtonElement.addEventListener( 'click', function(){
			loadingmanager.game.restart();
			loadingmanager.gameCompleteElement.style.opacity = 0;
			loadingmanager.gameCompleteElement.style.zIndex = -1;
			for( var i = 0; i < loadingmanager.statsScoreElements.length; i++ ){
				loadingmanager.statsScoreElements[i].style.opacity = 0;
			}

		}, false );
	},

	onGameComplete: function(){

		var score, bestscore;

		score = parseInt(this.game.score.total);
		bestscore = (localStorage && localStorage.getItem('bestscore')) 
			? localStorage.getItem('bestscore')
			: score;

		if(score >= bestscore){
			localStorage && localStorage.setItem('bestscore', score);
			bestscore = score;
		}

		this.statsScoreElements[0].classList.remove('fill', 'empty');
		this.statsScoreElements[1].classList.remove('fill', 'empty');
		this.statsScoreElements[2].classList.remove('fill', 'empty');

		if(score < 2000){
			this.statsScoreElements[0].classList.add('fill');
			this.statsScoreElements[1].classList.add('empty');
			this.statsScoreElements[2].classList.add('empty');
		}else if(score < 50000){
			this.statsScoreElements[0].classList.add('fill');
			this.statsScoreElements[1].classList.add('fill');
			this.statsScoreElements[2].classList.add('empty');
		}else{
			this.statsScoreElements[0].classList.add('fill');
			this.statsScoreElements[1].classList.add('fill');
			this.statsScoreElements[2].classList.add('fill');
		}

		this.ScoreElement.textContent = score;
		this.bestScoreElement.textContent = bestscore;

		this.gameCompleteElement.style.zIndex = 10;
		this.gameCompleteElement.style.opacity = 1;

		for( var i = 0; i < this.statsScoreElements.length; i++ ){
			this.statsScoreElements[i].style.opacity = 1;
		}
		
	}

};

loadingManager.init();