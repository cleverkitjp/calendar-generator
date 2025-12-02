// ------------------------------------------------------
// グローバル変数
// ------------------------------------------------------
let activeSymbol = "";
let appliedSymbols = {}; // {"2025-03-20": "●▲✕", ...}
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
    },
    {
      char: document.getElementById("sym4").value,
      label: document.getElementById("sym4label").value
    }
  ];

  const valid = pairs.filter(p => p.char && p.label);

  if (valid.length === 0) return;

  const title = document.createElement("div");
  title.className = "legend-title";
  title.textContent = "凡例";
  legendArea.appendChild(title);

  const row = document.createElement("div");
  row.className = "legend-row";

  valid.forEach(p => {
    const item = document.createElement("div");
    item.className = "legend-item";

    const symSpan = document.createElement("span");
    symSpan.className = "legend-symbol";
    symSpan.textContent = p.char;

    const labelSpan = document.createElement("span");
    labelSpan.textContent = p.label;

    item.appendChild(symSpan);
    item.appendChild(labelSpan);
    row.appendChild(item);
  });

  legendArea.appendChild(row);
}


// ------------------------------------------------------
// 曜日ヘッダーの生成
// ------------------------------------------------------
function createWeekdayHeader(weekStart) {
  const row = document.createElement("div");
  row.className = "weekday-row";

  const namesSunStart = ["日", "月", "火", "水", "木", "金", "土"];
  const namesMonStart = ["月", "火", "水", "木", "金", "土", "日"];
  const names = weekStart === "mon" ? namesMonStart : namesSunStart;

  names.forEach(name => {
    const cell = document.createElement("div");
    cell.className = "weekday-cell";
    cell.textContent = name;
    row.appendChild(cell);
  });

  return row;
}


// ------------------------------------------------------
// 1日に最大4つまで記号を入れるロジック
// ------------------------------------------------------
function toggleSymbolForDate(dateKey, symbolChar, symElement) {
  if (!symbolChar) return;
  let current = appliedSymbols[dateKey] || ""; // 例: "●▲"

  if (current.includes(symbolChar)) {
    // すでに含まれている → 取り除く
    current = current.split("").filter(c => c !== symbolChar).join("");
  } else {
    // 含まれていない → 追加（最大4つまで）
    if (current.length >= 4) {
      return;
    }
    current += symbolChar;
  }

  appliedSymbols[dateKey] = current;
  symElement.textContent = current;
}


// ------------------------------------------------------
// 月ごとレイアウトの生成
// ------------------------------------------------------
function renderMonthLayout(startDate, endDate, weekStart, area) {
  const months = getMonthsInRange(startDate, endDate);

  months.forEach(monthDate => {
    const y = monthDate.getFullYear();
    const m = monthDate.getMonth();

    const block = document.createElement("div");
    block.className = "month-block";

    const title = document.createElement("div");
    title.className = "month-title";
    title.textContent = `${y}年 ${m + 1}月`;
    block.appendChild(title);

    const weekdayHeader = createWeekdayHeader(weekStart);
    block.appendChild(weekdayHeader);

    const grid = document.createElement("div");
    grid.className = "calendar-grid";

    const firstDay = new Date(y, m, 1);
    const lastDay = new Date(y, m + 1, 0);
    const daysInMonth = lastDay.getDate();

    const offset = (weekStart === "sun")
      ? firstDay.getDay()
      : (firstDay.getDay() + 6) % 7;

    const totalCells = offset + daysInMonth;
    const rows = Math.ceil(totalCells / 7);
    const cells = rows * 7;

    for (let i = 0; i < cells; i++) {
      const cell = document.createElement("div");
      cell.className = "day-cell";

      if (i < offset || i >= offset + daysInMonth) {
        cell.classList.add("day-disabled");
        grid.appendChild(cell);
        continue;
      }

      const day = i - offset + 1;
      const curDate = new Date(y, m, day);
      const dateKey = curDate.toISOString().slice(0, 10);

      const dayNumber = document.createElement("div");
      dayNumber.textContent = day;

      const nativeDow = curDate.getDay(); // 0(日)〜6(土)
      const isSat = nativeDow === 6;
      const isSun = nativeDow === 0;
      const isHoliday = !!holidaysMap[dateKey];

      const outOfRange = curDate < startDate || curDate > endDate;

      if (outOfRange) {
        cell.classList.add("day-disabled");
      } else {
        if (isSat) cell.classList.add("sat");
        if (isSun || isHoliday) {
          cell.classList.add("sun");
          if (isHoliday && !isSun) cell.classList.add("holiday");
        }
      }

      cell.appendChild(dayNumber);

      const sym = document.createElement("div");
      sym.className = "symbol";
      sym.textContent = appliedSymbols[dateKey] || "";
      cell.appendChild(sym);

      if (!outOfRange) {
        cell.addEventListener("click", () => {
          if (!activeSymbol) return;
          toggleSymbolForDate(dateKey, activeSymbol, sym);
        });
      }

      grid.appendChild(cell);
    }

    block.appendChild(grid);
    area.appendChild(block);
  });
}


