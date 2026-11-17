
import * as THREE from
"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

console.log("SIMULASI 3D BERHASIL DIMUAT");

(() => {
const viewport = document.getElementById("sim3DViewport");

if (!viewport) return;

    const status = document.getElementById("sim3DStatus");
    const loading = document.getElementById("sim3DLoading");
    const switchButton = document.getElementById("sim3DSwitch");
    const resetButton = document.getElementById("sim3DReset");

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07152d);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(8, 7, 10);


let renderer;

try {
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "default"
    });

    console.log("WEBGL BERHASIL DIBUAT");
} catch (error) {
    console.error("WEBGL GAGAL:", error);

    if (loading) {
        loading.textContent =
            "WebGL tidak didukung atau gagal dijalankan pada perangkat ini.";
    }

    if (status) {
        status.textContent = "WEBGL TIDAK TERSEDIA";
    }

    return;
}


    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    viewport.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xb8ddff, 0x18243b, 2));

    const light = new THREE.DirectionalLight(0xffffff, 2.5);
    light.position.set(5, 10, 7);
    scene.add(light);

    // MATERIAL
    const materials = {
        table: new THREE.MeshStandardMaterial({
            color: 0x142b43,
            roughness: 0.8
        }),
        board: new THREE.MeshStandardMaterial({
            color: 0xe4eaf0,
            roughness: 0.65
        }),
        red: new THREE.MeshStandardMaterial({
            color: 0xe43b48
        }),
        black: new THREE.MeshStandardMaterial({
            color: 0x202b38
        }),
        metal: new THREE.MeshStandardMaterial({
            color: 0xc5d4df,
            metalness: 0.8,
            roughness: 0.25
        }),
        resistor: new THREE.MeshStandardMaterial({
            color: 0xd9b77c
        }),
        wireRed: new THREE.MeshStandardMaterial({
            color: 0xff344d,
            emissive: 0x44000a
        }),
        wireBlack: new THREE.MeshStandardMaterial({
            color: 0x161c28
        })
    };

    // HELPERS
    function box(width, height, depth, material, x, y, z) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            material
        );

        mesh.position.set(x, y, z);
        scene.add(mesh);

        return mesh;
    }

    function cylinder(radius, height, material, x, y, z) {
        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius, height, 24),
            material
        );

        mesh.position.set(x, y, z);
        scene.add(mesh);

        return mesh;
    }

    function wire(points, color) {
        const curve = new THREE.CatmullRomCurve3(
            points.map(p => new THREE.Vector3(...p))
        );

        const mesh = new THREE.Mesh(
            new THREE.TubeGeometry(curve, 32, 0.045, 8, false),
            color
        );

        scene.add(mesh);
        return mesh;
    }

    // MEJA PRAKTIK
    box(14, 0.45, 10, materials.table, 0, -0.4, 0);

    // BREADBOARD
    box(7, 0.28, 4, materials.board, 0, 0, 0);

    // LUBANG BREADBOARD
    const holeMaterial = new THREE.MeshStandardMaterial({
        color: 0x53616d
    });

    for (let x = -3; x <= 3; x += 0.35) {
        for (let z = -1.4; z <= 1.4; z += 0.35) {
            cylinder(
                0.045, 0.025,
                holeMaterial,
                x, 0.15, z
            );
        }
    }

    // BATTERY 9V
    const battery = new THREE.Group();
    scene.add(battery);

    const batteryBody = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 1.5, 0.7),
        materials.red
    );

    batteryBody.position.y = 0.8;
    battery.add(batteryBody);

    const batteryTop = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.15, 0.5),
        materials.metal
    );

    batteryTop.position.y = 1.6;
    battery.add(batteryTop);

    battery.position.set(-4.5, 0, 0);
    battery.rotation.y = -0.3;

    // RESISTOR
    const resistor = new THREE.Group();
    scene.add(resistor);

    const resistorBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 1.1, 20),
        materials.resistor
    );

    resistorBody.rotation.z = Math.PI / 2;
    resistorBody.position.y = 0.5;
    resistor.add(resistorBody);

    const bandMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b4513
    });

    for (const x of [-0.22, 0.22]) {
        const band = new THREE.Mesh(
            new THREE.CylinderGeometry(0.225, 0.225, 0.12, 20),
            bandMaterial
        );

        band.rotation.z = Math.PI / 2;
        band.position.set(x, 0.5, 0);
        resistor.add(band);
    }

    resistor.position.set(-1.8, 0, 0);

    // LED
    const led = new THREE.Group();
    scene.add(led);

    const ledMaterial = new THREE.MeshStandardMaterial({
        color: 0xff2222,
        emissive: 0x000000,
        emissiveIntensity: 2
    });

    const ledBody = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 24, 20),
        ledMaterial
    );

    ledBody.position.y = 0.7;
    led.add(ledBody);

    const ledBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.35, 20),
        materials.black
    );

    ledBase.position.y = 0.38;
    led.add(ledBase);

    led.position.set(1, 0, 0);

    const ledLight = new THREE.PointLight(0xff2222, 0, 4);
    ledLight.position.set(1, 1, 0);
    scene.add(ledLight);

    // SAKELAR
    const switchGroup = new THREE.Group();
    scene.add(switchGroup);

    const switchBase = new THREE.Mesh(
        new THREE.BoxGeometry(1.3, 0.25, 0.9),
        materials.black
    );

    switchBase.position.y = 0.3;
    switchGroup.add(switchBase);

    const switchLever = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.7, 0.18),
        materials.red
    );

    switchLever.position.set(0, 0.7, 0);
    switchLever.rotation.z = -0.35;
    switchGroup.add(switchLever);

    switchGroup.position.set(3.2, 0, 0);

    // KABEL
    wire(
        [[-3.8, 0.3, 0], [-3, 0.35, -1], [-2, 0.35, -1]],
        materials.wireRed
    );

    wire(
        [[-1.3, 0.3, 0], [-0.5, 0.35, 1], [0.5, 0.35, 1]],
        materials.wireRed
    );

    wire(
        [[1.5, 0.3, 0], [2.2, 0.35, -1], [3.2, 0.35, -1]],
        materials.wireBlack
    );

    // LANTAI
    const floor = new THREE.GridHelper(30, 30, 0x17628a, 0x17304c);
    floor.position.y = -0.15;
    scene.add(floor);

    // SAKELAR INTERAKTIF
    let switchOn = false;

    function setSwitch(value) {
        switchOn = value;

        ledMaterial.emissive.setHex(
            switchOn ? 0xff1111 : 0x000000
        );

        ledMaterial.emissiveIntensity = switchOn ? 2.5 : 0;

        ledLight.intensity = switchOn ? 3 : 0;

        switchLever.rotation.z = switchOn ? 0.35 : -0.35;

        switchButton.textContent = switchOn
            ? "Sakelar OFF"
            : "Sakelar ON";

        status.textContent = switchOn
            ? "SAKELAR AKTIF - LED MENYALA"
            : "SAKELAR TERBUKA - LED MATI";
    }

    switchButton.addEventListener("click", () => {
        setSwitch(!switchOn);
    });

    // KLIK MODEL SAKELAR
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let previousX = 0;
    let previousY = 0;

    let cameraAngle = Math.PI / 4;
    let cameraElevation = 0.55;
    let cameraDistance = 14;

    function updateCamera() {
        camera.position.set(
            Math.sin(cameraAngle) * cameraDistance,
            Math.sin(cameraElevation) * cameraDistance,
            Math.cos(cameraAngle) * cameraDistance
        );

        camera.lookAt(0, 0.3, 0);
    }

    function pointerDown(event) {
        isDragging = true;
        startX = previousX = event.clientX;
        startY = previousY = event.clientY;

        viewport.setPointerCapture(event.pointerId);
    }

    function pointerMove(event) {
        if (!isDragging) return;

        const dx = event.clientX - previousX;
        const dy = event.clientY - previousY;

        cameraAngle -= dx * 0.008;
        cameraElevation = THREE.MathUtils.clamp(
            cameraElevation + dy * 0.006,
            0.15,
            1.35
        );

        previousX = event.clientX;
        previousY = event.clientY;

        updateCamera();
    }

    function pointerUp(event) {
        if (!isDragging) return;

        isDragging = false;

        const moved = Math.hypot(
            event.clientX - startX,
            event.clientY - startY
        );

        if (moved < 6) {
            const rect = renderer.domElement.getBoundingClientRect();

            pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(pointer, camera);

            const hits = raycaster.intersectObjects(
                switchGroup.children,
                true
            );

            if (hits.length) {
                setSwitch(!switchOn);
            }
        }
    }

    viewport.addEventListener("pointerdown", pointerDown);
    viewport.addEventListener("pointermove", pointerMove);
    viewport.addEventListener("pointerup", pointerUp);
    viewport.addEventListener("pointercancel", () => {
        isDragging = false;
    });

    viewport.addEventListener("wheel", event => {
        event.preventDefault();

        cameraDistance = THREE.MathUtils.clamp(
            cameraDistance + event.deltaY * 0.01,
            7,
            25
        );

        updateCamera();
    }, { passive: false });

    // RESET KAMERA
    resetButton.addEventListener("click", () => {
        cameraAngle = Math.PI / 4;
        cameraElevation = 0.55;
        cameraDistance = 14;
        updateCamera();
    });

    // RESIZE
    function resize() {
        const width = viewport.clientWidth;
        const height = viewport.clientHeight;

        if (!width || !height) return;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
    }

    new ResizeObserver(resize).observe(viewport);
    window.addEventListener("resize", resize);

// ANIMATION
function animate() {
    requestAnimationFrame(animate);

    const rect = viewport.getBoundingClientRect();
    const visible = rect.width > 0 && rect.height > 0;

    if (visible) {
        resize();
        renderer.render(scene, camera);
    }
}

updateCamera();

function tungguViewportAktif() {
    const width = viewport.clientWidth;
    const height = viewport.clientHeight;

    if (width === 0 || height === 0) {
        requestAnimationFrame(tungguViewportAktif);
        return;
    }

    resize();
    loading?.remove();
    setSwitch(false);
    requestAnimationFrame(animate);
}

requestAnimationFrame(tungguViewportAktif);
})();
