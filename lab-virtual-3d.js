import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

(() => {
  const $ = (id) => document.getElementById(id);
  const viewport = $("sim3DViewport");
  if (!viewport || viewport.dataset.labVirtualReady === "1") return;
  viewport.dataset.labVirtualReady = "1";

  const status = $("sim3DStatus");
  const loading = $("sim3DLoading");
  const info = $("lab3DInfo");
  const controls = $("lab3DControls");
  const toolButtons = [...document.querySelectorAll("[data-lab-tool]")];
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  } catch (error) {
    if (loading) loading.textContent = "WebGL tidak tersedia. Gunakan browser yang mendukung WebGL untuk membuka Laboratorium Virtual 3D.";
    if (status) status.textContent = "WEBGL TIDAK TERSEDIA";
    console.error(error);
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  viewport.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07152d);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  const hemi = new THREE.HemisphereLight(0xd8edff, 0x17243b, 2.2); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 2.8); key.position.set(5, 9, 7); scene.add(key);
  const fill = new THREE.PointLight(0x59e6b5, 1.2, 30); fill.position.set(-5, 4, 2); scene.add(fill);

  const mat = (color, metalness=0, roughness=.5, emissive=0x000000) => new THREE.MeshStandardMaterial({color, metalness, roughness, emissive});
  const M = {
    navy:mat(0x142b48), dark:mat(0x101827), black:mat(0x202a38), grey:mat(0x9eacba,.65,.28), silver:mat(0xcbd5df,.8,.22),
    screen:mat(0x071b2d,.1,.2,0x08253b), green:mat(0x59e6b5,.1,.35,0x123d30), yellow:mat(0xf4c95d), red:mat(0xf05a63), blue:mat(0x2d83bb), white:mat(0xe8eef5)
  };
  const clickable = [];
  const addBox = (parent,w,h,d,material,x,y,z,name) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material);
    mesh.position.set(x,y,z); if(name) mesh.userData.toolName=name; parent.add(mesh); if(name) clickable.push(mesh); return mesh;
  };
  const addCylinder = (parent,r,h,material,x,y,z,rotationZ=0,name) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,24),material);
    mesh.position.set(x,y,z); mesh.rotation.z=rotationZ; if(name) mesh.userData.toolName=name; parent.add(mesh); if(name) clickable.push(mesh); return mesh;
  };
  const addTextScreen = (parent, text, x,y,z,w=1.15,h=.48) => {
    const canvas=document.createElement('canvas'); canvas.width=512; canvas.height=220;
    const ctx=canvas.getContext('2d'); ctx.fillStyle='#071b2d'; ctx.fillRect(0,0,512,220);
    ctx.fillStyle='#8fffd7'; ctx.font='bold 74px monospace'; ctx.textAlign='center'; ctx.fillText(text,256,137);
    const texture=new THREE.CanvasTexture(canvas); texture.colorSpace=THREE.SRGBColorSpace;
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture}));
    mesh.position.set(x,y,z); parent.add(mesh);
    return { mesh, setText(value) { ctx.clearRect(0,0,512,220); ctx.fillStyle='#071b2d'; ctx.fillRect(0,0,512,220); ctx.fillStyle='#8fffd7'; ctx.font='bold 74px monospace'; ctx.textAlign='center'; ctx.fillText(String(value),256,137); texture.needsUpdate=true; } };
  };
  const floor = new THREE.GridHelper(30,30,0x17628a,0x17304c); floor.position.y=-.03; scene.add(floor);
  addBox(scene,13,.45,8,M.navy,0,-.38,0);

  // Osiloskop: badan, layar, knob, dan tombol.
  const scope=new THREE.Group(); scope.position.set(-4.1,.0,-1.0); scene.add(scope);
  addBox(scope,2.8,1.65,1.45,M.dark,0,.85,0,'osiloskop');
  addBox(scope,1.65,.92,.055,M.screen,-.48,1.02,.755,'osiloskop');
  const gridMat=mat(0x23604e); for(let i=0;i<6;i++) addBox(scope,.012,.82,.012,gridMat,-1.25+i*.3,1.02,.79);
  for(let i=0;i<4;i++) addBox(scope,1.55,.012,.012,gridMat,-.48,.68+i*.22,.79);
  const scopeDisplay = addTextScreen(scope,'CH1  1.00V',-.48,1.02,.805,1.5,.48);
  addCylinder(scope,.18,.13,M.yellow,.86,1.1,.77,Math.PI/2,'osiloskop');
  addCylinder(scope,.13,.13,M.blue,.86,.65,.77,Math.PI/2,'osiloskop');
  for(let i=0;i<3;i++) addBox(scope,.16,.12,.08,M.grey,.42+i*.28,.35,.77,'osiloskop');

  // Multimeter digital.
  const meter=new THREE.Group(); meter.position.set(-1.35,.0,-1.0); scene.add(meter);
  addBox(meter,1.65,2.05,.72,M.yellow,0,1.0,0,'multimeter');
  addBox(meter,1.18,.58,.05,M.screen,0,1.52,.39,'multimeter');
  const meterDisplay = addTextScreen(meter,'12.0 V',0,1.52,.425,1.02,.36);
  addCylinder(meter,.34,.12,M.black,0,.91,.42,Math.PI/2,'multimeter');
  addCylinder(meter,.15,.12,M.red,-.42,.35,.42,Math.PI/2,'multimeter');
  addCylinder(meter,.15,.12,M.black,.42,.35,.42,Math.PI/2,'multimeter');
  // Probe cables.
  const cable=(points,color)=>{const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,32,.025,8,false),mat(color));scene.add(mesh);};
  cable([[-1.77,.35,-.6],[-2.0,.15,.1],[-2.4,.1,.7]],0xf05a63); cable([[-.93,.35,-.6],[-.75,.12,.2],[-.3,.1,.8]],0x202a38);

  // Catu daya DC.
  const supply=new THREE.Group(); supply.position.set(1.55,.0,-1.0); scene.add(supply);
  addBox(supply,2.55,1.65,1.35,M.blue,0,.85,0,'power');
  addBox(supply,1.1,.58,.05,M.screen,-.35,1.1,.705,'power');
  const supplyDisplay = addTextScreen(supply,'5.0 V',-.35,1.1,.74,.98,.38);
  addCylinder(supply,.19,.13,M.grey,.72,1.12,.73,Math.PI/2,'power');
  addCylinder(supply,.13,.13,M.red,-.45,.42,.72,Math.PI/2,'power');
  addCylinder(supply,.13,.13,M.black,.1,.42,.72,Math.PI/2,'power');
  addBox(supply,.32,.14,.08,M.green,.82,.42,.72,'power');

  // Solder station and iron.
  const solder=new THREE.Group(); solder.position.set(4.45,.0,-1.0); scene.add(solder);
  addBox(solder,1.8,.9,1.05,M.dark,0,.48,0,'solder');
  addBox(solder,.95,.4,.05,M.screen,-.22,.62,.555,'solder');
  const solderDisplay = addTextScreen(solder,'350 C',-.22,.62,.59,.82,.28);
  addCylinder(solder,.12,.12,M.green,.55,.65,.58,Math.PI/2,'solder');
  // Stand and iron.
  addBox(solder,.55,.12,.5,M.grey,.9,.16,.25,'solder');
  const iron=addCylinder(solder,.09,1.45,M.grey,.9,.65,.2,Math.PI/2,'solder'); iron.rotation.z=-.45;
  const tip=addCylinder(solder,.035,.35,M.silver,1.37,.98,.2,Math.PI/2,'solder'); tip.rotation.z=-.45;

  const tools = {
    osiloskop:{title:'Osiloskop',sub:'Mengamati bentuk gelombang listrik',desc:'Osiloskop menampilkan perubahan tegangan terhadap waktu. Alat ini membantu siswa mengamati amplitudo, periode, frekuensi, dan bentuk sinyal.',parts:'Layar: menampilkan gelombang. Knob VOLTS/DIV: mengatur skala tegangan. Knob TIME/DIV: mengatur skala waktu. Probe: menghubungkan titik ukur ke kanal osiloskop.',steps:['Pastikan probe dan kabel dalam kondisi baik.','Hubungkan ground probe ke ground rangkaian.','Sentuhkan ujung probe ke titik sinyal yang akan diamati.','Atur VOLTS/DIV dan TIME/DIV hingga gelombang terlihat jelas.'],safety:'Jangan menghubungkan ground probe ke titik bertegangan tinggi atau sumber listrik yang tidak sesuai spesifikasi alat.'},
    multimeter:{title:'Multimeter Digital',sub:'Mengukur tegangan, arus, dan hambatan',desc:'Multimeter digunakan untuk memeriksa besaran listrik dasar. Pemilihan mode dan terminal yang benar penting agar hasil ukur akurat dan alat tidak rusak.',parts:'Layar: menampilkan hasil ukur. Selektor: memilih V, A, atau Ω. Terminal COM: probe hitam. Terminal VΩmA: probe merah untuk tegangan, hambatan, dan arus kecil.',steps:['Masukkan probe hitam ke COM dan merah ke VΩmA.','Pilih mode pengukuran yang sesuai.','Ukur tegangan secara paralel pada rangkaian.','Untuk hambatan, matikan sumber daya sebelum mengukur.'],safety:'Jangan mengukur hambatan pada rangkaian yang masih bertegangan. Untuk arus, gunakan terminal dan sambungan seri yang tepat.'},
    power:{title:'Power Supply DC',sub:'Menyediakan tegangan DC terkontrol',desc:'Power supply DC menyediakan sumber tegangan untuk rangkaian praktik. Tegangan dan batas arus dapat diatur sesuai kebutuhan percobaan.',parts:'Display: menunjukkan tegangan dan arus keluaran. Knob VOLTAGE: mengatur tegangan. Terminal merah: positif (+). Terminal hitam: negatif (−). Tombol OUTPUT: mengaktifkan keluaran.',steps:['Pastikan output dalam keadaan OFF.','Hubungkan kabel positif dan negatif sesuai polaritas.','Atur tegangan sesuai kebutuhan rangkaian.','Aktifkan OUTPUT dan amati indikator tegangan serta arus.'],safety:'Mulai dari tegangan rendah dan atur current limit. Hindari hubungan singkat antara terminal positif dan negatif.'},
    solder:{title:'Solder Station',sub:'Menyambung komponen pada PCB',desc:'Solder station digunakan untuk melelehkan timah solder sehingga kaki komponen dapat tersambung ke jalur PCB.',parts:'Unit kontrol: mengatur suhu. Display: menunjukkan suhu. Handpiece: gagang solder. Tip: ujung pemanas yang menyentuh area sambungan. Stand: tempat meletakkan solder panas.',steps:['Atur suhu sesuai jenis timah dan komponen.','Bersihkan ujung solder dan beri sedikit timah.','Panaskan kaki komponen dan pad PCB secara bersamaan.','Sentuhkan timah ke sambungan, lalu angkat solder dan biarkan dingin.'],safety:'Gunakan ventilasi yang baik, jangan menyentuh ujung solder, dan selalu letakkan handpiece pada stand.'}
  };
  let selected='multimeter';
  let angle=.35, elevation=.55, distance=14, dragging=false, lastX=0,lastY=0;
  const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2();
  function updateCamera(){camera.position.set(Math.sin(angle)*distance,Math.sin(elevation)*distance,Math.cos(angle)*distance);camera.lookAt(0,.55,-.3);}
  function selectTool(id){if(!tools[id])return;selected=id;if(typeof window.vecMarkProgress==="function")window.vecMarkProgress("lab",id);toolButtons.forEach(b=>b.classList.toggle('active',b.dataset.labTool===id));
    const t=tools[id]; if(info) info.innerHTML=`<div class="lab-info-heading"><span class="lab-info-kicker">PERALATAN TERPILIH</span><h3>${t.title}</h3><p>${t.sub}</p></div><p>${t.desc}</p><div class="lab-info-block"><b>Bagian dan fungsi</b><p>${t.parts}</p></div><div class="lab-info-block"><b>Langkah penggunaan</b><ol>${t.steps.map(s=>`<li>${s}</li>`).join('')}</ol></div><div class="lab-safety"><b>⚠ Keselamatan kerja</b><p>${t.safety}</p></div>`;
    renderControls(); if(status)status.textContent=`OBJEK AKTIF: ${t.title.toUpperCase()}`;
    const target={osiloskop:-4.1,multimeter:-1.35,power:1.55,solder:4.45}[id]; camera.position.set(target+Math.sin(angle)*distance*.72,Math.sin(elevation)*distance*.72,-1+Math.cos(angle)*distance*.72); camera.lookAt(target,.75,-1);
  }
  function renderControls(){if(!controls)return;
    if(selected==='multimeter') controls.innerHTML=`<h4>Praktik Virtual: Pengukuran Multimeter</h4><p>Simulasikan pengukuran tegangan DC pada sumber 12 V.</p><label>Tegangan sumber <strong id="meterVoltageLabel">12 V</strong></label><input id="meterVoltage" type="range" min="0" max="24" value="12" step="0.5"><button type="button" id="meterMeasure">Ukur Tegangan</button><div class="lab-result" id="meterResult">Atur tegangan, lalu tekan Ukur Tegangan.</div>`;
    if(selected==='power') controls.innerHTML=`<h4>Praktik Virtual: Pengaturan Power Supply</h4><p>Atur tegangan keluaran sebelum menghubungkannya ke rangkaian.</p><label>Tegangan keluaran <strong id="supplyVoltageLabel">5 V</strong></label><input id="supplyVoltage" type="range" min="0" max="24" value="5" step="0.5"><button type="button" id="supplyOutput">Aktifkan Output</button><div class="lab-result" id="supplyResult">Output masih OFF. Pastikan polaritas sebelum mengaktifkan.</div>`;
    if(selected==='osiloskop') controls.innerHTML=`<h4>Praktik Virtual: Membaca Sinyal</h4><p>Atur frekuensi sinyal untuk melihat perubahan gelombang.</p><label>Frekuensi <strong id="scopeFreqLabel">1 kHz</strong></label><input id="scopeFreq" type="range" min="1" max="10" value="1"><canvas id="scopeWave" width="640" height="150" aria-label="Visualisasi gelombang osiloskop"></canvas><div class="lab-result" id="scopeResult">Frekuensi 1 kHz · Periode 1 ms.</div>`;
    if(selected==='solder') controls.innerHTML=`<h4>Praktik Virtual: Pengaturan Suhu Solder</h4><p>Pilih suhu kerja dan perhatikan rekomendasi keselamatan.</p><label>Suhu <strong id="solderTempLabel">350 °C</strong></label><input id="solderTemp" type="range" min="200" max="450" value="350" step="10"><div class="lab-result" id="solderResult">350 °C: suhu simulasi untuk latihan penyolderan umum. Sesuaikan dengan komponen dan jenis timah.</div>`;
    const meter=$('meterVoltage'); if(meter)meter.addEventListener('input',()=>{$('meterVoltageLabel').textContent=`${Number(meter.value).toFixed(1)} V`;$('meterResult').textContent=`Sumber disetel ${Number(meter.value).toFixed(1)} V DC. Tekan Ukur Tegangan untuk membaca hasil.`;meterDisplay.setText(`${Number(meter.value).toFixed(1)} V`);});
    $('meterMeasure')?.addEventListener('click',()=>{$('meterResult').textContent=`Hasil simulasi: ${Number(meter.value).toFixed(1)} V DC. Hubungkan multimeter secara paralel untuk mengukur tegangan.`;});
    const supplySlider=$('supplyVoltage'); if(supplySlider)supplySlider.addEventListener('input',()=>{const v=Number(supplySlider.value);$('supplyVoltageLabel').textContent=`${v.toFixed(1)} V`;supplyDisplay.setText(`${v.toFixed(1)} V`);$('supplyResult').textContent=`Setelan tegangan ${v.toFixed(1)} V DC. Output masih OFF.`;});
    $('supplyOutput')?.addEventListener('click',(e)=>{const on=e.currentTarget.dataset.on!=='1';e.currentTarget.dataset.on=on?'1':'0';e.currentTarget.textContent=on?'Matikan Output':'Aktifkan Output';$('supplyResult').textContent=on?`Output ON: ${Number(supplySlider.value).toFixed(1)} V DC. Periksa polaritas dan batas arus.`:'Output OFF. Atur tegangan sebelum mengaktifkan kembali.';supplyDisplay.setText(on?`${Number(supplySlider.value).toFixed(1)} V`:'OFF');supplyDisplay.setText(on?`${Number(supplySlider.value).toFixed(1)} V`:'OFF');supplyDisplay.setText(on?`${Number(supplySlider.value).toFixed(1)} V`:'OFF');supplyDisplay.setText(on?`${Number(supplySlider.value).toFixed(1)} V`:'OFF');});
    const freq=$('scopeFreq'); if(freq){const draw=()=>{const f=Number(freq.value);$('scopeFreqLabel').textContent=`${f} kHz`;scopeDisplay.setText(`CH1 ${f.toFixed(2)}kHz`);scopeDisplay.setText(`CH1 ${f.toFixed(2)}kHz`);scopeDisplay.setText(`CH1 ${f.toFixed(2)}kHz`);scopeDisplay.setText(`CH1 ${f.toFixed(2)}kHz`);$('scopeResult').textContent=`Frekuensi ${f} kHz · Periode ${(1/f).toFixed(2)} ms.`;const c=$('scopeWave'),ctx=c.getContext('2d');ctx.fillStyle='#071b2d';ctx.fillRect(0,0,c.width,c.height);ctx.strokeStyle='#24465b';ctx.lineWidth=1;for(let x=0;x<c.width;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,c.height);ctx.stroke();}for(let y=0;y<c.height;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(c.width,y);ctx.stroke();}ctx.strokeStyle='#59e6b5';ctx.lineWidth=3;ctx.beginPath();for(let x=0;x<c.width;x++){const y=75-Math.sin(x/640*f*2*Math.PI*3)*43;if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();};freq.addEventListener('input',draw);draw();}
    const temp=$('solderTemp'); if(temp)temp.addEventListener('input',()=>{$('solderTempLabel').textContent=`${temp.value} °C`;solderDisplay.setText(`${temp.value} C`);solderDisplay.setText(`${temp.value} C`);solderDisplay.setText(`${temp.value} C`);solderDisplay.setText(`${temp.value} C`); $('solderResult').textContent=`${temp.value} °C: suhu simulasi. Gunakan ventilasi, stand solder, dan hindari menyentuh ujung pemanas.`;});
  }
  toolButtons.forEach(b=>b.addEventListener('click',()=>selectTool(b.dataset.labTool)));
  viewport.addEventListener('pointerdown',e=>{if(e.button!==undefined&&e.button!==0)return;dragging=true;lastX=e.clientX;lastY=e.clientY;viewport.setPointerCapture?.(e.pointerId);});
  viewport.addEventListener('pointermove',e=>{if(!dragging)return;angle-=(e.clientX-lastX)*.008;elevation=THREE.MathUtils.clamp(elevation+(e.clientY-lastY)*.006,.15,1.25);lastX=e.clientX;lastY=e.clientY;updateCamera();});
  viewport.addEventListener('pointerup',e=>{if(!dragging)return;dragging=false;pointer.x=((e.clientX-viewport.getBoundingClientRect().left)/renderer.domElement.clientWidth)*2-1;pointer.y=-((e.clientY-viewport.getBoundingClientRect().top)/renderer.domElement.clientHeight)*2+1;raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(clickable,true)[0];if(hit){const id=hit.object.userData.toolName;if(id)selectTool(id);}});
  viewport.addEventListener('pointercancel',()=>dragging=false);
  viewport.addEventListener('wheel',e=>{e.preventDefault();distance=THREE.MathUtils.clamp(distance+e.deltaY*.01,8,22);updateCamera();},{passive:false});
  $('sim3DReset')?.addEventListener('click',()=>{angle=.35;elevation=.55;distance=14;updateCamera();});
  function resize(){const w=viewport.clientWidth,h=viewport.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);}
  const ro=new ResizeObserver(resize);ro.observe(viewport);window.addEventListener('resize',resize);
  function animate(){requestAnimationFrame(animate);if(!document.hidden&&viewport.clientWidth>0)renderer.render(scene,camera);}
  const start=()=>{if(viewport.clientWidth===0){requestAnimationFrame(start);return;}resize();updateCamera();if(loading)loading.remove();selectTool('multimeter');animate();};
  requestAnimationFrame(start);
  console.log('LABORATORIUM VIRTUAL 3D SIAP');
})();
