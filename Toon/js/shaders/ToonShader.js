// Based on Graphics Shaders: Theory and Practice 
// https://www.amazon.com/Graphics-Shaders-Theory-Practice-Second-ebook/dp/B0083DJT8U

const ToonShader = {

    uniforms: {

        "tDiffuse": { value: null },
        "uMagTol": { value: 0.6 },
        "uQuantize": { value: 4.0 },
        "uStep": { value: new THREE.Vector2( 500, 500 ) }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

            "vUv = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join( "\n" ),

    fragmentShader: [

        "uniform sampler2D tDiffuse;",
        "uniform float uMagTol;",
        "uniform float uQuantize;",
        "uniform vec2 uStep;",

        "varying vec2 vUv;",

        "void main() {",

            "vec3 rgb = texture2D( tDiffuse, vUv ).rgb;",
            "vec2 stp0 = vec2(1./uStep.x, 0.);",
            "vec2 st0p = vec2(0., 1./uStep.y);",
            "vec2 stpp = vec2(1./uStep.x, 1./uStep.y);",
            "vec2 stpm = vec2(1./uStep.x, -1./uStep.y);",

            "const vec3 w = vec3(0.2125, 0.7154, 0.0721);",
            "float i00 = dot( texture2D( tDiffuse, vUv ).rgb, w);",
            "float im1m1 = dot( texture2D( tDiffuse, vUv - stpp ).rgb, w);",
            "float ip1p1 = dot( texture2D( tDiffuse, vUv + stpp ).rgb, w);",
            "float im1p1 = dot( texture2D( tDiffuse, vUv - stpm ).rgb, w);",
            "float ip1m1 = dot( texture2D( tDiffuse, vUv + stpm ).rgb, w);",
            "float im10 = dot( texture2D( tDiffuse, vUv - stp0 ).rgb, w);",
            "float ip10 = dot( texture2D( tDiffuse, vUv + stp0 ).rgb, w);",
            "float i0m1 = dot( texture2D( tDiffuse, vUv - st0p ).rgb, w);",
            "float i0p1 = dot( texture2D( tDiffuse, vUv + st0p ).rgb, w);",

            "float h = -1.*im1p1 - 2.*i0p1 - 1.*ip1p1 + 1.*im1m1 + 2.*i0m1 + 1.*ip1m1;",
            "float v = -1.*im1m1 - 2.*im10 - 1.*im1p1 + 1.*ip1m1 + 2.*ip10 + 1.*ip1p1;",
            "float mag = length( vec2( h, v ) );",

            "if (mag > uMagTol) { gl_FragColor = vec4( 0., 0., 0., 1. ); }",
            "else { ",
            "   rgb *= uQuantize;",
            "   rgb += vec3( .5, .5, .5 );",
            "   rgb = floor(rgb) / uQuantize;",
            "   gl_FragColor = vec4( rgb, 1. );",
            "}",

        "}"

    ].join( "\n" )
    
};

export default ToonShader;