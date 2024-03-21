import * as THREE from './three.module.js';

const scene = new THREE.Scene();

var canvas = document.getElementById('threejs-canvas');

var camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
camera.position.z = 5;

var renderer = new THREE.WebGLRenderer({ canvas: canvas }); // Указываем canvas напрямую
renderer.setSize(canvas.clientWidth, canvas.clientHeight);

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

function updateCanvasSize() {
    var container = document.getElementById('threejs-window');
    var canvas = document.getElementById('threejs-canvas');

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.clientWidth, container.clientHeight);
}
window.addEventListener('resize', updateCanvasSize);

function animate() {
    requestAnimationFrame( animate );
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render( scene, camera );
}

animate();
