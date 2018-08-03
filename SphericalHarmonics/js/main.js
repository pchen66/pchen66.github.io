import SphericalHarmonics from "./SphericalHarmonics.js";
import Basic3D from '../../js/Basic3D.js';

let options = { 

    m0: 7, 
    m1: 6, 
    m2: 3, 
    m3: 9, 
    m4: 8, 
    m5: 0, 
    m6: 1, 
    m7: 2, 
    max: 12, 
    resolution: 100, 
    wireframe: false, 
    autoRotate: true, 
    unitSize: false, 
    randomize: randomize, 
    reset: reset

};

let optionsDefaults = JSON.parse( JSON.stringify( options ) );

const sphericalHarmonics = new SphericalHarmonics( options );
const basic3D = new Basic3D( { OrbitControls: true, DatGui: true, rendererOptions: { antialiasing: true } } );

basic3D.addEventListener( Basic3D.EVENT_INIT_COMPLETE, setupGUI );
basic3D.addEventListener( Basic3D.EVENT_INIT_COMPLETE, setupScene );
basic3D.addEventListener( Basic3D.EVENT_ANIMATION_FRAME, onUpdate );

basic3D.init();
basic3D.animate();

function onParameterChanged () {

    sphericalHarmonics.updateGeometry();

}

function onMaterialChanged ( value ) {

    const name = this.property;
    const parameters = {};

    parameters[ name ] = value;
    sphericalHarmonics.updateMaterial( parameters );

}

function updateGUIDisplay () {

    const gui = basic3D.gui;

    gui.__controllers.forEach( control => control.updateDisplay() );

}

function randomize () {

    sphericalHarmonics.generateRandomParameters();
    sphericalHarmonics.updateGeometry();
    updateGUIDisplay();

}

function reset () {

    for ( let name in optionsDefaults ) {

        if ( options.hasOwnProperty( name ) && optionsDefaults.hasOwnProperty( name ) ) {

            options[ name ] = optionsDefaults[ name ];

        }

    }

    updateGUIDisplay();
    onParameterChanged();

}

function setupGUI () {

    const gui = this.gui;

    for ( let i = 0; i < 8; i++ ) {

        gui.add( options, `m${i}`, 0, options.max ).step( 1 ).onChange( onParameterChanged );

    }

    gui.add( options, 'wireframe' ).onChange( onMaterialChanged );
    gui.add( options, 'autoRotate' );
    gui.add( options, 'unitSize' ).onChange( onParameterChanged );
    gui.add( options, 'randomize' );
    gui.add( options, 'reset' );

}

function setupScene () {

    const scene = this.scene;
    let light;

    // Lights
    light = new THREE.SpotLight( 0xffffff, 0.7 );
    light.position.set( 5, 20, 10 );
    scene.add( light );

    light = new THREE.SpotLight( 0xffffff, 0.6 );
    light.position.set( -30, -50, -70 );
    scene.add( light );

    scene.add( new THREE.AmbientLight( 0xffffff, 0.5 ) );

    // Spherical Harmonics Mesh
    scene.add( sphericalHarmonics.buildSurfaceMesh() );

}

function onUpdate () {

    sphericalHarmonics.update();

}