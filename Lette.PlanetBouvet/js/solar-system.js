
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

var origin = new THREE.Vector3(0, 0, 0);
var xAxis = new THREE.Vector3(1, 0, 0);
var yAxis = new THREE.Vector3(0, 1, 0);
var zAxis = new THREE.Vector3(0, 0, 1);

var degreesToRadians = function (degrees) {
    return degrees / 180.0 * Math.PI;
};

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMapEnabled = true;
renderer.shadowMapType = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

var onWindowResize = function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
};

window.addEventListener('resize', onWindowResize, false);

/* LIGHTS */

//var ambientLight = new THREE.AmbientLight(0xcccccc);
//scene.add(ambientLight);

//var sunlight = new THREE.PointLight(0xffff00);
//scene.add(sunlight);

/* SUN */

var sunGeo = new THREE.SphereGeometry(5, 96, 96);
var sunMat = new THREE.MeshBasicMaterial({ color: 0xffff77 });
sunMat.map = THREE.ImageUtils.loadTexture('images/sunmap.jpg');
var sun = new THREE.Mesh(sunGeo, sunMat);
sun.rotateOnAxis(xAxis, degreesToRadians(-7.25));
scene.add(sun);

/* SUNLIGHT */

var sunSpotlight = new THREE.SpotLight(0xffffff);
sunSpotlight.castShadow = true;
sunSpotlight.angle = degreesToRadians(35.0);
sunSpotlight.shadowDarkness = 0.6;
//sunSpotlight.shadowCameraVisible = true;
sunSpotlight.shadowCameraNear = 6;
scene.add(sunSpotlight);

/* EARTH/MOON BARYCENTER/ORBITAL PLANES */

var earthOrbitalCenter = new THREE.Object3D();
scene.add(earthOrbitalCenter);

var earthMoonBarycenter = new THREE.Object3D();
earthMoonBarycenter.translateX(20);
earthOrbitalCenter.add(earthMoonBarycenter);

var earthMoonOrbitalPlane = new THREE.Object3D();
earthMoonOrbitalPlane.rotateOnAxis(zAxis, degreesToRadians(5.145));
earthMoonBarycenter.add(earthMoonOrbitalPlane);

//var earthMoonOrbitalPlaneAxisHelper = new THREE.AxisHelper(3);
//earthMoonOrbitalPlane.add(earthMoonOrbitalPlaneAxisHelper);

/* EARTH */

var earthCoord = new THREE.Object3D();
earthCoord.translateX(-0.732 / 2);
earthMoonOrbitalPlane.add(earthCoord);

//var earthCoordAxisHelper = new THREE.AxisHelper(2);
//earthCoord.add(earthCoordAxisHelper);

var earthGeo = new THREE.SphereGeometry(1, 96, 96);

var earthMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
earthMat.map = THREE.ImageUtils.loadTexture('images/bouvet_1955_lg_cleaned_sharpened_colored.png');
earthMat.bumpMap = THREE.ImageUtils.loadTexture('images/bouvet_1955_lg_cleaned_sharpened_colored_bump.png');
earthMat.bumpScale = 0.02;

var earth = new THREE.Mesh(earthGeo, earthMat);
earth.rotateOnAxis(zAxis, degreesToRadians(-23.4));
earth.receiveShadow = true;
earth.castShadow = true;
earthCoord.add(earth);

//var earthAxisHelper = new THREE.AxisHelper(2);
//earth.add(earthAxisHelper);

sunSpotlight.target = earth;

/* MOON */

var moonCoord = new THREE.Object3D();
moonCoord.translateX(5);
earthMoonOrbitalPlane.add(moonCoord);

var moonGeo = new THREE.SphereGeometry(0.273, 96, 96);

var moonMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
moonMat.map = THREE.ImageUtils.loadTexture('images/moonmap4k.jpg');
moonMat.bumpMap = THREE.ImageUtils.loadTexture('images/moonbump4k.jpg');
moonMat.bumpScale = 0.0002;

var moon = new THREE.Mesh(moonGeo, moonMat);
moon.castShadow = true;
moon.receiveShadow = true;
moon.rotateOnAxis(yAxis, degreesToRadians(180.0));
moon.rotateOnAxis(zAxis, degreesToRadians(1.5424));
moonCoord.add(moon);

/* STARS */

var starsGeo = new THREE.SphereGeometry(100, 96, 96);

var starsMat = new THREE.MeshBasicMaterial();
starsMat.map = THREE.ImageUtils.loadTexture('images/milkyway-inverted.png');
starsMat.side = THREE.BackSide;

var stars = new THREE.Mesh(starsGeo, starsMat);
stars.rotateOnAxis(zAxis, degreesToRadians(-60.2));
scene.add(stars);


/* SUNLIGHT EFFECTS */

// coming soon!




/* ANIMATION */

var clock = new THREE.Clock();

var secondsPerMinute = 60.0;
var secondsPerHour = 60.0 * secondsPerMinute;
var secondsPerDay = 24.0 * secondsPerHour;
var secondsPerYear = 365 * secondsPerDay;

// Angular speeds in radians per second

