/* final script.js
   Attirra — complete viewer + mannequin + outfits loader
   Place your .glb files in one of the supported locations:
     - models/mannequin-male.glb
     - models/mannequin-female.glb
     - models/male/<state_slug>.glb
     - models/female/<state_slug>.glb
     - models/<state_slug>_male.glb
     - models/<state_slug>_female.glb
     - outfits/<state_slug>_male.glb
     - outfits/<state_slug>_female.glb
   State slug example: "andhra_pradesh", "tamil_nadu", "uttar_pradesh"
*/

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- DOM elements / panels ---------- */
  const panels = {
    welcome: document.getElementById('welcome'),
    gender: document.getElementById('gender'),
    region: document.getElementById('region'),
    outfits: document.getElementById('outfits'),
    viewer: document.getElementById('viewerPanel')
  };

  const gotIt = document.getElementById('gotIt');
  const genderBtns = document.querySelectorAll('.gender-btn');
  const regionGrid = document.getElementById('regionGrid');
  const regionSearch = document.getElementById('regionSearch');
  const outfitGrid = document.getElementById('outfitGrid');
  const backToGender = document.getElementById('backToGender');
  const backToRegion = document.getElementById('backToRegion');
  const tryAnother = document.getElementById('tryAnother');
  const changeRegionBtn = document.getElementById('changeRegionBtn');
  const changeGenderBtn = document.getElementById('changeGenderBtn');
  const hudTitle = document.getElementById('hudTitle');
  const hudDesc = document.getElementById('hudDesc');
  const loadingEl = document.getElementById('loading');

  function showPanel(name) {
    Object.values(panels).forEach(p => p && p.classList && p.classList.remove('active'));
    if (panels[name]) panels[name].classList.add('active');
  }

  function slug(s) {
    return String(s).toLowerCase().replace(/&/g,'and').replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'');
  }

  /* ---------- DATA: outfits metadata + descriptions ---------- */
  // For each region we store male/female name & description. Model paths are computed at runtime.
  const DATA = {
    "Andhra Pradesh": { male: {name:"Dhoti & Kurta", desc:"Dhoti and kurta often paired with angavastram — Telugu traditional attire."}, female: {name:"Silk Saree (Uppada/Mangalagiri)", desc:"Handloom silks with elegant zari; worn at weddings and festivals."} },
    "Arunachal Pradesh": { male: {name:"Tribal Wraps", desc:"Distinct tribal wraps and coats with traditional ornaments."}, female: {name:"Tribal Skirts & Beads", desc:"Layered skirts and beadwork varying by tribe."} },
    "Assam": { male: {name:"Dhoti & Gamosa", desc:"White dhoti–kurta accented with the red-bordered gamosa."}, female: {name:"Mekhela Sador", desc:"Two-piece mekhela–sador made from muga or eri silk."} },
    "Bihar": { male: {name:"Dhoti & Kurta", desc:"Simple dhoti–kurta, common in village and festival wear."}, female: {name:"Traditional Saree", desc:"Drapes with regional prints; worn for rituals and fairs."} },
    "Chhattisgarh": { male: {name:"Dhoti & Angavastra", desc:"Cotton dhoti with a shoulder cloth; often handwoven."}, female: {name:"Kosa Silk Saree", desc:"Kosa silk sarees with rustic elegance and tribal motifs."} },
    "Goa": { male: {name:"Coastal Shirt & Mundu", desc:"Light coastal garments influenced by Portuguese culture."}, female: {name:"Kunbi Saree", desc:"Red-checked Kunbi saree, simple and traditional."} },
    "Gujarat": { male: {name:"Kediyu & Dhoti", desc:"Flared kediyu with dhoti — popular in Navratri."}, female: {name:"Chaniya Choli", desc:"Mirror-work chaniya choli, vibrant festival attire."} },
    "Haryana": { male: {name:"Dhoti & Kurta with Pagri", desc:"Practical dhoti–kurta and regional turban (pagri)."}, female: {name:"Ghagra & Odhni", desc:"Colorful ghagra-choli with odhni for ceremonies."} },
    "Himachal Pradesh": { male: {name:"Chola & Cap", desc:"Warm chola tunic and Himachali cap for the hills."}, female: {name:"Pattu / Reshta", desc:"Woolen pattu drape with a traditional cap."} },
    "Jharkhand": { male: {name:"Dhoti & Shawl", desc:"Dhoti paired with tribal shawls and ornaments."}, female: {name:"Tussar Silk Saree", desc:"Tussar silk sarees with earthy tribal patterns."} },
    "Karnataka": { male: {name:"Panche & Kurta", desc:"Panche (veshti) with kurta; elegant for festivals."}, female: {name:"Ilkal / Mysore Silk", desc:"Ilkal and Mysore silks known for bold borders."} },
    "Kerala": { male: {name:"Mundu & Shirt", desc:"Crisp mundu and shirt — everyday and ceremonial."}, female: {name:"Kasavu Saree", desc:"Cream saree with golden border — Onam classic."} },
    "Madhya Pradesh": { male: {name:"Dhoti & Safa", desc:"Dhoti with colorful safa (turban) at festivals."}, female: {name:"Chanderi Saree", desc:"Light Chanderi silk with zari for special occasions."} },
    "Maharashtra": { male: {name:"Dhoti & Pheta", desc:"Dhoti–kurta with traditional pheta turban."}, female: {name:"Nauvari Saree", desc:"Nine-yard nauvari drape, often worn in temples."} },
    "Manipur": { male: {name:"Pheijom & Jacket", desc:"Pheijom wrap with traditional jacket for ceremonies."}, female: {name:"Phanek & Innaphi", desc:"Phanek skirt with innaphi shawl; Manipuri elegance."} },
    "Meghalaya": { male: {name:"Jymphong", desc:"Jymphong sleeveless jacket with tribal motifs."}, female: {name:"Jainsem", desc:"Layered jainsem dress of Khasi tradition."} },
    "Mizoram": { male: {name:"Wrap & Shawl", desc:"Handwoven wraps and shawls with bright motifs."}, female: {name:"Puanchei", desc:"Puanchei wrap with intricate designs."} },
    "Nagaland": { male: {name:"Shawl & Wrap", desc:"Bold shawls showing clan identity."}, female: {name:"Skirt & Shawl Set", desc:"Colorful wrap skirts and shawls with beadwork."} },
    "Odisha": { male: {name:"Dhoti & Gamucha", desc:"Cotton dhoti with Sambalpuri patterns on gamucha."}, female: {name:"Sambalpuri Saree", desc:"Ikat Sambalpuri sarees with geometric motifs."} },
    "Punjab": { male: {name:"Kurta-Pajama & Turban", desc:"Vibrant turban and kurta–pajama—Punjabi pride."}, female: {name:"Salwar Kameez & Phulkari", desc:"Salwar suits embroidered with phulkari motifs."} },
    "Rajasthan": { male: {name:"Angrakha & Safa", desc:"Angrakha top with dhoti and colorful safa (turban)."}, female: {name:"Ghagra Choli & Odhni", desc:"Vibrant ghagra with mirror work and odhni veil."} },
    "Sikkim": { male: {name:"Bakhu (Kho)", desc:"Bakhu wrap with Himalayan influences."}, female: {name:"Bakhu with Honju", desc:"Bakhu dress paired with honju blouse."} },
    "Tamil Nadu": { male: {name:"Veshti & Angavastram", desc:"Veshti and angavastram for ceremonies and festivals."}, female: {name:"Kanchipuram Saree", desc:"Luxurious Kanjivaram silk with temple borders."} },
    "Telangana": { male: {name:"Dhoti & Kurta", desc:"Dhoti–kurta with local handloom influences."}, female: {name:"Gadwal Saree", desc:"Gadwal handloom saree with contrasting borders."} },
    "Tripura": { male: {name:"Dhoti & Shawl", desc:"Light dhoti with distinctive tribal shawls."}, female: {name:"Rignai & Risa", desc:"Rignai wrap skirt with risa stole for women."} },
    "Uttar Pradesh": { male: {name:"Dhoti / Kurta / Sherwani", desc:"Dhoti–kurta daily attire; sherwani for ceremonies."}, female: {name:"Banarasi Saree / Lehenga", desc:"Banarasi silks and ornate lehengas from Varanasi."} },
    "Uttarakhand": { male: {name:"Kurta & Topi", desc:"Kurta-pajama with regional cap in the hills."}, female: {name:"Ghagra & Pichora", desc:"Ceremonial pichora dupatta with ghagra skirt."} },
    "West Bengal": { male: {name:"Dhoti & Panjabi", desc:"White dhoti and panjabi for puja and functions."}, female: {name:"Lal-Paar Saree", desc:"White saree with red border — classic puja attire."} },
    // Union Territories
    "Andaman and Nicobar Islands": { male: {name:"Island Wear", desc:"Coastal attire influenced by island life."}, female: {name:"Island Saree", desc:"Light drapes suitable for tropical climate."} },
    "Chandigarh": { male: {name:"Punjabi Kurta", desc:"Urban Punjabi-influenced kurta–pyjama."}, female: {name:"Salwar Kameez", desc:"Modern salwar suits with regional embroidery."} },
    "Dadra and Nagar Haveli and Daman and Diu": { male: {name:"Coastal Traditions", desc:"Blend of coastal and tribal garments."}, female: {name:"Local Drapes", desc:"Regional sarees and wrap-skirts."} },
    "Delhi": { male: {name:"Sherwani / Kurta", desc:"Cosmopolitan styles—sherwanis for formal events."}, female: {name:"Salwar / Saree", desc:"Urban sarees and salwar suits for ceremonies."} },
    "Jammu and Kashmir": { male: {name:"Pheran & Cap", desc:"Warm pheran (robe) with elaborate caps in the valley."}, female: {name:"Pheran & Traditional Jewelry", desc:"Flowing pheran and rich Kashmiri embroidery."} },
    "Ladakh": { male: {name:"Goncha & Woolens", desc:"Practical wool garments and Goncha for cold climates."}, female: {name:"Traditional Robes & Ornaments", desc:"Layered robes with distinct tribal ornaments."} },
    "Lakshadweep": { male: {name:"Island Wear", desc:"Light coastal garments suited to island life."}, female: {name:"Local Drapes", desc:"Breathable drapes for tropical climate."} },
    "Puducherry": { male: {name:"Coastal Shirt & Mundu", desc:"Coastal South Indian attire with French influence."}, female: {name:"Madras / Saree", desc:"Light drapes and Madras-influenced textiles."} }
  };

  /* ---------- UI wiring ---------- */
  if (gotIt) gotIt.addEventListener('click', () => showPanel('gender'));

  let selectedGender = '';
  let selectedRegion = '';

  genderBtns.forEach(b => {
    b.addEventListener('click', () => {
      selectedGender = b.dataset.gender || 'female';
      buildRegionGrid();
      // preload mannequin for smoother UX
      preloadMannequin(selectedGender).catch(()=>{/* ignore preload errors */});
      showPanel('region');
    });
  });

  if (backToGender) backToGender.addEventListener('click', () => showPanel('gender'));
  if (backToRegion) backToRegion.addEventListener('click', () => showPanel('region'));
  if (tryAnother) tryAnother.addEventListener('click', () => showPanel('outfits'));
  if (changeRegionBtn) changeRegionBtn.addEventListener('click', () => showPanel('region'));
  if (changeGenderBtn) changeGenderBtn.addEventListener('click', () => showPanel('gender'));

  /* ---------- Build region grid ---------- */
  function buildRegionGrid() {
    if (!regionGrid) return;
    regionGrid.innerHTML = '';
    const keys = Object.keys(DATA).sort((a,b) => a.localeCompare(b));
    keys.forEach(k => {
      const btn = document.createElement('button');
      btn.className = 'region-btn';
      btn.textContent = k;
      btn.addEventListener('click', () => {
        selectedRegion = k;
        renderOutfitsFor(k);
        showPanel('outfits');
      });
      regionGrid.appendChild(btn);
    });
  }

  if (regionSearch) {
    regionSearch.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      Array.from(regionGrid.children).forEach(btn => {
        btn.style.display = btn.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }

  /* ---------- Outfits rendering ---------- */
  function renderOutfitsFor(region) {
    if (!outfitGrid) return;
    outfitGrid.innerHTML = '';
    const entry = DATA[region];
    if (!entry) {
      outfitGrid.textContent = 'No outfits defined for this region.';
      return;
    }

    // Show user's gender first
    const order = selectedGender ? [selectedGender, selectedGender === 'male' ? 'female' : 'male'] : ['male','female'];

    order.forEach(g => {
      const info = entry[g];
      if (!info) return;
      const card = document.createElement('div');
      card.className = 'outfit-card';
      card.style.padding = '12px';
      card.style.borderRadius = '10px';
      card.style.background = 'rgba(255,255,255,0.95)';
      card.style.marginBottom = '10px';
      card.style.boxShadow = '0 6px 18px rgba(0,0,0,0.04)';

      const title = document.createElement('div');
      title.className = 'outfit-title';
      title.textContent = `${g.toUpperCase()} • ${info.name}`;
      title.style.fontWeight = '700';
      title.style.marginBottom = '8px';

      const desc = document.createElement('div');
      desc.className = 'outfit-desc';
      desc.textContent = info.desc;
      desc.style.color = 'var(--muted)';
      desc.style.marginBottom = '12px';

      const btn = document.createElement('button');
      btn.className = 'outfit-btn';
      btn.textContent = 'Try Outfit';
      btn.addEventListener('click', () => {
        // compute candidate model paths and try sequentially
        const s = slug(region);
        const sLower = s.toLowerCase();
        console.log("DEBUG: s =", s, "selectedGender =", selectedGender);


const candidates = [
    `models/${selectedGender}/${sLower}.glb`,
    `models/${sLower}_${selectedGender}.glb`,
    `models/outfits/${sLower}_${selectedGender}.glb`,
    `models/${sLower}.glb`
];

        hudTitle.textContent = `${region} — ${info.name}`;
        hudDesc.textContent = info.desc;
        tryLoadPathsSequential(candidates)
          .then(modelPath => loadAndShowModel(modelPath, hudTitle.textContent, hudDesc.textContent))
          .catch(err => {
            console.error('All model load attempts failed:', err);
            alert(`Couldn't find a model for ${region} (${selectedGender}).\n\nTried:\n${candidates.join('\n')}\n\nPlace the appropriate .glb in one of these paths.`);
          });
      });

      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(btn);
      outfitGrid.appendChild(card);
    });

    // tip
    const tip = document.createElement('div');
    tip.style.padding = '8px';
    tip.style.color = 'var(--muted)';
    tip.style.fontSize = '13px';
    tip.textContent = 'Tip: Place GLB files as models/<gender>/<state_slug>.glb or outfits/<state_slug>_<gender>.glb';
    outfitGrid.appendChild(tip);
  }

  /* ---------- Three.js setup ---------- */
  const canvas = document.getElementById('c3d');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 2, 0.1, 100);
  camera.position.set(0, 1.6, 3.2);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.4, 0);
  controls.enableDamping = true;
  controls.minDistance = 1.2;
  controls.maxDistance = 6;
  controls.maxPolarAngle = Math.PI * 0.49;

  const hemi = new THREE.HemisphereLight(0xffffff, 0x777777, 0.95);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 0.9);
  dir.position.set(2,3,1.5);
  dir.castShadow = true;
  scene.add(dir);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(1.2, 64),
    new THREE.MeshStandardMaterial({ color: 0xece4d6, roughness: 0.96 })
  );
  ground.rotation.x = -Math.PI/2;
  ground.receiveShadow = true;
  scene.add(ground);

  const loader = new THREE.GLTFLoader();
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  let mannequinModel = null;
  let currentModel = null;

  function resizeCanvas() {
    if (!canvas) return;
    const w = canvas.clientWidth || canvas.parentElement.clientWidth || 800;
    const h = canvas.clientHeight || canvas.parentElement.clientHeight || 600;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(h, 0.001);
    camera.updateProjectionMatrix();
  }

  function animate(t) {
    requestAnimationFrame(animate);
    controls.update();
    TWEEN.update(t);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);

  /* ---------- Loading helpers ---------- */
  function loadGLB(path) {
    if (loadingEl && loadingEl.classList) loadingEl.classList.remove('hidden');
    return new Promise((resolve, reject) => {
      loader.load(path, gltf => {
        if (loadingEl && loadingEl.classList) loadingEl.classList.add('hidden');
        resolve({ scene: gltf.scene, path });
      }, undefined, err => {
        if (loadingEl && loadingEl.classList) loadingEl.classList.add('hidden');
        reject(err);
      });
    });
  }

  // try list of paths sequentially; resolves with the successful path string
  async function tryLoadPathsSequential(paths) {
    let lastErr = null;
    for (const p of paths) {
      try {
        await loadGLB(p); // just test exist & load (we will actually load final time in loadAndShowModel)
        return p;
      } catch (err) {
        lastErr = err;
        // continue to next
      }
    }
    throw lastErr || new Error('No candidate paths');
  }

  function prepareModel(root, cast = true) {
    root.traverse(o => {
      if (o.isMesh) {
        o.castShadow = cast;
        o.receiveShadow = true;
        if (o.material) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach(m => { if (m.map) m.map.colorSpace = THREE.SRGBColorSpace; });
        }
      }
    });
  }

  function fadeIn(root, dur = 450) {
    const start = performance.now();
    root.traverse(o => {
      if (o.isMesh) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach(m => { m.transparent = true; m.opacity = 0; });
      }
    });
    (function step(){
      const t = Math.min(1, (performance.now() - start) / dur);
      root.traverse(o => {
        if (o.isMesh) {
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach(m => m.opacity = t);
        }
      });
      if (t < 1) requestAnimationFrame(step);
    })();
  }

  /* ---------- Mannequin preload & load ---------- */
  async function preloadMannequin(gender) {
    const path = `models/mannequin-${gender}.glb`;
    try {
      const res = await loadGLB(path);
      // don't add to scene here to avoid duplicates — we'll add in loadMannequin
      return res.path;
    } catch(e) {
      // silently ignore — mannequin optional
      return null;
    }
  }

  async function loadMannequin(gender) {
    // remove previous mannequin
    if (mannequinModel) {
      scene.remove(mannequinModel);
      mannequinModel = null;
    }
    const path = `models/mannequin-${gender}.glb`;
    try {
      const { scene: model } = await loadGLB(path);
      prepareModel(model, true);
      model.position.set(0, 0, 0);
      scene.add(model);
      mannequinModel = model;
      // entry animation
      model.rotation.y = Math.PI;
      new TWEEN.Tween(model.rotation).to({ y: 0 }, 800).easing(TWEEN.Easing.Cubic.Out).start();
      fadeIn(model, 600);
    } catch (err) {
      console.warn('Mannequin not found at', path);
      // no mannequin — fine, outfits will still load
    }
  }

  /* ---------- Load + display outfit model ---------- */
  async function loadAndShowModel(path, title = '', desc = '') {
    try {
      // remove previous outfit
      if (currentModel) {
        scene.remove(currentModel);
        currentModel = null;
      }

      // load model
      const { scene: model } = await loadGLB(path).catch(err => { throw err; });

      prepareModel(model, true);

      // If we have a mannequin loaded and the outfit model seems to be just clothing (not full mannequin),
      // try to re-position outfit to mannequin position. This is heuristic — ideally your outfits are pre-positioned.
      if (mannequinModel) {
        model.position.copy(mannequinModel.position || new THREE.Vector3(0,0,0));
      } else {
        model.position.set(0, 0, 0);
      }

      scene.add(model);
      currentModel = model;
      fadeIn(model, 600);

      // camera focus
      const from = { z: camera.position.z, y: camera.position.y };
      new TWEEN.Tween(from).to({ z: 2.4, y: 1.55 }, 700).easing(TWEEN.Easing.Cubic.Out)
        .onUpdate(()=> { camera.position.z = from.z; camera.position.y = from.y; camera.updateProjectionMatrix(); })
        .start();

      if (hudTitle) hudTitle.textContent = title || 'Outfit';
      if (hudDesc) hudDesc.textContent = desc || '';
      showPanel('viewer');
    } catch (err) {
      console.error('Loading model failed for', path, err);
      throw err;
    }
  }

  /* ---------- Utility: try load and then show ---------- */
  // candidatePaths: array of strings
  async function tryLoadAndShow(candidates, title, desc) {
    let lastErr = null;
    for (const p of candidates) {
      try {
        // test load & show
        await loadAndShowModel(p, title, desc);
        return;
      } catch (err) {
        lastErr = err;
        // try next candidate
      }
    }
    // if we reach here, all failed
    throw lastErr || new Error('No candidate succeeded');
  }

  // Start at welcome
  showPanel('welcome');

  // Expose buildRegionGrid so it can be called after gender selection
  function init() {
    buildRegionGrid();
  }
  init();

  // Whenever user reaches region panel after choosing gender, load mannequin
  // (This ensures a mannequin is present before trying outfits)
  // We already call preloadMannequin on gender click; let's fully load when user enters region
  document.getElementById('gender') && document.getElementById('gender').addEventListener('transitionend', ()=>{ /* noop */ });

  // OPTIONAL: auto-load mannequin when user selected gender and region panel shown
  // We'll call loadMannequin when building region grid (after gender selection)
  // For completeness, call loadMannequin when appropriate:
  // (the gender btn handler already called preloadMannequin; call loadMannequin explicitly to add to scene)
  // We'll patch genderBtns to call loadMannequin:
  genderBtns.forEach(b => {
    b.addEventListener('click', () => {
      const g = b.dataset.gender || 'female';
      // load mannequin (non-blocking)
      loadMannequin(g).catch(()=>{/* ignore errors */});
    }, { once: true });
  });

  // END DOMContentLoaded
}); // end




