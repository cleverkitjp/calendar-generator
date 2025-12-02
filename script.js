// ------------------------------------------------------
// グローバル変数
// ------------------------------------------------------
let activeSymbol = "";
let appliedSymbols = {}; // {"2025-03-20": "●▲✕★", ...}
let holidaysMap = {};    // {"2025-02-11": "建国記念の日", ...}
let holidaysLoaded = false;


// ------------------------------------------------------
// 日本の祝日データを読み込む（holidays-jp API）
// ------------------------------------------------------
async function loadHolidays() {
  if (holidaysLoaded) return;

  try {
    const res = await fetch("https://holidays-jp.github.io/api/v1/date.json");
    if (!res.ok) throw new Error("failed to fetch holidays");
    const data = await res.json();
    holidaysMap = data;  // キー: "YYYY-MM-DD", 値: 祝日名
    holidaysLoaded = true;
  } catch (e) {
    console.error("祝日データの取得に失敗しました", e);
    holidaysMap = {};
    holidaysLoaded = false;
  }
}


// ------------------------------------------------------
// テーマ適用
// ------------------------------------------------------
function applyTheme() {
  const select = document.getElementById("themeSelect");
  const val = select.value;
  const body = document.body;
  body.classList.remove("theme-cool", "theme-warm");

  if (val === "warm") {
    body.classList.add("theme-warm");
  } else {
    body.classList.add("theme-cool");
  }
}


// ------------------------------------------------------
// 記号ボタンの初期化（Step4）
// ------------------------------------------------------
function createSymbolButtons() {
  const symbols = [
    document.getElementById("sym1").value,
    document.getElementById("sym2").value,
    document.getElementById("sym3").value,
    document.getElementById("sym4").value,
  ];

  const area = document.getElementById("symbolButtons");
  if (!area) return;
  area.innerHTML = "";

  symbols.forEach(char => {
    if (!char) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = char;
    btn.dataset.symbol = char;

    btn.addEventListener("click", () => {
      [...area.children].forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeSymbol = btn.dataset.symbol;
    });

    area.appendChild(btn);
  });

  // 初期は最初のボタンを選択しておく
  if (area.firstChild) {
    area.firstChild.classList.add("active");
    activeSymbol = area.firstChild.dataset.symbol;
  }
}


// ------------------------------------------------------
// 期間内の月リスト生成（年月単位）
// ------------------------------------------------------
function getMonthsInRange(start, end) {
  const list = [];
  const s = new Date(start.getFullYear(), start.getMonth(), 1);
  const e = new Date(end.getFullYear(), end.getMonth(), 1);

  let cur = new Date(s);
  while (cur <= e) {
    list.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }
  return list;
}


// ------------------------------------------------------
// 凡例生成
// ------------------------------------------------------
function renderLegend() {
  const legendArea = document.getElementById("legendArea");
  legendArea.innerHTML = "";

  const pairs = [
    {
      char: document.getElementById("sym1").value,
      label: document.getElementById("sym1label").value
    },
    {
      char: document.getElementById("sym2").value,
      label: document.getElementById("sym2label").value
    },
    {
      char: document.getElementById("sym3").value,
      label: document.getElementById("sym3label").value
