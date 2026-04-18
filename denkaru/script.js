// --- 検査マスター (フルセット) ---
const TEST_MASTER = [
    ["WBC", "/μL", 3300, 8600], ["RBC", "10⁴/μL", 435, 555], ["Hb", "g/dL", 13.7, 16.8], ["Ht", "%", 40.7, 50.1], ["MCV", "fL", 83, 101], ["MCH", "pg", 27, 35], ["MCHC", "%", 32, 36], ["PLT", "10⁴/μL", 15.8, 34.8], ["Ret", "‰", 5, 20], ["Neut", "%", 40, 70], ["Lymph", "%", 20, 50], ["Mono", "%", 2, 10], ["Eos", "%", 0, 5], ["Baso", "%", 0, 2],
    ["AST", "U/L", 13, 30], ["ALT", "U/L", 10, 42], ["γ-GTP", "U/L", 13, 64], ["ALP", "U/L", 38, 113], ["LDH", "U/L", 124, 222], ["LAP", "U/L", 30, 70], ["CHE", "U/L", 214, 466], ["TP", "g/dL", 6.6, 8.1], ["Alb", "g/dL", 4.1, 5.1], ["A/G", "", 1.1, 2.0], ["T-Bil", "mg/dL", 0.4, 1.5], ["D-Bil", "mg/dL", 0.0, 0.3], ["I-Bil", "mg/dL", 0.2, 1.2], ["AMY", "U/L", 44, 132], ["P-AMY", "U/L", 10, 40], ["Lipase", "U/L", 10, 50], ["CK", "U/L", 59, 248], ["CK-MB", "U/L", 0, 25],
    ["BUN", "mg/dL", 8, 20], ["Cre", "mg/dL", 0.65, 1.07], ["eGFR", "mL/min", 60, 150], ["UA", "mg/dL", 3.7, 7.0], ["Na", "mEq/L", 138, 145], ["K", "mEq/L", 3.6, 4.8], ["Cl", "mEq/L", 101, 108], ["Ca", "mg/dL", 8.8, 10.1], ["IP", "mg/dL", 2.7, 4.6], ["Mg", "mg/dL", 1.8, 2.4], ["Fe", "μg/dL", 40, 188], ["UIBC", "μg/dL", 130, 360], ["TIBC", "μg/dL", 250, 450], ["Ferritin", "ng/mL", 20, 250],
    ["TC", "mg/dL", 142, 248], ["LDL-C", "mg/dL", 65, 163], ["HDL-C", "mg/dL", 40, 99], ["TG", "mg/dL", 40, 149], ["Non-HDL-C", "mg/dL", 90, 190], ["BS", "mg/dL", 73, 109], ["HbA1c", "%", 4.9, 6.0], ["GA", "%", 11, 16], ["1,5-AG", "μg/mL", 14, 45], ["Ins", "μU/mL", 2, 12],
    ["CRP", "mg/dL", 0, 0.14], ["ESR", "mm/h", 2, 10], ["RF", "IU/mL", 0, 15], ["ASLO", "IU/mL", 0, 240], ["MMP-3", "ng/mL", 17, 60], ["TSH", "μU/mL", 0.6, 4.5], ["FT3", "pg/mL", 2.3, 4.0], ["FT4", "ng/dL", 0.9, 1.7], ["PSA", "ng/mL", 0, 4], ["CEA", "ng/mL", 0, 5], ["AFP", "ng/mL", 0, 10], ["CA19-9", "U/mL", 0, 37], ["CA125", "U/mL", 0, 35], ["SCC", "ng/mL", 0, 1.5], ["PT", "sec", 10, 13], ["APTT", "sec", 25, 40], ["Fib", "mg/dL", 200, 400], ["FDP", "μg/mL", 0, 5], ["D-dimer", "μg/mL", 0, 1], ["HBsAg", "S/CO", 0, 0.9], ["HCVAb", "S/CO", 0, 0.9], ["HIV", "", 0, 0], ["RPR", "U", 0, 1], ["TPLA", "U", 0, 10], ["BNP", "pg/mL", 0, 18.4], ["NT-proBNP", "pg/mL", 0, 125], ["IgE", "IU/mL", 0, 170], ["IgG", "mg/dL", 860, 1740], ["IgA", "mg/dL", 93, 393], ["IgM", "mg/dL", 33, 183], ["C3", "mg/dL", 73, 138], ["C4", "mg/dL", 11, 31]
];

