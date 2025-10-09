const stepContent = document.getElementById("stepContent");
const stepIndicator = document.getElementById("stepIndicator");

let currentStep = 1;
let selectedKambing = null;
let currentDateKey = todayKey();
let editKambingIndex = null;
let hapusKambingIndex = null;
let hapusDetailNama = null;
let hapusDetailIndex = null;
let currentPinTarget = null;

// DATA KAMBING
let kambings = JSON.parse(localStorage.getItem("kambings")) || [
  "Kambing 1","Kambing 2","Kambing 3","Kambing 4","Kambing 5"
];
function saveKambings(){ localStorage.setItem("kambings", JSON.stringify(kambings)); }

// LOCAL STORAGE LAPORAN 
function todayKey(){ return new Date().toISOString().split("T")[0]; }
function getLaporanHari(key = todayKey()){ return JSON.parse(localStorage.getItem("laporanPangan_" + key)) || []; }
function saveLaporanHari(data, key = todayKey()){ localStorage.setItem("laporanPangan_" + key, JSON.stringify(data)); }
let laporanData = getLaporanHari(currentDateKey);

//  MODAL HELPERS
function openModal(id){ document.getElementById(id).classList.remove("hidden"); }
function closeModal(id){ document.getElementById(id).classList.add("hidden"); }

// RENDER STEP INDICATOR
function renderStepIndicator(){
  const steps = ["Pilih Kambing","Centang Makan","Riwayat Data"];
  stepIndicator.innerHTML = steps.map((s,i)=>`
    <div class="step ${currentStep===i+1?'active':''}">${i+1}. ${s}</div>
  `).join("");
}

