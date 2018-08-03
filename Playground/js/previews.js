import { GRID_SIZE } from './constants.js';
import SphericalHarmonics from '/SphericalHarmonics/js/SphericalHarmonics.js';
import TexturePoints from '/PhotoParticle/js/TexturePoints.js';
import { PointMaterialShader } from '../shaders/PointMaterialShader.js';

export const SphericalHarmonicsPreview = ( config ) => {

    const container = config.container;
    const options = Object.assign( {}, config.options );
    const sphericalHarmonics = new SphericalHarmonics( options );
    const onUpdateSphericalHarmonics = () => sphericalHarmonics.update();

    let mesh, enterTween, leaveTween;

    mesh = sphericalHarmonics.buildSurfaceMesh();
    mesh.geometry.attributes.position.copy( mesh.geometry.attributes.target ); 
    mesh.scale.multiplyScalar( 30 );

    enterTween = new TWEEN.Tween( { progress: 0 } )
        .to( { progress: 1 }, 1000 )
        .onStart(() => {
            sphericalHarmonics.generateRandomParameters();
            sphericalHarmonics.updateGeometry();
        })
        .onUpdate( onUpdateSphericalHarmonics );

    leaveTween = new TWEEN.Tween( { progress: 0 } )
        .to( { progress: 1 }, 1000 )
        .onStart(() => {
            Object.assign( sphericalHarmonics.options, config.options )
            sphericalHarmonics.updateGeometry();
        })
        .onUpdate( onUpdateSphericalHarmonics )

    container.addEventListener( 'hoverstart', () => { leaveTween.stop(); enterTween.start(); } );
    container.addEventListener( 'hoverend', () => { enterTween.stop(); leaveTween.start(); } );

    return mesh;

};

export const PhotoParticlePreview = ( config ) => {

    const container = config.container;
    const texturePoints = new TexturePoints();
    const tempGeometry = new THREE.BufferGeometry();
    const textureLoader = PANOLENS.Utils.TextureLoader;

    let mesh, enterTween, leaveTween;

    textureLoader.load( config.options.textureURL, onTextureLoaded );
    tempGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( [], 3 ) );

    mesh = new THREE.Points( tempGeometry );

    function onTextureLoaded( tex ) {

        const points = texturePoints.generateTexturePoints( tex, 500, 500 );
        mesh.geometry = points.geometry.clone();
        mesh.material = points.material.clone();

        const position = mesh.geometry.attributes.position;
        const color = mesh.geometry.attributes.color;
        const amplitude = 15, duration = 2000;

        const updatePointsDepth = ( progress, flat ) => {

            let target, index;

            for ( let i = 0, length = position.count; i < length; i++ ) {

                index = i * 3 + 2;
                target = flat ? 0 : position.original[ index ];
                position.array[ index ] = THREE.Math.lerp( position.array[ index ], target, progress );

            }

            position.needsUpdate = true;

        };

        enterTween = new TWEEN.Tween( { progress: 0 } )
            .to( { progress: 1 }, duration )
            .easing( TWEEN.Easing.Exponential.Out )
            .onUpdate( progress => updatePointsDepth( progress, true ) );

        leaveTween = new TWEEN.Tween( { progress: 0 } )
            .to( { progress: 1 }, duration )
            .easing( TWEEN.Easing.Exponential.Out )
            .onUpdate( progress => updatePointsDepth( progress, false ) );


        for ( let i = 0, length = position.count; i < length; i++ ) {

            let r2, g2, b2, colorDistance;

            r2 = Math.pow( color.array[ i * 3 ], 2 );
            g2 = Math.pow( color.array[ i * 3 + 1 ], 2 );
            b2 = Math.pow( color.array[ i * 3 + 2 ], 2 );

            colorDistance = Math.sqrt( r2 + g2 + b2 );

            position.array[ i * 3 + 2 ] = amplitude * colorDistance;

        }

        position.original = position.array.slice( 0 );

        container.addEventListener( 'hoverstart', () => enterTween.start() );
        container.addEventListener( 'hoverend', () => leaveTween.start() );

    }

    return mesh;

};

export const SplashPreview = ( config ) => {

    const container = config.container;
    const amplitude = 60;

    let mesh, enterTween, leaveTween;
    let geometry = new THREE.SphereGeometry( GRID_SIZE * 0.3, 20, 20 );
    let explodeModifier = new THREE.ExplodeModifier().modify( geometry );
    let timeline = { progress: 0, direction: 1 };

    for ( let i = 0, length = geometry.faces.length; i < length; i++ ) {

        let vertices = geometry.vertices;
        let face = geometry.faces[ i ];
        let vector = new THREE.Vector3();

        vector.x = Math.random() - 0.5;
        vector.y = Math.random() - 0.5;
        vector.z = Math.random() - 0.5;

        vector.multiplyScalar( amplitude );

        vertices[ face.a ].original = vertices[ face.a ].clone();
        vertices[ face.b ].original = vertices[ face.b ].clone();
        vertices[ face.c ].original = vertices[ face.c ].clone();                 

        vertices[ face.a ].speed = Math.random() * 0.15;
        vertices[ face.b ].speed = Math.random() * 0.15;
        vertices[ face.c ].speed = Math.random() * 0.15;

        vertices[ face.a ].add( vector );
        vertices[ face.b ].add( vector );
        vertices[ face.c ].add( vector );

        vertices[ face.a ].target = vertices[ face.a ].clone();
        vertices[ face.b ].target = vertices[ face.b ].clone();
        vertices[ face.c ].target = vertices[ face.c ].clone();

    }

    mesh = new THREE.Mesh( geometry, new THREE.MeshStandardMaterial( { color: 0x9985f2, wireframe: false, metalness: 0, roughness: 0 } ) );

    function update ( destination, value ) {

        for ( let i = 0, length = geometry.faces.length; i < length; i++ ) {

            let vertices = geometry.vertices;
            let face = geometry.faces[ i ];
            let da, db, dc;

            da = vertices[ face.a ][ destination ];
            db = vertices[ face.b ][ destination ];
            dc = vertices[ face.c ][ destination ];

            vertices[ face.a ].lerp( da, value + vertices[ face.a ].speed );
            vertices[ face.b ].lerp( db, value + vertices[ face.b ].speed );
            vertices[ face.c ].lerp( dc, value + vertices[ face.c ].speed );

        }

        geometry.verticesNeedUpdate = true;

    }

    enterTween = new TWEEN.Tween( timeline ).to( { progress: 1 }, 5000 ).easing( TWEEN.Easing.Cubic.Out ).onUpdate( update.bind( this, 'original' ) ).delay( 100 );

    leaveTween = new TWEEN.Tween( timeline ).to( { progress: 1 }, 5000 ).easing( TWEEN.Easing.Cubic.Out ).onUpdate( update.bind( this, 'target' ) );

    container.addEventListener( 'hoverstart', () => { leaveTween.stop(); enterTween.start(); } );
    container.addEventListener( 'hoverend', () => { enterTween.stop(); leaveTween.start(); } );

    return mesh;

};

