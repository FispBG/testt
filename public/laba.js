import * as THREE from './three.module.js';
import * as dat from './lil-gui.esm.js';
import init from './init.js';
import { LatheGeometry } from './LatheGeometry.js ';

const { sizes, scene, canvas, perspectiveCamera, orthographicCamera, renderer, controls_persp, controls_orth, raycaster } = init();

const axisHelper = new THREE.AxesHelper(25);
scene.add(axisHelper);

const pointer = new THREE.Vector2();

const cursor_point_geometry = new THREE.SphereGeometry(0.15);
const cursor_material = new THREE.MeshStandardMaterial({
	color: 0x999999,
	visible: false,
});
const cursor_point = new THREE.Mesh(cursor_point_geometry, cursor_material);
scene.add(cursor_point);

const group_measuring_points = new THREE.Group();
scene.add(group_measuring_points);

let activeCamera = perspectiveCamera;
let activeControls = controls_persp;
let magnetizm = false;

const config = {
	'activeCamera': 'перспективная',
	'camers': ['перспективная', 'вид сверху'],
	'magnetizm': false,
}

const dict_camera = {
	'перспективная': {
		camera: perspectiveCamera,
		position: new THREE.Vector3(0, 30, 0),
		rotation: new THREE.Vector3(0, 0, 0),
	},
	'вид сверху': {
		camera: orthographicCamera,
		position: new THREE.Vector3(0, 30, 0),
		rotation: new THREE.Vector3(0, 0, 0),
	},
}

const dict_controls = {
	'перспективная': {
		controls: controls_persp,
		enabled: true,
	},
	'вид сверху': {
		controls: controls_orth,
		enabled: false,
	},
}

activeCamera.position.z = 0;
activeCamera.position.y = 30;
controls_persp.enabled = true;
controls_orth.enabled = false;

 /** DAT.GUI */
const gui = new dat.GUI();
const cameraController = gui.add(config, 'activeCamera', config['camers']).name('Камера');
cameraController.onChange(changeCamera);
const magnetController = gui.add(config, 'magnetizm').name('Магнитный курсор');

/** Making PLANE */
const plane_geometry = new THREE.PlaneGeometry(43, 30);
const plane_material = new THREE.MeshStandardMaterial({
	color: 0xff3333,
	metalness: 0,
	roughness: 0.5,
});
const plane = new THREE.Mesh(plane_geometry, plane_material);
plane.rotation.x = -Math.PI * 0.5;
plane.receiveShadow = true;
// scene.add(plane);

/** Making TABLE */
const table_geometry = new THREE.BoxGeometry(43, 30, 1);
const table_material = new THREE.MeshStandardMaterial({
	color: 0xff0033,
	metalness: 0,
	roughness: 0.5,
});
const table = new THREE.Mesh(table_geometry, table_material);
table.rotation.x = -Math.PI * 0.5;
table.position.y -= table.geometry.parameters.depth / 2;
table.receiveShadow = true;
scene.add(table);

/** Making LIGHT */
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
hemisphereLight.position.set(0, 50, 0);
scene.add(hemisphereLight);

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set( 20, 12, 8 );
directionalLight.castShadow = true;
directionalLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
scene.add(directionalLight);

/** Making ELECTRODS */
const electrod_geometry = new THREE.CylinderGeometry(1.5, 1.5, 20);
const electrod_material = new THREE.MeshStandardMaterial({
	color: 0x999999,
	metalness: 0,
	roughness: 0.5,
})

const electrod1 = new THREE.Mesh(electrod_geometry, electrod_material);
electrod1.position.x = 9.5 + (plane.position.x - plane.geometry.parameters.width / 2);
electrod1.position.z = -15 + (plane.position.z + plane.geometry.parameters.height / 2);
electrod1.receiveShadow = true;
scene.add(electrod1);

const electrod2 = new THREE.Mesh(electrod_geometry, electrod_material);
electrod2.position.x = 33.5 + (plane.position.x - plane.geometry.parameters.width / 2);
electrod2.position.z = -15 + (plane.position.z + plane.geometry.parameters.height / 2);
electrod2.receiveShadow = true;
scene.add(electrod2);


