// =============================================================================
// GREEN INFO MOBILE APP SIMULATOR – PILOT ĐÀ LẠT (6m x 12m, 84 GỐC DƯA LƯỚI)
// Đồng bộ thông số 1:1 với Mô hình Web 3D & Hồ sơ Vòng 2 HUFLIT 2026
// =============================================================================

const WEATHER_DATA = {
  morning: {
    key: "morning",
    title: "Sáng sớm cao nguyên (Sương nhẹ)",
    pill: "Thu gọn pin 0% • Đón 100% sáng",
    desc: "Sương mỏng thung lũng Đà Lạt. Mái pin thu gọn sát vách để 84 gốc dưa đón trọn 100% quang hợp tán xạ sáng sớm.",
    tempOut: 19.5,
    tempDome: 19.5,
    humidityAir: 88,
    parPct: 100,
    parUmol: 920,
    rainMmHr: 0.0,
    windKmh: 9,
    windDir: "Đông Bắc",
    windGust: 14,
    deployDefault: 0,
    pvBase: 0.8,
    sunLabel: "Tán xạ dịu • UV vừa",
    badge: "Thu gọn (Đón sáng 100%)",
    heroCls: "morning",
    islandStatus: "Sáng sớm • Đón PAR",
    islandCls: "",
    forecast25m: {
      prob: "Xác suất 86%",
      text: "Nắng lên nhanh sau 35 phút nữa (bức xạ tăng > 680 W/m²). Khi nhiệt vòm tiến sát 31°C, Edge AI sẽ bắt đầu nâng pin từng bước lên phủ mái.",
    },
    hourly: [
      { t: "08:00", kind: "sun", temp: 19.5, rain: "5%", pv: "Pin 0%", now: true },
      { t: "10:00", kind: "sun", temp: 26.8, rain: "10%", pv: "Pin 35%" },
      { t: "12:00", kind: "sun", temp: 31.2, rain: "15%", pv: "Pin 100%" },
      { t: "14:00", kind: "cloud", temp: 29.4, rain: "25%", pv: "Pin 75%" },
      { t: "16:00", kind: "rain", temp: 21.0, rain: "60%", pv: "Pin 0%" },
      { t: "18:00", kind: "cloud", temp: 17.5, rain: "20%", pv: "Pin 0%" },
    ],
  },
  heatwave: {
    key: "heatwave",
    title: "Trưa nắng gắt bức xạ cao",
    pill: "Mái pin phủ nóc 100% • Cắt nhiệt -6.0°C",
    desc: "Tấm pin trượt lồng che đỉnh vòm cản bức xạ đỉnh trưa, giữ nhiệt vòm ổn định 31.2°C (thay vì 37.2°C) và phát 3.0 kW sạc LiFePO4.",
    tempOut: 37.2,
    tempDome: 31.2,
    humidityAir: 54,
    parPct: 62,
    parUmol: 680,
    rainMmHr: 0.0,
    windKmh: 7,
    windDir: "Đông Nam",
    windGust: 11,
    deployDefault: 100,
    pvBase: 3.0,
    sunLabel: "Nắng gắt • UV 9.2",
    badge: "Phủ nóc (Hạ nhiệt 37°C)",
    heroCls: "",
    islandStatus: "Trưa nắng • Che 100%",
    islandCls: "warn",
    forecast25m: {
      prob: "Xác suất 91%",
      text: "Nắng đỉnh duy trì thêm ~45 phút trước khi mây đối lưu buổi chiều kéo vào. AI tiếp tục giữ pin ở 100% để bảo vệ hạt phấn & chống sốc nhiệt trái.",
    },
    hourly: [
      { t: "12:30", kind: "sun", temp: 31.2, rain: "10%", pv: "Pin 100%", now: true },
      { t: "14:30", kind: "sun", temp: 30.5, rain: "20%", pv: "Pin 90%" },
      { t: "16:00", kind: "cloud", temp: 24.8, rain: "35%", pv: "Pin 25%" },
      { t: "18:00", kind: "cloud", temp: 19.6, rain: "30%", pv: "Pin 0%" },
      { t: "20:00", kind: "cloud", temp: 17.4, rain: "15%", pv: "Pin 0%" },
      { t: "22:00", kind: "cloud", temp: 16.2, rain: "10%", pv: "Pin 0%" },
    ],
  },
  rainstorm: {
    key: "rainstorm",
    title: "Mưa dông cao nguyên",
    pill: "Thu gọn pin 0% • Mái PE che mưa 100%",
    desc: "Màng PE mái vòm đã che mưa kín & xả về máng xối hở (±2,84–3,00 m) nạp đầy bồn chứa, tấm pin thu gọn sát vách đón 58% ánh sáng.",
    tempOut: 18.2,
    tempDome: 18.2,
    humidityAir: 93,
    parPct: 58,
    parUmol: 420,
    rainMmHr: 16.4,
    windKmh: 24,
    windDir: "Tây Nam",
    windGust: 32,
    deployDefault: 0,
    pvBase: 0.5,
    sunLabel: "Mưa vừa 16.4 mm/h",
    badge: "Thu gọn (Mái PE che mưa)",
    heroCls: "rain",
    islandStatus: "Mưa • Thu nước PE",
    islandCls: "",
    forecast25m: {
      prob: "Xác suất 88%",
      text: "Đám mây mưa di chuyển chậm hướng Đông Bắc; mưa kéo dài thêm 40–60 phút (~18 L/phút vào bồn chứa). AI khóa tưới để tránh dư ẩm giá thể.",
    },
    hourly: [
      { t: "15:30", kind: "rain", temp: 18.2, rain: "85%", pv: "Pin 0%", now: true },
      { t: "17:00", kind: "rain", temp: 17.5, rain: "70%", pv: "Pin 0%" },
      { t: "19:00", kind: "cloud", temp: 16.4, rain: "30%", pv: "Pin 0%" },
      { t: "21:00", kind: "cloud", temp: 15.5, rain: "20%", pv: "Pin 0%" },
      { t: "06:00", kind: "sun", temp: 16.8, rain: "15%", pv: "Pin 0%" },
      { t: "10:00", kind: "sun", temp: 25.4, rain: "15%", pv: "Pin 45%" },
    ],
  },
  typhoon: {
    key: "typhoon",
    title: "CẢNH BÁO GIÓ LỐC MẠNH",
    pill: "FAIL-SAFE: Khóa pin tại vách (0%)",
    desc: "Trạm đo gió góc phải ghi nhận gió 56 km/h (giật 68 km/h) vượt ngưỡng 45 km/h. Ngắt cứng kích hoạt khóa pin sát chân cột bảo vệ kết cấu.",
    tempOut: 17.0,
    tempDome: 17.0,
    humidityAir: 95,
    parPct: 46,
    parUmol: 310,
    rainMmHr: 28.5,
    windKmh: 56,
    windDir: "Đông Bắc",
    windGust: 68,
    deployDefault: 0,
    pvBase: 0.3,
    sunLabel: "Mưa bão 28.5 mm/h",
    badge: "FAIL-SAFE: Khóa bão!",
    heroCls: "typhoon",
    islandStatus: "FAIL-SAFE GIÓ 56",
    islandCls: "danger",
    forecast25m: {
      prob: "Cảnh báo 95%",
      text: "Cường độ gió giật tiếp tục dao động 50–68 km/h trong 30 phút tới. Hệ thống khóa cơ học giữ pin 0%, chỉ mở lại khi gió dưới 30 km/h liên tục 10 phút.",
    },
    hourly: [
      { t: "16:00", kind: "storm", temp: 17.0, rain: "95%", pv: "Khóa 0%", now: true },
      { t: "17:30", kind: "rain", temp: 16.8, rain: "80%", pv: "Khóa 0%" },
      { t: "19:30", kind: "rain", temp: 16.2, rain: "55%", pv: "Pin 0%" },
      { t: "22:00", kind: "cloud", temp: 15.2, rain: "25%", pv: "Pin 0%" },
      { t: "07:00", kind: "sun", temp: 18.0, rain: "15%", pv: "Pin 0%" },
      { t: "11:00", kind: "sun", temp: 27.6, rain: "15%", pv: "Pin 80%" },
    ],
  },
};