// オーダーセットマッピング
const ORDER_MAP = {
    "Basic": [0,1,2,3,4,5,6,7,8,9,10,11,12,13],
    "Liver": [14,15,16,17,18,19,20,21,22,23,24,25,26],
    "Renal": [32,33,34,35,36,37,38,39,40,41],
    "Lipid": [46,47,48,49,50],
    "Diabetes": [51,52,53,54,55],
    "Immune": [56,57,58,59,60,82,83,84,85,86,87],
    "Thyroid": [61,62,63,64],
    "Tumor": [65,66,67,68,69],
    "Coag": [70,71,72,73,74],
    "Infect": [75,76,77,78,79],
    "Heart": [80,81,30,31],
    "Iron": [42,43,44,45]
};

let patients = [];
let curIdx = -1;
let orderQueue = [];

// --- 1. Login ---
function login() {
    const u = document.getElementById("username").value;
    const p = document.getElementById("password").value;
    if(u && p) {
        document.getElementById("loginScreen").style.display = "none";
        document.getElementById("mainApp").style.display = "flex";
        loadFromLocal();
        if(patients.length === 0) addPatient();
    } else { alert("User ID and Password required."); }
}

function showTab(id) {
    document.querySelectorAll(".tabContent").forEach(t => t.style.display = "none");
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    document.getElementById(id).style.display = "block";
    event.currentTarget.classList.add("active");
}

// --- 2. Patient Data & Lock ---
function addPatient() {
    const p = {
        id: "ID-" + Math.floor(Math.random()*90000+10000),
        name: "新患 太郎", birth: "1980-01-01", gender: "男性", age: "--",
        isLocked: false, soap: [], exams: []
    };
    patients.push(p);
    curIdx = patients.length - 1;
    syncUI();
}

function syncUI() {
    const sel = document.getElementById("patientSelector");
    sel.innerHTML = patients.map((p,i) => `<option value="${i}">${p.name} (${p.id})</option>`).join("");
    sel.value = curIdx;
    sel.onchange = (e) => { curIdx = parseInt(e.target.value); loadPatient(); };
    loadPatient();
}

function loadPatient() {
    const p = patients[curIdx];
    document.getElementById("ptNameInput").value = p.name;
    document.getElementById("ptBirthInput").value = p.birth;
    document.getElementById("ptGenderInput").value = p.gender;
    document.getElementById("ptAgeDisplay").value = p.age;

    const fields = ["ptNameInput", "ptBirthInput", "ptGenderInput"];
    fields.forEach(f => document.getElementById(f).disabled = p.isLocked);
    document.getElementById("btnLock").style.display = p.isLocked ? "none" : "block";
    document.getElementById("btnUnlock").style.display = p.isLocked ? "block" : "none";
    document.getElementById("lockBadge").innerText = p.isLocked ? "LOCKED" : "UNLOCKED";
    document.getElementById("lockBadge").style.color = p.isLocked ? "red" : "#10b981";

    document.getElementById("headerName").innerText = p.name;
    document.getElementById("headerID").innerText = p.id;
    document.getElementById("headerMeta").innerText = `${p.age} / ${p.gender}`;

    renderSoap();
    renderResults();
    renderQueue();
}

function autoCalcAge() {
    const b = document.getElementById("ptBirthInput").value;
    if(!b) return;
    const age = new Date().getFullYear() - new Date(b).getFullYear();
    document.getElementById("ptAgeDisplay").value = age + " 歳";
}

function lockPatientInfo() {
    const p = patients[curIdx];
    p.name = document.getElementById("ptNameInput").value;
    p.birth = document.getElementById("ptBirthInput").value;
    p.gender = document.getElementById("ptGenderInput").value;
    p.age = document.getElementById("ptAgeDisplay").value;
    p.isLocked = true;
    loadPatient();
}

function unlockPatientInfo() {
    if(confirm("【警告】情報を編集可能に戻しますか？ 既存記録との不整合が発生する恐れがあります。")) {
        patients[curIdx].isLocked = false;
        loadPatient();
    }
}

// --- 3. SOAP ---
function saveSoapNote() {
    const val = document.getElementById("newSoapInput").value;
    if(!val) return;
    patients[curIdx].soap.push({ time: new Date().toLocaleString(), text: val });
    document.getElementById("newSoapInput").value = "";
    renderSoap();
}

function renderSoap() {
    const area = document.getElementById("soapHistory");
    area.innerHTML = patients[curIdx].soap.map(s => `
        <div class="soap-card">
            <div class="soap-time"><i class="fas fa-lock"></i> ${s.time} - Immutable Record</div>
            <div class="soap-body">${s.text}</div>
        </div>
    `).join("");
}

