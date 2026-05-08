    // ---- CURSOR ----
    const cursor = document.getElementById('cursor');
    const ring = document.getElementById('cursorRing');
    let mx = -100, my = -100, rx = -100, ry = -100;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    function animateCursor() {
      cursor.style.transform = `translate(${mx - 6}px, ${my - 6}px)`;
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.transform = `translate(${rx - 20}px, ${ry - 20}px)`;
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    document.querySelectorAll('a, button, .skill-card, .project-card, .stat-card, .edu-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.style.background = 'var(--gold)';
        ring.style.width = '60px'; ring.style.height = '60px';
        ring.style.borderColor = 'var(--gold)';
      });
      el.addEventListener('mouseleave', () => {
        cursor.style.background = 'var(--accent)';
        ring.style.width = '40px'; ring.style.height = '40px';
        ring.style.borderColor = 'var(--accent)';
      });
    });

    // ---- NAV SCROLL ----
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    });

    // =============================
    // THREE.JS — REALISTIC BASEBALL FIELD
    // =============================
    (function () {
      const container = document.getElementById('three-container');
      const tooltip   = document.getElementById('base-tooltip');
      const tipYear   = document.getElementById('base-tooltip-year');
      const tipLabel  = document.getElementById('base-tooltip-label');

      // ---- RENDERER ----
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x04060d, 0.020);

      const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 250);
      camera.position.set(0, 16, 18);
      camera.lookAt(0, 0, 0);

      function setSize() {
        const W = container.offsetWidth, H = container.offsetHeight;
        renderer.setSize(W, H);
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
      }
      setSize();
      window.addEventListener('resize', setSize);

      // ---- PROCEDURAL TEXTURES ----
      function makeGrassTex() {
        const c = document.createElement('canvas'); c.width = 512; c.height = 512;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#1b4d1b'; ctx.fillRect(0, 0, 512, 512);
        // Mowing stripes (parallel alternating bands)
        const sw = 28;
        for (let i = 0; i < 512; i += sw * 2) {
          ctx.fillStyle = 'rgba(30,80,28,0.6)';
          ctx.fillRect(i, 0, sw, 512);
        }
        // Fine grain noise
        for (let i = 0; i < 8000; i++) {
          const x = Math.random() * 512, y = Math.random() * 512;
          ctx.fillStyle = Math.random() > 0.5 ? 'rgba(90,160,60,0.08)' : 'rgba(0,18,0,0.1)';
          ctx.fillRect(x, y, 1 + Math.random(), 2 + Math.random() * 3);
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(9, 9);
        return tex;
      }

      function makeDirtTex() {
        const c = document.createElement('canvas'); c.width = 256; c.height = 256;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#7a4e28'; ctx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 5000; i++) {
          const x = Math.random() * 256, y = Math.random() * 256;
          const r = 90 + Math.random() * 70, g = 55 + Math.random() * 45, b = 15 + Math.random() * 30;
          ctx.fillStyle = `rgba(${r|0},${g|0},${b|0},0.22)`;
          ctx.beginPath(); ctx.arc(x, y, Math.random() * 2.2 + 0.4, 0, Math.PI * 2); ctx.fill();
        }
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(5, 5);
        return tex;
      }

      function makeBallTex() {
        const c = document.createElement('canvas'); c.width = 256; c.height = 256;
        const ctx = c.getContext('2d');
        const g = ctx.createRadialGradient(110, 90, 8, 128, 128, 130);
        g.addColorStop(0, '#fff9ee'); g.addColorStop(0.55, '#f2e8d0'); g.addColorStop(1, '#d8c498');
        ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
        // Red seam lines
        ctx.strokeStyle = '#bf1f0a'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(88, 38); ctx.bezierCurveTo(56, 82, 56, 172, 88, 218); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(100, 38); ctx.bezierCurveTo(68, 82, 68, 172, 100, 218); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(158, 38); ctx.bezierCurveTo(196, 82, 196, 172, 158, 218); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(170, 38); ctx.bezierCurveTo(208, 82, 208, 172, 170, 218); ctx.stroke();
        // Cross stitches
        ctx.lineWidth = 1.8;
        for (let i = 0; i < 10; i++) {
          const t = 0.08 + i * 0.085;
          const ly = 38 + t * 180;
          const lx = 94 + Math.sin(t * Math.PI) * (-28);
          ctx.beginPath(); ctx.moveTo(lx - 8, ly - 5); ctx.lineTo(lx + 8, ly + 5); ctx.stroke();
          const ry = 38 + t * 180;
          const rx = 164 + Math.sin(t * Math.PI) * 28;
          ctx.beginPath(); ctx.moveTo(rx - 8, ry - 5); ctx.lineTo(rx + 8, ry + 5); ctx.stroke();
        }
        return new THREE.CanvasTexture(c);
      }

      const grassTex = makeGrassTex();
      const dirtTex  = makeDirtTex();
      const ballTex  = makeBallTex();

      // ---- MATERIALS (PBR) ----
      const grassMat  = new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.96, metalness: 0.0 });
      const dirtMat   = new THREE.MeshStandardMaterial({ map: dirtTex,  roughness: 0.98, metalness: 0.0 });
      const moundMat  = new THREE.MeshStandardMaterial({ color: 0xaa7448, roughness: 0.97, metalness: 0.0 });
      const whiteMat  = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 });
      const chalkMat  = new THREE.MeshStandardMaterial({ color: 0xeeeee8, roughness: 0.92, emissive: 0xffffff, emissiveIntensity: 0.04 });
      const homeMat   = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.5,  emissive: 0xffffff, emissiveIntensity: 0.35 });
      const goldMat   = new THREE.MeshStandardMaterial({ color: 0xC8972B, roughness: 0.4, metalness: 0.35, emissive: 0x6B4A00, emissiveIntensity: 0.25 });
      const navyMat   = new THREE.MeshStandardMaterial({ color: 0x00205B, roughness: 0.5, metalness: 0.1,  emissive: 0x000e2a, emissiveIntensity: 0.2 });
      const glowMat   = new THREE.MeshBasicMaterial({ color: 0xC8972B, transparent: true, opacity: 0.55, side: THREE.DoubleSide });

      // ---- LIGHTS ----
      scene.add(new THREE.AmbientLight(0xfff5e0, 0.5));

      // Main key light (left flood tower)
      const keyLight = new THREE.DirectionalLight(0xfff8e8, 1.3);
      keyLight.position.set(-14, 24, 10);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(2048, 2048);
      keyLight.shadow.camera.left = -28; keyLight.shadow.camera.right = 28;
      keyLight.shadow.camera.top  =  28; keyLight.shadow.camera.bottom = -28;
      keyLight.shadow.camera.far = 90;
      keyLight.shadow.bias = -0.0008;
      scene.add(keyLight);

      // Fill light (right tower)
      const fillLight = new THREE.DirectionalLight(0xd0e8ff, 0.75);
      fillLight.position.set(14, 22, 10);
      scene.add(fillLight);

      // Back rim from center field
      const rimLight = new THREE.DirectionalLight(0xffe8a0, 0.3);
      rimLight.position.set(0, 20, -18);
      scene.add(rimLight);

      // Gold home-plate glow
      const goldLight = new THREE.PointLight(0xC8972B, 1.8, 14);
      goldLight.position.set(0, 4, 6);
      scene.add(goldLight);

      // ---- OUTFIELD GRASS ----
      const field = new THREE.Mesh(new THREE.PlaneGeometry(62, 62, 2, 2), grassMat);
      field.rotation.x = -Math.PI / 2;
      field.receiveShadow = true;
      scene.add(field);

      // ---- MOWING STRIPES (diagonal overlay) ----
      for (let i = -8; i <= 8; i++) {
        if (i % 2 === 0) continue;
        const stripe = new THREE.Mesh(
          new THREE.PlaneGeometry(4.0, 60),
          new THREE.MeshStandardMaterial({ color: 0x1e5820, roughness: 0.95, transparent: true, opacity: 0.3 })
        );
        stripe.rotation.x = -Math.PI / 2;
        stripe.position.set(i * 4.0, 0.006, -1);
        scene.add(stripe);
      }

      // ---- INFIELD DIRT ----
      const DIAMOND_R = 8.8;
      const infieldDirt = new THREE.Mesh(new THREE.CircleGeometry(DIAMOND_R, 72), dirtMat);
      infieldDirt.rotation.x = -Math.PI / 2;
      infieldDirt.position.y = 0.01;
      infieldDirt.receiveShadow = true;
      scene.add(infieldDirt);

      // Diamond base positions
      const HOME   = [0,  5.2];
      const FIRST  = [ 6.2, -0.8];
      const SECOND = [ 0,   -7.0];
      const THIRD  = [-6.2, -0.8];

      // ---- INFIELD GRASS (diamond inside basepaths) ----
      const igShape = new THREE.Shape();
      igShape.moveTo(HOME[0],   HOME[1]);
      igShape.quadraticCurveTo( FIRST[0] + 1.5, (HOME[1]   + FIRST[1]) / 2, FIRST[0],  FIRST[1]);
      igShape.quadraticCurveTo((FIRST[0]  + SECOND[0]) / 2 + 0.8, SECOND[1] - 0.8, SECOND[0], SECOND[1]);
      igShape.quadraticCurveTo( THIRD[0]  - 1.5, (SECOND[1] + THIRD[1]) / 2, THIRD[0],  THIRD[1]);
      igShape.quadraticCurveTo((THIRD[0]  + HOME[0])  / 2 - 0.8, (THIRD[1] + HOME[1]) / 2, HOME[0], HOME[1]);
      igShape.closePath();
      const igMesh = new THREE.Mesh(new THREE.ShapeGeometry(igShape), grassMat);
      igMesh.rotation.x = -Math.PI / 2;
      igMesh.position.y = 0.015;
      scene.add(igMesh);

      // ---- PITCHER'S MOUND ----
      const mound = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.85, 0.28, 40), moundMat);
      mound.position.set(0, 0.14, 0);
      mound.castShadow = true; mound.receiveShadow = true;
      scene.add(mound);

      // Pitcher's rubber
      const rubber = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.07, 0.16), whiteMat);
      rubber.position.set(0, 0.29, 0);
      rubber.castShadow = true;
      scene.add(rubber);

      // ---- CHALK HELPER ----
      function chalkLine(x1, z1, x2, z2, w) {
        w = w || 0.1;
        const dx = x2 - x1, dz = z2 - z1, len = Math.sqrt(dx * dx + dz * dz);
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, len), chalkMat);
        m.rotation.x = -Math.PI / 2;
        m.rotation.z = -Math.atan2(dx, dz);
        m.position.set((x1 + x2) / 2, 0.019, (z1 + z2) / 2);
        scene.add(m);
      }

      // Foul lines
      chalkLine(HOME[0], HOME[1], -20, -12);
      chalkLine(HOME[0], HOME[1],  20, -12);

      // ---- BASEPATHS (dirt strips) ----
      function dirtStrip(x1, z1, x2, z2) {
        const dx = x2 - x1, dz = z2 - z1, len = Math.sqrt(dx * dx + dz * dz);
        const m = new THREE.Mesh(new THREE.PlaneGeometry(0.72, len), dirtMat);
        m.rotation.x = -Math.PI / 2;
        m.rotation.z = -Math.atan2(dx, dz);
        m.position.set((x1 + x2) / 2, 0.013, (z1 + z2) / 2);
        scene.add(m);
      }
      dirtStrip(HOME[0], HOME[1], FIRST[0],  FIRST[1]);
      dirtStrip(FIRST[0],  FIRST[1],  SECOND[0], SECOND[1]);
      dirtStrip(SECOND[0], SECOND[1], THIRD[0],  THIRD[1]);
      dirtStrip(THIRD[0],  THIRD[1],  HOME[0],   HOME[1]);

      // ---- BATTER'S BOXES (chalk outlines) ----
      [1, -1].forEach(side => {
        const bw = 1.2, bh = 2.0, ox = side * 1.35, oz = HOME[1];
        chalkLine(ox - bw / 2, oz - bh / 2, ox + bw / 2, oz - bh / 2, 0.07);
        chalkLine(ox + bw / 2, oz - bh / 2, ox + bw / 2, oz + bh / 2, 0.07);
        chalkLine(ox + bw / 2, oz + bh / 2, ox - bw / 2, oz + bh / 2, 0.07);
        chalkLine(ox - bw / 2, oz + bh / 2, ox - bw / 2, oz - bh / 2, 0.07);
      });

      // ---- CATCHER'S BOX ----
      const cb = 1.3;
      chalkLine(-cb / 2, HOME[1] + 0.5, -cb / 2, HOME[1] + 0.5 + cb * 1.6, 0.06);
      chalkLine( cb / 2, HOME[1] + 0.5,  cb / 2, HOME[1] + 0.5 + cb * 1.6, 0.06);
      chalkLine(-cb / 2, HOME[1] + 0.5 + cb * 1.6, cb / 2, HOME[1] + 0.5 + cb * 1.6, 0.06);

      // ---- ON-DECK CIRCLES ----
      [-4.8, 4.8].forEach(ox => {
        const od = new THREE.Mesh(
          new THREE.RingGeometry(0.88, 1.05, 40),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, emissive: 0xffffff, emissiveIntensity: 0.05 })
        );
        od.rotation.x = -Math.PI / 2;
        od.position.set(ox, 0.022, HOME[1] + 3.8);
        scene.add(od);
      });

      // ---- BASES ----
      const baseData = [
        { pos: HOME,   year: 'HOME PLATE', label: 'Seton Hall University\nFall 2025 — The Future ✦', isHome: true  },
        { pos: FIRST,  year: '1ST BASE',   label: '2022 — Middle School\nFirst Design Class 🎨',     isHome: false, mat: goldMat },
        { pos: SECOND, year: '2ND BASE',   label: '2023 — Freshman Year\nFoundations of Code 💻',    isHome: false, mat: navyMat },
        { pos: THIRD,  year: '3RD BASE',   label: '2025 — Senior Year\nWeb Design Pathway 🚀',       isHome: false, mat: goldMat },
      ];

      const baseMeshes = [], baseGlows = [];
      baseData.forEach(b => {
        let base;
        if (b.isHome) {
          const sh = new THREE.Shape();
          sh.moveTo(-0.42, -0.52); sh.lineTo(0.42, -0.52);
          sh.lineTo(0.42, 0.1); sh.lineTo(0, 0.52); sh.lineTo(-0.42, 0.1);
          sh.closePath();
          base = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.08, bevelEnabled: false }), homeMat);
          base.rotation.x = -Math.PI / 2;
          base.position.set(b.pos[0], 0.08, b.pos[1]);
        } else {
          base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.9), b.mat);
          base.position.set(b.pos[0], 0.06, b.pos[1]);
        }
        base.castShadow = true; base.receiveShadow = true;
        base.userData = { year: b.year, label: b.label };
        scene.add(base); baseMeshes.push(base);

        const glow = new THREE.Mesh(new THREE.RingGeometry(0.72, 1.18, 36), glowMat.clone());
        glow.rotation.x = -Math.PI / 2;
        glow.position.set(b.pos[0], 0.022, b.pos[1]);
        scene.add(glow); baseGlows.push(glow);
      });

      // ---- BASEBALL (PBR + stitched texture) ----
      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 28, 28),
        new THREE.MeshStandardMaterial({ map: ballTex, roughness: 0.65, metalness: 0.0 })
      );
      ball.castShadow = true;
      scene.add(ball);

      // Ball trail
      const TLEN = 30;
      const tHist = Array.from({ length: TLEN }, () => new THREE.Vector3());
      const tGeo  = new THREE.BufferGeometry();
      const tPos  = new Float32Array(TLEN * 3);
      tGeo.setAttribute('position', new THREE.BufferAttribute(tPos, 3));
      const tLine = new THREE.Line(tGeo, new THREE.LineBasicMaterial({ color: 0xfff0a0, transparent: true, opacity: 0.45 }));
      scene.add(tLine);

      const ballPath = [HOME, FIRST, SECOND, THIRD, HOME];
      let ballT = 0, ballSeg = 0;
      function getBallPos(seg, t) {
        const a = ballPath[seg], b = ballPath[(seg + 1) % ballPath.length];
        return new THREE.Vector3(a[0] + (b[0] - a[0]) * t, 0.22 + Math.sin(t * Math.PI) * 1.2, a[1] + (b[1] - a[1]) * t);
      }

      // ---- WARNING TRACK ----
      const warnTrack = new THREE.Mesh(
        new THREE.RingGeometry(14.0, 17.0, 80),
        new THREE.MeshStandardMaterial({ map: dirtTex, roughness: 0.98 })
      );
      warnTrack.rotation.x = -Math.PI / 2;
      warnTrack.position.y = 0.009;
      warnTrack.receiveShadow = true;
      scene.add(warnTrack);

      // ---- OUTFIELD WALL (40 segments, taller) ----
      const WALL_H = 3.4, WALL_R = 17, WALL_SEGS = 40;
      for (let i = 0; i <= WALL_SEGS; i++) {
        const angle = (i / WALL_SEGS) * Math.PI;
        const wx = Math.cos(angle - Math.PI / 2) * WALL_R;
        const wz = Math.sin(angle - Math.PI / 2) * WALL_R - 4;
        const wall = new THREE.Mesh(
          new THREE.BoxGeometry(1.42, WALL_H, 0.32),
          new THREE.MeshStandardMaterial({
            color: i % 2 === 0 ? 0x00205B : 0xC8972B,
            roughness: 0.7, metalness: 0.1,
            emissive: i % 2 === 0 ? 0x000818 : 0x3a1e00,
            emissiveIntensity: 0.22
          })
        );
        wall.position.set(wx, WALL_H / 2, wz);
        wall.rotation.y = angle;
        wall.castShadow = true; wall.receiveShadow = true;
        scene.add(wall);
        // White padded rail
        const rail = new THREE.Mesh(
          new THREE.BoxGeometry(1.42, 0.25, 0.48),
          new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.6 })
        );
        rail.position.set(wx, WALL_H + 0.125, wz);
        rail.rotation.y = angle;
        scene.add(rail);
      }

      // ---- FOUL POLES ----
      [[-15.5, 3.5], [15.5, 3.5]].forEach(([px, pz]) => {
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.10, 0.13, 22, 10),
          new THREE.MeshStandardMaterial({ color: 0xffdd00, emissive: 0xffaa00, emissiveIntensity: 0.4, roughness: 0.4, metalness: 0.45 })
        );
        pole.position.set(px, 11, pz);
        pole.castShadow = true;
        scene.add(pole);
        // Basket screen
        const net = new THREE.Mesh(
          new THREE.PlaneGeometry(0.2, 7),
          new THREE.MeshBasicMaterial({ color: 0xffee55, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
        );
        net.position.set(px, 15, pz - 0.9);
        scene.add(net);
      });

      // ---- SCOREBOARD ----
      [[-3.5, -22.5], [3.5, -22.5]].forEach(([px, pz]) => {
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.28, 0.36, 14, 8),
          new THREE.MeshStandardMaterial({ color: 0x363646, roughness: 0.9 })
        );
        pillar.position.set(px, 7, pz);
        pillar.castShadow = true;
        scene.add(pillar);
      });
      const sbFrame = new THREE.Mesh(
        new THREE.BoxGeometry(9.6, 6.0, 0.65),
        new THREE.MeshStandardMaterial({ color: 0xC8972B, roughness: 0.45, metalness: 0.35, emissive: 0x5a3500, emissiveIntensity: 0.45 })
      );
      sbFrame.position.set(0, 11, -21.5);
      sbFrame.castShadow = true;
      scene.add(sbFrame);
      const sbBoard = new THREE.Mesh(
        new THREE.BoxGeometry(8.6, 5.2, 0.38),
        new THREE.MeshStandardMaterial({ color: 0x050810, roughness: 0.95 })
      );
      sbBoard.position.set(0, 11, -21.25);
      scene.add(sbBoard);
      const sbScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(7.8, 4.4),
        new THREE.MeshBasicMaterial({ color: 0x081840, transparent: true, opacity: 0.96 })
      );
      sbScreen.position.set(0, 11, -21.05);
      scene.add(sbScreen);
      [0, 1, 2].forEach(r => {
        scene.add(Object.assign(
          new THREE.Mesh(new THREE.PlaneGeometry(7.2, 0.25),
            new THREE.MeshBasicMaterial({ color: r === 0 ? 0xC8972B : 0x1a40cc, transparent: true, opacity: 0.6 })),
          { position: new THREE.Vector3(0, 12.1 - r * 0.95, -21.03) }
        ));
      });
      const sbLight = new THREE.PointLight(0x3a70ff, 2.0, 22);
      sbLight.position.set(0, 11, -19.5);
      scene.add(sbLight);

      // ---- 3-TIER STADIUM SEATING ----
      const tierDefs = [
        { ri: 18.5, ro: 22.5, yB: 0.4, rows: 5, rs: 0.88, ds: 0.13 },
        { ri: 23.0, ro: 28.0, yB: 4.5, rows: 6, rs: 0.92, ds: 0.12 },
        { ri: 28.5, ro: 33.5, yB: 9.5, rows: 4, rs: 0.96, ds: 0.10 },
      ];
      const cc = [0xC8972B, 0x00205B, 0xffffff, 0xbbbbcc, 0xdd3333, 0xaa8844];
      tierDefs.forEach(t => {
        const segs = 38;
        for (let i = 0; i <= segs; i++) {
          const ang = (i / segs) * Math.PI * 1.06 - Math.PI * 0.03;
          const rm = (t.ri + t.ro) / 2;
          const cx = Math.cos(ang - Math.PI / 2) * rm, cz = Math.sin(ang - Math.PI / 2) * rm - 3;
          const ch = t.rows * t.rs + 2.0;
          const conc = new THREE.Mesh(new THREE.BoxGeometry(1.5, ch, 0.6),
            new THREE.MeshStandardMaterial({ color: 0x1a2440, roughness: 0.92 }));
          conc.position.set(cx, t.yB + ch / 2 - 0.6, cz);
          conc.rotation.y = ang;
          scene.add(conc);
        }
        for (let row = 0; row < t.rows; row++) {
          for (let i = 0; i <= segs; i++) {
            const ang = (i / segs) * Math.PI * 1.06 - Math.PI * 0.03;
            const rm = t.ri + (row / t.rows) * (t.ro - t.ri);
            const cx = Math.cos(ang - Math.PI / 2) * rm, cz = Math.sin(ang - Math.PI / 2) * rm - 3;
            const seat = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.18, 0.22),
              new THREE.MeshStandardMaterial({ color: row % 2 === 0 ? 0x00205B : 0xC8972B, roughness: 0.8, metalness: 0.06 }));
            seat.position.set(cx, t.yB + row * t.rs + 0.2, cz);
            seat.rotation.y = ang;
            scene.add(seat);
          }
        }
        for (let i = 0; i < 220; i++) {
          const ang = (Math.random() * 1.06 - 0.03) * Math.PI;
          const rm = t.ri + Math.random() * (t.ro - t.ri);
          const row = Math.floor(Math.random() * t.rows);
          const ci = Math.floor(Math.random() * cc.length);
          const dot = new THREE.Mesh(
            new THREE.SphereGeometry(t.ds + Math.random() * 0.04, 6, 6),
            new THREE.MeshStandardMaterial({ color: cc[ci], emissive: cc[ci], emissiveIntensity: 0.28 })
          );
          dot.position.set(
            Math.cos(ang - Math.PI / 2) * rm,
            t.yB + row * t.rs + 0.58 + Math.random() * 0.2,
            Math.sin(ang - Math.PI / 2) * rm - 3
          );
          scene.add(dot);
        }
      });

      // ---- LIGHT TOWERS (4) ----
      [[-18, -7], [18, -7], [-14, -18], [14, -18]].forEach(([px, pz]) => {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 24, 8),
          new THREE.MeshStandardMaterial({ color: 0x778899, roughness: 0.65, metalness: 0.55 }));
        pole.position.set(px, 12, pz);
        pole.castShadow = true;
        scene.add(pole);
        const arm = new THREE.Mesh(new THREE.BoxGeometry(6, 0.25, 0.25),
          new THREE.MeshStandardMaterial({ color: 0x667788, roughness: 0.65, metalness: 0.5 }));
        arm.position.set(px, 24.3, pz);
        scene.add(arm);
        for (let f = 0; f < 4; f++) {
          const fix = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 0.65),
            new THREE.MeshStandardMaterial({ color: 0xfff8c8, emissive: 0xfff8c8, emissiveIntensity: 1.6, roughness: 0.25 }));
          fix.position.set(px + (f - 1.5) * 1.45, 24.6, pz);
          scene.add(fix);
        }
        const fl = new THREE.SpotLight(0xfff9e8, 0.65, 70, Math.PI / 9, 0.5);
        fl.position.set(px, 24, pz);
        fl.target.position.set(0, 0, 0);
        scene.add(fl); scene.add(fl.target);
      });

      // ---- NIGHT SKY ----
      const sky = new THREE.Mesh(
        new THREE.CylinderGeometry(48, 48, 46, 60, 1, true, -Math.PI * 0.08, Math.PI * 1.16),
        new THREE.MeshBasicMaterial({ color: 0x020508, side: THREE.BackSide })
      );
      sky.position.set(0, 12, -3);
      scene.add(sky);

      // Stars
      const starBuf = new Float32Array(800 * 3);
      for (let i = 0; i < 800; i++) {
        const ang = (Math.random() * 1.16 - 0.08) * Math.PI;
        const r = 40 + Math.random() * 7, h = 20 + Math.random() * 24;
        starBuf[i * 3]     = Math.cos(ang - Math.PI / 2) * r;
        starBuf[i * 3 + 1] = h;
        starBuf[i * 3 + 2] = Math.sin(ang - Math.PI / 2) * r - 3;
      }
      const sGeo = new THREE.BufferGeometry();
      sGeo.setAttribute('position', new THREE.BufferAttribute(starBuf, 3));
      scene.add(new THREE.Points(sGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.75, sizeAttenuation: true })));

      // ---- MOUSE PARALLAX ----
      let tRX = -0.18, tRY = 0, cRX = -0.18, cRY = 0;
      const heroEl = document.getElementById('hero');
      heroEl.addEventListener('mousemove', e => {
        const r = heroEl.getBoundingClientRect();
        tRY =  ((e.clientX - r.left) / r.width  - 0.5) * 0.25;
        tRX = -((e.clientY - r.top)  / r.height - 0.5) * 0.12 - 0.18;
        if (tooltip) { tooltip.style.left = (e.clientX - r.left + 20) + 'px'; tooltip.style.top = (e.clientY - r.top - 10) + 'px'; }
      });
      heroEl.addEventListener('mouseleave', () => { if (tooltip) tooltip.style.opacity = '0'; });

      // Raycaster for base hover
      const raycaster = new THREE.Raycaster(), mouse2D = new THREE.Vector2();
      heroEl.addEventListener('mousemove', e => {
        const r = heroEl.getBoundingClientRect();
        mouse2D.x =  ((e.clientX - r.left) / r.width)  * 2 - 1;
        mouse2D.y = -((e.clientY - r.top)  / r.height) * 2 + 1;
        raycaster.setFromCamera(mouse2D, camera);
        const hits = raycaster.intersectObjects(baseMeshes);
        if (hits.length && tooltip) {
          const d = hits[0].object.userData;
          tipYear.textContent = d.year;
          tipLabel.innerHTML  = d.label.replace(/\n/g, '<br>');
          tooltip.style.opacity = '1';
        } else if (tooltip) { tooltip.style.opacity = '0'; }
      });

      // ---- RENDER LOOP ----
      const clock = new THREE.Clock();
      function tick() {
        const delta = clock.getDelta(), elapsed = clock.getElapsedTime();

        cRX += (tRX - cRX) * 0.04; cRY += (tRY - cRY) * 0.04;
        camera.position.x = Math.sin(cRY) * 18;
        camera.position.z = 18 + Math.cos(cRY * 0.5) * 1.2;
        camera.position.y = 16 + cRX * 8;
        camera.lookAt(0, 0, 0);

        // Ball animation
        ballT += delta * 0.34;
        if (ballT >= 1) { ballT = 0; ballSeg = (ballSeg + 1) % (ballPath.length - 1); }
        const bp = getBallPos(ballSeg, ballT);
        ball.position.copy(bp);
        ball.rotation.x += delta * 7; ball.rotation.z += delta * 5;

        // Trail update
        tHist.unshift(bp.clone()); tHist.length = TLEN;
        for (let i = 0; i < TLEN; i++) {
          const p = tHist[i] || bp;
          tPos[i * 3] = p.x; tPos[i * 3 + 1] = p.y; tPos[i * 3 + 2] = p.z;
        }
        tGeo.attributes.position.needsUpdate = true;

        // Base glow pulse
        baseGlows.forEach((g, i) => {
          const pulse = 0.55 + 0.45 * Math.sin(elapsed * 2.2 + i * 1.5);
          g.material.opacity = pulse * 0.62;
          g.scale.setScalar(0.85 + pulse * 0.28);
        });

        goldLight.intensity = 1.6 + Math.sin(elapsed * 3.1) * 0.22;
        renderer.render(scene, camera);
        requestAnimationFrame(tick);
      }
      tick();
    })();
    // =============================
    // GLOBAL BG CANVAS (rest of site)
    // =============================
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.4 + 0.08;
        this.color = Math.random() > 0.5 ? '#C8972B' : Math.random() > 0.5 ? '#4a7fd4' : '#00205B';
      }
      update() {
        this.x += this.speedX; this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + Math.floor(this.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
      }
    }
    for (let i = 0; i < 100; i++) particles.push(new Particle());
    function animateBg() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animateBg);
    }
    animateBg();

    // =============================
    // MOTION.DEV — HERO TEXT ENTRANCE
    // =============================
    window.addEventListener('load', () => {
      const { animate, stagger } = Motion;

      // Eyebrow slides in
      animate('#mot-eyebrow', { opacity: [0,1], y: [30, 0] }, { duration: 0.7, delay: 0.2, easing: [0.16, 1, 0.3, 1] });

      // Line 1 — big slam up
      animate('#mot-line1', { opacity: [0,1], y: [80, 0], scaleY: [1.2, 1] }, { duration: 0.8, delay: 0.45, easing: [0.16, 1, 0.3, 1] });

      // Line 2 — gold name, slightly later with spring bounce
      animate('#mot-line2', { opacity: [0,1], y: [80, 0], scaleY: [1.15, 1] }, { duration: 0.9, delay: 0.62, easing: [0.16, 1, 0.3, 1] });

      // Sub text fades up
      animate('#mot-sub', { opacity: [0, 1], y: [25, 0] }, { duration: 0.7, delay: 0.9, easing: [0.16, 1, 0.3, 1] });

      // CTAs slide up staggered
      animate('#mot-ctas', { opacity: [0, 1], y: [20, 0] }, { duration: 0.6, delay: 1.05, easing: [0.16, 1, 0.3, 1] });

      // Scroll hint
      animate('#mot-scroll', { opacity: [0, 1] }, { duration: 0.8, delay: 1.4 });

      // Badges stagger in
      animate('#mot-badges', { opacity: [0, 1], x: [20, 0] }, { duration: 0.6, delay: 1.2, easing: [0.16, 1, 0.3, 1] });
    });

    // =============================
    // MOTION.DEV — SCROLL ANIMATIONS
    // =============================
    window.addEventListener('load', () => {
      const { animate, inView } = Motion;

      inView('.reveal', ({ target }) => {
        animate(target, { opacity: [0, 1], y: [40, 0] }, { duration: 0.75, easing: [0.16, 1, 0.3, 1] });
      }, { amount: 0.12 });

      inView('.skill-card', ({ target }) => {
        const fill = target.querySelector('.skill-bar-fill');
        if (fill) setTimeout(() => { fill.style.width = fill.dataset.width + '%'; }, 200);
        animate(target, { opacity: [0, 1], y: [30, 0] }, { duration: 0.6, easing: [0.16, 1, 0.3, 1] });
      }, { amount: 0.3 });
    });

    // ---- GLITCH CYCLE on line2 ----
    const line2 = document.querySelector('.hero-name .line2');
    const names = ['NAME', 'DESIGNER', 'CREATOR', 'DEVELOPER', 'VISIONARY'];
    let nameIdx = 0;
    const glitchChars = '!@#$%^&*<>?/|{}~';
    function glitchReveal(el, newText) {
      let iter = 0;
      const interval = setInterval(() => {
        el.textContent = newText.split('').map((ch, i) => {
          if (i < iter) return newText[i];
          return glitchChars[Math.floor(Math.random() * glitchChars.length)];
        }).join('');
        iter += 0.5;
        if (iter >= newText.length + 1) { el.textContent = newText; clearInterval(interval); }
      }, 40);
    }
    setInterval(() => {
      nameIdx = (nameIdx + 1) % names.length;
      glitchReveal(line2, names[nameIdx]);
    }, 2800);

    // ---- MAGNETIC HOVER ----
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width/2) * 0.25}px, ${(e.clientY - r.top - r.height/2) * 0.25}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });

    // ---- COUNTER ANIMATION ----
    function animateCounter(el, target, duration) {
      let start = 0;
      const step = target / (duration / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { el.textContent = target + '+'; clearInterval(timer); }
        else { el.textContent = Math.floor(start) + '+'; }
      }, 16);
    }
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const nums = e.target.querySelectorAll('.stat-number');
          nums[0] && animateCounter(nums[0], 4, 1000);
          nums[1] && animateCounter(nums[1], 12, 1000);
          statObserver.disconnect();
        }
      });
    }, { threshold: 0.5 });
    const aboutSection = document.getElementById('about');
    if (aboutSection) statObserver.observe(aboutSection);