const DAYS_FORECAST = [
  { day: "Hôm nay", cond: "Sáng mây nhẹ • Trưa nắng gắt • Chiều có thể mưa dông", range: "16° – 30°C" },
  { day: "Ngày mai", cond: "Nắng xen mây cao nguyên, gió Đông Bắc 10–18 km/h", range: "15° – 28°C" },
  { day: "Ngày kia", cond: "Mưa rào chiều 65% • Tận dụng nạp 100% bồn nước mưa PE", range: "16° – 26°C" },
];

const STAGES = {
  vegetative: {
    key: "vegetative",
    day: 24,
    totalDays: 68,
    label: "Ngày 24 / 68 • Đậu trái & Nuôi thân",
    harvestTitle: "Dự kiến thu hoạch sau ~44 ngày",
    harvestSub: "84 gốc đang ở pha nuôi trái xanh non; cần đủ nước & NPK cân đối để đạt cỡ trái 1.4–1.8 kg.",
    targetMoist: [66, 75],
    targetEc: [1.8, 2.2],
    defaultWater: 1.55,
    baseMoisture: 70,
    baseEc: 1.95,
    baseN: 175,
    baseP: 68,
    baseK: 170,
  },
  netting: {
    key: "netting",
    day: 48,
    totalDays: 68,
    label: "Ngày 48 / 68 • Pha tạo vân lưới xanh",
    harvestTitle: "Dự kiến thu hoạch sau ~20 ngày",
    harvestSub: "32% quả bắt đầu chuyển vàng rạn lưới rõ; tăng Kali để dày cùi, chắc vỏ & hạn chế nứt trái.",
    targetMoist: [63, 72],
    targetEc: [2.0, 2.4],
    defaultWater: 1.45,
    baseMoisture: 68,
    baseEc: 2.1,
    baseN: 148,
    baseP: 62,
    baseK: 215,
  },
  harvest: {
    key: "harvest",
    day: 64,
    totalDays: 68,
    label: "Ngày 64 / 68 • Canh chín & Cắt nước",
    harvestTitle: "Thu hoạch rộ sau ~4 ngày nữa",
    harvestSub: "Lứa đầu chín sớm đã đạt ≥14° Brix sẵn sàng cắt hôm nay; nhóm còn lại đang dồn đường chờ hái.",
    targetMoist: [52, 62],
    targetEc: [2.1, 2.5],
    defaultWater: 0.95,
    baseMoisture: 59,
    baseEc: 2.25,
    baseN: 112,
    baseP: 58,
    baseK: 255,
  },
};

const ROW_NAMES = ["A", "B", "C", "D"];

// =============================================================================
// APPLICATION STATE
// =============================================================================
const state = {
  weatherKey: "heatwave",
  stageKey: "harvest",
  solarDeploy: 100,
  moisturePct: 59,
  waterPerPlantL: 0.95,
  tankPct: 78,
  ec: 2.25,
  ph: 6.2,
  n: 112,
  p: 58,
  k: 255,
  cropFilter: "all",
  selectedPlantId: "A04",
  activeTab: "overview",
  plants: [],
  chatMessages: [
    {
      role: "bot",
      text: "Xin chào! Tôi là Trợ lý AI Green Info. Dữ liệu từ 2 trạm đất kiểu Enfarm, trạm gió & mái pin đã sẵn sàng — bạn có thể hỏi về nhu cầu nước, phân, số quả xanh/chín hoặc dự báo thời tiết mái vòm.",
    },
  ],
};