// --- 4. Lab & Canvas ---
function issueOrder() {
    const sets = [];
    document.querySelectorAll(".order-item:checked").forEach(i => sets.push(i.value));
    if(sets.length === 0) return alert("Select at least one set.");
    orderQueue.push({ ptIdx: curIdx, ptName: patients[curIdx].name, sets, time: new Date().toLocaleTimeString() });
    document.querySelectorAll(".order-item").forEach(i => i.checked = false);
    renderQueue();
}

function renderQueue() {
    const div = document.getElementById("pendingOrderList");
    div.innerHTML = orderQueue.map((o,i) => `
        <div style="background:#f1f5f9; padding:10px; border-radius:8px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
            <span>[${o.time}] ${o.ptName} - ${o.sets.join(", ")}</span>
            <button onclick="executeLab(${i})" class="btn-lock-main">測定実行</button>
        </div>
    `).join("") || "No pending orders.";
}

function executeLab(idx) {
    const ord = orderQueue[idx];
    const pt = patients[ord.ptIdx];
    const rep = { date: new Date().toLocaleString(), data: {} };

    ord.sets.forEach(setName => {
        ORDER_MAP[setName].forEach(id => {
            const m = TEST_MASTER[id];
            const val = (Math.random() * (m[3]*1.1 - m[2]*0.9) + m[2]*0.9).toFixed(1);
            rep.data[m[0]] = { val, unit: m[1], min: m[2], max: m[3] };
        });
    });

    pt.exams.unshift(rep);
    orderQueue.splice(idx,1);
    renderQueue();
    renderResults();
    alert("Analysis complete.");
}

function renderResults() {
    const pt = patients[curIdx];
    const area = document.getElementById("resultTableArea");
    if(pt.exams.length === 0) return area.innerHTML = "No lab data found.";

    let h = "<table><tr><th>ITEM</th><th>VALUE</th><th>REF RANGE</th><th>DATE</th></tr>";
    pt.exams.forEach(e => {
        for(let k in e.data) {
            const d = e.data[k];
            const cls = (d.val > d.max) ? "high" : (d.val < d.min) ? "low" : "";
            h += `<tr><td>${k}</td><td class="${cls}">${d.val} ${d.unit}</td><td>${d.min}-${d.max}</td><td><small>${e.date}</small></td></tr>`;
        }
    });
    area.innerHTML = h + "</table>";
}

// --- 5. Canvas Simulations ---
function startPCRSim() {
    const c = document.getElementById("pcrCanvas");
    const ctx = c.getContext("2d");
    ctx.clearRect(0,0,c.width,c.height);
    let x = 0;
    function animate() {
        if(x > c.width) return;
        ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 3;
        ctx.beginPath();
        const y = c.height - (Math.pow(1.025, x) * 0.8) - 20;
        ctx.lineTo(x, y); ctx.stroke();
        x += 2; requestAnimationFrame(animate);
    }
    animate();
}

function startImmunoSim(isPos) {
    const c = document.getElementById("immunoCanvas");
    const ctx = c.getContext("2d");
    ctx.clearRect(0,0,c.width,c.height);
    ctx.fillStyle = "#fff"; ctx.fillRect(10,10,280,60);
    let alpha = 0;
    const inv = setInterval(() => {
        alpha += 0.02; if(alpha >= 1) clearInterval(inv);
        ctx.clearRect(0,0,300,80);
        ctx.fillStyle = "#fff"; ctx.fillRect(10,10,280,60);
        // C Line
        ctx.fillStyle = `rgba(255,0,0,${alpha})`; ctx.fillRect(220,15,6,50);
        // T Line
        if(isPos) { ctx.fillStyle = `rgba(255,0,0,${alpha})`; ctx.fillRect(120,15,6,50); }
        ctx.fillStyle = "#000"; ctx.font = "bold 12px Arial";
        ctx.fillText("T", 120, 75); ctx.fillText("C", 220, 75);
    }, 50);
}

// --- 6. Persistence ---
function saveToLocal() { localStorage.setItem("MED_OS_V1", JSON.stringify({p:patients, q:orderQueue})); alert("All data synchronized."); }
function loadFromLocal() {
    const d = JSON.parse(localStorage.getItem("MED_OS_V1"));
    if(d) { patients = d.p; orderQueue = d.q; syncUI(); }
}
function clearSystem() { if(confirm("Clear system?")) { localStorage.clear(); location.reload(); } }