import { GRID_SIZE } from "./constants.js";
import { menuContainer, menuButton, menuIcon, iframeContainer, toggleMenu, onIFrameLoaded, onIFrameDismissed, setMenuIconMode, MODE } from "./elements.js";
import { mouse } from "./mouse.js";
import * as Previews from "./previews.js";

const projectWorldToScreen = ( object, viewer ) => {

    let position = new THREE.Vector3();
    let direction = new THREE.Vector3();

    object.getWorldPosition( position );
    viewer.camera.getWorldDirection( direction );

    if ( direction.dot( position ) > 0 ) {

        object.dispatchEvent( { type: 'inside-viewport', vector: viewer.getScreenVector( position ) } );

    } else {

        object.dispatchEvent( { type: 'outside-viewport' } );

    }

}

const createMenuItem = ( name, config, mesh ) => {

    let viewer = config.viewer;
    let item;

    item = document.createElement( 'span' );
    item.classList.add( 'project' );
    item.textContent = name;
    item.style.backgroundImage = `url(${config.imageURL})`;
    item.addEventListener( 'click', () => {

        toggleMenu();
        viewer.tweenControlCenterByObject( mesh ); 

    } );

    return item;

};

const createInfo = ( name, config, mesh ) => {

    let viewer = config.viewer;
    let container = config.container;
    let info, picture, texture, year;

    info = document.createElement( 'div' );
    info.classList.add( 'project-name' );
    info.textContent = name;
    
    viewer.container.appendChild( info );
    info.style.marginLeft = -( info.clientWidth + 20 ) / 2 + 'px';
    info.style.marginTop = -( info.clientHeight + 20 ) / 2 + 'px';

    picture = document.createElement( 'div' );
    picture.classList.add( 'project-picture' );
    picture.style.left = ( info.clientWidth - 305 + 1 ) * 0.5 + 'px';
    picture.style.backgroundImage = 'url(' + config.imageURL + ')';

    year = document.createElement( 'div' );
    year.classList.add( 'project-year', 'hidden' );
    year.textContent = config.year;
    picture.appendChild( year );

    info.appendChild( picture );

    info.hide = () => { 

        info.style.display = 'none'; 
        picture.style.display = 'none'; 

    }

    info.show = () => { 

        info.style.display = 'block'; 
        picture.style.display = 'block'; 
    }

    container.addEventListener( 'hoverstart', () => { 

        document.body.style.cursor = 'pointer';
        info.classList.add( 'highlight' );
        year.classList.remove( 'hidden' );

    } );
    container.addEventListener( 'hoverend', () => { 

        document.body.style.cursor = 'auto'; 
        info.classList.remove( 'highlight' );
        year.classList.add( 'hidden' );

    } );

    mesh.addEventListener( 'inside-viewport', ( event ) => {

        const vector = event.vector;
        const infoTrans = `translate3d( ${vector.x}px, ${vector.y}px, ${vector.z}px )`;
        const picTrans = `perspective(1000px) rotateY(${(mouse.x - vector.x) * 0.04}deg) rotateX(${(mouse.y - vector.y) * 0.04}deg)`;

        info.show();
        info.style.transform = infoTrans; 
        picture.style.transform = picTrans;

    } );

    mesh.addEventListener( 'outside-viewport', info.hide );

    info.hide();

    return info;

};

const createProjectContainer = ( name, config ) => {

    const viewer = config.viewer;
    const boxSize = GRID_SIZE * 0.9;

    let mesh, container, info;
    let geometry = new THREE.BoxBufferGeometry( boxSize, boxSize, boxSize );
    let material =  new THREE.MeshBasicMaterial( { transparent: true, opacity: 0 } );
    container = new THREE.Mesh( geometry, material );
    container.name = 'container';

    config.container = container;

    switch ( name ) {

        case 'Spherical Harmonics':

            mesh = Previews.SphericalHarmonicsPreview( config );

            break;

        case 'Photo Particle':

            mesh = Previews.PhotoParticlePreview( config );

            break;

        case 'Splash':

            mesh = Previews.SplashPreview( config );

            break;

        case 'Pano Theater':

            mesh = Previews.PanoTheatherPreview( config );

            break;

        case 'Panolens.js':

            mesh = Previews.PanolensJSPreview( config );

            break;

        case 'Claw Catch':

            mesh = Previews.ClawCatchPreview( config );

            break;

        case 'Ironman':

            mesh = Previews.IronmanPreview( config );

            break;

        case '3D_Assembly':

            mesh = Previews.AssemblyPreview( config );

            break;

        case 'eR3D':

            mesh = Previews.eR3DPReview( config );

            break;

        case 'Periodic Table':

            mesh = Previews.PeriodicTablePreview( config );

            break;

        default:

            return;

    }

    menuContainer.appendChild( createMenuItem( name, config, mesh ) );
    info = createInfo( name, config, mesh );

    viewer.addUpdateCallback( () => { 

        if ( viewer.panorama === container.parent.parent ) {    // trace panorama ancestor

            !mesh.disableAutoRotate && ( mesh.rotation.y += 0.01 );

            projectWorldToScreen( mesh, viewer );

        }
        
     } );

    const resume = () => {
   
        !viewer.requestAnimationId && viewer.animate();
        
    }

    const pause = () => {

        window.cancelAnimationFrame( viewer.requestAnimationId );
        viewer.requestAnimationId = null;

    };

    const iframeLoaded = () => {

        onIFrameLoaded();
        pause();
        iframeContainer.removeEventListener( 'load', iframeLoaded );
        menuButton.addEventListener( 'click', iframeDismissed );

    };

    const iframeDismissed = ( event ) => {

        onIFrameDismissed( event );
        resume();
        menuButton.removeEventListener( 'click', iframeDismissed );

    };

    const onContainerClicked  = ( event ) => {

        iframeContainer.src = config.link; 
        iframeContainer.addEventListener( 'load', iframeLoaded );

        setMenuIconMode( MODE.CLOSE );

    }

    container.mesh = mesh;
    container.info = info;
    container.add( mesh );
    container.addEventListener( 'click', onContainerClicked );

    return container;

}

export { createProjectContainer }