/** Making SETKA */
const checkMesh = new THREE.Group();
const checkMesh_material = new THREE.MeshStandardMaterial({
	color: 0x66ff66,
});

const checkMesh_height = plane.geometry.parameters.height;
const checkMesh_width = plane.geometry.parameters.width;
for (let i = 1; i < checkMesh_width; i++) {
	const geometry = new THREE.BoxGeometry(0.05, 0.05, checkMesh_height);
	const line = new THREE.Mesh(geometry, checkMesh_material);
	line.position.x = i + (plane.position.x - plane.geometry.parameters.width / 2);
	checkMesh.add(line);
}

for (let i = 1; i < checkMesh_height; i++) {
	const geometry = new THREE.BoxGeometry(checkMesh_width, 0.05, 0.05);
	const line = new THREE.Mesh(geometry, checkMesh_material);
	line.position.z = i + (plane.position.z - plane.geometry.parameters.height / 2);
	checkMesh.add(line);
}

scene.add(checkMesh);

const tick = () => {
	activeControls.update();
	renderer.render(scene, activeCamera);
	window.requestAnimationFrame(tick);
};
tick();

/** Базовые обпаботчики событий длы поддержки ресайза */
window.addEventListener('resize', updateSizeAfterResize);

document.addEventListener('pointermove', (event) => {
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	if (config.activeCamera === 'вид сверху') {
		raycaster.setFromCamera(pointer, activeCamera);
		const intersects = raycaster.intersectObjects([table, checkMesh]);

		if ( intersects.length > 0 ) {
			if (config.magnetizm){
				cursor_point.position.x = Math.round(intersects[0].point.x * 2) / 2;
				cursor_point.position.z = Math.round(intersects[0].point.z * 2) / 2;
			} else {
				cursor_point.position.x = intersects[0].point.x;
				cursor_point.position.z = intersects[0].point.z;
			}
			cursor_point.material.visible = true;
		} else {
			cursor_point.material.visible = false;
		}
	} else {
		cursor_point.material.visible = false;
	}
});

window.addEventListener('dblclick', () => {
	if (!document.fullscreenElement) {
		canvas.requestFullscreen();
	} else {
		document.exitFullscreen();
	}
});

window.addEventListener('click', (event) => {
	if (config.activeCamera === 'вид сверху' && cursor_point.material.visible) {
		const geometry_measuring_point = new THREE.SphereGeometry(cursor_point.geometry.parameters.radius);
		const material_measuring_point = new THREE.MeshBasicMaterial({
			color: 0xffcc33,
		});
		const measuring_point = new THREE.Mesh(geometry_measuring_point, material_measuring_point);
		group_measuring_points.add(measuring_point);

		measuring_point.position.x = cursor_point.position.x;
		measuring_point.position.z = cursor_point.position.z;
	}
});

function changeCamera() {
	const value = config.activeCamera;
	activeCamera = dict_camera[value].camera;
	activeCamera.position.set(0, 30, 0);
	activeCamera.rotation.set(0, 0, 0);
	updateSizeAfterResize();
	changeControls();
};

function changeControls() {
	const value = config.activeCamera;
	activeControls = dict_controls[value].controls;
	activeControls.enabled = dict_controls[value].enabled;
	for (let i = 0; i < config.camers.length; i++) {
		if (config.camers[i] !== value){
			const controls = dict_controls[config.camers[i]].controls;
			controls.enabled = false;
		}
	}
};

function updateSizeAfterResize() {
	// Обновляем размеры
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	let height_camera = 32;
	let width_camera = height_camera * (sizes.width / sizes.height);
	orthographicCamera.left = -width_camera / 2;
	orthographicCamera.right = width_camera / 2;
	orthographicCamera.bottom = -height_camera / 2;
	orthographicCamera.top = height_camera / 2;

	// Обновляем соотношение сторон камеры
	activeCamera.aspect = sizes.width / sizes.height;
	activeCamera.updateProjectionMatrix();

	// Обновляем renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.render(scene, activeCamera);
};