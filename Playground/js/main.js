// author - Ray Chen

import addWheelListener from './wheel.js';
import { lazyLoadSupport, registerLazyLoad } from './lazyload.js';

const main = document.querySelector( 'main' );
const sideNav = document.querySelector( '.side-nav' );
const about = document.querySelector( '.about' );
const home = document.querySelector( '.home' );
const overlay = document.querySelector( '.overlay' );
const iframe = document.querySelector( '.project-iframe' );
const icon_close = document.createElement( 'i' );
icon_close.classList.add( 'material-icons' );
icon_close.textContent = 'close';
const loading = document.querySelector( '.lds-ring' );

const sections = [];
const videos = [];

const triggerTypes = [ 'click', 'touchend' ];

const SCROLL_INTERVAL_THRESHOLD = 800;
const SCROLL_DISTANCE_THRESHOLD = 20;
const DEFAULT_PROJECT_NAME_TRANSFORM = 'translate3d(0,0, 100px)';

const touchEvent = { startX: 0, startY: 0, lastEndTime: 0, startTime: 0 };
const scrollEvent = { startTime: 0 };
const mouseEvent = { clientX: 0, clientY: 0 };

let sectionIndex = 0, lastSectionIndex = 0;

const loadProjectJSON = ( url ) => {
    
    return fetch( url )
    .then( response => response.json() )
    .then( json => Object.entries( json ) )
    .catch( console.error );

};

const onProjectListLoaded = ( projectList ) => {

    projectList.forEach( ( entry, index ) => {

        const section = document.createElement( 'section' );
        const projectData = Object.assign( { name: entry[ 0 ] }, entry[ 1 ] );
        const projectElement = createProjectElements( projectData, index );

        Object.assign( section, projectData );

        section.appendChild( projectElement );
        section.style.height = window.innerHeight + 'px';
        section.index = index;
        section.project = Object.assign( { element: projectElement }, projectData );

        const textElement = projectElement.name.textElement;
        const sideEntry = projectElement.entry;
        const videoElement = projectElement.videoContainer.video;
        const isVideoWithoutLazyLoad = !lazyLoadSupport && videoElement;
        const eventTypes = [ 'mousemove', 'touchmove' ];

        section.hide = () => {

            eventTypes.forEach( type => section.removeEventListener( type, onSectionMouseMove ) );
            textElement.classList.add( 'hidden' );
            sideEntry.classList.remove( 'selected' );

            if ( isVideoWithoutLazyLoad ) { videoElement.pause(); }

        };
        section.show = () => {

            main.style.background = section.background;

            scrollToSection( section );

            eventTypes.forEach( type => section.addEventListener( type, onSectionMouseMove ) );
            textElement.classList.remove( 'hidden' );
            sideEntry.classList.add( 'selected' );

            if ( isVideoWithoutLazyLoad ) { 

                if ( !videoElement.src ) {

                    videoElement.src = videoElement.getAttribute( 'data-src' );

                }

                videoElement.play();

            }

        };

        section.addEventListener( 'touchstart', onTouchStart, { passive: false } );

        sections.push( section );

        main.appendChild( section );

    } );

    updateSection( 0 );
    registerLazyLoad( '.project-video' );

    return projectList;

};

const createProjectElements = ( project, index ) => {

    const element = document.createElement( 'div' );
    element.classList.add( 'project' );
    
    const videoContainer = createProjectVideo( project );
    const name = createProjectName( project );
    const entry = createSideEntry( project, index );

    element.appendChild( videoContainer );
    element.appendChild( name );

    element.videoContainer = videoContainer;
    element.name = name;
    element.entry = entry;

    return element;

};

const createProjectName = ( project ) => {

    const textElement = document.createElement( 'div' );
    textElement.classList.add( 'hidden' );
    textElement.textContent = project.name;

    const element = document.createElement( 'div' );
    element.classList.add( 'project-name' );
    element.style.transform = DEFAULT_PROJECT_NAME_TRANSFORM;

    element.appendChild( textElement );
    element.textElement = textElement;

    return element;    

};

const createProjectVideo = ( project ) => {

    // Fix for Github Pages doesn't support Git LFS resource
    const GITHUB_RESOURCE_PATH = 'https://github.com/pchen66/pchen66.github.io/blob/master';

    const element = document.createElement( 'div' );
    element.classList.add( 'project-video-container' );

    const video = document.createElement( 'video' );
    const source = window.location.host.indexOf( 'pchen66.github.io' ) === -1 
        ? project.video
        : project.video.replace( './Playground', `${GITHUB_RESOURCE_PATH}/Playground` ).concat( '?raw=true' );

    video.classList.add( 'project-video' );
    video.loop = true;
    video.muted = true;
    video.setAttribute( 'playsinline', true );
    video.setAttribute( 'data-src', source );

    videos.push( video );

    element.video = video;
    element.appendChild( video );

    element.addEventListener( 'mouseenter', () => { video.play(); } );
    element.addEventListener( 'mouseleave', () => { video.pause(); } );

    const onIFrameLoaded = () => {

        iframe.classList.remove( 'hidden' );
        iframe.removeEventListener( 'load', onIFrameLoaded );
        loading.classList.add( 'hidden' );

    };

    const onExpandComplete = () => {

        iframe.addEventListener( 'load', onIFrameLoaded );
        iframe.src = project.link;

        element.removeEventListener( 'transitionend', onExpandComplete );

    };

    element.expand = () => {

        if ( element.classList.contains( 'full' ) ) { return };

        element.classList.add( 'full' );
        element.addEventListener( 'transitionend', onExpandComplete );
        loading.classList.remove( 'hidden' );

    };

    element.reset = () => {

        element.classList.remove( 'full' );

    };

    element.toggle = () => {

        element.classList.toggle( 'full' );

    };

    element.addEventListener( 'click', element.expand );
    element.addEventListener( 'touchend', ( event ) => { 

        const threshold = 15;
        const minTime = 400;
        const deltaX = event.changedTouches[ 0 ].clientX - touchEvent.startX;
        const deltaY = event.changedTouches[ 0 ].clientY - touchEvent.startY;
        const deltaTime = performance.now() - touchEvent.startTime;

        if ( Math.abs( deltaX ) < threshold && Math.abs( deltaY ) < threshold && deltaTime < minTime ) {

            element.expand();

        }

    } );

    return element;

};

