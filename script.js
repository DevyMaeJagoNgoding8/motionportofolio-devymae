
(() => {
  const root = document.getElementById("devy-portfolio");
  if (!root) return;

  // Pointer tilt: desktop only; touch devices keep a stable layout.
  const finePointer = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  if (finePointer) {
    root.querySelectorAll("[data-tilt]").forEach((el) => {
      const strength = Number(el.dataset.tilt || 8);
      el.addEventListener("pointermove", (event) => {
        const rect = el.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        el.style.transform = `perspective(1000px) rotateX(${(0.5-y)*strength}deg) rotateY(${(x-0.5)*strength}deg) translateZ(8px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  // Scroll reveal with a graceful fallback for reduced-motion preferences.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const avatarVideo = document.getElementById("dp-avatar-video");
  const avatarCanvas = document.getElementById("dp-avatar-canvas");
  const avatarStill = root.querySelector(".dp-avatar-still");
  const avatarContext = avatarCanvas && avatarCanvas.getContext("2d", { willReadFrequently: true });

  if (!reduceMotion && avatarCanvas && !avatarContext) {
    console.warn("Canvas untuk menampilkan video avatar tidak dapat dibuat.");
  }

  if (!reduceMotion && avatarVideo && avatarCanvas && avatarStill && avatarContext) {
    let background;
    let stack;
    const removeConnectedBlackBackground = () => {
      const { width, height } = avatarCanvas;
      const frame = avatarContext.getImageData(0, 0, width, height);
      const pixels = frame.data;
      background.fill(0);
      let stackLength = 0;
      const threshold = 18;
      const addIfBackground = (index) => {
        if (background[index]) return;
        const offset = index * 4;
        if (Math.max(pixels[offset], pixels[offset + 1], pixels[offset + 2]) <= threshold) {
          background[index] = 1;
          stack[stackLength++] = index;
        }
      };

      for (let x = 0; x < width; x++) {
        addIfBackground(x);
        addIfBackground((height - 1) * width + x);
      }
      for (let y = 1; y < height - 1; y++) {
        addIfBackground(y * width);
        addIfBackground(y * width + width - 1);
      }

      while (stackLength > 0) {
        const index = stack[--stackLength];
        const x = index % width;
        if (x > 0) addIfBackground(index - 1);
        if (x < width - 1) addIfBackground(index + 1);
        if (index >= width) addIfBackground(index - width);
        if (index < width * (height - 1)) addIfBackground(index + width);
      }

      for (let index = 0; index < background.length; index++) {
        if (background[index]) pixels[index * 4 + 3] = 0;
      }
      avatarContext.putImageData(frame, 0, 0);
    };

    const renderAvatarFrame = () => {
      if (avatarVideo.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
      try {
        avatarContext.drawImage(avatarVideo, 0, 0, avatarCanvas.width, avatarCanvas.height);
        removeConnectedBlackBackground();
      } catch (error) {
        console.warn("Latar hitam video avatar tidak dapat dihapus:", error);
        avatarVideo.pause();
        avatarCanvas.hidden = true;
        avatarStill.hidden = false;
        return;
      }
      if (typeof avatarVideo.requestVideoFrameCallback === "function") {
        avatarVideo.requestVideoFrameCallback(renderAvatarFrame);
      } else {
        requestAnimationFrame(renderAvatarFrame);
      }
    };

    const startAvatarVideo = () => {
      const scale = Math.min(1, 360 / avatarVideo.videoWidth, 640 / avatarVideo.videoHeight);
      avatarCanvas.width = Math.round(avatarVideo.videoWidth * scale);
      avatarCanvas.height = Math.round(avatarVideo.videoHeight * scale);
      background = new Uint8Array(avatarCanvas.width * avatarCanvas.height);
      stack = new Int32Array(background.length);
      avatarVideo.play().then(() => {
        avatarStill.hidden = true;
        avatarCanvas.hidden = false;
        renderAvatarFrame();
      }).catch((error) => {
        console.warn("Video avatar tidak dapat diputar:", error);
      });
    };

    avatarVideo.addEventListener("loadedmetadata", startAvatarVideo, { once: true });
    avatarVideo.addEventListener("error", () => {
      console.warn("Video avatar tidak dapat dimuat:", avatarVideo.error);
    }, { once: true });
    avatarVideo.load();
  }

  if (!reduceMotion && "IntersectionObserver" in window) {
    const revealItems = root.querySelectorAll(".dp-section, .dp-card, .dp-step");
    revealItems.forEach((el) => el.classList.add("dp-reveal"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("dp-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((el) => observer.observe(el));
  }

  // Three.js decorative environment: floating glass-like orbs and orbit rings.
  const mount = document.getElementById("dp-three-scene");
  if (!mount || !window.THREE || reduceMotion) return;
  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 8);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x9bcfff, 0.9));
    const keyLight = new THREE.PointLight(0x63c5ff, 2.1, 24);
    keyLight.position.set(2.8, 2.4, 5);
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0x376cff, 1.5, 20);
    rimLight.position.set(-3, -1, -2);
    scene.add(rimLight);

    const group = new THREE.Group();
    scene.add(group);
    const sphereGeo = new THREE.SphereGeometry(0.23, 32, 32);
    const sphereMat = new THREE.MeshPhysicalMaterial({
      color: 0x7bdcff, metalness: 0.25, roughness: 0.08,
      transmission: 0.45, transparent: true, opacity: 0.72,
      clearcoat: 1, clearcoatRoughness: 0.08
    });
    const orbs = [];
    [[-2.3,1.5,-.5,.85],[2.2,1.9,-.8,.62],[-2.2,-1.5,.2,.5],[2.1,-1.8,-.4,.95]].forEach((p) => {
      const mesh = new THREE.Mesh(sphereGeo, sphereMat.clone());
      mesh.position.set(p[0],p[1],p[2]); mesh.scale.setScalar(p[3]);
      group.add(mesh);
      orbs.push({ mesh, x: p[0], y: p[1], phase: orbs.length * Math.PI / 2 });
    });

    const ringMat = new THREE.MeshBasicMaterial({ color: 0x66caff, transparent: true, opacity: .38 });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.75, .012, 8, 160), ringMat);
    ring1.rotation.set(1.05, .35, -.25); group.add(ring1);
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.35, .009, 8, 160), ringMat.clone());
    ring2.rotation.set(.45, 1.1, .4); group.add(ring2);

    const particlesGeo = new THREE.BufferGeometry();
    const count = 180;
    const positions = new Float32Array(count * 3);
    for (let i=0; i<count; i++) {
      positions[i*3] = (Math.random()-.5)*7;
      positions[i*3+1] = (Math.random()-.5)*6;
      positions[i*3+2] = (Math.random()-.5)*3;
    }
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(positions,3));
    const particles = new THREE.Points(particlesGeo, new THREE.PointsMaterial({
      color: 0x9bdfff, size: .018, transparent: true, opacity: .72
    }));
    scene.add(particles);

    let pointerX = 0, pointerY = 0;
    mount.addEventListener("pointermove", (e) => {
      const r = mount.getBoundingClientRect();
      pointerX = ((e.clientX-r.left)/r.width-.5)*.16;
      pointerY = ((e.clientY-r.top)/r.height-.5)*.12;
    });
    const resize = () => {
      const w = Math.max(1,mount.clientWidth), h = Math.max(1,mount.clientHeight);
      camera.aspect = w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h);
    };
    new ResizeObserver(resize).observe(mount);

    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      group.rotation.y = Math.sin(t*.16)*.12 + pointerX;
      group.rotation.x = Math.cos(t*.13)*.06 + pointerY;
      orbs.forEach((orb) => {
        orb.mesh.position.x = orb.x + Math.sin(t*.7 + orb.phase)*.12;
        orb.mesh.position.y = orb.y + Math.sin(t*1.1 + orb.phase)*.16;
      });
      ring1.rotation.z = -.25 + t*.12;
      ring2.rotation.x = .45 + t*.09;
      ring2.rotation.z = .4 + Math.sin(t*.3)*.08;
      particles.rotation.y = t*.012;
      renderer.render(scene,camera);
    };
    animate();
  } catch (error) {
    console.warn("Adegan 3D dekoratif tidak dapat dimuat:", error);
  }
})();
