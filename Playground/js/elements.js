export const MODE = { SHOW: 0, HIDE: 1, CLOSE: 2 };

export const entrance = document.querySelector( '.entrance' );
export const menuContainer = document.querySelector( '.menu-container' );
export const menuButton = document.querySelector( '.menu-button' );
export const menuIcon = menuButton.querySelector( 'i' );
export const iframeContainer = document.querySelector( '.iframe-container' );

let menuMode = MODE.SHOW;

export const setMenuIconMode = ( mode ) => {

    switch ( mode ) {

        case MODE.SHOW:

            menuContainer.classList.add( 'hidden' );
            menuIcon.classList.add( 'fa-bars' );
            menuIcon.classList.remove( 'fa-angle-down' );
            menuIcon.classList.remove( 'fa-times' );

            break;

        case MODE.HIDE:

            menuContainer.classList.remove( 'hidden' );
            menuIcon.classList.add( 'fa-angle-down' );
            menuIcon.classList.remove( 'fa-bars' );
            menuIcon.classList.remove( 'fa-times' );

            break;

        case MODE.CLOSE:

            menuContainer.classList.add( 'hidden' );
            menuIcon.classList.remove( 'fa-bars' );
            menuIcon.classList.remove( 'fa-angle-down' );
            menuIcon.classList.add( 'fa-times' );

            break;

        default: 

            break;

    }

    menuMode = mode;

};

export const toggleMenu = () => {

    switch ( menuMode ) {

        case MODE.SHOW:
        case MODE.CLOSE:

            setMenuIconMode( MODE.HIDE );

            break;

        case MODE.HIDE:

            setMenuIconMode( MODE.SHOW );

            break;

        default: 

            break;

    }

};

export const onIFrameLoaded = () => {

    iframeContainer.classList.remove( 'hidden' );
    menuButton.removeEventListener( 'click', toggleMenu );

};

export const onIFrameDismissed = ( event ) => {

    event.stopPropagation();

    menuIcon.classList.remove( 'fa-times' );
    menuIcon.classList.add( 'fa-bars' );
    menuButton.addEventListener( 'click', toggleMenu );

    function onTransitionEnd( event ) {

        iframeContainer.removeEventListener( 'transitionend', onTransitionEnd );
        iframeContainer.src = '';
    }

    iframeContainer.classList.add( 'hidden' );
    iframeContainer.addEventListener( 'transitionend', onTransitionEnd );

};

menuButton.addEventListener( 'click', toggleMenu );