// Build deterministic 84-plant spatial model matching greenhouse geometry (4 rows x 21 plants)
function generatePlants(stageKey) {
  const stage = STAGES[stageKey];
  const plants = [];
  for (let r = 0; r < 4; r++) {
    const rowLetter = ROW_NAMES[r];
    const outerBoost = r === 0 || r === 3 ? 3 : 0; // outer sunlit aisles mature slightly faster
    for (let idx = 1; idx <= 21; idx++) {
      const id = `${rowLetter}${idx < 10 ? "0" + idx : idx}`;
      const hash = ((r * 37 + idx * 19 + 11) % 13) - 6; // -6..+6 natural biological spread
      let ripenessPct = 0;
      if (stageKey === "vegetative") {
        ripenessPct = Math.max(12, Math.min(48, 28 + outerBoost + hash));
      } else if (stageKey === "netting") {
        ripenessPct = Math.max(38, Math.min(82, 64 + outerBoost + hash * 2));
      } else {
        // Staggered pollination waves along row positions so ripe, turning, and still-green melons coexist naturally
        const cohortOffset = idx >= 15 ? -15 : idx <= 5 ? 6 : 0;
        ripenessPct = Math.max(48, Math.min(99, 77 + outerBoost * 2 + cohortOffset + hash * 2.5));
      }
      ripenessPct = Math.round(ripenessPct);

      let status = "green";
      if (ripenessPct >= 88) status = "ripe";
      else if (ripenessPct >= 66) status = "turning";

      const brix = Number((7.5 + (ripenessPct / 100) * 7.6).toFixed(1));
      const daysToHarvest =
        status === "ripe"
          ? 0
          : Math.max(1, Math.round(((88 - ripenessPct) / 100) * stage.totalDays * 0.65));

      const hasEnfarm = id === "A04" || id === "C14";
      plants.push({
        id,
        row: rowLetter,
        num: idx,
        ripenessPct,
        status,
        brix,
        daysToHarvest,
        hasEnfarm,
      });
    }
  }
  return plants;
}

// =============================================================================
// COMPUTED LIVE DIAGNOSTICS & AI RECOMMENDER
// =============================================================================
function getLiveClimate() {
  const w = WEATHER_DATA[state.weatherKey];
  const d = state.solarDeploy / 100;
  const parFactor = 1.0 - 0.38 * d;
  const basePar = w.key === "rainstorm" ? 58 : w.key === "typhoon" ? 46 : 100;
  const parPct = Math.round(basePar * parFactor);
  const parUmol = Math.round((w.key === "rainstorm" ? 420 : w.key === "typhoon" ? 310 : 1096) * parFactor);
  const tempDome =
    w.key === "heatwave"
      ? Number((w.tempOut - 6.0 * d).toFixed(1))
      : Number((w.tempOut - 1.1 * d).toFixed(1));
  const pvScale = w.key === "rainstorm" || w.key === "typhoon" ? 0.35 : 1.0;
  const pvKw = Number(((0.7 + 2.3 * d) * pvScale).toFixed(1));
  return { w, d, parPct, parUmol, tempDome, pvKw };
}

function getRipenessCounts() {
  let green = 0, turning = 0, ripe = 0, sumBrix = 0, sumDays = 0, notRipe = 0;
  for (const p of state.plants) {
    if (p.status === "ripe") ripe++;
    else if (p.status === "turning") turning++;
    else green++;
    sumBrix += p.brix;
    if (p.daysToHarvest > 0) {
      sumDays += p.daysToHarvest;
      notRipe++;
    }
  }
  const avgBrix = (sumBrix / state.plants.length).toFixed(1);
  const avgDaysLeft = notRipe > 0 ? Math.max(1, Math.round(sumDays / notRipe)) : 0;
  return { green, turning, ripe, avgBrix, avgDaysLeft };
}

function computeAiPlan() {
  const clim = getLiveClimate();
  const stg = STAGES[state.stageKey];
  const counts = getRipenessCounts();
  const [mMin, mMax] = stg.targetMoist;

  const needs = [];
  let riskLevel = "ok";
  let riskLabel = "Tối ưu ổn định";
  let headline = "";

  // 1. Water analysis
  if (state.moisturePct < mMin) {
    needs.push(
      `Thiếu ẩm vùng rễ (${state.moisturePct}% < ngưỡng ${mMin}%): Cần kích hoạt tưới nhỏ giọt +250 ml/gốc từ bồn nước mưa PE.`
    );
    riskLevel = "warn";
    riskLabel = "Cần bù nước";
  } else if (state.moisturePct > mMax) {
    needs.push(
      `Ẩm giá thể cao (${state.moisturePct}% > ${mMax}%): Cần tạm dừng van tưới để tránh thối rễ & giữ độ ngọt Brix (đặc biệt đang có ${counts.ripe + counts.turning} cây vào pha chín).`
    );
    if (state.stageKey === "harvest") {
      riskLevel = "warn";
      riskLabel = "Siết nước tạo ngọt";
    }
  } else {
    needs.push(`Độ ẩm giá thể (${state.moisturePct}%) nằm đúng dải chuẩn ${mMin}–${mMax}% (${state.waterPerPlantL.toFixed(2)} L/gốc/ngày).`);
  }

  // 2. Nutrient (Enfarm 7-in-1) analysis
  if (state.stageKey !== "vegetative" && state.k < 210) {
    needs.push(`Kali hiện tại (${state.k} ppm) hơi thấp cho pha tạo lưới/ngọt quả: Đề xuất châm thêm Kali sunfat lên 220–260 ppm.`);
    if (riskLevel === "ok") {
      riskLevel = "warn";
      riskLabel = "Cần tăng Kali";
    }
  } else {
    needs.push(`Cảm biến 7 chỉ số kiểu Enfarm: EC ${state.ec.toFixed(2)} mS/cm • pH ${state.ph.toFixed(1)} • N-P-K (${state.n}/${state.p}/${state.k} ppm) đạt chuẩn cân bằng.`);
  }

  // 3. Light / Heat / Wind Fail-Safe roof analysis
  if (clim.w.key === "typhoon") {
    riskLevel = "danger";
    riskLabel = "Cảnh báo gió bão";
    headline = `Bão lốc ${clim.w.windKmh} km/h: Hệ thống khóa pin 0% (Fail-Safe), ngắt tưới & xả tràn máng xối về bồn PE.`;
    needs.push(`Giữ nguyên tấm pin tại vách đứng (0%): An toàn tuyệt đối trước gió giật ${clim.w.windGust} km/h.`);
  } else if (clim.w.key === "heatwave" && state.solarDeploy < 70) {
    riskLevel = "danger";
    riskLabel = "Nguy cơ sốc nhiệt";
    headline = `CẢNH BÁO NÓNG ${clim.tempDome}°C! Cây đang thiếu che chắn — trượt ngay pin lên phủ đỉnh 100% để hạ về ~31.2°C.`;
    needs.push(`Nhiệt vòm vượt 33°C dễ làm yếu hạt phấn & nứt quả đang chín. Trượt pin lên 100% giúp hạ ngay ~6°C.`);
  } else if (clim.w.key === "rainstorm") {
    headline = `Trời mưa dông 18.2°C: Khóa van tưới nhỏ giọt, giữ pin 0% bên vách vì mái PE đã che mưa kín 100%.`;
    needs.push(`Mái PE gom ~18 L/phút vào bồn chứa (hiện đạt ${state.tankPct}%). Tận dụng ánh sáng tán xạ 58% PAR.`);
  } else if (counts.ripe > 0) {
    headline = `Có ${counts.ripe} quả đã chín (≥13.8° Brix) sẵn sàng cắt hôm nay; giảm nhẹ nước tưới giúp lứa ${counts.turning} quả gần chín tăng đường nhanh.`;
    needs.push(`Mái vòm đạt ${clim.tempDome}°C & ${clim.parPct}% PAR: Môi trường lý tưởng để cô đặc đường buổi sáng.`);
  } else {
    headline = `Cây sinh trưởng khỏe ở ${clim.tempDome}°C & ${clim.parPct}% PAR. Dự kiến thu hoạch rộ sau ~${counts.avgDaysLeft} ngày nữa.`;
    needs.push(`Duy trì chế độ mái pin ${state.solarDeploy}% theo bức xạ hiện hành để tối ưu tỷ lệ đậu quả Loại 1.`);
  }

  return { clim, stg, counts, headline, needs, riskLevel, riskLabel };
}