const createSideEntry = ( project, index ) => {

    const bar = document.createElement( 'div' );
    bar.classList.add( 'bar' );

    const number = document.createElement( 'div' );
    number.textContent = `0${index + 1}`;
    number.classList.add( 'number' );

    const entry = document.createElement( 'div' );
    entry.index = index
    entry.classList.add( 'entry' );

    triggerTypes.forEach( ( type ) => {

        entry.addEventListener( type, () => updateSection( entry.index ) );

    } )

    entry.appendChild( bar );
    entry.appendChild( number );
    sideNav.appendChild( entry );

    return entry;

};

const onSectionMouseMove = ( event ) => {

    const ROTATION_SCALAR = 30;

    const clientX = event.changedTouches ? event.changedTouches[ 0 ].clientX : event.clientX;
    const clientY = event.changedTouches ? event.changedTouches[ 0 ].clientY : event.clientY;

    const section = sections[ sectionIndex ];
    const nameElement = section.project.element.name;
    const videoContainer = section.project.element.videoContainer;
    const degX = - ( clientY / window.innerHeight - 0.5 ) * ROTATION_SCALAR;
    const degY = ( clientX / window.innerWidth - 0.5 ) * ROTATION_SCALAR;
    const transform = `rotateX(${degX}deg) rotateY(${degY}deg)`;
    
    videoContainer.style.transform = transform;
    nameElement.style.transform = `${transform} ${DEFAULT_PROJECT_NAME_TRANSFORM}`;

};

const scrollToSection = ( section ) => {

    main.style.transform = `translate3d( 0, ${ -section.clientHeight * section.index }px, 0 )`;

};

const updateSection = ( index ) => {

    if ( index >= sections.length || index < 0 ) {

        index = 0;

    }

    lastSectionIndex = sectionIndex;
    sectionIndex = index;

    advanceSection();

};

const advanceSection = () => {

    const previous = sections[ lastSectionIndex ];
    const current = sections[ sectionIndex ];

    previous.hide();
    current.show();

};

const isScrollEnabled = () => performance.now() - scrollEvent.startTime > SCROLL_INTERVAL_THRESHOLD;

const onScroll = ( event ) => { 

    if ( ( isScrollEnabled() || performance.now() < SCROLL_INTERVAL_THRESHOLD ) && Math.abs( event.deltaY ) > 10 ) {

        scrollEvent.startTime = performance.now();

        updateSection( sectionIndex + ( event.deltaY > 0 ? 1 : -1 ) );

    } 

 };

const onTouchStart = ( event ) => {

    const target = event.target;

    event.preventDefault();
    event.stopPropagation();

    touchEvent.startX = event.changedTouches[ 0 ].clientX;
    touchEvent.startY = event.changedTouches[ 0 ].clientY;
    touchEvent.startTime = performance.now();

    target.addEventListener( 'touchend', onTouchEnd, { passive: false } );

};

const onTouchEnd = ( event ) => {

    const target = event.target;

    event.preventDefault();
    event.stopPropagation();

    const deltaTime = performance.now() - touchEvent.lastEndTime;
    const elapsedTime = performance.now() - touchEvent.startTime;
    const deltaY = touchEvent.startY - event.changedTouches[ 0 ].clientY;

    if ( deltaTime > SCROLL_INTERVAL_THRESHOLD && elapsedTime < SCROLL_INTERVAL_THRESHOLD && Math.abs( deltaY ) > SCROLL_DISTANCE_THRESHOLD ) {

        touchEvent.lastEndTime = performance.now();
        onScroll( { deltaY } );

    }

    target.removeEventListener( 'touchend', onTouchEnd );

};

const onAbout = ( event ) => {

    event.preventDefault();
    event.stopPropagation();

    overlay.classList.toggle( 'hidden' );
    sections[ sectionIndex ].classList.toggle( 'shrink' );

    if ( overlay.classList.contains( 'hidden' ) ) {

        about.textContent = 'About';
        about.removeChild( icon_close );

    } else {

        about.textContent = '';
        about.appendChild( icon_close );

    }

};

const onHome = ( event ) => {

    const section = sections[ sectionIndex ];

    event.preventDefault();
    event.stopPropagation();

    const onIFrameHidden = () => {

        iframe.src = 'about:blank';
        iframe.removeEventListener( 'transitionend', onIFrameHidden );

    };

    iframe.addEventListener( 'transitionend', onIFrameHidden );
    iframe.classList.add( 'hidden' );

    section.project.element.videoContainer.reset();

};

const init = () => {

    loadProjectJSON( 'Playground/Projects.json' ).then( onProjectListLoaded );

    addWheelListener( main, onScroll );

    about.addEventListener( 'click', onAbout );
    home.addEventListener( 'click', onHome );

};

window.addEventListener( 'load', init );