// ------------------------------------------------------
// 連続レイアウトの生成（1本のカレンダー）
// ------------------------------------------------------
function renderContinuousLayout(startDate, endDate, weekStart, area) {
  const block = document.createElement("div");
  block.className = "month-block";

  const title = document.createElement("div");
  title.className = "month-title";
  title.textContent = `${startDate.toISOString().slice(0, 10)} 〜 ${endDate.toISOString().slice(0, 10)}`;
  block.appendChild(title);

  const weekdayHeader = createWeekdayHeader(weekStart);
  block.appendChild(weekdayHeader);

  const grid = document.createElement("div");
  grid.className = "calendar-grid";

  const startKey = startDate.toISOString().slice(0, 10);

  const first = new Date(startDate);
  const nativeDowStart = first.getDay(); // 0(日)〜6(土)
  const offsetDays = weekStart === "sun" ? nativeDowStart : (nativeDowStart + 6) % 7;
  first.setDate(first.getDate() - offsetDays);

  const last = new Date(endDate);
  const nativeDowEnd = last.getDay();
  const offsetEnd = weekStart === "sun" ? nativeDowEnd : (nativeDowEnd + 6) % 7;
  const tailDays = 6 - offsetEnd;
  last.setDate(last.getDate() + tailDays);

  let cur = new Date(first);
  while (cur <= last) {
    const cell = document.createElement("div");
    cell.className = "day-cell";

    const dateKey = cur.toISOString().slice(0, 10);
    const nativeDow = cur.getDay();
    const isSat = nativeDow === 6;
    const isSun = nativeDow === 0;
    const isHoliday = !!holidaysMap[dateKey];

    const outOfRange = cur < startDate || cur > endDate;

    const dayNumber = document.createElement("div");
    if (!outOfRange && (dateKey === startKey || cur.getDate() === 1)) {
      dayNumber.textContent = `${cur.getMonth() + 1}/${cur.getDate()}`;
    } else {
      dayNumber.textContent = cur.getDate();
    }

    if (outOfRange) {
      cell.classList.add("day-disabled");
    } else {
      if (isSat) cell.classList.add("sat");
      if (isSun || isHoliday) {
        cell.classList.add("sun");
        if (isHoliday && !isSun) cell.classList.add("holiday");
      }
    }

    cell.appendChild(dayNumber);

    const sym = document.createElement("div");
    sym.className = "symbol";
    sym.textContent = appliedSymbols[dateKey] || "";
    cell.appendChild(sym);

    if (!outOfRange) {
      cell.addEventListener("click", () => {
        if (!activeSymbol) return;
        toggleSymbolForDate(dateKey, activeSymbol, sym);
      });
    }

    grid.appendChild(cell);
    cur.setDate(cur.getDate() + 1);
  }

  block.appendChild(grid);
  area.appendChild(block);
}