// =============================================================================
// CUSTOM PROCEDURAL FRUIT VISUAL & UI RENDERING
// =============================================================================
function renderMelonSvg(plant) {
  const isRipe = plant.status === "ripe";
  const isTurn = plant.status === "turning";
  const baseFill = isRipe ? "#eab308" : isTurn ? "#84cc16" : "#15803d";
  const hiFill = isRipe ? "#fef08a" : isTurn ? "#d9f99d" : "#4ade80";
  const netStroke = isRipe ? "#fefce8" : isTurn ? "#ecfccb" : "#86efac";
  const netOpacity = isRipe ? 0.92 : isTurn ? 0.68 : 0.25;
  const stemCracked = isRipe ? '<circle cx="32" cy="14" r="4" fill="none" stroke="#92400e" stroke-width="1.6" stroke-dasharray="2 1.5"/>' : "";

  return `
    <svg viewBox="0 0 64 64" width="56" height="56">
      <defs>
        <radialGradient id="mGrad_${plant.id}" cx="35%" cy="32%" r="68%">
          <stop offset="0%" stop-color="${hiFill}"/>
          <stop offset="55%" stop-color="${baseFill}"/>
          <stop offset="100%" stop-color="#064e3b"/>
        </radialGradient>
      </defs>
      <path d="M32 14 C32 8, 37 6, 40 8" fill="none" stroke="#15803d" stroke-width="3" stroke-linecap="round"/>
      ${stemCracked}
      <ellipse cx="32" cy="36" rx="20" ry="22" fill="url(#mGrad_${plant.id})"/>
      <g fill="none" stroke="${netStroke}" stroke-width="1.15" opacity="${netOpacity}">
        <path d="M22 17 Q30 36 22 55"/>
        <path d="M32 14 Q35 36 32 58"/>
        <path d="M42 17 Q34 36 42 55"/>
        <path d="M14 29 Q32 34 50 29"/>
        <path d="M13 39 Q32 45 51 39"/>
        <path d="M18 48 Q32 51 46 48"/>
      </g>
    </svg>`;
}

