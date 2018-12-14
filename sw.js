
//Install stage sets up the index page (home page) in the cache and opens a new cache

self.addEventListener( 'install', ( event ) => {

    const indexPage = new Request( 'index.html' );

    event.waitUntil(
        fetch( indexPage )
            .then( ( response ) => {
            return caches.open( 'pchen66.github.io-offline' )
                .then( ( cache ) => {
                    console.log( '[pchen66.github.io] Cached index page during Install' + response.url );
                    return cache.put( indexPage, response );
                });
            })

    );
});

//If any fetch fails, it will look for the request in the cache and serve it from there first
self.addEventListener( 'fetch', ( event ) => {

    const updateCache = ( request ) => {
        return caches.open('pchen66.github.io-offline')
            .then( ( cache ) => {
                return fetch( request )
                    .then( ( response ) => {
                        console.log('[pchen66.github.io] add page to offline ' + response.url );
                        return cache.put( request, response );
                    });
            });
    };


    event.waitUntil( updateCache( event.request ) );

    event.respondWith(

        caches.match( event.request )
        
        .then( response => {

            if ( response ) { return response; }
            else {

                return fetch( event.request )
                    .catch( ( error ) => {
                        console.log( '[pchen66.github.io] Network request Failed. Serving content from cache: ' + error );

                        //Check to see if you have it in the cache
                        //Return response
                        //If not in the cache, then return error page
                        return caches.open( 'pchen66.github.io-offline' )
                            .then( ( cache ) => {
                                return cache.match( event.request ).then( ( matching ) => {
                                    const report =  !matching || matching.status == 404 ? Promise.reject( 'no-match' ): matching;
                                    return report;
                                });
                            });
                    })

            }

        })
        
    );
});
