const LS_KEY = 'catatanPraktikumDini_v1';
const namaEl = document.getElementById('nama');
const tanggalEl = document.getElementById('tanggal');
const tekananEl = document.getElementById('tekanan');
const nadiEl = document.getElementById('nadi');
const suhuEl = document.getElementById('suhu');
const simpanBtn = document.getElementById('simpanBtn');
const feedback = document.getElementById('feedback');
const lastList = document.getElementById('lastList');
const exportBtn = document.getElementById('exportBtn');
const clearBtn = document.getElementById('clearBtn');
const refreshBtn = document.getElementById('refreshBtn');
const undoBtn = document.getElementById('undoBtn');
const limitEl = document.getElementById('limit');
const chartCanvas = document.getElementById('chart');
let myChart;

function nowStr() {
  const d = new Date();
  return d.toLocaleString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

tanggalEl.value = nowStr();

function readData() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
}
function writeData(arr) {
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
}
function showFeedback(msg) {
  feedback.style.display = 'block';
  feedback.textContent = msg;
  setTimeout(() => feedback.style.display = 'none', 3500);
}
function renderList() {
  const arr = readData();
  lastList.innerHTML = '';
  if (arr.length === 0) {
    lastList.innerHTML = '<div class="tiny">Belum ada catatan.</div>';
    return;
  }
  const recent = arr.slice(-30).reverse();
  recent.forEach(item => {
    const div = document.createElement('div');
    div.className = 'entry save-anim';
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between">
        <strong>${item.nama}</strong>
        <span class="tiny">${item.tanggal}</span>
      </div>
      <div class="tiny" style="margin-top:6px">
        Tekanan: ${item.tekanan} · Nadi: ${item.nadi} bpm · Suhu: ${item.suhu} °C
      </div>`;
    lastList.appendChild(div);
  });
}

function updateChart() {
  const data = readData();
  const limit = parseInt(limitEl.value);
  const sliced = data.slice(-limit);
  const labels = sliced.map(x => x.tanggal);
  const nadi = sliced.map(x => x.nadi);
  const suhu = sliced.map(x => x.suhu);
  if (myChart) myChart.destroy();
  myChart = new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Denyut Nadi (bpm)', data: nadi, borderColor: '#7fb3ff', tension: 0.4 },
        { label: 'Suhu (°C)', data: suhu, borderColor: '#bfe3ff', tension: 0.4 }
      ]
    },
    options: { scales: { y: { beginAtZero: false } }, responsive: true }
  });
}

simpanBtn.addEventListener('click', () => {
  const nama = namaEl.value.trim();
  const tekanan = tekananEl.value.trim();
  const nadi = parseFloat(nadiEl.value);
  const suhu = parseFloat(suhuEl.value);
  const tanggal = nowStr();
  if (!nama || !tekanan || isNaN(nadi) || isNaN(suhu)) {
    showFeedback('Harap isi semua kolom dulu ya, Sayangg 🌸');
    return;
  }
  const arr = readData();
  arr.push({ nama, tekanan, nadi, suhu, tanggal });
  writeData(arr);
  tanggalEl.value = tanggal;
  tekananEl.value = ''; nadiEl.value = ''; suhuEl.value = '';
  renderList(); updateChart();
  const msgs = [
    'Hebat Dini hari ini ❤️✨',
    'Catatanmu udah tersimpan rapi, Nurse Dini 🩺💫',
    'Keren banget, terus semangat yaaaww❤️'
  ];
  showFeedback(msgs[Math.floor(Math.random() * msgs.length)]);
});

exportBtn.addEventListener('click', () => {
  const arr = readData();
  if (arr.length === 0) return showFeedback('Belum ada data buat diexport 💙');
  let csv = 'Nama,Tanggal,Tekanan,Nadi,Suhu\\n';
  arr.forEach(x => csv += `${x.nama},${x.tanggal},${x.tekanan},${x.nadi},${x.suhu}\\n`);
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'catatan_praktikum_dini.csv';
  a.click();
});

clearBtn.addEventListener('click', () => {
  if (confirm('Yakin mau hapus semua data, Dini?')) {
    localStorage.removeItem(LS_KEY);
    renderList(); updateChart();
  }
});
refreshBtn.addEventListener('click', () => updateChart());
undoBtn.addEventListener('click', () => {
  const arr = readData();
  arr.pop(); writeData(arr);
  renderList(); updateChart();
  showFeedback('Catatan terakhir dihapus 💙');
});

renderList();
updateChart();
