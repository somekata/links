// --- 検査項目マスターデータ ---
const MASTER = [
    ["WBC","/uL",3300,8600], ["RBC","10^4/uL",435,555], ["Hb","g/dL",13.7,16.8], ["Ht","%",40.7,50.1], ["PLT","10^4/uL",15.8,34.8],
    ["AST","U/L",13,30], ["ALT","U/L",10,42], ["GTP","U/L",13,64], ["ALP","U/L",38,113], ["LDH","U/L",124,222],
    ["BUN","mg/dL",8,20], ["Cre","mg/dL",0.65,1.07], ["UA","mg/dL",3.7,7.0], ["Na","mEq/L",138,145], ["K","mEq/L",3.6,4.8],
    ["TC","mg/dL",142,248], ["LDL","mg/dL",65,163], ["TG","mg/dL",40,149], ["BS","mg/dL",73,109], ["HbA1c","%",4.9,6.0],
    ["CRP","mg/dL",0,0.14], ["TSH","uU/mL",0.6,4.5], ["FT4","ng/dL",0.9,1.7], ["PSA","ng/mL",0,4]
    // ※ 実際にはここを増やすだけで100項目以上に対応可能
];

const SETS = {
    "Basic": ["WBC","RBC","Hb","Ht","PLT"],
    "Liver": ["AST","ALT","GTP","ALP","LDH"],
    "Renal": ["BUN","Cre","UA","Na","K"],
    "Lipid": ["TC","LDL","TG"],
    "Diabetes": ["BS","HbA1c"],
    "Inflam": ["CRP"]
};

let patients = [];
let currentPatientIndex = -1;
let orderQueue = [];

// 1. ログイン
function login() {
    const u = document.getElementById("username").value;
    const p = document.getElementById("password").value;
    if(u && p) {
        document.getElementById("loginScreen").style.display = "none";
        document.getElementById("mainApp").style.display = "flex";
        loadLocal();
        if(patients.length === 0) addPatient();
    } else {
        alert("IDとパスワードを入力してください（デモ用なので何でもOKです）");
    }
}

// 2. タブ・UI制御
function showTab(id) {
    document.querySelectorAll(".tabContent").forEach(t => t.style.display = "none");
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    document.getElementById(id).style.display = "block";
    event.currentTarget.classList.add("active");
}

function updateHeader() {
    const p = patients[currentPatientIndex];
    if(!p) return;
    p.name = document.getElementById("name").value;
    document.getElementById("headerName").innerText = p.name || "患者氏名未入力";
    document.getElementById("headerID").innerText = `ID: ${p.id}`;
}

// 3. 患者管理
function addPatient() {
    const newP = {
        id: "P-" + Math.floor(Math.random()*90000+10000),
        name: "新規患者", birthDate: "", alerts: "", soap: "", tests: []
    };
    patients.push(newP);
    currentPatientIndex = patients.length - 1;
    syncList();
    loadPatient();
}

function syncList() {
    const sel = document.getElementById("patientSelector");
    sel.innerHTML = patients.map((p,i) => `<option value="${i}">${p.name} (${p.id})</option>`).join("");
    sel.onchange = (e) => { currentPatientIndex = e.target.value; loadPatient(); };
}

function loadPatient() {
    const p = patients[currentPatientIndex];
    document.getElementById("name").value = p.name;
    document.getElementById("birthDate").value = p.birthDate;
    document.getElementById("alerts").value = p.alerts;
    document.getElementById("soapBox").value = p.soap;
    updateHeader();
    renderResults();
    renderQueue();
}

// 4. オーダー・実施
function issueOrder() {
    const selected = [];
    document.querySelectorAll(".order-item:checked").forEach(i => selected.push(i.value));
    if(selected.length === 0) return alert("検査を選んでください");

    orderQueue.push({
        ptIdx: currentPatientIndex,
        ptName: patients[currentPatientIndex].name,
        sets: selected,
        time: new Date().toLocaleTimeString()
    });
    alert("オーダーを送信しました");
    document.querySelectorAll(".order-item").forEach(i => i.checked = false);
    renderQueue();
}

function renderQueue() {
    const div = document.getElementById("pendingOrderList");
    div.innerHTML = orderQueue.map((o,i) => `
        <div style="background:#f1f5f9; padding:10px; border-radius:5px; margin-bottom:5px; display:flex; justify-content:space-between; align-items:center;">
            <span>[${o.time}] ${o.ptName}: ${o.sets.join(", ")}</span>
            <button onclick="executeTest(${i})" style="background:#10b981; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">実施</button>
        </div>
    `).join("") || "待機中のオーダーはありません";
}

function executeTest(idx) {
    const o = orderQueue[idx];
    const p = patients[o.ptIdx];
    const report = { date: new Date().toLocaleString(), items: {} };

    o.sets.forEach(setName => {
        SETS[setName].forEach(itemName => {
            const m = MASTER.find(x => x[0] === itemName);
            const val = (Math.random() * (m[3]*1.2 - m[2]*0.8) + m[2]*0.8).toFixed(1);
            report.items[itemName] = { val, unit: m[1], min: m[2], max: m[3] };
        });
    });

    p.tests.unshift(report);
    orderQueue.splice(idx,1);
    renderQueue();
    renderResults();
    alert("検査が完了しました");
}

function renderResults() {
    const p = patients[currentPatientIndex];
    const target = document.getElementById("resultTable");
    if(p.tests.length === 0) return target.innerHTML = "結果はありません";

    let html = "<table><tr><th>項目</th><th>結果</th><th>基準値</th><th>日時</th></tr>";
    p.tests.forEach(r => {
        for(let key in r.items) {
            const it = r.items[key];
            const isH = parseFloat(it.val) > it.max;
            const isL = parseFloat(it.val) < it.min;
            html += `<tr><td>${key}</td><td class="${isH?'val-high':isL?'val-low':''}">${it.val} ${it.unit}</td><td>${it.min}-${it.max}</td><td>${r.date}</td></tr>`;
        }
    });
    target.innerHTML = html + "</table>";
}

// 5. 特殊機能（PCR・画像）
function runPCR() {
    const area = document.getElementById("pcrStatus");
    let c = 0;
    const t = setInterval(() => {
        c++; area.innerText = `PCR増幅中... ${c}/40サイクル`;
        if(c>=40) { clearInterval(t); area.innerText = Math.random()>0.8 ? "POSITIVE (検出)" : "Negative (不検出)"; }
    }, 50);
}

function changeImg(id, type) {
    const el = document.getElementById(id);
    el.src = `https://via.placeholder.com/400?text=${type}`;
}

// 6. 保存・同期
function savePatientData() {
    const p = patients[currentPatientIndex];
    p.birthDate = document.getElementById("birthDate").value;
    p.alerts = document.getElementById("alerts").value;
    p.soap = document.getElementById("soapBox").value;
    localStorage.setItem("emr_vFinal", JSON.stringify({p:patients, q:orderQueue}));
    alert("ブラウザに保存しました");
}

function loadLocal() {
    const d = JSON.parse(localStorage.getItem("emr_vFinal"));
    if(d) { patients = d.p; orderQueue = d.q; syncList(); loadPatient(); }
}

function clearAllData() { if(confirm("消去しますか？")) { localStorage.clear(); location.reload(); } }
function updateAge() { updateHeader(); }