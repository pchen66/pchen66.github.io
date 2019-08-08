(function(){

  var viewer, container, title, docSection, exampleSection, supportSection, routePanoramas, assetPath, items, selection, cards, menuIcon, nav, progressElement, progress;

  assetPath = 'examples/asset/textures/equirectangular';
  selection = document.querySelector( '.item.selected' );

  routePanoramas = {
    Home: { 
      panorama: new PANOLENS.ImagePanorama( assetPath + '/view.jpg' ), 
      initialLookPosition: new THREE.Vector3( -5000.00, 167.06, 3449.90 )
    },
    Documentation: { 
      panorama: new PANOLENS.ImagePanorama( assetPath + '/tunnel.jpg' ),
      initialLookPosition: new THREE.Vector3( 4994.63, -110.08, -19.93 ) 
    },
    Example: { 
      panorama: new PANOLENS.ImagePanorama( assetPath + '/planet.jpg' )
    },
    Support: { 
      panorama: new PANOLENS.GoogleStreetviewPanorama( '-OiczBjHvoJdQVTg9tGUTQ' ),
      initialLookPosition: new THREE.Vector3( -5000.00, -901.09, -74.03 )
    }
  };

  nav = document.querySelector( 'nav' );
  container = document.querySelector( 'section.background' );
  title = document.querySelector( 'section.title' );
  docSection = document.querySelector( 'section.documentation' );
  exampleSection = document.querySelector( 'section.example' );
  supportSection = document.querySelector( 'section.support' );
  cards = document.querySelectorAll( '.card' );
  menuIcon = document.querySelector( '.menu-icon' );
  items = document.querySelectorAll( '.item' );
  progressElement = document.getElementById( 'progress' );

  viewer = new PANOLENS.Viewer( { container: container, controlBar: false } );

  window.addEventListener( 'orientationchange', function () {
    nav.classList.remove('animated');
    setTimeout(function(){
      viewer.onWindowResize(window.innerWidth, window.innerHeight)
    }, 200);
    
  }, false );

  function onEnter ( event ) {

    progressElement.style.width = 0;
    progressElement.classList.remove( 'finish' );

  }

  function onProgress ( event ) {

    progress = event.progress.loaded / event.progress.total * 100;
    progressElement.style.width = progress + '%';
    if ( progress === 100 ) {
      progressElement.classList.add( 'finish' );
    }

  }

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

          route.panorama.addEventListener( 'progress', onProgress );
          route.panorama.addEventListener( 'enter', onEnter );

          if ( route.initialLookPosition ) {
            route.panorama.addEventListener('enter-fade-start', function( position ){
              viewer.setControlCenter( position );
            }.bind( this, route.initialLookPosition ));
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
      supportSection.classList.add( 'hide' );

    } else if ( name === 'Documentation' ){

      title.classList.add( 'hide' );
      docSection.classList.remove( 'hide' );
      exampleSection.classList.add( 'hide' );
      supportSection.classList.add( 'hide' );

    } else if ( name === 'Example' ){

      title.classList.add( 'hide' );
      docSection.classList.add( 'hide' );
      exampleSection.classList.remove( 'hide' );
      supportSection.classList.add( 'hide' );

    } else if ( name === 'Support' ){

      title.classList.add( 'hide' );
      docSection.classList.add( 'hide' );
      exampleSection.classList.add( 'hide' );
      supportSection.classList.remove( 'hide' );

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