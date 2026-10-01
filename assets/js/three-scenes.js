const canvas = document.querySelector('[data-three-scene]');

if (canvas) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  try {
    const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
    initThreeExperience(THREE, canvas, reducedMotion);
    document.documentElement.classList.add('three-ready');
  } catch (error) {
    console.warn('Three.js no pudo cargarse; se mantiene el diseño de respaldo.', error);
    document.documentElement.classList.add('three-fallback');
  }
}

function initThreeExperience(THREE, canvas, reducedMotion) {
  const mode = canvas.dataset.threeScene || 'participant';
  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(mode === 'screen' ? 54 : 58, 1, 0.1, 100);
  camera.position.set(0, 0, mode === 'screen' ? 8.4 : 7.2);

  const root = new THREE.Group();
  scene.add(root);

  const ambient = new THREE.AmbientLight(0xffffff, 1.4);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffd47a, 2.1);
  key.position.set(4, 5, 7);
  scene.add(key);

  const rim = new THREE.PointLight(0x5c9e3a, 18, 14, 2);
  rim.position.set(-4, -2, 4);
  scene.add(rim);

  const blueLight = new THREE.PointLight(0x5f9ed8, 16, 14, 2);
  blueLight.position.set(4, 1, 3);
  scene.add(blueLight);

  const palette = [0x123a6d, 0xf2a900, 0x5c9e3a, 0x6a8fb7];
  const cards = [];
  const cardCount = mode === 'screen' ? 11 : 8;

  for (let i = 0; i < cardCount; i++) {
    const geometry = new THREE.PlaneGeometry(1.15 + (i % 3) * 0.11, 0.7 + (i % 2) * 0.08, 1, 1);
    const material = new THREE.MeshPhysicalMaterial({
      color: palette[i % palette.length],
      transparent: true,
      opacity: mode === 'screen' ? 0.12 : 0.16,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 0.85,
      clearcoatRoughness: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const card = new THREE.Mesh(geometry, material);
    card.position.set(
      (Math.random() - 0.5) * (mode === 'screen' ? 12 : 7.5),
      (Math.random() - 0.5) * (mode === 'screen' ? 6.5 : 8.5),
      -1.5 - Math.random() * 4.5
    );
    card.rotation.set(
      (Math.random() - 0.5) * 0.7,
      (Math.random() - 0.5) * 0.9,
      (Math.random() - 0.5) * 0.5
    );
    card.userData = {
      baseY: card.position.y,
      speed: 0.3 + Math.random() * 0.45,
      offset: Math.random() * Math.PI * 2
    };

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({color:0xffffff, transparent:true, opacity:0.22})
    );
    card.add(edges);
    root.add(card);
    cards.push(card);
  }

  const particlesGeometry = new THREE.BufferGeometry();
  const particleCount = mode === 'screen' ? 150 : 90;
  const particlePositions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 16;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    particlePositions[i * 3 + 2] = -Math.random() * 8;
  }

  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particles = new THREE.Points(
    particlesGeometry,
    new THREE.PointsMaterial({
      color: mode === 'screen' ? 0x9bc2e6 : 0x577c9e,
      size: mode === 'screen' ? 0.045 : 0.035,
      transparent:true,
      opacity:0.65,
      sizeAttenuation:true
    })
  );
  scene.add(particles);

  const nodeGroup = new THREE.Group();
  scene.add(nodeGroup);
  const nodePalette = [0xf2a900,0x5c9e3a,0x8bb8df,0xf2a900,0x5c9e3a,0x8bb8df];
  const nodes = [];
  const lines = [];

  for (let i = 0; i < 6; i++) {
    const node = new THREE.Mesh(
      new THREE.IcosahedronGeometry(mode === 'screen' ? 0.16 : 0.12, 1),
      new THREE.MeshStandardMaterial({
        color:nodePalette[i],
        emissive:nodePalette[i],
        emissiveIntensity:0.6,
        roughness:0.24,
        metalness:0.18
      })
    );
    const angle = (i / 6) * Math.PI * 2;
    node.position.set(Math.cos(angle) * 3.4, Math.sin(angle) * 2.2, -0.8 - (i % 2) * 0.6);
    node.userData.start = node.position.clone();
    nodes.push(node);
    nodeGroup.add(node);
  }

  for (let i = 0; i < 3; i++) {
    const geometry = new THREE.BufferGeometry().setFromPoints([nodes[i*2].position, nodes[i*2+1].position]);
    const line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({color:0xffffff, transparent:true, opacity:0.18})
    );
    lines.push(line);
    nodeGroup.add(line);
  }

  const targetPairs = [
    [new THREE.Vector3(-3.1,1.4,-0.6), new THREE.Vector3(-1.9,1.4,-0.6)],
    [new THREE.Vector3(-0.6,-0.1,-0.9), new THREE.Vector3(0.6,-0.1,-0.9)],
    [new THREE.Vector3(1.9,-1.6,-0.7), new THREE.Vector3(3.1,-1.6,-0.7)]
  ];

  let revealTarget = 0;
  let revealProgress = 0;
  let conceptPulse = 0;
  let pointerX = 0;
  let pointerY = 0;

  window.addEventListener('connections:revealed', () => {
    revealTarget = 1;
    conceptPulse = 1;
  });

  window.addEventListener('experience:reset', () => {
    revealTarget = 0;
  });

  window.addEventListener('concept:revealed', () => {
    conceptPulse = 1;
  });

  window.addEventListener('pointermove', event => {
    pointerX = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
    pointerY = (event.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;
  }, {passive:true});

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(rect.width, 1);
    const height = Math.max(rect.height, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  const clock = new THREE.Clock();

  function frame() {
    const t = clock.getElapsedTime();

    if (!reducedMotion) {
      root.rotation.y += ((pointerX * 0.08) - root.rotation.y) * 0.02;
      root.rotation.x += ((-pointerY * 0.04) - root.rotation.x) * 0.02;
      particles.rotation.y = t * 0.018;
      particles.rotation.x = Math.sin(t * 0.15) * 0.04;

      cards.forEach((card, index) => {
        card.position.y = card.userData.baseY + Math.sin(t * card.userData.speed + card.userData.offset) * 0.22;
        card.rotation.z += Math.sin(t * 0.25 + index) * 0.0008;
      });

      revealProgress += (revealTarget - revealProgress) * 0.035;
      conceptPulse *= 0.965;
    } else {
      revealProgress = revealTarget;
      conceptPulse = 0;
    }

    nodes.forEach((node, index) => {
      const pairIndex = Math.floor(index / 2);
      const pairSide = index % 2;
      const target = targetPairs[pairIndex][pairSide];
      node.position.lerpVectors(node.userData.start, target, revealProgress);
      const pulse = 1 + Math.sin(t * 3 + index) * 0.08 + conceptPulse * 0.28;
      node.scale.setScalar(pulse);
    });

    lines.forEach((line, index) => {
      line.geometry.setFromPoints([nodes[index*2].position, nodes[index*2+1].position]);
      line.material.opacity = 0.14 + revealProgress * 0.48;
    });

    camera.position.x += (pointerX * 0.18 - camera.position.x) * 0.018;
    camera.position.y += (-pointerY * 0.12 - camera.position.y) * 0.018;
    camera.lookAt(0, 0, -1.8);

    renderer.render(scene, camera);

    if (!reducedMotion) requestAnimationFrame(frame);
  }

  frame();

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !reducedMotion) {
      clock.getDelta();
    }
  });
}
