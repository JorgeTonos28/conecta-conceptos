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
  const isScreen = mode === 'screen';

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha:true,
    antialias:true,
    powerPreference:'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isScreen ? 1.75 : 1.55));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = isScreen ? 1.18 : 1.08;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(isScreen ? 48 : 54, 1, 0.1, 100);
  camera.position.set(0, 0, isScreen ? 9.2 : 7.8);

  const world = new THREE.Group();
  scene.add(world);

  const floatGroup = new THREE.Group();
  const nodeGroup = new THREE.Group();
  world.add(floatGroup, nodeGroup);

  scene.add(new THREE.AmbientLight(0xffffff, isScreen ? 1.2 : 1.4));

  const warm = new THREE.DirectionalLight(0xffc85a, isScreen ? 3.4 : 2.2);
  warm.position.set(5, 5, 6);
  scene.add(warm);

  const blue = new THREE.PointLight(0x3f8fd8, isScreen ? 38 : 20, 22, 2);
  blue.position.set(-4, 2.5, 4);
  scene.add(blue);

  const green = new THREE.PointLight(0x6caf48, isScreen ? 24 : 14, 18, 2);
  green.position.set(4, -2.5, 3);
  scene.add(green);

  const orange = new THREE.PointLight(0xf2a900, isScreen ? 30 : 16, 18, 2);
  orange.position.set(2.5, 4, 2);
  scene.add(orange);

  const palette = [
    {color:0x174a82, emissive:0x0b2341},
    {color:0xf2a900, emissive:0x6f4900},
    {color:0x5c9e3a, emissive:0x244715},
    {color:0x6d9bc3, emissive:0x173b59},
  ];

  const floatingObjects = [];

  function addFloatingMesh(mesh, config = {}) {
    mesh.position.set(config.x ?? 0, config.y ?? 0, config.z ?? -2);
    mesh.rotation.set(config.rx ?? 0, config.ry ?? 0, config.rz ?? 0);
    mesh.userData = {
      basePosition:mesh.position.clone(),
      baseRotation:mesh.rotation.clone(),
      ampX:config.ampX ?? 0.18,
      ampY:config.ampY ?? 0.24,
      ampR:config.ampR ?? 0.15,
      speed:config.speed ?? 0.35,
      offset:config.offset ?? Math.random() * Math.PI * 2
    };
    floatingObjects.push(mesh);
    floatGroup.add(mesh);
  }

  function physicalMaterial(index, opacity = 1) {
    const p = palette[index % palette.length];
    return new THREE.MeshPhysicalMaterial({
      color:p.color,
      emissive:p.emissive,
      emissiveIntensity:isScreen ? 0.48 : 0.28,
      metalness:isScreen ? 0.34 : 0.2,
      roughness:0.2,
      clearcoat:1,
      clearcoatRoughness:0.16,
      transparent:opacity < 1,
      opacity,
      side:THREE.DoubleSide
    });
  }

  const cardPositions = isScreen ? [
    [-4.7, 2.8, -2.1, -0.35, 0.45, -0.1],
    [-2.5,-2.7, -3.2,  0.22,-0.42,  0.25],
    [ 0.7, 3.4, -3.9, -0.25, 0.3,  0.08],
    [ 2.0,-2.8, -2.5,  0.4, -0.38, -0.12],
    [ 4.9, 2.4, -3.4, -0.2, -0.48,  0.3],
    [ 5.2,-1.0, -5.2,  0.3,  0.35, -0.2],
    [-5.2,-0.6, -5.3, -0.1, -0.32, 0.18],
  ] : [
    [-2.9, 3.0, -3.2, -0.3, 0.4, -0.1],
    [ 2.8, 2.4, -4.0,  0.24,-0.36, 0.2],
    [-2.4,-2.8, -4.4,  0.3, 0.28, -0.2],
    [ 2.7,-2.6, -3.5, -0.24,-0.34, 0.15],
  ];

  cardPositions.forEach((p, index) => {
    const w = isScreen ? 1.65 + (index % 2) * 0.35 : 1.35 + (index % 2) * 0.22;
    const h = isScreen ? 1.0 : 0.82;
    const d = isScreen ? 0.18 : 0.14;
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(w,h,d,2,2,1),
      physicalMaterial(index, isScreen ? 0.78 : 0.55)
    );

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(box.geometry),
      new THREE.LineBasicMaterial({
        color:0xffffff,
        transparent:true,
        opacity:isScreen ? 0.42 : 0.26
      })
    );
    box.add(edges);

    addFloatingMesh(box,{
      x:p[0],y:p[1],z:p[2],rx:p[3],ry:p[4],rz:p[5],
      ampX:0.12 + (index%3)*0.04,
      ampY:0.18 + (index%2)*0.07,
      ampR:0.11,
      speed:0.28 + index*0.035,
      offset:index*.9
    });
  });

  const accentShapes = [
    new THREE.Mesh(new THREE.TorusGeometry(isScreen ? .72 : .55, .12, 22, 72), physicalMaterial(1,.78)),
    new THREE.Mesh(new THREE.IcosahedronGeometry(isScreen ? .58 : .42,2), physicalMaterial(2,.82)),
    new THREE.Mesh(new THREE.OctahedronGeometry(isScreen ? .46 : .34,1), physicalMaterial(0,.86)),
    new THREE.Mesh(new THREE.TorusKnotGeometry(isScreen ? .38 : .28,.095,80,12,2,3), physicalMaterial(3,.72))
  ];

  const accentConfigs = isScreen ? [
    {x:5.4,y:3.6,z:-2.2,rx:.5,ry:.3,rz:.1,ampY:.24,speed:.32},
    {x:-4.8,y:-3.2,z:-1.8,rx:.4,ry:.2,rz:.2,ampY:.22,speed:.38},
    {x:3.9,y:-3.5,z:-4.1,rx:.1,ry:.4,rz:.3,ampY:.28,speed:.29},
    {x:-1.0,y:3.9,z:-4.8,rx:.5,ry:.1,rz:.2,ampY:.18,speed:.34}
  ] : [
    {x:2.7,y:3.5,z:-2.6,rx:.4,ry:.2,rz:.1,ampY:.18,speed:.33},
    {x:-2.9,y:-3.2,z:-2.2,rx:.3,ry:.2,rz:.2,ampY:.2,speed:.36},
    {x:3.1,y:-2.5,z:-4.2,rx:.2,ry:.4,rz:.2,ampY:.2,speed:.3},
    {x:-2.2,y:2.7,z:-4.6,rx:.4,ry:.1,rz:.1,ampY:.16,speed:.34}
  ];

  accentShapes.forEach((mesh,index) => addFloatingMesh(mesh,{...accentConfigs[index],offset:index*1.2}));

  const particlesGeometry = new THREE.BufferGeometry();
  const particleCount = isScreen ? 210 : 110;
  const particlePositions = new Float32Array(particleCount * 3);

  for (let i=0;i<particleCount;i++) {
    particlePositions[i*3]=(Math.random()-.5)*(isScreen?17:10);
    particlePositions[i*3+1]=(Math.random()-.5)*(isScreen?10:11);
    particlePositions[i*3+2]=-Math.random()*9;
  }

  particlesGeometry.setAttribute('position',new THREE.BufferAttribute(particlePositions,3));
  const particles=new THREE.Points(
    particlesGeometry,
    new THREE.PointsMaterial({
      color:isScreen?0xa6c8e8:0x51789d,
      size:isScreen?.052:.038,
      transparent:true,
      opacity:isScreen?.72:.46,
      sizeAttenuation:true
    })
  );
  world.add(particles);

  const nodePalette=[0xf2a900,0x5c9e3a,0x74a6d2,0xf2a900,0x5c9e3a,0x74a6d2];
  const nodes=[];
  const lines=[];

  for(let i=0;i<6;i++) {
    const node=new THREE.Mesh(
      new THREE.SphereGeometry(isScreen?.18:.13,32,32),
      new THREE.MeshPhysicalMaterial({
        color:nodePalette[i],
        emissive:nodePalette[i],
        emissiveIntensity:.9,
        clearcoat:1,
        clearcoatRoughness:.08,
        metalness:.28,
        roughness:.18
      })
    );
    const angle=(i/6)*Math.PI*2;
    node.position.set(Math.cos(angle)*(isScreen?4.2:3.2),Math.sin(angle)*(isScreen?2.7:2.2),-1.0-(i%2)*.8);
    node.userData.start=node.position.clone();
    nodes.push(node);
    nodeGroup.add(node);
  }

  for(let i=0;i<3;i++) {
    const geometry=new THREE.BufferGeometry().setFromPoints([nodes[i*2].position,nodes[i*2+1].position]);
    const line=new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.2})
    );
    lines.push(line);
    nodeGroup.add(line);
  }

  const targetPairs=isScreen?[
    [new THREE.Vector3(-4.0,1.8,-.5),new THREE.Vector3(-2.3,1.8,-.5)],
    [new THREE.Vector3(-.85,-.05,-.65),new THREE.Vector3(.85,-.05,-.65)],
    [new THREE.Vector3(2.3,-1.9,-.55),new THREE.Vector3(4.0,-1.9,-.55)]
  ]:[
    [new THREE.Vector3(-2.5,1.3,-.6),new THREE.Vector3(-1.25,1.3,-.6)],
    [new THREE.Vector3(-.62,-.1,-.8),new THREE.Vector3(.62,-.1,-.8)],
    [new THREE.Vector3(1.25,-1.5,-.65),new THREE.Vector3(2.5,-1.5,-.65)]
  ];

  let revealTarget=0;
  let revealProgress=0;
  let conceptPulse=0;
  let pointerX=0;
  let pointerY=0;

  window.addEventListener('connections:revealed',()=>{revealTarget=1;conceptPulse=1});
  window.addEventListener('experience:reset',()=>{revealTarget=0});
  window.addEventListener('concept:revealed',()=>{conceptPulse=1});

  window.addEventListener('pointermove',event=>{
    pointerX=(event.clientX/Math.max(window.innerWidth,1)-.5)*2;
    pointerY=(event.clientY/Math.max(window.innerHeight,1)-.5)*2;
  },{passive:true});

  function resize() {
    const rect=canvas.getBoundingClientRect();
    const width=Math.max(rect.width,1);
    const height=Math.max(rect.height,1);
    renderer.setSize(width,height,false);
    camera.aspect=width/height;
    camera.updateProjectionMatrix();
  }

  const observer=new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  const clock=new THREE.Clock();

  function renderFrame() {
    const t=clock.getElapsedTime();

    if(!reducedMotion) {
      floatGroup.rotation.y+=((pointerX*.11)-floatGroup.rotation.y)*.018;
      floatGroup.rotation.x+=((-pointerY*.055)-floatGroup.rotation.x)*.018;

      floatingObjects.forEach((mesh,index)=>{
        const d=mesh.userData;
        mesh.position.x=d.basePosition.x+Math.sin(t*d.speed*.72+d.offset)*d.ampX;
        mesh.position.y=d.basePosition.y+Math.sin(t*d.speed+d.offset)*d.ampY;
        mesh.rotation.x=d.baseRotation.x+Math.sin(t*d.speed*.6+d.offset)*d.ampR;
        mesh.rotation.y=d.baseRotation.y+Math.cos(t*d.speed*.52+d.offset)*d.ampR*1.45;
        mesh.rotation.z=d.baseRotation.z+Math.sin(t*d.speed*.43+d.offset)*d.ampR*.55;
      });

      particles.rotation.y=t*.018;
      particles.rotation.x=Math.sin(t*.13)*.045;

      revealProgress+=(revealTarget-revealProgress)*.04;
      conceptPulse*=.955;

      world.position.y=Math.sin(t*.28)*(isScreen?.07:.04);
    } else {
      revealProgress=revealTarget;
      conceptPulse=0;
    }

    nodes.forEach((node,index)=>{
      const pairIndex=Math.floor(index/2);
      const pairSide=index%2;
      const target=targetPairs[pairIndex][pairSide];
      node.position.lerpVectors(node.userData.start,target,revealProgress);

      const pulse=1+Math.sin(t*2.7+index)*.07+conceptPulse*.28;
      node.scale.setScalar(pulse);
    });

    lines.forEach((line,index)=>{
      line.geometry.setFromPoints([nodes[index*2].position,nodes[index*2+1].position]);
      line.material.opacity=.16+revealProgress*.62;
    });

    camera.position.x+=(pointerX*(isScreen?.22:.14)-camera.position.x)*.015;
    camera.position.y+=(-pointerY*(isScreen?.14:.09)-camera.position.y)*.015;
    camera.lookAt(0,0,-2.0);

    renderer.render(scene,camera);
    if(!reducedMotion) requestAnimationFrame(renderFrame);
  }

  renderFrame();
}
