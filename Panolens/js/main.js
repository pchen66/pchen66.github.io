(function(){

  var viewer, container, title, docSection, exampleSection, routePanoramas, assetPath, items, selection, cards, menuIcon, nav;

  assetPath = 'examples/asset/textures/equirectangular';
  selection = document.querySelector( '.item.selected' );

  routePanoramas = {
    Home: { 
      panorama: new PANOLENS.ImagePanorama( assetPath + '/planet.jpg' ), 
      rotationY: Math.PI 
    },
    Documentation: { 
      panorama: new PANOLENS.ImagePanorama( assetPath + '/tunnel.jpg' ),
      rotationY: Math.PI / 2 
    },
    Example: { 
      panorama: new PANOLENS.ImagePanorama( assetPath + '/sunset.jpg' )
    }
  };

  nav = document.querySelector( 'nav' );
  container = document.querySelector( 'section.background' );
  title = document.querySelector( 'section.title' );
  docSection = document.querySelector( 'section.documentation' );
  exampleSection = document.querySelector( 'section.example' );
  cards = document.querySelectorAll( '.card' );
  menuIcon = document.querySelector( '.menu-icon' );
  items = document.querySelectorAll( '.item' );

  viewer = new PANOLENS.Viewer( { container: container, controlBar: false } );

  function addDomEvents () {

    container.addEventListener( 'mousedown', function(){
      this.classList.add( 'mousedown' );
    }, false );

    container.addEventListener( 'mouseup', function(){
      this.classList.remove( 'mousedown' );
    }, false );

    menuIcon.addEventListener( 'click', function () {
      this.classList.toggle( 'open' );
      nav.classList.toggle( 'open' );
    }, false );

    nav.classList.add( 'animated' );

    // Add click events
    for ( var i = 0; i < cards.length; i++ ) {

      cards[i].addEventListener( 'click', function(){

        window.location.assign( this.getAttribute( 'data-url' ) );

      }, false );

    }

    // Routing
    for ( var i = 0, hash; i < items.length; i++ ) {

      hash = items[ i ].getAttribute( 'data-hash' );

      if ( hash ) {

        items[ i ].addEventListener( 'click', function () {

          routeTo( this.getAttribute( 'name' ), this );

        }, false );

      }      

      if ( hash === window.location.hash ) {

        routeTo( hash.replace( '#', '' ), items[ i ] );

      }

    }

  }

  function setUpInitialState () {

    if ( routePanoramas ) {

      for ( var routeName in routePanoramas ) {

        if ( routePanoramas.hasOwnProperty( routeName ) ) {

          var route = routePanoramas[ routeName ];

          if ( route.rotationY ) {

            route.panorama.rotation.y = route.rotationY;

          }

          viewer.add( route.panorama );

        }

      }

    }

  }

  function routeTo ( name, element ) {

    window.location.hash = '' + name;

    if ( name === 'Home' ) {

      title.classList.remove( 'hide' );
      docSection.classList.add( 'hide' );
      exampleSection.classList.add( 'hide' );

    } else if ( name === 'Documentation' ){

      title.classList.add( 'hide' );
      docSection.classList.remove( 'hide' );
      exampleSection.classList.add( 'hide' );

    } else if ( name === 'Example' ){

      title.classList.add( 'hide' );
      docSection.classList.add( 'hide' );
      exampleSection.classList.remove( 'hide' );

    }

    menuIcon.classList.remove( 'open' );
    nav.classList.remove( 'open' );

    selection.classList.remove( 'selected' );
    selection = element;
    selection.classList.add( 'selected' );

    viewer.setPanorama( routePanoramas[ name ].panorama );

  }

  addDomEvents();
  setUpInitialState();

})();