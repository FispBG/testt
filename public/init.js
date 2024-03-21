import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';

const init = () => {
	var canvas = document.getElementById('threejs-canvas');
	const sizes = {
		width: canvas.clientWidth,
		height: canvas.clientHeight,
	};

	const scene = new THREE.Scene();
	const perspectiveCamera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
	scene.add(perspectiveCamera);

	let height_camera = 32;
	let width_camera = height_camera * (sizes.width / sizes.height);
	const orthographicCamera = new THREE.OrthographicCamera(
		-width_camera / 2, width_camera / 2,
		height_camera / 2, -height_camera / 2,
		0.1, 100);
	scene.add(orthographicCamera);

	const controls_persp = new OrbitControls(perspectiveCamera, canvas);
	const controls_orth = new OrbitControls(orthographicCamera, canvas);
	controls_persp.enableDamping = true;
	controls_orth.enableDamping = true;

	const raycaster = new THREE.Raycaster();
	raycaster.params.Line.threshold = 3;

	const renderer = new THREE.WebGLRenderer({ canvas });
	renderer.setSize(sizes.width, sizes.height);
	renderer.render(scene, perspectiveCamera);

	return { sizes, scene, canvas, perspectiveCamera, orthographicCamera, renderer, controls_persp, controls_orth, raycaster};
};

export default init;