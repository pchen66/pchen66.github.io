import { ROOM_SIZE, GRID_SIZE, ROTATION_FACTOR } from "./constants.js";
import { entrance, menuButton, toggleMenu } from "./elements.js";
import { createProjectContainer } from "./container.js";
import { mouse } from './mouse.js';

let projects, selection, message;
let emptyRoom, mainRoom;
let viewer;

let config = {

    Viewer: {

        cameraFov: 45,
        controlBar: false

    }

};

const loadProjectJSON = ( url ) => {
    
    return fetch( url )
    .then( response => response.json() )
    .then( json => Object.entries( json ) )
    .catch( console.error );

}

const projectWorldToScreen = ( object ) => {

    let position = new THREE.Vector3();
    let direction = new THREE.Vector3();

    object.getWorldPosition( position );
    viewer.camera.getWorldDirection( direction );

    if ( direction.dot( position ) > 0 ) {

        object.dispatchEvent( { type: 'inside-viewport', vector: viewer.getScreenVector( position ) } );

    } else {

        object.dispatchEvent( { type: 'outside-viewport' } );

    }

};

const createEntranceMessage = ( text ) => {

    const point = new THREE.Object3D();
    const displayText = text ? text : 'TEXT';
    let letter, vector;

    for ( let character of displayText ) {

        letter = document.createElement( 'span' );
        letter.classList.add( 'letter' );
        letter.textContent = character;
        entrance.appendChild( letter );

    }

    entrance.style.marginLeft = -entrance.clientWidth / 2 + 'px';
    entrance.style.marginTop = -entrance.clientHeight / 2 + 'px';

    point.position.set( 0, 0, -ROOM_SIZE / 2 );
    point.addEventListener( 'inside-viewport', ( event ) => {

        vector = event.vector;
        entrance.style.display = '';
        entrance.style.transform = `translate3d( ${vector.x}px, ${vector.y}px, ${vector.z}px )`;

    } );
    point.addEventListener( 'outside-viewport', () => { 

        entrance.style.display = 'none'; 

    } );
    
    viewer.addUpdateCallback( () => { 

        if ( viewer.panorama === mainRoom ) {

            projectWorldToScreen( point );

        }

    } );

    return point;

};

const createMainRoom = () => {

    let room;
    let spotlight, pointlight;

    const onPanoramaHover = ( event ) => {

        const intersects = event.intersects;

        if ( intersects.length > 0 
            && intersects[ 0 ].object.name === 'container' 
            && viewer.hoverObject !== selection ) {

            selection = intersects[ 0 ].object;
            selection.dispatchEvent( { type: 'hoverstart' } );

        } else if ( !viewer.hoverObject && selection ) {

            selection.dispatchEvent( { type: 'hoverend' } );
            selection = null;

        }

    };

    const onPanoramaClick = ( event ) => {

        if ( event.intersects.length > 0  ) {

            const object = event.intersects[ 0 ].object;
            object.traverseAncestors( ancestor => { 

                if ( ancestor.name === 'container' ) {

                    ancestor.dispatchEvent( { type: 'click' } );                

                }

            } );

        } 

    };

    room = new PANOLENS.BasicPanorama( ROOM_SIZE );
    room.addEventListener( 'hover', onPanoramaHover );
    room.addEventListener( 'click', onPanoramaClick );

    spotlight = new THREE.SpotLight( 0xffffff, 1 );
    spotlight.position.set( 0, 1000, 0 );
    room.add( spotlight );

    spotlight = new THREE.SpotLight( 0xffffff, 0.3 );
    spotlight.position.set( 100, 150, -300 );
    room.add( spotlight );

    pointlight = new THREE.PointLight( 0xffffff, 0.2 );
    pointlight.position.set( -200, -250, 100 );
    room.add( pointlight );

    return room;

};

const createEmptyRoom = () => {

    let room;

    room = new PANOLENS.EmptyPanorama();
    room.geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( [], 1 ) );
    room.addEventListener( 'load', () => {

        setTimeout( () => {

            menuButton.classList.remove( 'hidden' );
            entrance.style.display = '';
            viewer.setPanorama( mainRoom );

        }, 1000 );
        

    } );

    return room;

};

const onLoaded = ( projectList ) => {

    const mobile = PANOLENS.Utils.isMobile;

    viewer = new PANOLENS.Viewer( config.Viewer );

    message = createEntranceMessage( 'PLAYGROUND' );
    emptyRoom = createEmptyRoom();
    mainRoom = createMainRoom();

    viewer.add( message, emptyRoom, mainRoom );

    projects = projectList.filter( item => mobile ? item[ 1 ].mobile !== false : true );

    for ( let project of projects ) {

        let container;
        let name = project[ 0 ];
        let config = project[ 1 ];
        let position = new THREE.Vector3().fromArray( config.index3D );

        config.viewer = viewer;

        container = createProjectContainer( name, config );
        container.position.copy( position ).multiplyScalar( GRID_SIZE );

        mainRoom.add( container );

    }

    viewer.container.addEventListener( 'mousemove', function( event ){

        mouse.x = ( event.touches ? event.touches[ 0 ] : event ).clientX;
        mouse.y = ( event.touches ? event.touches[ 0 ] : event ).clientY;

    }, false );

};

loadProjectJSON( 'Playground/Projects.json' ).then( onLoaded );