/**
 * Photo Particle created by Ray Chen @ 2018
 */

var MAX_DEPTH = 100;

var camera,
    scene, 
    renderer, 
    container,
    control,
    gui = new dat.GUI(),
    options,
    optionsDefault,
    mouse = new THREE.Vector3();

var textureLoader = new THREE.TextureLoader(),
    imageData,
    points;

var timerId;

var clock = new THREE.Clock();

var raycaster = new THREE.Raycaster();
var hoveredPoint = new THREE.Vector3();
var clickPoint = new THREE.Vector3();
var elapsedTime = 0;
var decay = 1.0;
var waving = false;
var firstTime = true;
var timerIds = [];

var resolution = { width: 1080, height: 607 };
var imageSizeRatio = { extrasmall: 0.1, small: 0.3, medium: 0.5, large: 1 };
var lastLoadedURL = '';

function getImageData( image ) {

    var canvas = document.createElement( 'canvas' );
    canvas.width = image.width;
    canvas.height = image.height;

    var context = canvas.getContext( '2d' );
    context.drawImage( image, 0, 0 );

    return context.getImageData( 0, 0, image.width, image.height );

}

function updateURLonGUI ( url ) {

    // Update GUI
    options.image.url = url;
    gui.__folders[ 'image' ].__controllers[ 1 ].updateDisplay();

}

function generateRemoteImageURL () {

    var url = 'https://source.unsplash.com/random/';
    var ratio = imageSizeRatio[ options.image.size ];
    var width = ratio * resolution.width;
    var height = ratio * resolution.height;

    url += width + 'x' + height;

    updateURLonGUI( url );

    // Prevent image cache from threejs
    url += '?i=' + Date.now();

    return url;

}

function onImageLoadProgress () {}

function onImageLoadError ( err ) {

    alert( 'Image Loaded Error', err );
    reset();

}