//  RENDER STEP 
function renderStep(){
  renderStepIndicator();

  // STEP 1
if(currentStep === 1){
  const counts = kambings.map(k=>({
    nama: k,
    jumlah: laporanData.filter(d=>d.nama===k).length
  }));

  stepContent.innerHTML = `
    <!-- Pilih Kambing -->
    <div class="card-enhanced p-8 rounded-2xl text-center mb-8">
      <div class="flex justify-between mb-6">
        <button onclick="openPinModal('kambing')" class="glass-effect text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all">⚙️ Kelola Kambing</button>
        <button onclick="goNext()" class="btn-primary text-white px-8 py-3 rounded-xl font-bold">Lanjut ke Centang Makan →</button>
      </div>
      <h2 class="text-2xl font-bold mb-6 text-black">🐑 Pilih Kambing</h2>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        ${counts.map(c=>{
          let warna = "bg-gradient-to-br from-red-100 to-red-200 border-red-400"; 
          if(c.jumlah === 1) warna = "bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-400"; 
          else if(c.jumlah === 2) warna = "bg-gradient-to-br from-orange-200 to-orange-300 border-orange-600"; 
          else if(c.jumlah >= 3) warna = "bg-gradient-to-br from-green-100 to-green-200 border-green-400";

          const isSelected = selectedKambing === c.nama ? "ring-4 ring-blue-400" : "";

          return `
            <div onclick="selectKambing('${c.nama}')"
                 class="selection-card cursor-pointer p-6 rounded-2xl text-center border-2 ${warna} ${isSelected}">
              <div class="text-6xl mb-3">🐑</div>
              <p class="font-bold text-lg text-gray-800">${c.nama}</p>
              <p class="text-sm text-gray-700">${c.jumlah>0?`${c.jumlah}x makan`:"Belum makan"}</p>
            </div>
          `;
        }).join("")}
      </div>
    </div>

    <!-- Keterangan Warna Status -->
    <div class="card-enhanced p-8 rounded-2xl text-center">
      <h2 class="text-2xl font-bold mb-6 text-black">🎯 Keterangan Warna Status</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="color-selection-card p-6 rounded-2xl border-2 border-red-400 bg-gradient-to-br from-red-100 to-red-200">
          <div class="text-6xl mb-3">🐑</div>
          <p class="font-bold text-red-600 text-lg">MERAH</p>
          <p class="text-gray-700">Belum makan</p>
        </div>
        <div class="color-selection-card p-6 rounded-2xl border-2 border-yellow-400 bg-gradient-to-br from-yellow-100 to-yellow-200">
          <div class="text-6xl mb-3">🐑</div>
          <p class="font-bold text-yellow-600 text-lg">KUNING</p>
          <p class="text-gray-700">Sudah makan 1x</p>
        </div>
        <div class="color-selection-card p-6 rounded-2xl border-2 border-orange-600 bg-gradient-to-br from-orange-200 to-orange-300">
          <div class="text-6xl mb-3">🐑</div>
          <p class="font-bold text-orange-700 text-lg">OREN</p>
          <p class="text-gray-700">Sudah makan 2x</p>
        </div>
        <div class="color-selection-card p-6 rounded-2xl border-2 border-green-400 bg-gradient-to-br from-green-100 to-green-200">
          <div class="text-6xl mb-3">🐑</div>
          <p class="font-bold text-green-600 text-lg">HIJAU</p>
          <p class="text-gray-700">Sudah makan 3x</p>
        </div>
      </div>
    </div>
  `;
}


  // STEP 2
  else if(currentStep === 2){
    stepContent.innerHTML = `
      <div class="card-enhanced p-8 rounded-2xl text-center">
        <h2 class="text-2xl font-bold mb-8 text-black">🍽️ Centang Makan Kambing</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div onclick="goBackKambing()"
               class="color-selection-card cursor-pointer p-8 rounded-2xl border-2 bg-gradient-to-br from-red-100 to-red-200 border-red-500 flex flex-col items-center">
            <div class="text-7xl mb-4">❌</div>
            <p class="font-bold text-red-700 text-xl">Belum Diberi Makan</p>
          </div>
          <div onclick="beriMakan()"
               class="color-selection-card cursor-pointer p-8 rounded-2xl border-2 bg-gradient-to-br from-green-100 to-green-200 border-green-500 flex flex-col items-center">
            <div class="text-7xl mb-4">✅</div>
            <p class="font-bold text-green-700 text-xl">Sudah Diberi Makan</p>
          </div>
        </div>
      </div>
    `;
  }

  // STEP 4
  else if(currentStep === 4){
    const counts = kambings.map(k=>({ 
      nama:k, 
      jumlah: laporanData.filter(d=>d.nama===k).length 
    }));

    stepContent.innerHTML = `
      <div class="card-enhanced p-8 rounded-2xl relative">
        <button onclick="goBackKambing()" class="absolute top-4 right-4 glass-effect text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all">← Kembali ke Pilih Kambing</button>
        <h2 class="text-2xl font-bold mb-6 text-black">📊 Riwayat Data Pangan</h2>
        <div class="mb-6 text-left">
          <label class="font-semibold text-black">Lihat history tanggal:</label>
          <input type="date" id="historyDateAll" value="${currentDateKey}" class="input-enhanced ml-3"
                 onchange="loadHistory(this.value,true)">
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${counts.map(c=>{
            let warna = "bg-gradient-to-br from-red-100 to-red-200 border-red-400"; 
            if(c.jumlah === 1) warna = "bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-400"; 
            else if(c.jumlah === 2) warna = "bg-gradient-to-br from-orange-200 to-orange-300 border-orange-600"; 
            else if(c.jumlah >= 3) warna = "bg-gradient-to-br from-green-100 to-green-200 border-green-400";

            return `
              <div class="color-selection-card p-6 border-2 ${warna} rounded-2xl">
                <h3 class="font-bold mb-3 text-xl text-gray-800">🐑 ${c.nama}</h3>
                <p class="mb-4 text-lg text-gray-700">
                  ${c.jumlah > 0 
                    ? `Sudah diberi makan <b>${c.jumlah} kali</b> hari ini` 
                    : `<span class="text-red-600 font-semibold">Belum diberi makan hari ini</span>`}
                </p>
                <button onclick="showDetail('${c.nama}')" class="btn-primary text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all">Detail</button>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }
}

