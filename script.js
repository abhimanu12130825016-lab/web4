(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader = document.querySelector('.loader');
  const loaderLine = document.querySelector('.loader-line i');
  const loaderCount = document.querySelector('.loader-count');
  let progress = 0;
  const loading = window.setInterval(() => {
    progress = Math.min(progress + (reducedMotion ? 100 : Math.ceil(Math.random() * 10)), 100);
    loaderLine.style.width = `${progress}%`;
    loaderCount.textContent = String(progress).padStart(2, '0');
    if (progress === 100) { window.clearInterval(loading); window.setTimeout(() => loader.classList.add('done'), reducedMotion ? 0 : 350); }
  }, reducedMotion ? 10 : 55);
  const menuButton = document.querySelector('.menu-button');
  const menu = document.querySelector('.menu-panel');
  const toggleMenu = (open) => { menuButton.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-hidden', String(!open)); menu.classList.toggle('open', open); };
  menuButton.addEventListener('click', () => toggleMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  document.querySelectorAll('.menu-panel a').forEach((link) => link.addEventListener('click', () => toggleMenu(false)));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') toggleMenu(false); });
  const scenes = [...document.querySelectorAll('.scene')];
  const dots = [...document.querySelectorAll('.rail-dots a')];
  const currentScene = document.querySelector('.scene-current');
  const revealObserver = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (entry.isIntersecting) entry.target.querySelectorAll('.reveal').forEach((item) => item.classList.add('visible')); }); }, { threshold: 0.18 });
  scenes.forEach((scene) => revealObserver.observe(scene));
  const sceneObserver = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (!entry.isIntersecting) return; const number = entry.target.dataset.scene; currentScene.textContent = number; dots.forEach((dot, index) => dot.classList.toggle('active', String(index + 1).padStart(2, '0') === number)); }); }, { threshold: 0.55 });
  scenes.forEach((scene) => sceneObserver.observe(scene));
  const world = document.querySelector('#world');
  let renderer;
  let animationFrame;
  if (window.THREE) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 7;
    renderer = new THREE.WebGLRenderer({ canvas: world, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.setSize(window.innerWidth, window.innerHeight);
    const group = new THREE.Group(); scene.add(group);
    const geometry = new THREE.BufferGeometry(); const count = 900; const positions = new Float32Array(count * 3);
    for (let index = 0; index < count * 3; index += 3) { positions[index] = (Math.random() - .5) * 13; positions[index + 1] = (Math.random() - .5) * 9; positions[index + 2] = (Math.random() - .5) * 9; }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0xb84b30, size: .018, transparent: true, opacity: .45, depthWrite: false }); group.add(new THREE.Points(geometry, material));
    const toriiMaterial = new THREE.MeshBasicMaterial({ color: 0x8f3523, transparent: true, opacity: .16, wireframe: true });
    const torii = new THREE.Mesh(new THREE.TorusGeometry(2.4, .015, 3, 64), toriiMaterial); torii.scale.y = .64; torii.rotation.y = .2; group.add(torii);
    let targetX = 0; let targetY = 0; let scroll = 0;
    const onPointer = (event) => { targetX = (event.clientX / window.innerWidth - .5) * .45; targetY = (event.clientY / window.innerHeight - .5) * .3; };
    const onScroll = () => { scroll = window.scrollY / Math.max(document.body.scrollHeight - window.innerHeight, 1); };
    const onResize = () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); };
    window.addEventListener('pointermove', onPointer, { passive: true }); window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onResize);
    const animate = () => { group.rotation.y += (targetX - group.rotation.y) * .025; group.rotation.x += (targetY + scroll * .12 - group.rotation.x) * .025; torii.rotation.z = Math.sin(Date.now() * .0002) * .02; renderer.render(scene, camera); animationFrame = requestAnimationFrame(animate); };
    animate();
    window.addEventListener('pagehide', () => { cancelAnimationFrame(animationFrame); geometry.dispose(); material.dispose(); torii.geometry.dispose(); toriiMaterial.dispose(); renderer.dispose(); window.removeEventListener('pointermove', onPointer); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); });
  } else { world.style.display = 'none'; }
})();
