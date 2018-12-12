/**
 * Jun 21, 2018
 * @author Ray Chen
 * @class Basic3D
 * @description Templatize basic threejs scene creation and rendering
 */

const EVENT_INIT_COMPLETE = 1;
const EVENT_ANIMATION_FRAME = 2;
const EVENT_WIDNOW_RESIZE = 3;

const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream; 

class Basic3D {

    static get EVENT_INIT_COMPLETE () { return EVENT_INIT_COMPLETE;  };
    static get EVENT_ANIMATION_FRAME () { return EVENT_ANIMATION_FRAME;  };
    static get EVENT_WIDNOW_RESIZE () { return EVENT_WIDNOW_RESIZE;  };

    constructor ( options ) {

        this.options = options;
        this.camera;
        this.scene;
        this.renderer;
        this.controls ;
        this.gui;

        this.requestAnimationId;

        this.options.rendererOptions = options.rendererOptions || {};

    }

    addEventListener ( type, listener ) {

        if ( this._listeners === undefined ) this._listeners = {};

        const listeners = this._listeners;

        if ( listeners[ type ] === undefined ) {

            listeners[ type ] = [];

        }

        if ( listeners[ type ].indexOf( listener ) === - 1 ) {

            listeners[ type ].push( listener );

        }

    }

    hasEventListener ( type, listener ) {

        if ( this._listeners === undefined ) return false;

        const listeners = this._listeners;

        return listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1;

    }

    removeEventListener ( type, listener ) {

        if ( this._listeners === undefined ) return;

        const listeners = this._listeners;
        const listenerArray = listeners[ type ];

        if ( listenerArray !== undefined ) {

            const index = listenerArray.indexOf( listener );

            if ( index !== - 1 ) {

                listenerArray.splice( index, 1 );

            }

        }

    }

    dispatchEvent ( event ) {

        if ( this._listeners === undefined ) return;

        const listeners = this._listeners;
        const listenerArray = listeners[ event.type ];

        if ( listenerArray !== undefined ) {

            event.target = this;

            const array = listenerArray.slice( 0 );

            for ( let i = 0, l = array.length; i < l; i ++ ) {

                array[ i ].call( this, event );

            }

        }

    }

    init () {

        this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
        this.camera.position.z = 10;

        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer( this.options.rendererOptions );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        
        document.body.appendChild( this.renderer.domElement );

        this.control = this.options.OrbitControls ? new THREE.OrbitControls( this.camera, this.renderer.domElement ) : undefined;
        this.gui = this.options.DatGui ? new dat.GUI() : undefined;

        window.addEventListener( 'resize', this.onWindowResize.bind( this ), false );
        document.addEventListener( 'visibilitychange', this.handleVisibilityChange.bind( this ), false );

        this.dispatchEvent( { type: EVENT_INIT_COMPLETE } );

    }

    onWindowResize ( event ) {

        const width = iOS ? screen.width : window.innerWidth;
        const height = iOS ? screen.height : window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize( width, height );

        this.dispatchEvent( { type: EVENT_WIDNOW_RESIZE } );

    }

    handleVisibilityChange () {

        if ( document.hidden ) {

            window.cancelAnimationFrame( this.requestAnimationId );
            this.requestAnimationId = null;

        } else if ( !this.requestAnimationId ) {

            this.requestAnimationId = window.requestAnimationFrame( this.animate.bind( this ) );

        }

    }

    animate () {

        this.requestAnimationId = window.requestAnimationFrame( this.animate.bind( this ) );

        this.controls && this.controls.update();

        this.dispatchEvent( { type: EVENT_ANIMATION_FRAME } );

        this.render();

    }

    render () {

        this.renderer.render( this.scene, this.camera );

    }

}

export default Basic3D;