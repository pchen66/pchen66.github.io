/**
 * Jun 21, 2018
 * @author Ray Chen
 * @class SphereicalHarmonics
 * @description Spherical Harmonics Mesh Generator based on http://paulbourke.net/geometry/sphericalh/
 */

class SphericalHarmonics {

    constructor( options ) {

        options = options || {};

        this.options = options;
        this.max = options.max || 6;
        this.scale = options.scale || 1;
        this.resolution = options.resolution || 100;
        this.baseTint = options.baseTint || new THREE.Color( 0.5, 0.5, 0.5 );

        this.mesh;
        this.blend = 1.0;
        this.increment = 0.01;

    }

    generateRandomInteger () {

        return Math.round( Math.random() * this.max );

    }

    generateRandomParameters () {

        const options = this.options;

        for ( let i = 0; i < 8; i++ ) {

            options[ `m${i}` ] = this.generateRandomInteger();

        }

    }

    getSurfacePosition ( u, v, p0 ) {

        const options = this.options;
        const m = [ options.m0, options.m1, options.m2, options.m3, options.m4, options.m5, options.m6, options.m7 ];
        let r = 0;

        u *= 2 * Math.PI;
        v *= Math.PI;

        r += Math.pow( Math.sin( m[ 0 ] * v ), m[ 1 ] );
        r += Math.pow( Math.cos( m[ 2 ] * v ), m[ 3 ] );
        r += Math.pow( Math.sin( m[ 4 ] * u ), m[ 5 ] );
        r += Math.pow( Math.cos( m[ 6 ] * u ), m[ 7 ] );

        r = options.unitSize ? THREE.Math.clamp( r, 0, 1 ) : r;

        p0.x = r * Math.sin( v ) * Math.cos( u );
        p0.y = r * Math.cos( v );
        p0.z = r * Math.sin( v ) * Math.sin( u );

        p0.multiplyScalar( this.scale );

    }

    disposeMesh () {

        if ( this.mesh ) {

            this.mesh.material.dispose();
            this.mesh.geometry.dispose();

        }

    }

    updateMaterial( options ) {

        for ( const name in options ) {

            if ( options.hasOwnProperty( name ) && this.mesh.material.hasOwnProperty( name ) ) {

                this.mesh.material[ name ] = options[ name ];

            }

        }

        this.mesh.material.needsUpdate = true;

    }

    updateGeometry () {

        const attributes = this.mesh.geometry.attributes;
        const geometry = new THREE.ParametricBufferGeometry( this.getSurfacePosition.bind( this ), this.resolution, this.resolution );
        const boundingRadius = this.getBoundingSphereRadius( geometry );
        const position = geometry.attributes.position.array;

        if ( !attributes.target ) {

            attributes.target = attributes.position.clone();

        }

        if ( !attributes.color ) {

            attributes.color = attributes.normal.clone();

        }

        attributes.target.copy( geometry.attributes.position );
        attributes.normal.copy( geometry.attributes.normal );
        attributes.uv.copy( geometry.attributes.uv );

        const color = attributes.color.array;

        for ( let i = 0, length = position.length; i < length; i += 3 ) {

            color[ i ] = this.baseTint.r + position[ i ] / boundingRadius;
            color[ i + 1 ] = this.baseTint.g + position[ i + 1 ] / boundingRadius;
            color[ i + 2 ] = this.baseTint.b + position[ i + 2 ] / boundingRadius;

        }

        this.blend = 0;

        attributes.normal.needsUpdate = true;
        attributes.color.needsUpdate = true;

    }

    getBoundingSphereRadius ( geometry ) {

        geometry.computeBoundingSphere();

        return geometry.boundingSphere.radius;

    }

    buildSurfaceMesh () {

        const options = this.options;
        const geometry = new THREE.ParametricBufferGeometry( ( u, v, p ) => {}, this.resolution, this.resolution );
        const material = new THREE.MeshStandardMaterial( { vertexColors: THREE.VertexColors, wireframe: options.wireframe, metalness: 0, roughness: 0 } );

        this.mesh = new THREE.Mesh( geometry, material );
        this.updateGeometry();
        
        return this.mesh;

    }

    update () {

        if ( this.options.autoRotate ) {

            this.mesh.rotation.x += 0.005;
            this.mesh.rotation.y += 0.01;

        }

        if ( this.blend < 1 ) {

            const position = this.mesh.geometry.attributes.position.array;
            const target = this.mesh.geometry.attributes.target.array; 

            for ( let i = 0, length = position.length; i < length; i += 3 ) {

                position[ i ] += ( target[ i ] - position[ i ] ) * this.blend;
                position[ i + 1 ] += ( target[ i + 1 ] - position[ i + 1 ] ) * this.blend;
                position[ i + 2 ] += ( target[ i + 2 ] - position[ i + 2 ] ) * this.blend;

            }

            this.mesh.geometry.attributes.position.needsUpdate = true;

            this.blend += this.increment;
            this.blend = this.blend >= 1 ? 1 : this.blend;

        }        

    }

}

export default SphericalHarmonics;