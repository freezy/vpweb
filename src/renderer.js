import {
	AmbientLight, BasicShadowMap,
	DirectionalLight,
	PCFSoftShadowMap,
	PerspectiveCamera,
	Scene,
	Vector3, VSMShadowMap,
	WebGLRenderer
} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'stats.js/src/Stats';

export class Renderer {

	constructor() {
		this.playfieldScale = 0.5;
		this.globalLightsIntensity = 0.2;
	}

	init() {
		this._initScene();
		this._initStats();
		this._initRenderer();
		this._initControls();
		this._initLights();
		this._resetCamera();
		document.getElementById('top-container').classList.add('d-none')
	}

	setPlayfield(playfield) {
		if (this.playfield) {
			this.scene.remove(this.playfield);
		}
		this.playfield = playfield;
		this.scene.add(playfield);
	}

	/**
	 * @param {PlayerController} player
	 */
	setPlayer(player) {
		this.player = player;
	}

	_initScene() {
		this.scene = window.vpw.scene = new Scene();
		this.scene.scale.set(this.playfieldScale, this.playfieldScale, this.playfieldScale);

		this.cameraDefaults = {
			posCamera: new Vector3(-10, 40.0, 50.0),
			posCameraTarget: new Vector3(0, -5, 0),
			near: 1,
			far: 500,
			fov: 45,
		};
		this.camera = new PerspectiveCamera(this.cameraDefaults.fov, window.innerWidth / window.innerHeight, this.cameraDefaults.near, this.cameraDefaults.far);
		this.camera.position.set(0, 1.3, 3);
		this.cameraTarget = this.cameraDefaults.posCameraTarget;
	}

	_initStats() {
		this.renderStats = new Stats();
		this.physicsStats = new Stats();
		this.physicsStats.dom.style.cssText = 'position:fixed;top:50px;left:0;cursor:pointer;opacity:0.9;z-index:10000';
		this.physicsStats.showPanel(1);
		document.body.appendChild(this.renderStats.dom);
		document.body.appendChild(this.physicsStats.dom);
	}

	_initRenderer() {
		this.renderer = new WebGLRenderer({
			antialias: true,
			autoClear: true,
			alpha: true,
		});
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = VSMShadowMap;
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		window.addEventListener('resize', this.onWindowResize.bind(this), false);
		document.body.appendChild(this.renderer.domElement);
	}

	_initControls() {
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.target = this.cameraDefaults.posCameraTarget;
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.1;
		this.controls.rotateSpeed = 1;
		this.controls.panSpeed = 1;
		this.controls.update();
	}

	_initLights() {
		// ambient light
		const ambientLight = new AmbientLight(0xffffff, 0.1);
		this.scene.add(ambientLight);

		// front
		this.directionalLightFront = new DirectionalLight(0xffffff);
		// this.directionalLightFront.castShadow = true;
		// this.directionalLightFront.shadow.bias = -0.002;
		// this.directionalLightFront.shadow.radius = 20;
		this.directionalLightFront.position.set(0, 30, 20);
		this.directionalLightFront.target.position.set(0, 0, 0);
		this.directionalLightFront.target.updateMatrixWorld();
		this.directionalLightFront.intensity = this.globalLightsIntensity;
		this.scene.add(this.directionalLightFront);

		// back
		this.directionalLightBack = new DirectionalLight(0xffffff);
		// this.directionalLightBack.castShadow = true;
		// this.directionalLightBack.shadow.bias = -0.002;
		// this.directionalLightBack.shadow.radius = 20;
		this.directionalLightBack.position.set(0, 30, -30);
		this.directionalLightBack.target.position.set(0, 0, -10);
		this.directionalLightBack.target.updateMatrixWorld();
		this.directionalLightBack.intensity = this.globalLightsIntensity;
		this.scene.add(this.directionalLightBack);
	}

	_resetCamera() {
		this.camera.position.copy(this.cameraDefaults.posCamera);
		this.cameraTarget.copy(this.cameraDefaults.posCameraTarget);

		this._updateCamera();
	}

	_updateCamera() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.lookAt(this.cameraTarget);
		this.camera.updateProjectionMatrix();
	}

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	animate() {
		requestAnimationFrame(this.animate.bind(this));
		this.controls.update();
		if (this.player) {
			this.physicsStats.begin();
			this.player.update();
			this.physicsStats.end();
		}
		this.renderStats.begin();
		this.renderer.render(this.scene, this.camera);
		this.renderStats.end();
	}
}
