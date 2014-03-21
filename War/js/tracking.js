MarkerTracking = function(sourceElement, mainWorld){
	
	this.srcElement = sourceElement;
	this.threshold = 128;
	
	this.markers = {};
	
	//Tracking Setup
	this.trackScene = new THREE.Scene();
	this.trackCamera = new THREE.PerspectiveCamera(60, this.srcElement.clientWidth / this.srcElement.clientHeight, 0.1, 10000);
	
	//lights
	this.trackScene.add(new THREE.AmbientLight(0xffffff));
	
	var _this = this;
	//JSARtoolkit
	this.jsartoolkit = new THREEx.JSARToolKit({
		srcElement	: this.srcElement,
		threshold	: this.threshold,
		camera		: this.trackCamera,
		canvasRasterW	: this.srcElement.clientWidth,
		canvasRasterH	: 554,
		debug		: false,
		callback	: function(event){
			//console.log("event", event.type, event.markerId);
			if( event.type === 'create' ){
				_this.onCreate(event);
			}else if( event.type === 'delete' ){
				_this.onDelete(event);
			}else if( event.type === 'update' ){
				_this.onUpdate(event);
			}else	console.assert(false, "invalid event.type "+event.type);
		}
	});
	
	return this;
};

MarkerTracking.prototype.onCreate = function(event){
	console.assert(	this.markers[event.markerId] === undefined );
	var markerId = event.markerId;
	this.markers[markerId]= {};
	var marker	= this.markers[markerId];
	// create the container object
	marker.object3d = new THREE.Object3D();
	marker.object3d.matrixAutoUpdate = false;
	this.trackScene.add(marker.object3d);	

	/*var minecraftman = new Character();
	minecraftman.model.position.set(0,23,0);
	minecraftman.model.scale.set(2,1.5,2);
	marker.object3d.add(minecraftman.model);*/
	
	if(!displayModel){
		//blockyworld.ModalDialog.show('Marker Detected', 'Loading 3D Model...');
		//this.load3dMdoel('model/policecar/policecar.dae','collada');
		this.load3dMdoel('model/engineer/engineer.js','json');
	}
};

MarkerTracking.prototype.load3dMdoel = function(modelPath,modelType){
	var loader;
	if( modelType=='collada' ){
		loader = new THREE.ColladaLoader();
		loader.options.convertUpAxis = true;
		loader.load( modelPath, function ( collada ) {
		
			dae = collada.scene;
			dae.scale.x = dae.scale.y = dae.scale.z = 0.1;
			dae.matrixAutoUpdate = false;
			dae.updateMatrix();
			
			/*blockyworld.ModalDialog.close();	//loaded completed
			blockyworld.Track.displayModel = dae;
			blockyworld.Track.displayModel.needsUpdate = false;*/
		});
	}
	else if(modelType=='json'){
		var loader = new THREE.JSONLoader();
			loader.load( modelPath, function(geometry,materials){

				geometry.materials = materials;
				var x = 0, y = -5, z = 0, s = 0.3;
				
				for ( var i = 0; i < geometry.animation.hierarchy.length; i ++ ) {

					var bone = geometry.animation.hierarchy[ i ];

					var first = bone.keys[ 0 ];
					var last = bone.keys[ bone.keys.length - 1 ];

					last.pos = first.pos;
					last.rot = first.rot;
					last.scl = first.scl;

				}

				geometry.computeBoundingBox();
				var bb = geometry.boundingBox;

				THREE.AnimationHandler.add( geometry.animation );

				for ( var i = 0; i < geometry.materials.length; i ++ ) {

					var m = geometry.materials[ i ];
					m.skinning = true;
					m.ambient.copy( m.color );

					m.wrapAround = true;
					m.perPixel = true;
				}

				var mesh = new THREE.SkinnedMesh( geometry, new THREE.MeshFaceMaterial(geometry.materials) );
				mesh.position.set( x, y - bb.min.y * s, z );
				mesh.scale.set( s, s, s );

				//mesh.castShadow = true;
				//mesh.receiveShadow = true;

				animation = new THREE.Animation( mesh, geometry.animation.name );
				animation.JITCompile = false;
				animation.interpolationType = THREE.AnimationHandler.LINEAR;

				animation.play();
				
				/*blockyworld.ModalDialog.close();	//loaded completed
				blockyworld.Track.displayModel = mesh;
				blockyworld.Track.displayModel.needsUpdate = true;*/
				displayModel = mesh;
				displayModel.needsUpdate = true;
			});
	}
};

MarkerTracking.prototype.onDelete = function(event){
	console.assert(	this.markers[event.markerId] !== undefined );
	
	var markerId	= event.markerId;
	var marker	= this.markers[markerId];
	
	this.trackScene.remove( marker.object3d );
	delete this.markers[markerId];
};

MarkerTracking.prototype.onUpdate = function(event){
	console.assert(	this.markers[event.markerId] !== undefined );

	var markerId	= event.markerId;
	var marker	= this.markers[markerId];

	if(marker.object3d.children.length < 1)
		marker.object3d.add(displayModel);
	marker.object3d.matrix.copy(event.matrix);
	marker.object3d.matrixWorldNeedsUpdate = true;		
};