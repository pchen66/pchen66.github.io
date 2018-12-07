import Basic3D from '../../js/Basic3D.js';
import ToonShader from './shaders/ToonShader.js';

const basic3D = new Basic3D( { OrbitControls: true, DatGui: true, rendererOptions: { antialiasing: true } } );

const data = {

    uMagTol: 0.6,
    uQuantize: 4.0,
    uStep: new THREE.Vector2( 500, 500 ),
    autoRotate: true

};

let composer;
const group = new THREE.Object3D();
const toonEffect = new THREE.ShaderPass( ToonShader );

const setupGUI = () => {

    const gui = basic3D.gui;

    gui.add( data, 'uMagTol', 0, 1 ).onChange( value => { toonEffect.uniforms[ 'uMagTol' ].value = value;  });
    gui.add( data, 'uQuantize', 1, 10 ).onChange( value => { toonEffect.uniforms[ 'uQuantize' ].value = value;  });

    const folder = gui.addFolder( 'uStep' );
    folder.closed = false;
    folder.add( data.uStep, 'x', 200, 800 );
    folder.add( data.uStep, 'y', 200, 800 );

    gui.add( data, 'autoRotate' );

};

const setupScene = () => {

    const scene = basic3D.scene;
    const renderer = basic3D.renderer;
    const camera = basic3D.camera;

    const boxGeometry = new THREE.BoxBufferGeometry( 1, 1, 1 );
    const teapotGeometry = new THREE.TeapotBufferGeometry( 1, 10, 4 );
    const material = new THREE.MeshStandardMaterial( { color: 0xffffff } );
    const light = new THREE.DirectionalLight( 0xffffff );

    camera.fov = 70;
    camera.position.z = 400;
    camera.updateProjectionMatrix();

    for ( let i = 0; i < 100; i ++ ) {
      const mesh = new THREE.Mesh( Math.random() < 0.5 ? teapotGeometry : boxGeometry, material );
      mesh.position.set( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 ).normalize();
      mesh.position.multiplyScalar( Math.random() * 400 );
      mesh.rotation.set( Math.random() * 2, Math.random() * 2, Math.random() * 2 );
      mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50;
      group.add( mesh );

    }

    // postprocessing

    composer = new THREE.EffectComposer( renderer );
    
    const renderPass = new THREE.RenderPass( scene, camera );
    composer.addPass( renderPass );

    // toon
    toonEffect.uniforms[ 'uMagTol' ].value = data.uMagTol;
    toonEffect.uniforms[ 'uQuantize' ].value = data.uQuantize;
    toonEffect.uniforms[ 'uStep' ].value = data.uStep;
    composer.addPass( toonEffect );

    const vignetteEffect = new THREE.ShaderPass( THREE.VignetteShader );
    vignetteEffect.renderToScreen = true;
    composer.addPass( vignetteEffect );

    scene.add( new THREE.AmbientLight( 0x222222 ) );
    scene.add( group );

    light.position.set( 1, 1, 1 );
    scene.add( light );

    renderer.setClearColor( 0xffffff, 1 );

};

const render = () => {

    if ( data.autoRotate ) {
        group.rotation.x += 0.001;
        group.rotation.y += 0.005;
    }

    composer.render();

};

const onWindowResize = () => {

    composer.setSize( window.innerWidth, window.innerHeight );

};


basic3D.addEventListener( Basic3D.EVENT_INIT_COMPLETE, setupGUI );
basic3D.addEventListener( Basic3D.EVENT_INIT_COMPLETE, setupScene );
basic3D.addEventListener( Basic3D.EVENT_WIDNOW_RESIZE, onWindowResize );

basic3D.render = render;

basic3D.init();
basic3D.animate();
