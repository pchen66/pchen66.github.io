
export const lazyLoadSupport = 'IntersectionObserver' in window;

export const registerLazyLoad = ( selector ) => {

  const contents = document.querySelectorAll( selector );

  if ( lazyLoadSupport ) {

    const oberserver = new IntersectionObserver( function( entries, observer ) {

      entries.forEach( function( entry ) {

        if ( entry.isIntersecting ) {
          let element = entry.target;
          element.src = element.dataset.src;
          element.srcset = element.dataset.srcset;
          element.classList.remove( 'lazy' );
          oberserver.unobserve( element );
        }

      });

    });

    contents.forEach( function( element ) {

      oberserver.observe( element );

    });

  }

  return lazyLoadSupport;

};