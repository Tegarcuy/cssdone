const stepContent = document.getElementById("stepContent");
const stepIndicator = document.getElementById("stepIndicator");

// STATE 
let currentStep = 1;
let selectedProfil = null;
let selectedDrum = null;
let inputTHG = {};
let warna = null;
let statusSuhu = null;
let statusKelembapan = null;
let statusGas = null;
let statusPh = null;
let currentDateKey = todayKey();
let editIndex = null;
let hapusIndex = null;
let editDrumIndex = null;
let hapusDrumIndex = null;
let hapusLaporanIndex = null;
let currentPinTarget = null;
let currentDrumTarget = null;

// DATA PROFIL & DRUM 
let profiles = JSON.parse(localStorage.getItem("profiles")) || ["Risky","Hafidz","Andra","Kiki","Dinda","Febri","Lanang","Taufik","Ryzuhu","Hasti"];

let drums = JSON.parse(localStorage.getItem("drums")) || ["A","B","C","D"];
function saveProfiles(){ localStorage.setItem("profiles", JSON.stringify(profiles)); }
function saveDrums(){ localStorage.setItem("drums", JSON.stringify(drums)); }

// LOCAL STORAGE LAPORAN 
function todayKey(){ return new Date().toISOString().split("T")[0]; }
function getLaporanHari(key = todayKey()){ return JSON.parse(localStorage.getItem("laporan_" + key)) || []; }
function saveLaporanHari(data, key = todayKey()){ localStorage.setItem("laporan_" + key, JSON.stringify(data)); }
let laporanData = getLaporanHari(currentDateKey);

// === HELPERS MODAL ===
function openModal(id){ document.getElementById(id).classList.remove("hidden"); }
function closeModal(id){ document.getElementById(id).classList.add("hidden"); }

// Helper: map status text to CSS class for colored text
function getStatusClass(status){
  if(!status) return '';
  if(status === 'Belum Siap') return 'text-red-600 font-bold';
  if(status === 'Hampir Siap') return 'text-yellow-600 font-bold';
  if(status === 'Sudah Siap') return 'text-green-600 font-bold';
  return '';
}

// === SMOOTH STEP TRANSITION ANIMATION ===
function animateStepTransition(callback, delay = 500) {
  const stepContent = document.getElementById("stepContent");
  const stepIndicator = document.getElementById("stepIndicator");
  
  // Smooth fade out current content
  stepContent.classList.add("step-fade-out");
  stepIndicator.style.opacity = "0.6";
  stepIndicator.style.transform = "translateY(-8px)";
  
  setTimeout(() => {
    // Execute callback (render next step)
    if (callback) callback();
    
    // Smooth fade in new content
    stepContent.classList.remove("step-fade-out");
    stepContent.classList.add("step-fade-in");
    
    // Animate step indicator back
    stepIndicator.style.opacity = "1";
    stepIndicator.style.transform = "translateY(0)";
    
    // Clean up entrance animations and remove fade-in class after animation
    setTimeout(() => {
      stepContent.classList.remove("step-fade-in");
    }, 900);
  }, delay);
}

// === STEP INDICATOR ===
function renderStepIndicator(){
  const steps = ["Profil","Drum","Input THG","Pilih Warna","Riwayat Data"];
  stepIndicator.innerHTML = steps.map((s,i)=>`
    <div class="step ${currentStep===i+1?'active':''}">${i+1}. ${s}</div>
  `).join("");
}