export const PanoTheatherPreview = ( config ) => {

    const videoElement = document.querySelector( '.video-texture' );
    const videoTexture = new THREE.VideoTexture( videoElement );
    const RATIO = PANOLENS.Utils.isMobile ? 0.2 : 0.3;
    const PIXEL_RESOLUTION = PANOLENS.Utils.isMobile ? 0.1 : 0.2;
    let mesh, Sgeometry, Smaterial;

    videoTexture.minFilter = THREE.NearestFilter;
    videoElement.muted = PANOLENS.Utils.isMobile ? true : false;

    PointMaterialShader.uniforms.texture.value = videoTexture

    Sgeometry = new THREE.PlaneBufferGeometry( 
        videoElement.videoWidth * RATIO, 
        videoElement.videoHeight * RATIO, 
        videoElement.videoWidth * PIXEL_RESOLUTION, 
        videoElement.videoHeight * PIXEL_RESOLUTION 
    );

    Smaterial = new THREE.ShaderMaterial( PointMaterialShader );

    mesh = new THREE.Points( Sgeometry, Smaterial );
    mesh.rotation.set( 0, Math.PI / 2, 0 );
    mesh.position.set( 0, 80, 0 );
    mesh.disableAutoRotate = true;

    videoElement.play();

    return mesh;

};

export const PanolensJSPreview = ( config ) => {

    const textureLoader = PANOLENS.Utils.TextureLoader;
    let container = config.container, mesh, texture;

    texture = textureLoader.load( 'Panolens/examples/asset/textures/equirectangular/planet.jpg' );
    texture.minFilter = THREE.LinearFilter;
    mesh = new THREE.Mesh( 
        new THREE.SphereBufferGeometry( 60, 16, 16 ), 
        new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } )
    );

    return mesh;

};

export const ClawCatchPreview = ( config ) => {

    const textureLoader = PANOLENS.Utils.TextureLoader;
    let container = config.container, mesh, texture;
    
    texture = textureLoader.load( 'ClawCatch/img/question.png' );
    texture.minFilter = THREE.LinearFilter;

    mesh = new THREE.Mesh( 

        new THREE.BoxBufferGeometry( 100, 120, 80 ), 
        new THREE.MeshBasicMaterial( { map: texture } ) 

    );

    return mesh;

};

export const IronmanPreview = ( config ) => {

    let container = config.container, mesh;
    
    mesh = new THREE.Mesh(

        new THREE.SphereBufferGeometry( 80, 32, 32 ), 
        new THREE.MeshBasicMaterial( { color: 0x77ffff, wireframe: true } ) 

    );

    return mesh;

};

export const AssemblyPreview = ( config ) => {

    let container = config.container, mesh;
    
    mesh = new THREE.Mesh( 
        new THREE.SphereBufferGeometry( 80, 32, 32 ), 
        new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } ) 
    );

    return mesh;

};

export const eR3DPReview = ( config ) => {

    let container = config.container, mesh;
    let count = 5, gap = 2, width = 20, height = 30;

    mesh = new THREE.Group();

    for ( let i = 0; i < count; i++ ) {
        for ( let j = 0; j < count; j++ ) {

            let column, grow, shrink;
            column = new THREE.Mesh( 
                new THREE.BoxGeometry( width, height, width ), 
                new THREE.MeshStandardMaterial( { color: 0xffffff, metalness: 0, roughness: 0 } ) 
            );
            column.position.x = -count / 2  * ( width + gap ) + i * ( width + gap );
            column.position.z = -count / 2  * ( width + gap ) + j * ( width + gap );
            column.geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 0, -height / 2, 0 ) );

            grow = new TWEEN.Tween( column.scale ).to( { y: -1.5 }, 3000 ).easing( TWEEN.Easing.Elastic.Out ).delay( i * 500 + j * 100 );

            shrink = new TWEEN.Tween( column.scale ).to( { y: -1 }, 3000 ).easing( TWEEN.Easing.Elastic.Out ).delay( i * 500 + j * 100 );

            grow.chain( shrink );
            shrink.chain( grow );

            grow.start();

            mesh.add( column );

        }
    }

    return mesh;

};

export const PeriodicTablePreview = ( config ) => {

    let container = config.container, mesh;

    mesh = new THREE.Mesh(

        new THREE.CylinderBufferGeometry( 80, 80, 80, 16, 4, true ),
        new THREE.MeshNormalMaterial( { wireframe: true } )

    );

    return mesh;

};

