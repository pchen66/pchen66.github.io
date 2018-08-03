/**
 * July 1, 2018
 * @author Ray Chen
 * @class TexturePoints
 * @description Points object with image texture
 */


class TexturePoints {

    constructor () {}

    getImageData( image ) {

        const canvas = document.createElement( 'canvas' );
        canvas.width = image.width;
        canvas.height = image.height;

        const context = canvas.getContext( '2d' );
        context.drawImage( image, 0, 0 );

        return context.getImageData( 0, 0, image.width, image.height );

    }

    generateTexturePoints ( texture, maxWidth, maxHeight ) {
        
        const positions = [];
        const colors = [];
        const directions = [];
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.PointsMaterial( { size: 1, vertexColors: THREE.VertexColors, sizeAttenuation: false, blending: THREE.AdditiveBlending } );
        let width, height, index, data, px, py, pz = 0, pixelColor = new THREE.Color();
        let imageData, dpr;
        let points;

        imageData = this.getImageData( texture.image );

        width = imageData.width > maxWidth ? maxWidth : imageData.width;
        height = imageData.height > maxHeight ? maxHeight : imageData.height;
        dpr = Math.max( window.devicePixelRatio, 2.0 );

        for ( let y = 0; y < height; y++ ) {
            for ( let x = 0; x < width; x++ ) {

                index = ( x + imageData.width * y ) * 4;
                data = imageData.data;

                px = x - width / 2;
                py = - ( y - height / 2 );
                px /= dpr;
                py /= dpr;

                // Color
                pixelColor.setRGB( data[ index ] / 255, data[ index + 1 ] / 255, data[ index + 2 ] / 255 );
                colors.push( pixelColor.r, pixelColor.g, pixelColor.b );

                // Alpha
                if ( data[ index + 3 ] == 0 ) pz = -Math.Infinity;

                // Position
                positions.push( px, py, pz );

                // Directions
                directions.push( 
                    ( Math.random() - 0.5 ) * 2, 
                    ( Math.random() - 0.5 ) * 2, 
                    ( Math.random() - 0.5 ) * 2 
                );

            }
        }

        geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ).setDynamic( true ) );
        geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
        geometry.addAttribute( 'originalPosition', new THREE.Float32BufferAttribute( positions, 3 ) );
        geometry.computeBoundingSphere();

        geometry.attributes.position.directions = directions.slice(0);
        geometry.attributes.color.original = colors.slice(0);

        points = new THREE.Points( geometry, material );
        points.imageData = imageData;

        return points;

    }

}

export default TexturePoints;