// STEP FUNCTION 
function selectKambing(nama){ 
  selectedKambing = nama; 
  // Langsung render tanpa animasi untuk selection
  renderStepIndicator();
  const stepContent = document.getElementById("stepContent");
  if(currentStep === 1){
    const counts = kambings.map(k=>({
      nama: k,
      jumlah: laporanData.filter(d=>d.nama===k).length
    }));

    stepContent.innerHTML = `
      <!-- Pilih Kambing -->
      <div class="card-enhanced p-8 rounded-2xl text-center mb-8">
        <div class="flex justify-between mb-6">
          <button onclick="openPinModal('kambing')" class="glass-effect text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all">⚙️ Kelola Kambing</button>
          <button onclick="goNext()" class="btn-primary text-white px-8 py-3 rounded-xl font-bold">Lanjut ke Centang Makan →</button>
        </div>
        <h2 class="text-2xl font-bold mb-6 text-black">🐑 Pilih Kambing</h2>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          ${counts.map(c=>{
            let warna = "bg-gradient-to-br from-red-100 to-red-200 border-red-400"; 
            if(c.jumlah === 1) warna = "bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-400"; 
            else if(c.jumlah === 2) warna = "bg-gradient-to-br from-orange-200 to-orange-300 border-orange-600"; 
            else if(c.jumlah >= 3) warna = "bg-gradient-to-br from-green-100 to-green-200 border-green-400";

            const isSelected = selectedKambing === c.nama ? "ring-4 ring-blue-400" : "";

            return `
              <div onclick="selectKambing('${c.nama}')"
                   class="selection-card cursor-pointer p-6 rounded-2xl text-center border-2 ${warna} ${isSelected}">
                <div class="text-6xl mb-3">🐑</div>
                <p class="font-bold text-lg text-gray-800">${c.nama}</p>
                <p class="text-sm text-gray-700">${c.jumlah>0?`${c.jumlah}x makan`:"Belum makan"}</p>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <!-- Keterangan Warna Status -->
      <div class="card-enhanced p-8 rounded-2xl text-center">
        <h2 class="text-2xl font-bold mb-6 text-black">🎯 Keterangan Warna Status</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="p-6 rounded-2xl border-2 border-red-400 bg-gradient-to-br from-red-100 to-red-200">
            <div class="text-6xl mb-3">🐑</div>
            <p class="font-bold text-red-600 text-lg">MERAH</p>
            <p class="text-gray-700">Belum makan</p>
          </div>
          <div class="p-6 rounded-2xl border-2 border-yellow-400 bg-gradient-to-br from-yellow-100 to-yellow-200">
            <div class="text-6xl mb-3">🐑</div>
            <p class="font-bold text-yellow-600 text-lg">KUNING</p>
            <p class="text-gray-700">Sudah makan 1x</p>
          </div>
          <div class="p-6 rounded-2xl border-2 border-orange-600 bg-gradient-to-br from-orange-200 to-orange-300">
            <div class="text-6xl mb-3">🐑</div>
            <p class="font-bold text-orange-700 text-lg">OREN</p>
            <p class="text-gray-700">Sudah makan 2x</p>
          </div>
          <div class="p-6 rounded-2xl border-2 border-green-400 bg-gradient-to-br from-green-100 to-green-200">
            <div class="text-6xl mb-3">🐑</div>
            <p class="font-bold text-green-600 text-lg">HIJAU</p>
            <p class="text-gray-700">Sudah makan 3x</p>
          </div>
        </div>
      </div>
    `;
  }
}
function goNext(){ if(currentStep===1 && !selectedKambing) return; currentStep++; renderStep(); }
function goBackKambing(){ currentStep = 1; renderStep(); }
function beriMakan(){
  const now = new Date();
  const hari = now.toLocaleDateString("id-ID",{ weekday:"long" });
  const jam = now.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"});
  const timestamp = `${hari}, ${jam}`;

  laporanData.unshift({ nama:selectedKambing, timestamp });
  saveLaporanHari(laporanData, currentDateKey);

  // Modal sukses
  document.body.insertAdjacentHTML("beforeend", `
    <div id="modalSuccess" class="fixed inset-0 modal-enhanced flex items-center justify-center z-[1000]">
      <div class="modal-content p-8 rounded-2xl w-96 text-center bounce-in">
        <div class="text-green-500 text-6xl mb-4 animate-pulse">✅</div>
        <h2 class="text-2xl font-bold mb-4 text-black">Sukses!</h2>
        <p class="text-gray-600 mb-6">Data berhasil disimpan</p>
        <button onclick="closeSuccessModal()" class="btn-secondary text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all">OK</button>
      </div>
    </div>
  `);
}

function loadHistory(dateKey,isAll=false){
  currentDateKey=dateKey;
  laporanData=getLaporanHari(dateKey);
  if(isAll) currentStep=4;
  renderStep();
}
function goToLaporanSemua(){
  const btn = document.getElementById("btnLaporanPangan");
  if(currentStep === 4){
    currentStep = 1; 
    btn.innerHTML = "📊 Riwayat Data Pangan";
  } else {
    currentStep = 4; 
    btn.innerHTML = "🔙 Kembali";
  }
  renderStep();
}

// MODAL DETAIL LAPORAN
function showDetail(nama){
  const detail = laporanData.filter(d=>d.nama===nama);
  const list = detail.map((d,i)=>`
    <tr>
      <td class="border p-3">${i+1}</td>
      <td class="border p-3">${d.timestamp}</td>
      <td class="border p-3">Sudah Diberi Makan</td>
      <td class="border p-3">
        <button onclick="confirmHapusDetail('${nama}',${i})" class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-all">Hapus</button>
      </td>
    </tr>
  `).join("");

  document.body.insertAdjacentHTML("beforeend", `
    <div id="modalDetail" class="fixed inset-0 modal-enhanced flex items-center justify-center z-50">
      <div class="modal-content p-8 rounded-2xl w-full max-w-2xl slide-up">
        <h2 class="text-2xl font-bold mb-6 text-black">🐑 Detail ${nama}</h2>
        <div class="overflow-x-auto mb-6">
          <table class="table-enhanced w-full text-center">
            <thead>
              <tr>
                <th class="border p-3 font-semibold">No</th>
                <th class="border p-3 font-semibold">Waktu</th>
                <th class="border p-3 font-semibold">Status</th>
                <th class="border p-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${list || `<tr><td colspan="4" class="p-4 text-gray-500">Belum ada data</td></tr>`}
            </tbody>
          </table>
        </div>
        <button onclick="closeDetail()" class="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl w-full transition-all transform hover:scale-105">Tutup</button>
      </div>
    </div>
  `);
}
function closeDetail(){ const el=document.getElementById("modalDetail"); if(el) el.remove(); }

function confirmHapusDetail(nama,index){
  closeDetail();
  document.body.insertAdjacentHTML("beforeend", `
    <div id="modalConfirmHapus" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
        <h2 class="text-lg font-semibold mb-4">Konfirmasi Hapus</h2>
        <p class="mb-4">Yakin ingin menghapus data ini?</p>
        <div class="flex justify-center space-x-4">
          <button onclick="doHapusDetail('${nama}',${index})" class="bg-red-600 text-white px-4 py-2 rounded">Ya, Hapus</button>
          <button onclick="closeModalConfirmHapus('${nama}')" class="bg-gray-500 text-white px-4 py-2 rounded">Batal</button>
        </div>
      </div>
    </div>
  `);
}
function closeModalConfirmHapus(nama){ document.getElementById("modalConfirmHapus").remove(); showDetail(nama); }

function doHapusDetail(nama,index){
  let data=getLaporanHari(currentDateKey);
  const list=data.filter(d=>d.nama===nama);
  const target=list[index];
  const pos=data.indexOf(target);
  if(pos>-1){
    data.splice(pos,1);
    saveLaporanHari(data,currentDateKey);
  }
  document.getElementById("modalConfirmHapus").remove();

  document.body.insertAdjacentHTML("beforeend", `
    <div id="modalSuccess" class="fixed inset-0 modal-enhanced flex items-center justify-center z-[1000]">
      <div class="modal-content p-8 rounded-2xl w-96 text-center bounce-in">
        <div class="text-green-500 text-6xl mb-4 animate-pulse">✅</div>
        <h2 class="text-2xl font-bold mb-4 text-black">Sukses!</h2>
        <p class="text-gray-600 mb-6">Data berhasil dihapus</p>
        <button onclick="closeSuccessModal()" class="btn-secondary text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all">OK</button>
      </div>
    </div>
  `);
}

function closeSuccessModal(){
  const el=document.getElementById("modalSuccess"); if(el) el.remove();
  currentStep=1;
  renderStep(); // refresh ke step 1 dengan data terbaru
}

// ================= PIN + CRUD KAMBING =================
function openPinModal(target){
  currentPinTarget=target;
  document.getElementById("pinError").classList.add("hidden");
  openModal("modalPin"); 
}
function resetPinModal(){
  document.getElementById("pinInput").value = "";
  document.getElementById("pinError").classList.add("hidden");
  closeModal("modalPin");
}
function checkPin(){
  const pin=document.getElementById("pinInput").value;
  if(pin==="0000"){
    document.getElementById("pinError").classList.add("hidden");
    closeModal("modalPin");
    if(currentPinTarget==="kambing") openKambingModal();
  }else{
    document.getElementById("pinError").classList.remove("hidden");
  }
}

function openKambingModal(){ openModal("modalKambing"); renderKelolaKambing(); }
function closeKambingModal(){ closeModal("modalKambing"); }
function renderKelolaKambing(){
  const list=document.getElementById("kambingList");
  list.innerHTML=kambings.map((nama,i)=>`
    <div class="flex justify-between items-center border p-2 rounded-lg">
      <span>${nama}</span>
      <div class="space-x-2">
        <button onclick="openEditKambing(${i})" class="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
        <button onclick="openHapusKambing(${i})" class="bg-red-500 text-white px-2 py-1 rounded">Hapus</button>
      </div>
    </div>
  `).join("");
}
function addKambing(){
  const val=document.getElementById("newKambing").value.trim();
  if(val){ kambings.push(val); saveKambings(); renderKelolaKambing(); renderStep(); }
  document.getElementById("newKambing").value="";
}
function openEditKambing(index){ editKambingIndex=index; document.getElementById("editKambingInput").value=kambings[index]; openModal("modalEditKambing"); }
function closeEditKambing(){ closeModal("modalEditKambing"); }
function confirmEditKambing(){ const newName=document.getElementById("editKambingInput").value.trim(); if(newName){ kambings[editKambingIndex]=newName; saveKambings(); renderStep(); renderKelolaKambing(); } closeEditKambing(); }
function openHapusKambing(index){ hapusKambingIndex=index; document.getElementById("hapusKambingText").innerText=`Apakah yakin ingin menghapus "${kambings[index]}"?`; openModal("modalHapusKambing"); }
function closeHapusKambing(){ closeModal("modalHapusKambing"); }
function confirmHapusKambing(){ if(hapusKambingIndex!==null){ kambings.splice(hapusKambingIndex,1); saveKambings(); renderStep(); renderKelolaKambing(); } closeHapusKambing(); }

renderStep();
