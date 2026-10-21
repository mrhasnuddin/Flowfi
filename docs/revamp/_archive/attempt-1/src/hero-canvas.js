import * as THREE from 'three';

export function initHeroCanvas(containerId = 'hero-canvas-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Dimensions
    let width = container.clientWidth || 560;
    let height = container.clientHeight || 480;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = null; // Transparent canvas so it blends with warm alabaster background

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.8);

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // -------------------------------------------------------------
    // 1. Dynamic Texture for Vertical Frequency Wave / Barcode Underlay
    // -------------------------------------------------------------
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 1024;
    patternCanvas.height = 512;
    const pCtx = patternCanvas.getContext('2d');

    const patternTexture = new THREE.CanvasTexture(patternCanvas);
    patternTexture.wrapS = THREE.ClampToEdgeWrapping;
    patternTexture.wrapT = THREE.ClampToEdgeWrapping;

    // Draw vertical bars with wave modulation matching reference
    function updatePattern(time = 0, mouseX = 0) {
        pCtx.clearRect(0, 0, 1024, 512);

        const barCount = 40;
        const barWidth = 11;
        const totalW = 1024;
        const spacing = totalW / barCount;

        for (let i = 0; i < barCount; i++) {
            const x = i * spacing + spacing / 2;
            const normalizedX = (x / totalW) * 2 - 1;

            // Wave height modulation
            const wave1 = Math.sin(normalizedX * 4 + time * 1.5) * 0.35;
            const wave2 = Math.cos(normalizedX * 8 - time * 2) * 0.22;
            const mouseDist = Math.abs(normalizedX - mouseX * 1.2);
            const mouseReaction = Math.max(0, 1 - mouseDist * 1.8) * 0.4;
            const heightFactor = Math.min(1, Math.max(0.18, 0.65 + wave1 + wave2 + mouseReaction));

            const barH = 340 * heightFactor;
            const yStart = 256 - barH / 2;

            // Gradient: Vibrant Terracotta / FlowFi Purple
            const grad = pCtx.createLinearGradient(x, yStart, x, yStart + barH);
            grad.addColorStop(0, '#E85D3A'); // Terracotta warm accent
            grad.addColorStop(0.5, '#FF6B4A'); // Bright coral mid
            grad.addColorStop(1, '#7B5CFA'); // FlowFi purple bottom

            pCtx.fillStyle = grad;
            pCtx.beginPath();
            // Tapered needle bar shape
            const midY = 256;
            const midWidth = barWidth * (1 + (heightFactor - 0.5) * 0.8);
            pCtx.moveTo(x, yStart);
            pCtx.lineTo(x + midWidth / 2, midY);
            pCtx.lineTo(x, yStart + barH);
            pCtx.lineTo(x - midWidth / 2, midY);
            pCtx.closePath();
            pCtx.fill();
        }

        patternTexture.needsUpdate = true;
    }
    updatePattern(0, 0);

    // Background Plane carrying the vertical bars
    const bgPlaneGeo = new THREE.PlaneGeometry(7.0, 3.5);
    const bgPlaneMat = new THREE.MeshBasicMaterial({
        map: patternTexture,
        transparent: true,
        opacity: 0.95
    });
    const bgPlane = new THREE.Mesh(bgPlaneGeo, bgPlaneMat);
    bgPlane.position.set(-0.3, -0.6, -0.8);
    scene.add(bgPlane);

    // -------------------------------------------------------------
    // 2. Lighting Rig for Realistic Optical Glass
    // -------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff7ed, 3.2);
    dirLight1.position.set(4, 6, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xecd8ff, 2.2);
    dirLight2.position.set(-5, -3, 3);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xff6b4a, 4.0, 9);
    pointLight.position.set(0, 0, 2);
    scene.add(pointLight);

    // -------------------------------------------------------------
    // 3. Physical Glass Material (Refraction, Caustics & Transmission)
    // -------------------------------------------------------------
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xecfdf5), // Soft celadon / mint glass tint from reference
        transmission: 0.93,             // High optical transparency
        opacity: 1,
        transparent: true,
        roughness: 0.08,                // Glossy surface
        ior: 1.45,                      // Glass index of refraction
        thickness: 2.4,                 // Volume thickness for refraction distortion
        specularIntensity: 1.2,
        specularColor: new THREE.Color(0xffffff),
        clearcoat: 0.8,
        clearcoatRoughness: 0.1,
        attenuationColor: new THREE.Color(0xa7f3d0),
        attenuationDistance: 1.2
    });

    // Helper to create an organic deformed sphere (liquid droplet)
    function createOrganicBlobGeometry(radius, detail, deformationParams) {
        const geom = new THREE.SphereGeometry(radius, detail, detail);
        const pos = geom.attributes.position;
        const v = new THREE.Vector3();

        for (let i = 0; i < pos.count; i++) {
            v.fromBufferAttribute(pos, i);
            const nx = v.x / radius;
            const ny = v.y / radius;
            const nz = v.z / radius;

            // Organic asymmetry
            const bump = Math.sin(nx * deformationParams.freqX + deformationParams.phase) * deformationParams.ampX
                       + Math.cos(ny * deformationParams.freqY) * deformationParams.ampY
                       + Math.sin(nz * 2.0) * 0.05;

            // Elongate along diagonal axis
            const elongation = 1.0 + ny * deformationParams.stretchY;
            v.multiplyScalar(1 + bump).y *= elongation;
            pos.setXYZ(i, v.x, v.y, v.z);
        }
        geom.computeVertexNormals();
        return geom;
    }

    const blobsGroup = new THREE.Group();
    scene.add(blobsGroup);

    // Blob 1 (Large Main Blob - Upper Left)
    const blob1Geo = createOrganicBlobGeometry(1.35, 48, {
        freqX: 2.2,
        freqY: 1.8,
        ampX: 0.18,
        ampY: 0.14,
        stretchY: 0.22,
        phase: 0.4
    });
    const blob1 = new THREE.Mesh(blob1Geo, glassMaterial);
    blob1.position.set(-1.1, 0.4, 0.4);
    blob1.rotation.set(-0.2, 0.3, -0.4);
    blobsGroup.add(blob1);

    // Blob 2 (Mid-Right Capsule Blob)
    const blob2Geo = createOrganicBlobGeometry(0.72, 36, {
        freqX: 2.5,
        freqY: 2.0,
        ampX: 0.14,
        ampY: 0.12,
        stretchY: 0.15,
        phase: 1.2
    });
    const blob2 = new THREE.Mesh(blob2Geo, glassMaterial.clone());
    blob2.position.set(1.1, -0.5, 0.6);
    blob2.rotation.set(0.3, -0.4, 0.5);
    blobsGroup.add(blob2);

    // Blob 3 (Bottom-Center Small Droplet)
    const blob3Geo = createOrganicBlobGeometry(0.85, 36, {
        freqX: 1.9,
        freqY: 2.4,
        ampX: 0.16,
        ampY: 0.15,
        stretchY: 0.28,
        phase: 2.1
    });
    const blob3 = new THREE.Mesh(blob3Geo, glassMaterial.clone());
    blob3.position.set(-0.4, -1.3, 0.8);
    blob3.rotation.set(0.4, 0.2, 0.3);
    blobsGroup.add(blob3);

    // Blob 4 (Tiny accent droplet bottom-left)
    const blob4Geo = createOrganicBlobGeometry(0.42, 24, {
        freqX: 2.0,
        freqY: 2.0,
        ampX: 0.1,
        ampY: 0.1,
        stretchY: 0.1,
        phase: 0.8
    });
    const blob4 = new THREE.Mesh(blob4Geo, glassMaterial.clone());
    blob4.position.set(-2.0, -1.2, 0.3);
    blob4.rotation.set(-0.1, 0.5, -0.2);
    blobsGroup.add(blob4);

    // -------------------------------------------------------------
    // 4. Embedded Procedural Token Glyphs (₿, Ξ, and FF)
    // -------------------------------------------------------------
    function createTokenBadge(symbolText, colorHex) {
        const badgeCanvas = document.createElement('canvas');
        badgeCanvas.width = 256;
        badgeCanvas.height = 256;
        const bCtx = badgeCanvas.getContext('2d');

        bCtx.clearRect(0, 0, 256, 256);
        bCtx.fillStyle = 'rgba(255, 255, 255, 0.88)';
        bCtx.beginPath();
        bCtx.arc(128, 128, 116, 0, Math.PI * 2);
        bCtx.fill();

        bCtx.strokeStyle = colorHex;
        bCtx.lineWidth = 14;
        bCtx.stroke();

        bCtx.fillStyle = colorHex;
        bCtx.font = 'bold 120px "Plus Jakarta Sans", -apple-system, sans-serif';
        bCtx.textAlign = 'center';
        bCtx.textBaseline = 'middle';
        bCtx.fillText(symbolText, 128, 134);

        const badgeTex = new THREE.CanvasTexture(badgeCanvas);
        badgeTex.generateMipmaps = true;

        const badgeGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.05, 32);
        badgeGeo.rotateX(Math.PI / 2);

        const badgeMat = new THREE.MeshStandardMaterial({
            map: badgeTex,
            roughness: 0.25,
            metalness: 0.6,
            transparent: true,
            opacity: 0.88
        });

        return new THREE.Mesh(badgeGeo, badgeMat);
    }

    const tokenBitcoin = createTokenBadge('₿', '#D97706');
    tokenBitcoin.position.set(-0.15, 0.1, 0.0);
    blob1.add(tokenBitcoin);

    const tokenFlowFi = createTokenBadge('FF', '#7B5CFA');
    tokenFlowFi.position.set(0.05, 0.05, 0.0);
    blob2.add(tokenFlowFi);

    const tokenEth = createTokenBadge('Ξ', '#4F46E5');
    tokenEth.position.set(-0.05, -0.05, 0.0);
    blob3.add(tokenEth);

    // -------------------------------------------------------------
    // 5. Interactive Mouse & Touch Tracking
    // -------------------------------------------------------------
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    function onPointerMove(e) {
        const rect = container.getBoundingClientRect();
        const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
        const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);

        if (clientX !== undefined && clientY !== undefined) {
            const relX = clientX - rect.left;
            const relY = clientY - rect.top;
            mouse.targetX = (relX / rect.width) * 2 - 1;
            mouse.targetY = -(relY / rect.height) * 2 + 1;
        }
    }

    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('touchstart', onPointerMove, { passive: true });
    container.addEventListener('touchmove', onPointerMove, { passive: true });

    container.addEventListener('mouseleave', () => {
        mouse.targetX = 0;
        mouse.targetY = 0;
    });

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY || window.pageYOffset;
        if (blobsGroup) {
            blobsGroup.position.y = -scrollY * 0.0006;
        }
    }, { passive: true });

    // Handle Resize
    function handleResize() {
        if (!container) return;
        const newW = container.clientWidth;
        const newH = container.clientHeight;
        if (newW === 0 || newH === 0) return;

        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
    }
    window.addEventListener('resize', handleResize);

    // Render Loop
    const clock = new THREE.Clock();
    let animId;

    function animate() {
        animId = requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Damped mouse smoothing
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        // Animate underlying vertical wave bars
        updatePattern(elapsedTime, mouse.x);

        // Ambient floating motion for blobs
        blob1.position.y = 0.4 + Math.sin(elapsedTime * 1.2) * 0.08 + mouse.y * 0.2;
        blob1.position.x = -1.1 + Math.cos(elapsedTime * 0.9) * 0.06 + mouse.x * 0.25;
        blob1.rotation.z = -0.4 + Math.sin(elapsedTime * 0.8) * 0.05;
        tokenBitcoin.rotation.z = elapsedTime * 0.4;

        blob2.position.y = -0.5 + Math.cos(elapsedTime * 1.5) * 0.07 + mouse.y * 0.15;
        blob2.position.x = 1.1 + Math.sin(elapsedTime * 1.1) * 0.05 + mouse.x * 0.18;
        blob2.rotation.y = -0.4 + Math.cos(elapsedTime * 0.7) * 0.08;
        tokenFlowFi.rotation.z = -elapsedTime * 0.5;

        blob3.position.y = -1.3 + Math.sin(elapsedTime * 1.4 + 1) * 0.06 + mouse.y * 0.18;
        blob3.position.x = -0.4 + Math.cos(elapsedTime * 1.0 + 1) * 0.05 + mouse.x * 0.2;
        tokenEth.rotation.z = elapsedTime * 0.6;

        blob4.position.y = -1.2 + Math.cos(elapsedTime * 1.8) * 0.05 + mouse.y * 0.1;

        // Group subtle tilt
        blobsGroup.rotation.y = mouse.x * 0.2;
        blobsGroup.rotation.x = -mouse.y * 0.15;

        renderer.render(scene, camera);
    }

    animate();

    return {
        destroy() {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
        }
    };
}