function loadImage ( path ) {

    clearAllTimer();

    if ( !path ) {

        path = lastLoadedURL !== options.image.url ? options.image.url : generateRemoteImageURL();
        updateURLonGUI( path );

    }

    if ( points ) {

        scene.remove( points );

        points.geometry.dispose();
        points.material.dispose();
        points = null;

    }

    textureLoader.load( path, function( texture ){

        var positions = [];
        var colors = [];
        var directions = [];
        var geometry = new THREE.BufferGeometry();
        var material = new THREE.PointsMaterial( { size: 1, vertexColors: THREE.VertexColors, sizeAttenuation: false, blending: THREE.AdditiveBlending } );
        var width, height, index, data, px, py, pz = 0, pixelColor = new THREE.Color();
        var maxWidth, maxHeight, dpr;

        lastLoadedURL = texture.image.src.split( '?' )[ 0 ];

        maxWidth = imageSizeRatio[ options.image.size ] * resolution.width;
        maxHeight = imageSizeRatio[ options.image.size ] * resolution.height;

        imageData = getImageData( texture.image );

        width = imageData.width > maxWidth ? maxWidth : imageData.width;
        height = imageData.height > maxHeight ? maxHeight : imageData.height;
        dpr = Math.max( window.devicePixelRatio, 2.0 );

        for ( var y = 0; y < height; y++ ) {
            for ( var x = 0; x < width; x++ ) {

                index = ( x + imageData.width * y ) * 4;
                data = imageData.data;

                px = x - width / 2;
                py = - ( y - height / 2 );
                px /= dpr;
                py /= dpr;

                // Color
                pixelColor.setRGB( data[ index ] / 255, data[ index + 1 ] / 255, data[ index + 2 ] / 255 );
                colors.push( pixelColor.r, pixelColor.g, pixelColor.b );

                // Alpha
                if ( data[ index + 3 ] == 0 ) pz = -Math.Infinity;

                // Position
                positions.push( px, py, pz );

                // Directions
                directions.push( 
                    ( Math.random() - 0.5 ) * 2, 
                    ( Math.random() - 0.5 ) * 2, 
                    ( Math.random() - 0.5 ) * 2 
                );

            }
        }

        geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ).setDynamic( true ) );
        geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
        geometry.addAttribute( 'originalPosition', new THREE.Float32BufferAttribute( positions, 3 ) );
        geometry.computeBoundingSphere();

        geometry.attributes.position.directions = directions.slice(0);
        geometry.attributes.color.original = colors.slice(0);

        points = new THREE.Points( geometry, material );
        scene.add( points );

        wave();
        
    }, onImageLoadProgress, onImageLoadError );

}

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 15, window.innerWidth / window.innerHeight, 0.1, 10000 );
    camera.position.set( 0, -500, 500 );

    control = new THREE.OrbitControls( camera, container );
    scene = new THREE.Scene();

    // Options
    options = {

        image: { 

            size: 'ontouchstart' in window ? 'extrasmall' : 'small',
            url: 'https://source.unsplash.com/random/324x182', 
            brightness: 1.0, 
            depth: 0.0, 
            loadURL: loadImage

        },

        regroup: { 

            scalar: 0.5, 
            decay: 0.5,
            decayFactor: 0.9, 
            repulsiveRadius: 0 

        },

        spread: { 

            enabled: false, 
            heightColor: [ 0, 128, 255 ] 

        },

        wave: wave,
        reset: reset,
        
        // Internal
        K: 0.2,
        frequency: 0.3,
        amplitude: 30
    };

    optionsDefault = JSON.parse( JSON.stringify( options ) );

    var folderImage = gui.addFolder( 'image' );
    folderImage.add( options.image, "size", [ 'extrasmall', 'small', 'medium', 'large' ] ).onChange( onChangeImageSize );
    folderImage.add( options.image, "url" );
    folderImage.add( options.image, "brightness", 0, 5 ).onChange( onChangeBrightness );
    folderImage.add( options.image, "depth", -MAX_DEPTH, MAX_DEPTH ).onChange( onChangeDepth );
    folderImage.add( options.image, "loadURL" );
    folderImage.open();

    var folderRegroup = gui.addFolder( 'regroup' );         
    folderRegroup.add( options.regroup, "scalar", 0, 1 );
    folderRegroup.add( options.regroup, "decay", 0, 1 );
    folderRegroup.add( options.regroup, "decayFactor", 0, 1 );
    folderRegroup.add( options.regroup, "repulsiveRadius", 0, 50 );

    var folderSpread = gui.addFolder( 'spread' );
    folderSpread.add( options.spread, "enabled" );
    folderSpread.addColor( options.spread, "heightColor" );

    gui.add( options, 'wave' );
    gui.add( options, 'reset' );

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    
    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );

    container.addEventListener( 'mousemove', onMouseMove, false );
    container.addEventListener( 'click', onMouseClick, false );

    container.addEventListener( 'touchstart', onMouseMove, false );
    container.addEventListener( 'touchmove', onMouseMove, false );
    container.addEventListener( 'touchend', onMouseClick, false );

    loadImage( options.image.url );
    animate();

}

function trigger ( value ) {

    onChangeDepth( value );
    onChangeBrightness( options.image.brightness );
    clickPoint.set( 0, 0, 0 );
    decay = options.regroup.decay;

}

function deplayedTrigger ( value, time ) {

    timerIds.push( setTimeout( trigger.bind( this, value ), time ) );

}

function normalizeRGB( array ) {

    return array.map( function( c ) { return c /= 255; } );

}

function setSpreadEnabled ( enabled ) {

    options.spread.enabled = enabled;

}

function wave () {

    if ( waving ) return;

    var time = 0, waving = true;

    if ( firstTime ) {

        time = 2000;
        setSpreadEnabled( true );
        timerIds.push( setTimeout( setSpreadEnabled.bind( this, false ), time ) );

    }

    deplayedTrigger( 10, time + 2000 );
    deplayedTrigger( -10, time + 4000 );
    timerIds.push( setTimeout( function(){ 

        waving = false; 
        reset(); 

    }, time + 6000 ) );

}