// === RENDER STEP ===
function renderStep(){
  renderStepIndicator();

  // STEP 1: PROFIL
  if(currentStep === 1){
    stepContent.innerHTML = `
      <div class="card-enhanced p-8 rounded-2xl text-center">
        <div class="flex justify-between mb-6">
          <button onclick="openPinModal('profil')" class="glass-effect text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all">⚙️ Kelola Profil</button>
          <button onclick="goNext()" class="btn-primary text-white px-8 py-3 rounded-xl font-bold">Lanjut ke Drum →</button>
        </div>
        <h2 class="text-2xl font-bold mb-6 text-black">👥 Pilih Profil Siswa</h2>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-6">
          ${profiles.map(nama=>{
            const selected = selectedProfil?.nama === nama ? "selected" : "";
            return `
              <div onclick="selectProfil('${nama}')"
                   class="selection-card animate-entrance cursor-pointer p-6 rounded-2xl text-center ${selected}">
                <div class="text-6xl mb-3">🎓</div>
                <p class="font-bold text-lg">${nama}</p>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  // STEP 2: DRUM
  else if(currentStep === 2){
    stepContent.innerHTML = `
      <div class="card-enhanced p-8 rounded-2xl text-center">
        <div class="flex justify-between mb-6">
          <button onclick="goBackProfil()" class="glass-effect text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all">← Kembali</button>
          <button onclick="openPinModal('drum')" class="glass-effect text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all">⚙️ Kelola Drum</button>
          <button onclick="goNext()" class="btn-primary text-white px-8 py-3 rounded-xl font-bold">Lanjut ke Input THG →</button>
        </div>
        <h2 class="text-2xl font-bold mb-6 text-black">🛢️ Pilih Drum Fermentasi</h2>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-6">
          ${drums.map(nama=>{
            const selected = selectedDrum === nama ? "selected" : "";
            return `
              <div onclick="selectDrum('${nama}')"
                   class="drum-card animate-entrance cursor-pointer p-6 rounded-2xl text-center ${selected}">
                <div class="text-6xl mb-3">🛢️</div>
                <p class="font-bold text-lg">Drum ${nama}</p>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

// STEP 3: INPUT THG
else if(currentStep === 3){
  stepContent.innerHTML = `
    <div class="card-enhanced p-8 rounded-2xl text-center relative">
      <div class="flex justify-between mb-6">
        <button onclick="goBackDrum()" class="glass-effect text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all">← Kembali</button>
        <button onclick="skipTHG()" class="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold transform hover:scale-105 transition-all">⏭️ Lewati</button>
        <button onclick="nextStepTHG()" class="btn-primary text-white px-8 py-3 rounded-xl font-bold">Lanjut →</button>
      </div>
      <h2 class="text-2xl font-bold mb-8 text-black"> Input Data Sensor</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <!-- Card Suhu -->
        <div class="input-card animate-entrance glass-effect p-6 rounded-2xl text-white relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 opacity-80"></div>
          <div class="relative z-10">
            <div class="text-5xl mb-3">🌡️</div>
            <p class="font-bold mb-3 text-lg">Suhu (°C)</p>
            <input id="suhu" type="number" placeholder="contoh: 30" 
                   class="input-enhanced w-full text-center text-black font-semibold">
          </div>
        </div>

        <!-- Card Kelembapan -->
        <div class="input-card animate-entrance glass-effect p-6 rounded-2xl text-white relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-80"></div>
          <div class="relative z-10">
            <div class="text-5xl mb-3">💧</div>
            <p class="font-bold mb-3 text-lg">Kelembapan (%)</p>
            <input id="kelembapan" type="number" placeholder="contoh: 60" 
                   class="input-enhanced w-full text-center text-black font-semibold">
          </div>
        </div>

        <!-- Card Gas -->
        <div class="input-card animate-entrance glass-effect p-6 rounded-2xl text-white relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-yellow-500 to-yellow-600 opacity-80"></div>
          <div class="relative z-10">
            <div class="text-5xl mb-3">🔥</div>
            <p class="font-bold mb-3 text-lg">Gas </p>
            <input id="gas" type="number" placeholder="contoh: 100" 
                   class="input-enhanced w-full text-center text-black font-semibold">
          </div>
        </div>

        <!-- Card pH -->
        <div class="input-card animate-entrance glass-effect p-6 rounded-2xl text-white relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 opacity-80"></div>
          <div class="relative z-10">
            <div class="text-5xl mb-3">🧪</div>
            <p class="font-bold mb-3 text-lg">pH</p>
            <input id="ph" type="number" step="0.1" placeholder="contoh: 7.0" 
                   class="input-enhanced w-full text-center text-black font-semibold">
          </div>
        </div>

      </div>
    </div>
  `;
}




// STEP 4: PILIH WARNA
else if(currentStep === 4){
  // New UI: pick individual status for Suhu, Kelembapan, Gas, PH
  stepContent.innerHTML = `
    <div class="card-enhanced p-8 rounded-2xl text-center">
      <div class="flex justify-between mb-6">
        <button onclick="goBackTHG()" class="glass-effect text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all">← Kembali</button>
        <button onclick="generateLaporan()" class="btn-primary text-white px-8 py-3 rounded-xl font-bold">📋 Buat Laporan</button>
      </div>
      <h2 class="text-2xl font-bold mb-6 text-black"> Pilih Status per Sensor</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        ${[{
          key: 'suhu',
          title: 'Status SUHU',
          emoji: '🌡️',
          value: statusSuhu
        },{
          key: 'kelembapan',
          title: 'Status KELEMBAPAN',
          emoji: '💧',
          value: statusKelembapan
        },{
          key: 'gas',
          title: 'Status GAS',
          emoji: '🔥',
          value: statusGas
        },{
          key: 'ph',
          title: 'Status PH',
          emoji: '🧪',
          value: statusPh
        }].map(sensor=>{
          return `
            <div class="p-6 rounded-2xl bg-white shadow-sm text-left">
              <div class="flex items-center mb-4">
                <div class="text-4xl mr-4">${sensor.emoji}</div>
                <div>
                  <div class="font-bold">${sensor.title}</div>
                  <div class="text-sm text-gray-500">Pilih status untuk ${sensor.title.split(' ')[1].toLowerCase()}</div>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-3">
                ${["Belum Siap","Hampir Siap","Sudah Siap"].map(opt=>{
                  const gradientBg = opt==="Belum Siap" ? "from-red-200 to-red-300"
                                   : opt==="Hampir Siap" ? "from-yellow-200 to-yellow-300"
                                   : "from-green-200 to-green-300";
                  const selectedClass = sensor.value===opt ? 'ring-4 ring-blue-400 shadow-2xl transform scale-105' : '';
                  const bulatan = opt==="Belum Siap" ? "sensor-red"
                                : opt==="Hampir Siap" ? "sensor-yellow"
                                : "sensor-green";
                  return `
                    <div onclick="setStatus('${sensor.key}','${opt}')" class="cursor-pointer p-3 rounded-xl bg-gradient-to-br ${gradientBg} ${selectedClass} text-center transition-all">
                      <div class="sensor-light ${bulatan} mb-2 mx-auto"></div>
                      <div class="font-semibold text-sm text-gray-800">${opt}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}


  // STEP 5: LAPORAN

  else if(currentStep === 5){
    stepContent.innerHTML = `
      <div class="bg-white p-6 rounded-2xl shadow-md relative overflow-x-auto">
        <button onclick="goBackProfil()" class="absolute top-3 right-3 bg-gray-600 text-white px-4 py-2 rounded-lg">Kembali ke Profil</button>
        <h2 class="text-lg font-semibold mb-4">Laporan Monitoring</h2>
        <div class="mb-4 text-left">
          <label class="font-medium">Lihat history tanggal:</label>
          <input type="date" id="historyDate" value="${currentDateKey}" class="ml-2 border p-1 rounded"
                 onchange="loadHistory(this.value)">
        </div>
        <table class="w-full border text-center mb-4">
          <thead class="bg-gray-200">
            <tr>
              <th class="border p-2">No</th>
              <th class="border p-2">Waktu</th>
              <th class="border p-2">Nama</th>
              <th class="border p-2">Drum</th>
              <th class="border p-2">Suhu</th>
              <th class="border p-2">Kelembapan</th>
              <th class="border p-2">Gas</th>
              <th class="border p-2">pH</th>
              
              <th class="border p-2">Status Suhu</th>
              <th class="border p-2">Status Kelembapan</th>
              <th class="border p-2">Status Gas</th>
              <th class="border p-2">Status pH</th>
              <th class="border p-2">Status</th>
              <th class="border p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${laporanData.length > 0 ? laporanData.map((d,i)=>{
              const warnaClass = d.warna==="Belum Siap" ? "text-red-600 font-bold"
                               : d.warna==="Hampir Siap" ? "text-yellow-600 font-bold"
                               : "text-green-600 font-bold";
              return `
                <tr>
                  <td class="border p-2">${i+1}</td>
                  <td class="border p-2">${d.timestamp || "-"}</td>
                  <td class="border p-2">${d.nama}</td>
                  <td class="border p-2">${d.drum || "-"}</td>
                  <td class="border p-2">${d.suhu || "-"}</td>
                  <td class="border p-2">${d.kelembapan || "-"}</td>
                  <td class="border p-2">${d.gas || "-"}</td>
                  <td class="border p-2">${d.ph || "-"}</td>
                  <td class="border p-2"><span class="${getStatusClass(d.statusSuhu)}">${d.statusSuhu || "-"}</span></td>
                  <td class="border p-2"><span class="${getStatusClass(d.statusKelembapan)}">${d.statusKelembapan || "-"}</span></td>
                  <td class="border p-2"><span class="${getStatusClass(d.statusGas)}">${d.statusGas || "-"}</span></td>
                  <td class="border p-2"><span class="${getStatusClass(d.statusPh)}">${d.statusPh || "-"}</span></td>
                  <td class="border p-2 ${warnaClass}">${d.warna}</td>
                  <td class="border p-2">
                    <button onclick="openHapusLaporanModal(${i}, 'step5')" class="bg-red-600 text-white px-2 py-1 rounded">Hapus</button>
                  </td>
                </tr>
              `;
            }).join("") : `<tr><td colspan="15" class="p-4 text-gray-500">Belum ada data</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  }

  // STEP 6: RIWAYAT SEMUA DRUM
  else if (currentStep === 6) {
    const allForDay = getLaporanHari(currentDateKey);

    const cardsHtml = drums.map(nama => {
      const list = allForDay.filter(d => d.drum === nama);
      const latest = list[0];
      let summary = "Belum ada data";

      if (latest) {
        const color =
          latest.warna === "Sudah Siap" ? "text-green-600"
        : latest.warna === "Hampir Siap" ? "text-yellow-600"
        : "text-red-600";
        summary = `
          <span class="font-semibold ${color}">${latest.warna}</span><br>
          <span class="text-xs text-gray-500">Terakhir: ${latest.timestamp}</span>
        `;
      }

      return `
        <div class="cursor-pointer p-4 rounded-xl shadow-md bg-green-50 hover:bg-green-100 transition">
          <div class="text-5xl mb-2">🛢️</div>
          <p class="font-bold">Drum ${nama}</p>
          <p class="text-sm text-gray-600">${summary}</p>
          <button onclick="openDetailDrum('${nama}')" class="mt-2 bg-blue-600 text-white px-3 py-1 rounded">Detail</button>
        </div>
      `;
    }).join("");

    stepContent.innerHTML = `
      <div class="bg-white p-6 rounded-2xl shadow-md text-center relative">
        <button onclick="goBackProfil()" class="absolute top-3 right-3 bg-gray-600 text-white px-4 py-2 rounded-lg">Kembali</button>
        <h2 class="text-lg font-semibold mb-4">Riwayat Data Sensor</h2>
        <div class="mb-4 text-left">
          <label class="font-medium">Lihat history tanggal:</label>
          <input type="date" id="historyDateAll" value="${currentDateKey}" 
                 class="ml-2 border p-1 rounded" onchange="loadHistoryAll(this.value)">
        </div>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">${cardsHtml}</div>
      </div>
    `;
  }
}

// === DETAIL DRUM ===
function openDetailDrum(nama) {
  document.getElementById("detailTitleDrum").innerText = `Detail Drum ${nama}`;
  const body = document.getElementById("detailDrumBody");

  const data = getLaporanHari(currentDateKey).filter(d => d.drum === nama);

body.innerHTML = data.length > 0
  ? data.map((d,i)=>{
      const warnaClass = d.warna==="Belum Siap" ? "text-red-600 font-bold"
                       : d.warna==="Hampir Siap" ? "text-yellow-600 font-bold"
                       : "text-green-600 font-bold";
      return `
        <tr>
          <td class="border p-2">${i+1}</td>
          <td class="border p-2">${d.timestamp || "-"}</td>
          <td class="border p-2">${d.nama || "-"}</td>
          <td class="border p-2">${d.drum || "-"}</td>
          <td class="border p-2">${d.suhu || "-"}</td>
          <td class="border p-2">${d.kelembapan || "-"}</td>
          <td class="border p-2">${d.gas || "-"}</td>
          <td class="border p-2">${d.ph || "-"}</td>
          <td class="border p-2"><span class="${getStatusClass(d.statusSuhu)}">${d.statusSuhu || "-"}</span></td>
          <td class="border p-2"><span class="${getStatusClass(d.statusKelembapan)}">${d.statusKelembapan || "-"}</span></td>
          <td class="border p-2"><span class="${getStatusClass(d.statusGas)}">${d.statusGas || "-"}</span></td>
          <td class="border p-2"><span class="${getStatusClass(d.statusPh)}">${d.statusPh || "-"}</span></td>
          <td class="border p-2">
            <button onclick="openHapusLaporanModalDetail('${nama}', ${i})"
                    class="bg-red-600 text-white px-3 py-1 rounded">Hapus</button>
          </td>
        </tr>
      `;
    }).join("")
  : `<tr><td colspan="14" class="p-4 text-gray-500">Belum ada data</td></tr>`;





  openModal("modalDetailDrum");
}
function closeDetailDrum(){ closeModal("modalDetailDrum"); }


// === MODAL SUKSES ===
function openSuccessModal(){
  openModal('modalSuccess');
}
function closeSuccessModal(){
  closeModal('modalSuccess');
}


// === STEP CONTROL ===
function selectProfil(nama){ 
  selectedProfil = {nama}; 
  // Langsung render tanpa animasi untuk selection
  renderStepIndicator();
  const stepContent = document.getElementById("stepContent");
  if(currentStep === 1){
    stepContent.innerHTML = `
      <div class="card-enhanced p-8 rounded-2xl text-center">
        <div class="flex justify-between mb-6">
          <button onclick="openPinModal('profil')" class="glass-effect text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all">⚙️ Kelola Profil</button>
          <button onclick="goNext()" class="btn-primary text-white px-8 py-3 rounded-xl font-bold">Lanjut ke Drum →</button>
        </div>
        <h2 class="text-2xl font-bold mb-6 text-black">👥 Pilih Profil Siswa</h2>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-6">
          ${profiles.map(nama=>{
            const selected = selectedProfil?.nama === nama ? "selected" : "";
            return `
              <div onclick="selectProfil('${nama}')"
                   class="selection-card cursor-pointer p-6 rounded-2xl text-center ${selected}">
                <div class="text-6xl mb-3">🎓</div>
                <p class="font-bold text-lg">${nama}</p>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }
}
function selectDrum(nama){ 
  selectedDrum = nama; 
  // Langsung render tanpa animasi untuk selection
  renderStepIndicator();
  const stepContent = document.getElementById("stepContent");
  if(currentStep === 2){
    stepContent.innerHTML = `
      <div class="card-enhanced p-8 rounded-2xl text-center">
        <div class="flex justify-between mb-6">
          <button onclick="goBackProfil()" class="glass-effect text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all">← Kembali</button>
          <button onclick="openPinModal('drum')" class="glass-effect text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all">⚙️ Kelola Drum</button>
          <button onclick="goNext()" class="btn-primary text-white px-8 py-3 rounded-xl font-bold">Lanjut ke Input THG →</button>
        </div>
        <h2 class="text-2xl font-bold mb-6 text-black">🛢️ Pilih Drum Fermentasi</h2>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-6">
          ${drums.map(nama=>{
            const selected = selectedDrum === nama ? "selected" : "";
            return `
              <div onclick="selectDrum('${nama}')"
                   class="drum-card cursor-pointer p-6 rounded-2xl text-center ${selected}">
                <div class="text-6xl mb-3">🛢️</div>
                <p class="font-bold text-lg">Drum ${nama}</p>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }
}
function goNext(){
  if(currentStep===1 && !selectedProfil) return;
  if(currentStep===2 && !selectedDrum) return;
  
  // Animate transition to next step
  animateStepTransition(() => {
    currentStep++; 
    renderStep();
  });
}
function goBackProfil(){ 
  animateStepTransition(() => {
    currentStep = 1; 
    renderStep();
  }, 400);
}
function goBackDrum(){ 
  animateStepTransition(() => {
    currentStep = 2; 
    renderStep();
  }, 400);
}
function goBackTHG(){ 
  animateStepTransition(() => {
    currentStep = 3; 
    renderStep();
  }, 400);
}

function nextStepTHG(){
  const suhu = document.getElementById("suhu").value;
  const kelembapan = document.getElementById("kelembapan").value;
  const gas = document.getElementById("gas").value;
  const ph = document.getElementById("ph").value; // 🔥 ambil input pH

  if(!suhu || !kelembapan || !gas || !ph){ 
    openModal('modalWarning'); 
    return; 
  }

  inputTHG = {
    suhu: suhu + "°C",
    kelembapan: kelembapan + "%",
    gas: gas + " ppm",
    ph: ph // 🔥 simpan pH
  };

  // Animate transition to next step
  animateStepTransition(() => {
    currentStep = 4; 
    renderStep();
  });
}


function skipTHG(){
  inputTHG = {
    suhu: "-",
    kelembapan: "-",
    gas: "-",
    ph: "-"   // 🔥 jangan undefined, kasih placeholder
  };
  
  // Animate transition to next step
  animateStepTransition(() => {
    currentStep = 4; 
    renderStep();
  });
}


function setWarna(w){ 
  warna=w; 
  // Langsung render tanpa animasi untuk selection
  renderStepIndicator();
  const stepContent = document.getElementById("stepContent");
  if(currentStep === 4){
    stepContent.innerHTML = `
    <!-- Pilih Warna -->
    <div class="card-enhanced p-8 rounded-2xl text-center">
      <div class="flex justify-between mb-6">
        <button onclick="goBackTHG()" class="glass-effect text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all">← Kembali</button>
        <button onclick="generateLaporan()" class="btn-primary text-white px-8 py-3 rounded-xl font-bold">📋 Buat Laporan</button>
      </div>
      <h2 class="text-2xl font-bold mb-6 text-black"> Pilih Status LED</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        ${["Belum Siap","Hampir Siap","Sudah Siap"].map(w=>{
          const gradientBg = w==="Belum Siap" ? "from-red-200 to-red-300"
                           : w==="Hampir Siap" ? "from-yellow-200 to-yellow-300"
                           : "from-green-200 to-green-300";
          const selectedClass = warna===w ? 'ring-4 ring-blue-400 shadow-2xl transform scale-105' : '';
          const bulatan = w==="Belum Siap" ? "sensor-red"
                        : w==="Hampir Siap" ? "sensor-yellow"
                        : "sensor-green";
          return `
            <div onclick="setWarna('${w}')"
                 class="cursor-pointer p-8 rounded-2xl glass-effect bg-gradient-to-br ${gradientBg} ${selectedClass} transition-all duration-300 hover:scale-105">
              <div class="sensor-light ${bulatan} mb-4 mx-auto"></div>
              <p class="font-bold text-lg text-gray-800">${w}</p>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
  }
}
// New: set individual sensor status
function setStatus(key, value){
  if(key === 'suhu') statusSuhu = value;
  if(key === 'kelembapan') statusKelembapan = value;
  if(key === 'gas') statusGas = value;
  if(key === 'ph') statusPh = value;

  // re-render step 4 UI quickly
  renderStepIndicator();
  if(currentStep === 4) renderStep();
}
function generateLaporan(){
  // require at least one status selected; optionally you can require all
  if(!statusSuhu && !statusKelembapan && !statusGas && !statusPh) return;

  const now = new Date();
  const hari = now.toLocaleDateString("id-ID",{ weekday:"long" });
  const jam = now.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"});
  const timestamp = `${hari}, ${jam}`;

  const calonLaporan = {
    ...selectedProfil,
    drum: selectedDrum,
    ...inputTHG,
    // include individual statuses
    statusSuhu: statusSuhu || '-',
    statusKelembapan: statusKelembapan || '-',
    statusGas: statusGas || '-',
    statusPh: statusPh || '-',
    // derive overall warna priority: if any 'Belum Siap' -> Belum Siap, else if any 'Hampir Siap' -> Hampir Siap, else Sudah Siap
    warna: (statusSuhu==='Belum Siap' || statusKelembapan==='Belum Siap' || statusGas==='Belum Siap' || statusPh==='Belum Siap') ? 'Belum Siap'
           : (statusSuhu==='Hampir Siap' || statusKelembapan==='Hampir Siap' || statusGas==='Hampir Siap' || statusPh==='Hampir Siap') ? 'Hampir Siap'
           : 'Sudah Siap',
    timestamp
  };

  // Tampilkan ke modal konfirmasi
  const warnaClass = calonLaporan.warna==="Belum Siap" ? "text-red-600 font-bold"
                   : calonLaporan.warna==="Hampir Siap" ? "text-yellow-600 font-bold"
                   : "text-green-600 font-bold";

  document.getElementById("konfirmasiLaporanBody").innerHTML = `
    <tr>
      <td class="border p-2">1</td>
      <td class="border p-2">${calonLaporan.timestamp}</td>
      <td class="border p-2">${calonLaporan.nama}</td>
      <td class="border p-2">${calonLaporan.drum}</td>
      <td class="border p-2">${calonLaporan.suhu}</td>
      <td class="border p-2">${calonLaporan.kelembapan}</td>
      <td class="border p-2">${calonLaporan.gas}</td>
  <td class="border p-2">${calonLaporan.ph}</td>
  <td class="border p-2"><span class="${getStatusClass(calonLaporan.statusSuhu)}">${calonLaporan.statusSuhu}</span></td>
  <td class="border p-2"><span class="${getStatusClass(calonLaporan.statusKelembapan)}">${calonLaporan.statusKelembapan}</span></td>
  <td class="border p-2"><span class="${getStatusClass(calonLaporan.statusGas)}">${calonLaporan.statusGas}</span></td>
  <td class="border p-2"><span class="${getStatusClass(calonLaporan.statusPh)}">${calonLaporan.statusPh}</span></td>
    </tr>
  `;

  // simpan sementara
  window.calonLaporan = calonLaporan;

  openModal("modalKonfirmasiLaporan");
}

function simpanLaporanKonfirmasi(){
  laporanData.unshift(window.calonLaporan);
  saveLaporanHari(laporanData, currentDateKey);
  // clear temporary calon
  window.calonLaporan = null;

  closeModal("modalKonfirmasiLaporan");
  openSuccessModal();

  // setelah klik OK → balik ke Step 1 and reset selections
  document.querySelector("#modalSuccess button").onclick = () => {
    closeSuccessModal();
    animateStepTransition(() => {
      currentStep = 1;
      // reset selections
      selectedProfil = null;
      selectedDrum = null;
      inputTHG = {};
      statusSuhu = statusKelembapan = statusGas = statusPh = null;
      renderStep();
    }, 500);
  };
}

function simpanLaporanFinal(){
  if(window.calonLaporan){
    laporanData.unshift(window.calonLaporan);
    saveLaporanHari(laporanData, currentDateKey);
    window.calonLaporan = null;
    closeModal("modalKonfirmasiLaporan");
    openSuccessModal();
    animateStepTransition(() => {
      currentStep = 1; // ✅ balik ke step 1 setelah simpan
      // reset selections
      selectedProfil = null;
      selectedDrum = null;
      inputTHG = {};
      statusSuhu = statusKelembapan = statusGas = statusPh = null;
      renderStep();
    }, 500);
  }
}





function loadHistory(dateKey){ currentDateKey=dateKey; laporanData=getLaporanHari(dateKey); renderStep(); }
function goToLaporan(){
  const btn = document.getElementById("btnLaporan");
  if(currentStep === 6){
    animateStepTransition(() => {
      currentStep = 1;
      btn.innerHTML = "📊 Riwayat Data Sensor";
      renderStep();
    }, 500); 
  } else {
    animateStepTransition(() => {
      currentStep = 6;
      btn.innerHTML = "🔙 Kembali";
      renderStep();
    }, 500);
  }
}
function loadHistoryAll(dateKey){ currentDateKey = dateKey; renderStep(); }

// ==== MODAL PIN ====
function openPinModal(target){
  currentPinTarget=target;
  document.getElementById("pinError").classList.add("hidden");
  openModal('modalPin');   
}
function resetPinModal(){
  document.getElementById("pinInput").value = "";
  document.getElementById("pinError").classList.add("hidden");
  currentPinTarget = null;
  closeModal('modalPin');
}
function checkPin(){
  const pin=document.getElementById("pinInput").value;
  if(pin==="0000"){
    closeModal('modalPin');
    document.getElementById("pinInput").value="";
    document.getElementById("pinError").classList.add("hidden");

    if(currentPinTarget==="profil") openProfilModal();
    if(currentPinTarget==="drum") openDrumModal();
    if(currentPinTarget==="laporan") confirmHapusLaporanStep5(true);

    currentPinTarget = null;
  }else{
    document.getElementById("pinError").classList.remove("hidden");
    document.getElementById("pinInput").value="";
  }
}

// === MODAL PROFIL ===
function openProfilModal(){ openModal('modalProfil'); renderKelolaProfil(); }
function closeProfilModal(){ closeModal('modalProfil'); }
function renderKelolaProfil(){
  const list=document.getElementById("profilList");
  list.innerHTML=profiles.map((nama,i)=>`
    <div class="flex justify-between items-center border p-2 rounded-lg">
      <span>${nama}</span>
      <div class="space-x-2">
        <button onclick="openEditModal(${i})" class="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
        <button onclick="openHapusModal(${i})" class="bg-red-500 text-white px-2 py-1 rounded">Hapus</button>
      </div>
    </div>
  `).join("");
}
function addProfil(){
  const val=document.getElementById("newProfil").value.trim();
  if(val){ profiles.push(val); saveProfiles(); renderKelolaProfil(); renderStep(); }
  document.getElementById("newProfil").value="";
}
function openEditModal(index){ editIndex=index; document.getElementById("editProfilInput").value=profiles[index]; openModal('modalEditProfil'); }
function closeEditModal(){ closeModal('modalEditProfil'); }
function confirmEditProfil(){ 
  const newName=document.getElementById("editProfilInput").value.trim(); 
  if(newName){ 
    const old=profiles[editIndex];
    profiles[editIndex]=newName; 
    saveProfiles(); 
    if(selectedProfil && selectedProfil.nama===old){ selectedProfil={nama:newName}; }
    renderStep(); 
    renderKelolaProfil(); 
  } 
  closeEditModal(); 
}
function openHapusModal(index){ 
  hapusIndex=index; 
  document.getElementById("hapusText").innerText=`Apakah yakin ingin menghapus profil "${profiles[index]}"?`; 
  openModal('modalHapusProfil'); 
}
function closeHapusModal(){ closeModal('modalHapusProfil'); }
function confirmHapusProfil(){ 
  if(hapusIndex!==null){ 
    const removed=profiles.splice(hapusIndex,1)[0]; 
    if(selectedProfil && selectedProfil.nama===removed){ selectedProfil=null; currentStep=1; }
    saveProfiles(); 
    renderStep(); 
    renderKelolaProfil(); 
  } 
  closeHapusModal(); 
}

// === MODAL DRUM ===
function openDrumModal(){ openModal('modalDrum'); renderKelolaDrum(); }
function closeDrumModal(){ closeModal('modalDrum'); }
function renderKelolaDrum(){
  const list=document.getElementById("drumList");
  list.innerHTML=drums.map((nama,i)=>`
    <div class="flex justify-between items-center border p-2 rounded-lg">
      <span>Drum ${nama}</span>
      <div class="space-x-2">
        <button onclick="openEditDrum(${i})" class="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
        <button onclick="openHapusDrum(${i})" class="bg-red-500 text-white px-2 py-1 rounded">Hapus</button>
      </div>
    </div>
  `).join("");
}
function addDrum(){
  const val=document.getElementById("newDrum").value.trim();
  if(val){ drums.push(val); saveDrums(); renderKelolaDrum(); renderStep(); }
  document.getElementById("newDrum").value="";
}
function openEditDrum(index){ editDrumIndex=index; document.getElementById("editDrumInput").value=drums[index]; openModal('modalEditDrum'); }
function closeEditDrum(){ closeModal('modalEditDrum'); }
function confirmEditDrum(){ 
  const newName=document.getElementById("editDrumInput").value.trim(); 
  if(newName){ 
    const old=drums[editDrumIndex];
    drums[editDrumIndex]=newName; 
    saveDrums(); 
    if(selectedDrum===old){ selectedDrum=newName; }
    renderStep(); 
    renderKelolaDrum(); 
  } 
  closeEditDrum(); 
}
function openHapusDrum(index){ hapusDrumIndex=index; document.getElementById("hapusDrumText").innerText=`Apakah yakin ingin menghapus drum "${drums[index]}"?`; openModal('modalHapusDrum'); }
function closeHapusDrum(){ closeModal('modalHapusDrum'); }
function confirmHapusDrum(){ 
  if(hapusDrumIndex!==null){ 
    const removed=drums.splice(hapusDrumIndex,1)[0]; 
    if(selectedDrum===removed){ selectedDrum=null; currentStep=2; }
    saveDrums(); 
    renderStep(); 
    renderKelolaDrum(); 
  } 
  closeHapusDrum(); 
}

// === MODAL HAPUS LAPORAN ===
function openHapusLaporanModal(index, step){
  hapusLaporanIndex = index;
  document.getElementById("hapusLaporanError").classList.add("hidden");
  const btn = document.querySelector("#modalHapusLaporan button.bg-red-600");
  if(step === "step5"){
    btn.setAttribute("onclick", "confirmHapusLaporanStep5()");
  }
  openModal('modalHapusLaporan'); 
}
function openHapusLaporanModalDetail(drum, index){
  hapusLaporanIndex = index;
  currentDrumTarget = drum;
  document.getElementById("hapusLaporanError").classList.add("hidden");
  const btn = document.querySelector("#modalHapusLaporan button.bg-red-600");
  btn.setAttribute("onclick", `confirmHapusLaporanStep6(false,'${drum}')`);
  openModal('modalHapusLaporan'); 
}
function resetHapusLaporanModal(){ 
  const el = document.getElementById("hapusLaporanPin");
  el.value="";
  document.getElementById("hapusLaporanError").classList.add("hidden");
  closeModal('modalHapusLaporan');
}
function confirmHapusLaporanStep5(force=false){
  const pin = document.getElementById("hapusLaporanPin").value;
  if(force || pin==="0000"){
    if(hapusLaporanIndex!==null){
      laporanData.splice(hapusLaporanIndex,1);
      saveLaporanHari(laporanData,currentDateKey);
      renderStep();
    }
    resetHapusLaporanModal();
    openSuccessModal();
  }else{
    document.getElementById("hapusLaporanError").classList.remove("hidden");
  }
}
function confirmHapusLaporanStep6(force=false, drumTarget){
  const pin = document.getElementById("hapusLaporanPin").value;
  if(force || pin==="0000"){
    if(hapusLaporanIndex!==null && drumTarget){
      let all = getLaporanHari(currentDateKey);
      const list = all.filter(d => d.drum === drumTarget);
      const target = list[hapusLaporanIndex];
      const pos = all.indexOf(target);
      if(pos > -1) all.splice(pos,1);
      saveLaporanHari(all,currentDateKey);
      openDetailDrum(drumTarget); // refresh tabel detail
    }
    resetHapusLaporanModal();
    openSuccessModal(); // ✅ tampilkan popup sukses
  }else{
    document.getElementById("hapusLaporanError").classList.remove("hidden");
  }
}


// === MODAL WARNING ===
function closeWarningModal(){ closeModal('modalWarning'); }

// INIT
renderStep();