// Earth orbital period = 365.256363004 days
// Earth sidereal rotation period = 0.99726968 days
var earthOrbitalPeriodInSeconds = 365.256363004 * secondsPerDay;
var earthOrbitAngularSpeed = degreesToRadians(360.0 / (earthOrbitalPeriodInSeconds));
var earthRotationAngularSpeed = degreesToRadians(360.0 / (0.99726968 * secondsPerDay));

// Moon orbital period = 27.321582 days
// Moon sidereal rotation period = orbital period (synchronous)
var moonOrbitAngularSpeed = degreesToRadians(360.0 / (27.321582 * secondsPerDay));
var moonRotationAngularSpeed = moonOrbitAngularSpeed;

// Sun sidereal rotation period = 25.05 days
var sunRotationAngularSpeed = degreesToRadians(360.0 / (25.05 * secondsPerDay));

// Camera virtual sidereal rotation period
var cameraRotationAngularSpeed = degreesToRadians(-360.0 / (30.0 * secondsPerDay));

/* INTERACTION */

var cameraTarget = 'sun';

var onKeypress = function(e) {
    var keyCode = e.keyCode;
    if (keyCode == 115) { // 's'
        cameraTarget = 'sun';
    } else if (keyCode == 101) { // 'e'
        cameraTarget = 'earth';
    } else if (keyCode == 109) { // 'm'
        cameraTarget = 'moon';
    } else if (keyCode == 69) { // 'E'
        cameraTarget = 'earthFromSun';
    } else if (keyCode == 77) { // 'M'
        cameraTarget = 'moonFromEarth';
    }
};

window.addEventListener('keypress', onKeypress, false);

var navigationMode = '';

var onKeydown = function (e) {
    if (e.keyCode == 37) {
        navigationMode = 'left';
    } else if (e.keyCode == 39) {
        navigationMode = 'right';
    }
    //console.log(e.keyCode);
};

var onKeyup = function(e) {
    if (e.keyCode == 37 || e.keyCode == 39) {
        navigationMode = 'stop';
    }
};

window.addEventListener('keydown', onKeydown, false);
window.addEventListener('keyup', onKeyup, false);

/* RENDERING */

var fullEarthOrbitSimulationTime = 800.0;
var cameraAngle = 0.0;
var navigationSpeed = cameraRotationAngularSpeed;
var navigationSpeedFactor = 0.0;
var navigationStart = 0.0;

function adjustCameraAngle(elapsed) {
    if (navigationMode == 'left') {
        if (navigationStart == 0.0) {
            navigationStart = elapsed;
        }
        if (elapsed - navigationStart >= 1.0) {
            navigationSpeedFactor = 1.0;
        } else {
            
        }

        cameraAngle -= navigationSpeed * navigationSpeedFactor * elapsed;
    } else if (navigationMode == 'right') {
        cameraAngle += navigationSpeed * elapsed;
    } else {
        navigationSpeedFactor
        cameraAngle += cameraRotationAngularSpeed * elapsed;
    }
}

function render() {
    requestAnimationFrame(render);

    /* ANIMATION */
    var elapsed = clock.getDelta();

    elapsed *= (earthOrbitalPeriodInSeconds / fullEarthOrbitSimulationTime);

    earthOrbitalCenter.rotateOnAxis(yAxis, earthOrbitAngularSpeed * elapsed);
    earthMoonBarycenter.rotateOnAxis(yAxis, -earthOrbitAngularSpeed * elapsed);

    earthMoonOrbitalPlane.rotateOnAxis(yAxis, moonOrbitAngularSpeed * elapsed);
    earthCoord.rotateOnAxis(yAxis, -moonOrbitAngularSpeed * elapsed);

    earth.rotateOnAxis(yAxis, earthRotationAngularSpeed * elapsed);

    sun.rotateOnAxis(yAxis, sunRotationAngularSpeed * elapsed);

    var targetPosition;

    adjustCameraAngle(elapsed);
    
    if (cameraTarget == 'sun') {

        /* CAMERA ROTATING AROUND SUN */

        camera.position.set(
            40 * Math.sin(cameraAngle),
            30,
            40 * Math.cos(cameraAngle));

        camera.lookAt(origin);

    } else if (cameraTarget == 'earth' || cameraTarget == 'moon') {

        /* CAMERA ROTATING AROUND EARTH OR MOON */

        if (cameraTarget == 'earth') {
            targetPosition = earth.getWorldPosition();
        } else {
            targetPosition = moon.getWorldPosition();
        }

        camera.position.set(
            targetPosition.x + 10 * Math.sin(cameraAngle),
            0,
            targetPosition.z + 10 * Math.cos(cameraAngle));

        camera.lookAt(targetPosition);

    } else if (cameraTarget == 'moonFromEarth') {

        /* CAMERA LOOKING AT THE MOON FROM EARTH */

        targetPosition = earth.getWorldPosition();
        camera.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
        camera.lookAt(moon.getWorldPosition());

    } else {

        /* CAMERA LOOKING AT THE EARTH FROM THE SUN */

        targetPosition = sun.getWorldPosition();
        camera.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
        camera.lookAt(earth.getWorldPosition());

    }

    renderer.render(scene, camera);
}
render();