function clearAllTimer () {

    timerIds.forEach( clearTimeout );
    timerIds = [];

}

function ripple ( parameter ) {

    var colorArray = parameter.colorArray;
    var originalColorArray = parameter.originalColorArray;
    var point = parameter.point;
    var blend, r, color;
    var ix = parameter.ix, 
        iy = parameter.iy,
        iz = parameter.iz;
    var delta = clickPoint.clone().sub( point );

    // Get distance
    r = Math.sqrt( delta.x * delta.x + delta.y * delta.y );

    // Calculate wave height
    point.z += decay * options.amplitude * Math.sin( options.K * r + elapsedTime * options.frequency ) / ( options.K * r );
    point.z = THREE.Math.clamp( point.z, -options.amplitude + clickPoint.z, options.amplitude + clickPoint.z );

    if ( options.spread.enabled ) {

        blend = THREE.Math.clamp( Math.abs( ( point.z ) / options.amplitude ), 0, 1 );
        color = normalizeRGB( options.spread.heightColor );

        colorArray[ ix ] = originalColorArray[ ix ] * ( 1.0 - blend ) + color[ 0 ] * blend;
        colorArray[ iy ] = originalColorArray[ iy ] * ( 1.0 - blend ) + color[ 1 ] * blend;
        colorArray[ iz ] = originalColorArray[ iz ] * ( 1.0 - blend ) + color[ 2 ] * blend;

        point.z *= options.regroup.decayFactor;

    }

    // Update z value
    parameter.positionArray[ iz ] = point.z;

}

function regroup ( parameter ) {

    var originalPositionArray = parameter.originalPositionArray;
    var directions = points.geometry.attributes.position.directions;
    var point = parameter.point;
    var count = parameter.count, index = parameter.index;
    var distance, blend;
    var target = new THREE.Vector3();
    var ix = parameter.ix, 
        iy = parameter.iy,
        iz = parameter.iz;

    target.set( originalPositionArray[ ix ], originalPositionArray[ iy ], originalPositionArray[ iz ] );

    distance = hoveredPoint.distanceTo( point );
    distance = distance || 0.001;

    blend = THREE.Math.clamp( elapsedTime * ( count / index ) * Math.abs( directions[ iz ] ), 0, 1 );

    point.lerp( target, blend * ( options.regroup.scalar / 10 ) );

    if ( options.regroup.repulsiveRadius > 0 && distance < options.regroup.repulsiveRadius ) {

        point.x += ( point.x - hoveredPoint.x ) * ( distance / options.regroup.repulsiveRadius );
        point.y += ( point.y - hoveredPoint.y ) * ( distance / options.regroup.repulsiveRadius );

    }

    parameter.positionArray[ ix ] = point.x;
    parameter.positionArray[ iy ] = point.y;
    parameter.positionArray[ iz ] = point.z;

}

function spread ( parameter ) {

    var positionArray = parameter.positionArray;
    var originalPositionArray = parameter.originalPositionArray;
    var directions = points.geometry.attributes.position.directions;
    var point = parameter.point;
    var time = parameter.time;
    var ix = parameter.ix, 
        iy = parameter.iy,
        iz = parameter.iz;
    var maxWidth, maxHeight;

    maxWidth = imageSizeRatio[ options.image.size ] * resolution.width;
    maxHeight = imageSizeRatio[ options.image.size ] * resolution.height;

    positionArray[ ix ] += directions[ ix ] * time * options.regroup.scalar;
    positionArray[ iy ] += directions[ iy ] * time * options.regroup.scalar;

    if ( Math.abs( point.x ) > maxWidth / 2 || Math.abs( point.y ) > maxHeight / 2 ) {

        positionArray[ ix ] = originalPositionArray[ ix ];
        positionArray[ iy ] = originalPositionArray[ iy ];
        positionArray[ iz ] = originalPositionArray[ iz ];

    }

}

