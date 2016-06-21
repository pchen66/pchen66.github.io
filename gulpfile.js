var gulp = require('gulp');
var concat = require('gulp-concat');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');

var THREEJS_OUTPUT = 'js/three';
var THREEJS = [
	
	'node_modules/three/build/three.min.js',

];
var THREEJS_COMPONENTS = [

	'node_modules/three/examples/js/Detector.js',
	'node_modules/three/examples/js/libs/stats.min.js',
	'node_modules/three/examples/js/libs/tween.min.js',
  'node_modules/three/examples/js/libs/dat.gui.min.js',
	'node_modules/three/examples/js/loaders/ColladaLoader.js',
  'node_modules/three/examples/js/loaders/MTLLoader.js',
  'node_modules/three/examples/js/loaders/OBJLoader.js',
	'node_modules/three/examples/js/controls/OrbitControls.js',
  'node_modules/three/examples/js/controls/TrackballControls.js',
  'node_modules/three/examples/js/renderers/CSS3DRenderer.js',
  'node_modules/three/examples/js/modifiers/ExplodeModifier.js',
  'node_modules/three/examples/js/GPUParticleSystem.js'

];

gulp.task( 'default', [ 'copy-three-library', 'copy-three-library-component' ] );

gulp.task('copy-three-library', function () {
  return gulp.src( THREEJS )
    .pipe( gulp.dest( THREEJS_OUTPUT ) );
});

gulp.task('copy-three-library-component', function () {
  return gulp.src( THREEJS_COMPONENTS, { base: 'node_modules/three/examples/js/' } )
    .pipe( gulp.dest( THREEJS_OUTPUT ) );
});

gulp.task('minify-PanoTheater', function () {
  return gulp.src( './PanoTheater/src/**.js' )
    .pipe( concat( 'app.min.js', { newLine: ';' } ) )
    .pipe( stripDebug() )
    .pipe( uglify() )
    .pipe( gulp.dest( './PanoTheater/js' ) );
});