// ------------------------------------------------------
// カレンダー生成（祝日＆レイアウト対応）
// ------------------------------------------------------
async function generateCalendar() {
  appliedSymbols = {}; // 新規生成時は一度リセット

  const startDateStr = document.getElementById("startDate").value;
  const endDateStr = document.getElementById("endDate").value;
  const weekStart = document.getElementById("weekStart").value;
  const layoutMode = document.getElementById("layoutMode").value;

  if (!startDateStr || !endDateStr) {
    alert("開始日と終了日を入力してください");
    return;
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (endDate < startDate) {
    alert("終了日は開始日より後にしてください");
    return;
  }

  const maxEnd = new Date(startDate);
  maxEnd.setMonth(maxEnd.getMonth() + 6);
  if (endDate > maxEnd) {
    alert("期間は最大6ヶ月までです");
    return;
  }

  await loadHolidays();

  const area = document.getElementById("calendarArea");
  area.innerHTML = "";
  document.getElementById("resultArea").innerHTML = "";
  document.getElementById("shareBtn").style.display = "none";

  if (layoutMode === "continuous") {
    renderContinuousLayout(startDate, endDate, weekStart, area);
  } else {
    renderMonthLayout(startDate, endDate, weekStart, area);
  }

  renderLegend();
  createSymbolButtons();

  document.getElementById("makeImgBtn").style.display = "inline-block";
}


// ------------------------------------------------------
// メモ欄の高さを内容に合わせて自動調整
// ------------------------------------------------------
function autoResizeMemo() {
  const ta = document.getElementById("memoText");
  if (!ta) return;
  ta.style.height = "auto";
  ta.style.height = ta.scrollHeight + "px";
}


// ------------------------------------------------------
// PNG生成（カレンダー＋凡例＋メモ全体）
// ------------------------------------------------------
function makeImage() {
  autoResizeMemo();  // 画像化前にメモを展開

  const target = document.getElementById("calendarImageArea");
  if (!target) return;

  html2canvas(target, {
    scale: 2,
    backgroundColor: "#ffffff"
  }).then(canvas => {
    const img = document.createElement("img");
    img.src = canvas.toDataURL("image/png");
    img.className = "result-img";

    const result = document.getElementById("resultArea");
    result.innerHTML = "";
    result.appendChild(img);

    const share = document.getElementById("shareBtn");
    share.style.display = "block";
    share.dataset.image = img.src;
  }).catch(err => {
    console.error(err);
    alert("画像の生成に失敗しました。");
  });
}


// ------------------------------------------------------
// SNS共有
// ------------------------------------------------------
async function shareImage() {
  const base64 = document.getElementById("shareBtn").dataset.image;
  if (!base64) {
    alert("先に画像を作成してください。");
    return;
  }

  try {
    const res = await fetch(base64);
    const blob = await res.blob();
    const file = new File([blob], "calendar.png", { type: "image/png" });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "期間カレンダー",
        text: "期間カレンダーを共有します。",
      });
    } else if (navigator.share) {
      await navigator.share({
        title: "期間カレンダー",
        text: "期間カレンダーを共有します。",
      });
      alert("一部端末では画像が添付されない場合があります。画像を保存してから送信してください。");
    } else {
      alert("この端末では共有機能が使えません。画像を長押しして保存してから、SNSに貼り付けてください。");
    }
  } catch (e) {
    console.error(e);
    alert("共有に失敗しました。画像を保存してから送信してください。");
  }
}


// ------------------------------------------------------
// イベント登録
// ------------------------------------------------------
document.getElementById("generateCalBtn").addEventListener("click", () => {
  generateCalendar();
});

document.getElementById("makeImgBtn").addEventListener("click", makeImage);
document.getElementById("shareBtn").addEventListener("click", shareImage);
document.getElementById("themeSelect").addEventListener("change", applyTheme);

// メモ入力時に自動リサイズ
const memoEl = document.getElementById("memoText");
if (memoEl) {
  memoEl.addEventListener("input", autoResizeMemo);
}

// 初期設定
applyTheme();
createSymbolButtons();
autoResizeMemo();