function getForecastIconSvg(kind) {
  if (kind === "sun") {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/></svg>`;
  }
  if (kind === "storm") {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" stroke-linecap="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="m13 13-2 4h3l-2 4"/></svg>`;
  }
  if (kind === "rain") {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round"><path d="M17.5 15H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="M8 19v2M12 19v2M16 19v2"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`;
}

function renderOrchardGrid() {
  const gridEl = document.getElementById("orchard-grid");
  const filter = state.cropFilter;
  let html = "";

  for (let r = 0; r < 4; r++) {
    const rowLetter = ROW_NAMES[r];
    const rowPlants = state.plants.filter((p) => p.row === rowLetter);
    html += `<div class="row-col"><div class="row-label">Luống ${rowLetter}</div><div class="row-cells">`;
    for (const p of rowPlants) {
      const dim = filter !== "all" && p.status !== filter ? "dim" : "";
      const sel = p.id === state.selectedPlantId ? "selected" : "";
      const enf = p.hasEnfarm ? "has-enfarm" : "";
      html += `<button class="plant-dot ${p.status} ${dim} ${sel} ${enf}" data-plant-id="${p.id}" title="${p.id}: ${p.brix}° Brix">${p.num}</button>`;
    }
    html += `</div></div>`;
  }
  gridEl.innerHTML = html;

  gridEl.querySelectorAll(".plant-dot").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedPlantId = btn.dataset.plantId;
      renderOrchardGrid();
      renderPlantInspector();
    });
  });
}

function renderPlantInspector() {
  const plant = state.plants.find((p) => p.id === state.selectedPlantId) || state.plants[0];
  if (!plant) return;

  document.getElementById("pi-fruit-visual").innerHTML = renderMelonSvg(plant);
  document.getElementById("pi-id").textContent = plant.hasEnfarm ? `Gốc ${plant.id} • Sensor Z` : `Gốc ${plant.id}`;

  const badgeEl = document.getElementById("pi-status-badge");
  badgeEl.className = `pi-status-badge ${plant.status}`;
  if (plant.status === "ripe") {
    badgeEl.textContent = "Đã chín • Sẵn sàng hái";
    document.getElementById("pi-title").textContent = "Dưa lưới Kim Hoàng Hậu – Lưới nổi 100%";
    document.getElementById("pi-desc").textContent =
      "Vỏ vàng kem đồng đều, vân lưới nổi gờ khít và xuất hiện rạn nhẹ quanh cuống quả (abscission ring).";
    document.getElementById("pi-days").textContent = "Hái hôm nay";
    document.getElementById("pi-water-need").textContent = "Ngưng tưới";
    document.getElementById("pi-advice").textContent =
      "AI đề xuất: Có thể cắt thu hoạch trong sáng nay khi đường tích lũy đạt đỉnh, không tưới thêm trước khi hái.";
  } else if (plant.status === "turning") {
    badgeEl.textContent = "Sắp chín • Chuyển vàng";
    document.getElementById("pi-title").textContent = "Dưa lưới – Đang tạo lưới hoàn chỉnh";
    document.getElementById("pi-desc").textContent =
      "Vỏ chuyển xanh ngà, lưới trắng nổi 70–85%. Đang trong pha chuyển hóa tinh bột thành đường.";
    document.getElementById("pi-days").textContent = `Còn ~${plant.daysToHarvest} ngày`;
    document.getElementById("pi-water-need").textContent = "Giảm 0.9–1.0 L";
    document.getElementById("pi-advice").textContent =
      "AI đề xuất: Duy trì ẩm xơ dừa quanh 56–62%, bổ sung Kali cao & giữ sáng buổi sáng 100% để đạt ≥14° Brix.";
  } else {
    badgeEl.textContent = "Đang xanh non";
    document.getElementById("pi-title").textContent = "Dưa lưới – Pha phát triển kích thước";
    document.getElementById("pi-desc").textContent =
      "Vỏ xanh lục sẫm, vân lưới đang giãn nở theo kích thước trái. Cần đủ nước và dinh dưỡng nuôi cùi.";
    document.getElementById("pi-days").textContent = `Còn ~${plant.daysToHarvest} ngày`;
    document.getElementById("pi-water-need").textContent = "Đủ 1.45 L";
    document.getElementById("pi-advice").textContent =
      "AI đề xuất: Tưới đều theo rễ (ẩm 68–72%), giữ EC ~2.0–2.2 mS/cm và chống sốc nhiệt trưa >33°C.";
  }

  document.getElementById("pi-ripeness").textContent = `${plant.ripenessPct}%`;
  document.getElementById("pi-brix").textContent = `${plant.brix}°`;
}

// =============================================================================
// SVG DOME CROSS-SECTION & RAIN / SOLAR ANIMATION
// =============================================================================
let rainSeedPts = [];
{
  const g = document.getElementById("svg-rain-layer");
  let lines = "";
  for (let i = 0; i < 28; i++) {
    const x = 15 + ((i * 31) % 330);
    const y = 8 + ((i * 47) % 130);
    lines += `<line x1="${x}" y1="${y}" x2="${x - 5}" y2="${y + 12}" stroke="#0284c7" stroke-width="1.4" opacity="0.65"/>`;
    rainSeedPts.push({ x, y });
  }
  g.innerHTML = lines;
}

function updateDomeSvg(clim) {
  const t = state.solarDeploy / 100; // 0 = vertical side wall, 1 = curved over top ridge
  const leftEl = document.getElementById("svg-solar-left");
  const rightEl = document.getElementById("svg-solar-right");

  // Smooth interpolation along side wall -> upper arch shoulder -> roof top
  const interpSide = (u) => {
    if (u <= 0.45) {
      const k = u / 0.45;
      return { x: 78 + k * 4, y: 148 - k * 52 };
    }
    const k = (u - 0.45) / 0.55;
    const angle = Math.PI * (0.92 - k * 0.44); // arc toward dome crown
    return {
      x: 180 + 99 * Math.cos(angle),
      y: 122 - 74 * Math.sin(angle),
    };
  };

  const uStart = 0.0 + t * 0.52;
  const uEnd = Math.min(0.99, uStart + 0.43);
  const steps = 6;
  let dL = "";
  let dR = "";
  for (let i = 0; i <= steps; i++) {
    const u = uStart + (uEnd - uStart) * (i / steps);
    const p = interpSide(u);
    const pxR = (360 - p.x).toFixed(1);
    const pxL = p.x.toFixed(1);
    const py = p.y.toFixed(1);
    dL += (i === 0 ? `M ${pxL} ${py}` : ` L ${pxL} ${py}`);
    dR += (i === 0 ? `M ${pxR} ${py}` : ` L ${pxR} ${py}`);
  }
  leftEl.setAttribute("d", dL);
  rightEl.setAttribute("d", dR);

  // Sky / Sun / Rain look
  const isStormy = clim.w.key === "rainstorm" || clim.w.key === "typhoon";
  document.getElementById("svg-sky-top").setAttribute("stop-color", isStormy ? "#64748b" : "#bae6fd");
  document.getElementById("svg-sky-bot").setAttribute("stop-color", isStormy ? "#cbd5e1" : "#f0fdf4");
  document.getElementById("svg-sun-glow").style.opacity = isStormy ? "0" : clim.w.key === "heatwave" ? "1" : "0.7";
  document.getElementById("svg-rain-layer").style.opacity = isStormy ? "1" : "0";
  document.getElementById("svg-tank-txt").textContent = `${state.tankPct}%`;
  document.getElementById("svg-dome-label").textContent = `Vòm: ${clim.tempDome}°C • Pin ${state.solarDeploy}%`;
}

// Lightweight anemometer spin inside SVG
let anemoAngle = 0;
let lastFrame = performance.now();
function tickSvgAnimations(now) {
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  const wind = WEATHER_DATA[state.weatherKey].windKmh;
  anemoAngle = (anemoAngle + wind * 8 * dt) % 360;
  const rotor = document.getElementById("svg-anemo-rotor");
  if (rotor) {
    rotor.setAttribute("transform", `translate(322, 76) rotate(${anemoAngle.toFixed(1)})`);
  }
  requestAnimationFrame(tickSvgAnimations);
}
requestAnimationFrame(tickSvgAnimations);

// =============================================================================
// MASTER RENDER SYNC
// =============================================================================
function renderAll() {
  const ai = computeAiPlan();
  const { clim, stg, counts } = ai;

  // Dynamic Island & Top Bar
  const islandDot = document.getElementById("island-dot");
  islandDot.className = `island-dot ${clim.w.islandCls}`;
  document.getElementById("island-status").textContent = clim.w.islandStatus;
  document.getElementById("ah-subtitle").textContent = `Pilot Đà Lạt • ${stg.day}/${stg.totalDays} ngày • 84 gốc`;

  // Tab 1: Overview Hero
  const heroCard = document.getElementById("ov-hero-card");
  heroCard.className = `hero-card ${clim.w.heroCls}`;
  document.getElementById("ov-dome-badge").textContent =
    state.solarDeploy >= 50 ? `Phủ nóc ${state.solarDeploy}% • Cắt nhiệt` : clim.w.pill;
  document.getElementById("ov-climate-title").textContent = clim.w.title;
  document.getElementById("ov-climate-desc").textContent = clim.w.desc;
  document.getElementById("ov-days-left").textContent = counts.avgDaysLeft === 0 ? "0" : `${counts.avgDaysLeft}`;
  document.getElementById("ov-ripe-summary").textContent = `${counts.ripe} / 84 gốc`;
  document.getElementById("ov-brix-avg").textContent = `${counts.avgBrix}° Brix`;
  document.getElementById("ov-tank-pct").textContent = `${state.tankPct}% (${Math.round(state.tankPct * 5)} L)`;

  // Tab 1: 4 Telemetry Cards
  document.getElementById("mc-temp-val").textContent = `${clim.tempDome}°C`;
  document.getElementById("mc-temp-out").textContent = `(Ngoài ${clim.w.tempOut}°C)`;
  document.getElementById("mc-temp-bar").style.width = `${Math.min(100, Math.round((clim.tempDome / 40) * 100))}%`;
  const tempBadge = document.getElementById("mc-temp-badge");
  if (clim.tempDome > 33.5) {
    tempBadge.className = "mc-status danger";
    tempBadge.textContent = "Quá nóng!";
  } else if (clim.tempDome < 18.5) {
    tempBadge.className = "mc-status warn";
    tempBadge.textContent = "Hơi lạnh";
  } else {
    tempBadge.className = "mc-status ok";
    tempBadge.textContent = "Chuẩn 25–33°";
  }

  document.getElementById("mc-par-val").textContent = `${clim.parPct}% PAR`;
  document.getElementById("mc-par-umol").textContent = `(${clim.parUmol} µmol)`;
  document.getElementById("mc-par-bar").style.width = `${clim.parPct}%`;
  document.getElementById("mc-par-sub").textContent =
    state.solarDeploy >= 50 ? "Mái pin cản bớt bức xạ gắt" : "100% mái PE đón tán xạ";

  document.getElementById("mc-water-val").textContent = `${state.moisturePct}% ẩm`;
  document.getElementById("mc-water-l").textContent = `${state.waterPerPlantL.toFixed(2)} L/gốc`;
  document.getElementById("mc-water-bar").style.width = `${state.moisturePct}%`;
  document.getElementById("mc-water-sub").textContent = `Bồn nước mưa PE: ${state.tankPct}%`;
  const wBadge = document.getElementById("mc-water-badge");
  if (state.moisturePct < stg.targetMoist[0]) {
    wBadge.className = "mc-status warn";
    wBadge.textContent = "Hơi khô";
  } else if (state.moisturePct > stg.targetMoist[1]) {
    wBadge.className = "mc-status warn";
    wBadge.textContent = "Ẩm cao";
  } else {
    wBadge.className = "mc-status ok";
    wBadge.textContent = "Đủ ẩm";
  }

  document.getElementById("mc-ec-val").textContent = `EC ${state.ec.toFixed(1)}`;
  document.getElementById("mc-ph-val").textContent = state.ph.toFixed(1);
  document.getElementById("mc-k-val").textContent = state.k;

  // Tab 1: AI Urgent Needs + Glance
  document.getElementById("ov-ai-headline").textContent = ai.headline;
  document.getElementById("ov-ai-needs").innerHTML = ai.needs.map((n) => `<li>${n}</li>`).join("");
  document.getElementById("ov-ripeness-bar").innerHTML = `
    <span class="sb-ripe" style="width:${(counts.ripe / 84) * 100}%"></span>
    <span class="sb-turn" style="width:${(counts.turning / 84) * 100}%"></span>
    <span class="sb-green" style="width:${(counts.green / 84) * 100}%"></span>`;
  document.getElementById("ov-ripeness-legend").textContent = `${counts.ripe} Chín • ${counts.turning} Sắp chín • ${counts.green} Xanh`;
  document.getElementById("ov-dome-glance").textContent = `Gió ${clim.w.windKmh} km/h • ${clim.w.rainMmHr > 0 ? "Đang mưa" : `${clim.w.tempOut}°C`}`;
  document.getElementById("ov-forecast-glance").textContent =
    clim.w.key === "typhoon" ? "Dự báo: Gió giật mạnh 30p" : `Dự báo 3h: ${clim.w.hourly[1].temp}°C • Mưa ${clim.w.hourly[1].rain}`;

  // Tab 2: Crops & Harvest
  document.getElementById("crop-stage-label").textContent = stg.label;
  document.getElementById("crop-harvest-title").textContent = stg.harvestTitle;
  document.getElementById("crop-harvest-sub").textContent = stg.harvestSub;
  const pctCycle = Math.round((stg.day / stg.totalDays) * 100);
  document.getElementById("crop-cycle-pct").textContent = `${pctCycle}%`;
  document.getElementById("crop-cycle-ring").style.strokeDashoffset = (163.36 * (1 - pctCycle / 100)).toFixed(1);
  document.getElementById("cnt-ripe").textContent = counts.ripe;
  document.getElementById("cnt-turning").textContent = counts.turning;
  document.getElementById("cnt-green").textContent = counts.green;
  renderOrchardGrid();
  renderPlantInspector();

  // Tab 3: Dome & Weather
  document.getElementById("dome-mode-pill").textContent = `Trạng thái: ${clim.w.badge}`;
  document.getElementById("dome-wind-badge").textContent = `Gió ${clim.w.windKmh} km/h`;
  document.getElementById("app-solar-slider").value = state.solarDeploy;
  document.getElementById("app-solar-pct").textContent = `${state.solarDeploy}%`;
  updateDomeSvg(clim);

  document.getElementById("z-wind-val").textContent = `${clim.w.windKmh} km/h • ${clim.w.windDir}`;
  document.getElementById("z-wind-sub").textContent =
    clim.w.windKmh >= 45 ? `Giật ${clim.w.windGust} km/h • NGẮT BÃO FAIL-SAFE` : `Giật ${clim.w.windGust} km/h • Ngưỡng an toàn`;
  document.getElementById("z-sun-val").textContent = clim.w.sunLabel;
  document.getElementById("z-sun-sub").textContent =
    clim.w.rainMmHr > 0 ? "Máng PE ±2,84m đang thu nước mưa" : "Bề mặt mái PE khô ráo";
  document.getElementById("z-pv-val").textContent = `${state.solarDeploy}% • ${clim.pvKw} kW`;
  document.getElementById("z-pv-sub").textContent = `Ray lồng 8/13.5cm • Pin LiFePO4 94%`;
  const diff = (clim.tempDome - clim.w.tempOut).toFixed(1);
  document.getElementById("z-mesh-val").textContent = `Chênh ${diff}°C`;
  document.getElementById("z-mesh-sub").textContent = `Lưới 32 mesh ngăn côn trùng & đối lưu`;

  document.getElementById("fa-prob").textContent = clim.w.forecast25m.prob;
  document.getElementById("fa-msg").textContent = clim.w.forecast25m.text;

  document.getElementById("hourly-strip").innerHTML = clim.w.hourly
    .map(
      (h) => `
      <div class="hr-col ${h.now ? "now" : ""}">
        <span class="hr-t">${h.t}</span>
        <span class="hr-ic">${getForecastIconSvg(h.kind)}</span>
        <span class="hr-temp">${h.temp}°</span>
        <span class="hr-rain">${h.rain}</span>
        <span class="hr-pv">${h.pv}</span>
      </div>`
    )
    .join("");

  document.getElementById("days-forecast").innerHTML =
    `<div class="hc-subhead">Dự báo thời tiết Đà Lạt (3 ngày tới)</div>` +
    DAYS_FORECAST.map(
      (d) => `
      <div class="day-row">
        <span class="dr-day">${d.day}</span>
        <span class="dr-cond">${d.cond}</span>
        <span class="dr-tmp">${d.range}</span>
      </div>`
    ).join("");

  // Tab 4: Deep AI Diagnosis & Chat
  const riskBadge = document.getElementById("ai-risk-badge");
  riskBadge.className = `air-badge ${ai.riskLevel}`;
  riskBadge.textContent = ai.riskLabel;

  document.getElementById("ai-report-blocks").innerHTML = `
    <div class="air-item"><b>1. Phân tích Nước &amp; Độ ẩm:</b> Hiện đạt <b>${state.moisturePct}%</b> (tưới ~<b>${state.waterPerPlantL.toFixed(2)} L/gốc/ngày</b>). Bồn nước mưa PE còn <b>${state.tankPct}%</b>. Dải khuyến nghị cho ${stg.label}: <b>${stg.targetMoist[0]}–${stg.targetMoist[1]}%</b>.</div>
    <div class="air-item"><b>2. Phân tích Dinh dưỡng (Kiểu Enfarm 7 chỉ số):</b> EC <b>${state.ec.toFixed(2)}</b>, pH <b>${state.ph.toFixed(1)}</b>, Đạm <b>${state.n}</b> / Lân <b>${state.p}</b> / Kali <b>${state.k} ppm</b>. Đang tối ưu tỷ lệ K/N để nuôi lưới và tăng Brix.</div>
    <div class="air-item"><b>3. Dự báo Thu hoạch &amp; Xanh/Chín:</b> Đã có <b>${counts.ripe} quả chín</b> (${counts.avgBrix}° Brix TB toàn vườn), <b>${counts.turning} quả gần chín</b>, <b>${counts.green} quả còn xanh</b>. Dự kiến lứa kế tiếp thu hoạch rộ sau <b>${counts.avgDaysLeft} ngày</b>.</div>
    <div class="air-item"><b>4. Vi khí hậu Mái vòm &amp; Dự báo thời tiết:</b> Gió <b>${clim.w.windKmh} km/h</b> (${clim.w.windDir}), mưa <b>${clim.w.rainMmHr} mm/h</b>. Dự báo gần: ${clim.w.forecast25m.text}</div>
  `;

  renderChatFeed();
}

function renderChatFeed() {
  const feed = document.getElementById("chat-feed");
  feed.innerHTML = state.chatMessages
    .map((m) => `<div class="msg ${m.role}">${m.text}</div>`)
    .join("");
  feed.scrollTop = feed.scrollHeight;
}

// =============================================================================
// SEMANTIC CLIENT-SIDE AI AGRONOMIST RESPONDER
// =============================================================================
function answerAiQuestion(qRaw) {
  const q = qRaw.toLowerCase();
  const ai = computeAiPlan();
  const { clim, stg, counts } = ai;

  if (q.includes("thu hoạch") || q.includes("bao lâu") || q.includes("chín") || q.includes("xanh")) {
    return `Hiện vườn 84 gốc đang ở <b>${stg.label}</b>: đã có <b>${counts.ripe} quả chín</b> (có thể cắt ngay), <b>${counts.turning} quả sắp chín</b> và <b>${counts.green} quả còn xanh</b>. Độ ngọt trung bình <b>${counts.avgBrix}° Brix</b>; đợt rộ kế tiếp thu hoạch sau khoảng <b>${counts.avgDaysLeft} ngày nữa</b>.`;
  }
  if (q.includes("gió") || q.includes("mưa") || q.includes("mái") || q.includes("thời tiết") || q.includes("dự báo")) {
    return `Khu vực mái vòm hiện đang <b>${clim.w.title}</b>: gió <b>${clim.w.windKmh} km/h</b> hướng ${clim.w.windDir} (giật ${clim.w.windGust} km/h), mưa <b>${clim.w.rainMmHr} mm/h</b>, pin đang <b>${state.solarDeploy}%</b>. ${clim.w.forecast25m.text}`;
  }
  if (q.includes("nước") || q.includes("tưới") || q.includes("ẩm") || q.includes("phân") || q.includes("npk") || q.includes("ec")) {
    return `Cảm biến 7 chỉ số báo độ ẩm giá thể <b>${state.moisturePct}%</b> (mục tiêu ${stg.targetMoist[0]}–${stg.targetMoist[1]}%), lượng nước cấp <b>${state.waterPerPlantL.toFixed(2)} L/gốc</b>, bồn nước mưa PE còn <b>${state.tankPct}%</b>. Dinh dưỡng EC <b>${state.ec.toFixed(2)}</b>, pH <b>${state.ph.toFixed(1)}</b>, Kali <b>${state.k} ppm</b>.`;
  }
  return `<b>Đánh giá AI ngay lúc này:</b> ${ai.headline} Các thông số chính: Nhiệt vòm <b>${clim.tempDome}°C</b>, sáng <b>${clim.parPct}% PAR</b>, ẩm giá thể <b>${state.moisturePct}%</b>, còn <b>${counts.avgDaysLeft} ngày</b> đến đợt cắt chính (${counts.ripe} gốc đã chín sẵn).`;
}

// =============================================================================
// EVENT LISTENERS & NAVIGATION
// =============================================================================
function showToast(msg) {
  const el = document.getElementById("app-toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(showToast._tid);
  showToast._tid = setTimeout(() => el.classList.remove("show"), 2300);
}

function setWeatherMode(key) {
  state.weatherKey = key;
  const w = WEATHER_DATA[key];
  state.solarDeploy = w.deployDefault;
  if (key === "rainstorm") state.tankPct = Math.min(98, state.tankPct + 8);
  if (key === "typhoon") state.tankPct = Math.min(100, state.tankPct + 12);

  document.querySelectorAll("[data-sim-weather]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.simWeather === key);
  });
  renderAll();
}

function setStageMode(key) {
  state.stageKey = key;
  const s = STAGES[key];
  state.moisturePct = s.baseMoisture;
  state.waterPerPlantL = s.defaultWater;
  state.ec = s.baseEc;
  state.n = s.baseN;
  state.p = s.baseP;
  state.k = s.baseK;
  state.plants = generatePlants(key);

  document.querySelectorAll("[data-sim-stage]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.simStage === key);
  });
  renderAll();
}

function switchTab(tabId) {
  state.activeTab = tabId;
  document.querySelectorAll(".tab-view").forEach((v) => v.classList.toggle("active", v.dataset.tab === tabId));
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tabTarget === tabId));
  document.getElementById("app-scroll").scrollTop = 0;
}

document.querySelectorAll("[data-sim-weather]").forEach((btn) => {
  btn.addEventListener("click", () => {
    setWeatherMode(btn.dataset.simWeather);
    showToast(`Đã chuyển bối cảnh: ${WEATHER_DATA[btn.dataset.simWeather].title}`);
  });
});

document.querySelectorAll("[data-sim-stage]").forEach((btn) => {
  btn.addEventListener("click", () => {
    setStageMode(btn.dataset.simStage);
    showToast(`Cập nhật vụ mùa: ${STAGES[btn.dataset.simStage].label}`);
  });
});

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tabTarget));
});

document.querySelectorAll("[data-go-tab]").forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.goTab));
});

document.querySelectorAll("[data-crop-filter]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.cropFilter = btn.dataset.cropFilter;
    document.querySelectorAll("[data-crop-filter]").forEach((b) => b.classList.toggle("active", b === btn));
    renderOrchardGrid();
  });
});

document.getElementById("app-solar-slider").addEventListener("input", (e) => {
  const val = Number(e.target.value);
  if (state.weatherKey === "typhoon" && val > 0) {
    e.target.value = 0;
    state.solarDeploy = 0;
    showToast("FAIL-SAFE đang khóa cứng pin 0% khi gió > 45 km/h!");
    renderAll();
    return;
  }
  state.solarDeploy = val;
  renderAll();
});

// Action Buttons
document.getElementById("btn-ov-apply-ai").addEventListener("click", () => {
  const clim = getLiveClimate();
  const stg = STAGES[state.stageKey];
  if (clim.w.key === "heatwave") state.solarDeploy = 100;
  else if (clim.w.key === "rainstorm" || clim.w.key === "typhoon") state.solarDeploy = 0;
  state.moisturePct = Math.round((stg.targetMoist[0] + stg.targetMoist[1]) * 0.5);
  renderAll();
  showToast("Đã đồng bộ mái pin & tưới về ngưỡng AI tối ưu!");
});

document.getElementById("act-drip").addEventListener("click", () => {
  state.moisturePct = Math.min(84, state.moisturePct + 8);
  state.waterPerPlantL = Number((state.waterPerPlantL + 0.25).toFixed(2));
  state.tankPct = Math.max(12, state.tankPct - 3);
  renderAll();
  showToast("Đã mở van tưới nhỏ giọt 15 phút (+8% ẩm giá thể)");
});

document.getElementById("act-dry-cut").addEventListener("click", () => {
  state.moisturePct = 54;
  state.waterPerPlantL = 0.7;
  renderAll();
  showToast("Đã bật chế độ siết nước (54%) thúc chín ngọt ≥14° Brix");
});

document.getElementById("act-boost-k").addEventListener("click", () => {
  state.k = Math.min(310, state.k + 25);
  state.ec = Number((state.ec + 0.15).toFixed(2));
  renderAll();
  showToast("Đã châm bổ sung Kali (+25 ppm) giúp chắc vỏ & nổi lưới");
});

document.getElementById("act-auto-roof").addEventListener("click", () => {
  state.solarDeploy = WEATHER_DATA[state.weatherKey].deployDefault;
  renderAll();
  showToast(`Edge AI đã chỉnh mái pin về ${state.solarDeploy}% theo thời tiết`);
});

document.getElementById("btn-sync-sensors").addEventListener("click", () => {
  document.getElementById("sensor-sync-time").textContent = "Đồng bộ lúc " + new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  showToast("Đã cập nhật dữ liệu mới từ trạm đất & khí tượng");
});

document.getElementById("btn-toggle-frame").addEventListener("click", (e) => {
  const full = document.body.classList.toggle("full-view");
  e.currentTarget.querySelector("span").textContent = full ? "Khung điện thoại" : "Toàn màn hình";
});

// Chat events
document.querySelectorAll(".prompt-chip").forEach((btn) => {
  btn.addEventListener("click", () => {
    const q = btn.dataset.prompt;
    state.chatMessages.push({ role: "user", text: q });
    state.chatMessages.push({ role: "bot", text: answerAiQuestion(q) });
    renderChatFeed();
  });
});

document.getElementById("chat-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const inp = document.getElementById("chat-input");
  const q = inp.value.trim();
  if (!q) return;
  inp.value = "";
  state.chatMessages.push({ role: "user", text: q });
  state.chatMessages.push({ role: "bot", text: answerAiQuestion(q) });
  renderChatFeed();
});

// Live Clock Sync
function updateClock() {
  const t = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  document.getElementById("app-clock").textContent = t;
}
updateClock();
setInterval(updateClock, 30000);

// Initial Boot
state.plants = generatePlants(state.stageKey);
renderAll();