function update ( time ) {

    if ( !points ) return;

    // Position
    var positions = points.geometry.attributes.position;
    var positionArray = positions.array;
    var originalPositionArray = points.geometry.attributes.originalPosition.array;

    // Color
    var colors = points.geometry.attributes.color;
    var colorArray = colors.array;
    var originalColorArray = colors.original;

    // Parameter
    var parameter = {
        count: positions.count,
        index: -1,
        point: new THREE.Vector3(),
        time: time
    };

    var  i = positions.count;

    elapsedTime += time;

    while( i-- ) {

        var x = i % imageData.width;
        var y = Math.floor( i / imageData.width );
        var alpha = imageData.data[ ( x + imageData.width * y ) * 4 + 3 ];
        var ix, iy, iz;

        if ( alpha === 0 ) continue;

        ix = i * 3;
        iy = ix + 1;
        iz = ix + 2;

        parameter.point.set( positionArray[ ix ], positionArray[ iy ], positionArray[ iz ] );

        parameter.ix = ix;
        parameter.iy = iy;
        parameter.iz = iz;
        parameter.index = i;
        parameter.time = time;
        parameter.positionArray = positionArray;
        parameter.originalPositionArray = originalPositionArray;
        parameter.colorArray = colorArray;
        parameter.originalColorArray = originalColorArray;

        // Recover or Spread
        options.spread.enabled ? spread( parameter ) : regroup( parameter );

        // Ripple
        ripple( parameter );

    }

    // Decaying
    decay *= options.regroup.decayFactor;

    positions.needsUpdate = true;
    colors.needsUpdate = true;

}

function reset() {

    clearAllTimer();

    for ( var folderName in gui.__folders ) {

        if ( gui.__folders.hasOwnProperty( folderName ) ) {

            gui.__folders[ folderName ].__controllers.forEach( function ( controller ) {

                if ( controller.property !== 'loadURL' ) {

                    options[ folderName ][ controller.property ] = optionsDefault[ folderName ][ controller.property ];
                    controller.updateDisplay();

                }

            });

        }

    }

    !points ? onChangeImageSize() : trigger( options.image.depth );

}

function onChangeImageSize () {

    clearAllTimer();
    loadImage( generateRemoteImageURL() );

} 

function onChangeDepth ( value ) {

    elapsedTime = 0;

    if ( points ) {

        var originalPosition = points.geometry.attributes.originalPosition.array;
        var color = points.geometry.attributes.color.array;

        var r2, g2, b2, colorDistance, i = originalPosition.length;

        while( i -= 3 ) {

            r2 = Math.pow( color[ i ], 2 );
            g2 = Math.pow( color[ i + 1 ], 2 );
            b2 = Math.pow( color[ i + 2 ], 2 );

            colorDistance = Math.sqrt( r2 + g2 + b2 );
            originalPosition[ i + 2 ] = value * ( ( colorDistance > 0 ) ? colorDistance : -Math.Infinity );

        }

        originalPosition.needsUpdate = true;

    }

}

function onChangeBrightness ( value ) {

    var color = points.geometry.attributes.color;
    var colorArray = color.array;
    var i = color.array.length;

    while( i-=3 ) {

        colorArray[ i ] = color.original[ i ] * value;
        colorArray[ i + 1 ] = color.original[ i + 1 ] * value;
        colorArray[ i + 2 ] = color.original[ i + 2 ] * value;

    }

    color.needsUpdate = true;

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function onMouseMove( event ) {

    mouse.x = ( ( event.touches ? event.touches[ 0 ] : event ).clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( ( event.touches ? event.touches[ 0 ] : event ).clientY / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );

    if ( !points ) return;

    var intersects = raycaster.intersectObject( points );

    if ( intersects.length > 0 ) {

        hoveredPoint.copy( intersects[ 0 ].point );

    }

}

function onMouseClick() {

    clickPoint.copy( hoveredPoint );
    decay = options.regroup.decay;

}

function animate() {

    requestAnimationFrame(animate);

    update( clock.getDelta() * 50 );

    render();

}

function render() {

    renderer.render(scene, camera);

}

init();