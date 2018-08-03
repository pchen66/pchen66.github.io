export const PointMaterialShader = {

    uniforms: {

        depth: { value: 15 },
        texture: { value: new THREE.Texture() },
        pixelColor: { value: new THREE.Color( 0xffffff ) },
        pointSize:  { value: 2 }

    },

    vertexShader: [

        "uniform sampler2D texture;",
        "uniform float depth;",
        "uniform float pointSize;",
        "varying vec2 vUv;",
        "vec3 heightPosition;",
        "void main()",
        "{",
        "    vUv = uv;",
        "    heightPosition = position;",

        "    vec3 color = texture2D( texture, vUv ).rgb;",
        "    heightPosition.z = depth * length( color );",
        "    vec4 mvPosition = modelViewMatrix * vec4( heightPosition, 1.0 );",
        "    gl_PointSize = pointSize;",
        "    gl_Position = projectionMatrix * mvPosition;",
        "}"

    ].join('\n'),

    fragmentShader: [

        "uniform sampler2D texture;",
        "uniform float depth;",
        "uniform vec3 pixelColor;",
        "varying vec2 vUv;",
        "void main( void ) {",
        "    vec3 color = texture2D( texture, vUv ).rgb;",
        "    color = pixelColor * length( color );",
        "    gl_FragColor = vec4( color, length( color ) );",
        "}"

    ].join('\n'),

    transparent: true

};