document.addEventListener('DOMContentLoaded', function () {
    // DOM elements
    const canvas = document.getElementById('modelCanvas');
    const hudTitle = document.getElementById('hudTitle');
    const hudDesc = document.getElementById('hudDesc');

    // Three.js core
    let scene, camera, renderer, controls, mannequin, currentOutfit;
    const loader = new THREE.GLTFLoader();

    function init3D() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xeeeeee);

        // Camera
        camera = new THREE.PerspectiveCamera(
            45,
            canvas.clientWidth / canvas.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 1.6, 3);

        // Renderer
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);

        // Controls
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 1.6, 0);
        controls.update();

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(5, 10, 7);
        dirLight.castShadow = true;
        scene.add(dirLight);

        // Ground
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(10, 10),
            new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: true })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Resize handler
        window.addEventListener('resize', onWindowResize);

        animate();
    }

    function onWindowResize() {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }

    // Load mannequin (.glb)
    function loadMannequin() {
        loader.load(
            '/models/mannequin.glb',
            function (gltf) {
                mannequin = gltf.scene;
                mannequin.position.set(0, 0, 0);
                mannequin.traverse(obj => {
                    if (obj.isMesh) {
                        obj.castShadow = true;
                    }
                });
                scene.add(mannequin);
            },
            undefined,
            function (error) {
                console.error('Error loading mannequin:', error);
            }
        );
    }

    // Load outfit (.glb) — remove old before adding new
    function loadOutfit(url, title, desc) {
        if (currentOutfit) {
            scene.remove(currentOutfit);
            currentOutfit.traverse(obj => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(mat => mat.dispose());
                    } else {
                        obj.material.dispose();
                    }
                }
            });
            currentOutfit = null;
        }

        loader.load(
            url,
            function (gltf) {
                currentOutfit = gltf.scene;
                currentOutfit.position.set(0, 0, 0);
                scene.add(currentOutfit);

                hudTitle.textContent = title;
                hudDesc.textContent = desc;
            },
            undefined,
            function (error) {
                console.error('Error loading outfit:', error);
            }
        );
    }

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    // Outfit click event
    document.querySelectorAll('.outfit').forEach(el => {
        el.addEventListener('click', () => {
            const modelUrl = el.getAttribute('data-model'); // .glb path
            const title = el.getAttribute('data-title') || 'Outfit';
            const desc = el.getAttribute('data-desc') || '';
            loadOutfit(modelUrl, title, desc);
        });
    });

    // Initialize scene and mannequin
    init3D();
    loadMannequin();
});
// End of script.js

