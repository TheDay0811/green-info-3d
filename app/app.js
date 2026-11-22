import { MqttLiteClient } from "../mqtt_lite.js";

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
  hilConnected: false,
  hilRoom: new URLSearchParams(window.location.search).get("hil") || "pilot01",
  hilLive: null,
  plants: [],
  camActiveId: "cam1",
  camNightMode: false,
  camGuardArmed: true,
  camAutoPatrol: true,
  camRailM: 4.2,
  camIntruderActive: false,
  camSirenActive: false,
  camDoorLocked: true,
  camEvents: [
    { time: "Vừa xong", tag: "Nông nghiệp", danger: false, msg: "Cam 01 trượt quét 4 luống: 22 gốc chín sẵn sàng hái hôm nay.", thumb: "" },
    { time: "06:15", tag: "An ninh", danger: false, msg: "Chuyển ca ngày: cửa lùa đang KHÓA chốt từ xa, lưới 32 Mesh nguyên vẹn.", thumb: "" },
    { time: "02:40", tag: "Canh đêm", danger: false, msg: "IR Đêm: gió rung lá 18 km/h — AI Human Filter loại trừ báo động giả.", thumb: "" },
  ],
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
  const baseW = WEATHER_DATA[state.weatherKey];
  if (state.hilLive) {
    const h = state.hilLive;
    const d = state.solarDeploy / 100;
    const parPct = Math.round(Number(h.par_pct ?? 70));
    const parUmol = Math.round(parPct * 10.96);
    const tempDome = Number(Number(h.temp_c ?? 28).toFixed(1));
    const windKmh = Math.round(Number(h.wind_kmh ?? 8));
    const pvScale = h.rain || h.failsafe ? 0.35 : 1.0;
    const pvKw = Number(((0.6 + 2.4 * d) * pvScale).toFixed(1));
    const w = {
      ...baseW,
      tempOut: Number((tempDome + (d >= 0.5 ? 5.2 : 0.4)).toFixed(1)),
      tempDome,
      parPct,
      parUmol,
      windKmh,
      windGust: Math.round(windKmh * 1.25),
      rainMmHr: h.rain ? 16.4 : 0.0,
      badge: `WOKWI LIVE: ${h.mode || "AUTO"}`,
      islandStatus: `Wokwi LIVE • Gió ${windKmh}`,
    };
    return { w, d, parPct, parUmol, tempDome, pvKw };
  }
  const w = baseW;
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
  const wind = state.hilLive ? Number(state.hilLive.wind_kmh ?? 8) : WEATHER_DATA[state.weatherKey].windKmh;
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

  // Dynamic Island & Top Bar (Intrusion Alert overrides Island badge immediately)
  const islandDot = document.getElementById("island-dot");
  if (state.camIntruderActive) {
    islandDot.className = "island-dot danger";
    document.getElementById("island-status").textContent = "CẢNH BÁO TRỘM!";
  } else {
    islandDot.className = `island-dot ${clim.w.islandCls}`;
    document.getElementById("island-status").textContent = clim.w.islandStatus;
  }
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
  renderCameraSecurityUI();
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

  if (q.includes("trộm") || q.includes("an ninh") || q.includes("đột nhập") || q.includes("ban đêm") || q.includes("còi") || q.includes("khóa")) {
    return `Chính cụm <b>1–2 Camera AI dùng chung (~500k–1tr)</b> sẽ bật <b>Hồng ngoại IR + AI Nhận diện dáng người</b> vào ban đêm (hoặc khi bạn bật chế độ Vắng chủ). Nếu có người lạ mở cửa hoặc rạch lưới, hệ thống <b>bỏ qua gió rung/chim nhỏ</b>, tự bật <b>còi hú 110dB + đèn pha ắc quy 24V</b>, khóa chốt cửa và gửi ngay ảnh chụp + cảnh báo đỏ về web điện thoại trong <b>&lt; 2 giây</b>! Bạn mở tab <b>Camera</b> để xem trực tiếp hoặc bấm <b>Test Trộm</b> thử ngay.`;
  }
  if (q.includes("camera") || q.includes("chi phí") || q.includes("nhân công") || q.includes("tự động") || q.includes("bón phân")) {
    return `Hệ thống chỉ lắp <b>1–2 Camera dùng chung (~500 nghìn – 1 triệu VNĐ)</b> chạy dọc hành lang giữa và canh cửa lùa: ban ngày tự động quét 84 gốc kết hợp 2 trạm đất A4/C14, ban đêm trực chống trộm hồng ngoại gửi ảnh về điện thoại. Nhờ vậy nông dân hầu như <b>chỉ cần ra vườn khi bón phân bổ sung hoặc cắt quả chín</b> (${counts.ripe} gốc sẵn sàng hái).`;
  }
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
    state.hilLive = null;
    setWeatherMode(btn.dataset.simWeather);
    sendAppCmd({ pv_pct: state.solarDeploy, mode: btn.dataset.simWeather });
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
  sendAppCmd({ pv_pct: val });
  renderAll();
});

// Wokwi Live Hardware Bridge
let appMqtt = null;
let lastHilIntruder = false;
let lastHilDoorLock = true;
function sendAppCmd(obj) {
  if (state.hilConnected && appMqtt && appMqtt.connected) {
    appMqtt.publish(`greeninfo/v2/${state.hilRoom}/cmd`, JSON.stringify(obj));
  }
}
function updateHilButtons() {
  const txt = state.hilConnected ? (state.hilLive ? "Wokwi LIVE" : "Chờ Wokwi...") : "Link Wokwi";
  for (const id of ["btn-sb-wokwi", "btn-app-wokwi"]) {
    const el = document.getElementById(id);
    if (!el) continue;
    el.classList.toggle("active", state.hilConnected);
    const sp = el.querySelector("span");
    if (sp) sp.textContent = txt;
    else el.textContent = txt;
  }
}
function toggleAppWokwi(forceOn = null) {
  const next = forceOn !== null ? forceOn : !state.hilConnected;
  if (!next) {
    state.hilConnected = false;
    state.hilLive = null;
    if (appMqtt) appMqtt.disconnect();
    appMqtt = null;
    updateHilButtons();
    renderAll();
    showToast("Đã ngắt liên kết phần cứng Wokwi");
    return;
  }
  state.hilConnected = true;
  updateHilButtons();
  showToast(`Đang kết nối EMQX WSS (phòng ${state.hilRoom})...`);
  appMqtt = new MqttLiteClient({
    onStatus: (st) => {
      if (!state.hilConnected) return;
      if (st === "connected") {
        appMqtt.subscribe(`greeninfo/v2/${state.hilRoom}/telemetry`);
        showToast("Đã nối MQTT! Bấm Play trên Wokwi để đồng bộ LIVE.");
      }
    },
    onMessage: (_topic, payload) => {
      try {
        const pkt = JSON.parse(payload);
        state.hilLive = pkt;
        state.solarDeploy = Math.max(0, Math.min(100, Math.round(Number(pkt.pv_pct ?? 0))));
        if (pkt.soil_moist != null) state.moisturePct = Math.round(Number(pkt.soil_moist));
        const wk = pkt.failsafe || Number(pkt.wind_kmh) >= 45
          ? "typhoon"
          : pkt.rain
            ? "rainstorm"
            : Number(pkt.temp_c) >= 31
              ? "heatwave"
              : "morning";
        state.weatherKey = wk;
        document.querySelectorAll("[data-sim-weather]").forEach((b) => {
          b.classList.toggle("active", b.dataset.simWeather === wk);
        });
        if (typeof pkt.door_lock === "boolean" && pkt.door_lock !== lastHilDoorLock) {
          lastHilDoorLock = pkt.door_lock;
          state.camDoorLocked = pkt.door_lock;
        }
        const hwIntr = Boolean(pkt.intruder);
        if (hwIntr !== lastHilIntruder) {
          lastHilIntruder = hwIntr;
          triggerIntrusionSimulation(hwIntr, false);
        }
        updateHilButtons();
        renderAll();
      } catch (_) {}
    },
  });
  appMqtt.connect(`gi-app-${Math.random().toString(16).slice(2, 7)}`);
}
document.getElementById("btn-sb-wokwi").addEventListener("click", () => toggleAppWokwi());
document.getElementById("btn-app-wokwi").addEventListener("click", () => toggleAppWokwi());
if (new URLSearchParams(window.location.search).has("hil")) {
  setTimeout(() => toggleAppWokwi(true), 300);
}

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

// =============================================================================
// LIVE CAMERA AI & ANTI-INTRUSION SECURITY MODULE (1-2 SHARED CAMERAS)
// =============================================================================
function nowTimeStr() {
  return new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function playSirenTone(pulses = 2) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    for (let i = 0; i < pulses; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      const t0 = ctx.currentTime + i * 0.28;
      osc.frequency.setValueAtTime(780, t0);
      osc.frequency.linearRampToValueAtTime(1180, t0 + 0.12);
      osc.frequency.linearRampToValueAtTime(780, t0 + 0.22);
      gain.gain.setValueAtTime(0.06, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.24);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.25);
    }
    setTimeout(() => {
      try { ctx.close(); } catch (_) {}
    }, pulses * 320 + 200);
  } catch (_) {}
}

function getRailPairIdx(railM) {
  const idx = Math.max(1, Math.min(21, Math.round(1 + ((railM - 1.2) / 9.6) * 20)));
  return idx < 10 ? `0${idx}` : `${idx}`;
}

function drawCameraFrame(tMs = performance.now()) {
  const canvas = document.getElementById("cam-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;
  const sec = tMs * 0.001;
  const isNight = state.camNightMode;
  const isAlarm = state.camIntruderActive;
  const strobeOn = state.camSirenActive && Math.floor(sec * 5) % 2 === 0;

  ctx.save();
  ctx.clearRect(0, 0, W, H);

  if (state.camActiveId === "cam1") {
    // --- CAM 01: CENTER CORRIDOR RAIL POV (LOOKING DOWN 4 MELON ROWS) ---
    const panShift = Math.sin(sec * 0.7) * 6 + ((state.camRailM - 6.0) / 5.5) * 4;
    const vx = W * 0.5 + panShift;
    const vy = H * 0.44;

    // Sky / PE Dome ceiling
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    if (isNight) {
      bgGrad.addColorStop(0, "#03150e");
      bgGrad.addColorStop(0.45, "#0a2a1d");
      bgGrad.addColorStop(1, "#04140d");
    } else if (state.weatherKey === "rainstorm" || state.weatherKey === "typhoon") {
      bgGrad.addColorStop(0, "#334155");
      bgGrad.addColorStop(0.45, "#64748b");
      bgGrad.addColorStop(1, "#1e293b");
    } else {
      bgGrad.addColorStop(0, "#0284c7");
      bgGrad.addColorStop(0.45, "#bae6fd");
      bgGrad.addColorStop(1, "#e2e8f0");
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Solar canopy shadow band if deployed >= 50%
    if (!isNight && state.solarDeploy >= 50) {
      ctx.fillStyle = "rgba(15, 23, 42, 0.36)";
      ctx.fillRect(0, 0, W, vy + 8);
    }

    // Center concrete walkway trapezoid
    ctx.fillStyle = isNight ? "#122c20" : "#cbd5e1";
    ctx.beginPath();
    ctx.moveTo(W * 0.24, H);
    ctx.lineTo(vx - 18, vy + 18);
    ctx.lineTo(vx + 18, vy + 18);
    ctx.lineTo(W * 0.76, H);
    ctx.closePath();
    ctx.fill();

    // Side weed-mat bed strips
    ctx.fillStyle = isNight ? "#071a12" : "#1e293b";
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(W * 0.24, H);
    ctx.lineTo(vx - 18, vy + 18);
    ctx.lineTo(vx - 88, vy + 18);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(W, H);
    ctx.lineTo(W * 0.76, H);
    ctx.lineTo(vx + 18, vy + 18);
    ctx.lineTo(vx + 88, vy + 18);
    ctx.closePath();
    ctx.fill();

    // Arch steel hoops in perspective
    ctx.strokeStyle = isNight ? "rgba(74, 222, 128, 0.35)" : "rgba(241, 245, 249, 0.78)";
    for (let i = 0; i < 6; i++) {
      const k = Math.pow(0.68, i);
      const rw = (W * 0.62) * k;
      const rh = (H * 0.62) * k;
      ctx.lineWidth = Math.max(1, 2.5 * k);
      ctx.beginPath();
      ctx.ellipse(vx, vy + 24 * k, rw, rh, 0, Math.PI, 0);
      ctx.stroke();
    }

    // Far end door frame
    ctx.strokeStyle = isNight ? "#22c55e" : "#475569";
    ctx.lineWidth = 2;
    ctx.strokeRect(vx - 22, vy - 18, 44, 38);

    // 4 Melon Rows (Coco-peat growbags + stems + melons in perspective)
    const melonColor =
      state.stageKey === "harvest"
        ? isNight ? "#86efac" : "#eab308"
        : state.stageKey === "netting"
          ? isNight ? "#4ade80" : "#84cc16"
          : isNight ? "#22c55e" : "#16a34a";

    const railPhase = ((state.camRailM - 0.5) / 11.0);
    for (let d = 5; d >= 0; d--) {
      const zFrac = Math.min(0.95, (d + 0.25 + (railPhase * 0.6) % 0.4) / 6.0);
      const scale = 1.0 - zFrac * 0.76;
      const pyBase = vy + 18 + (H - (vy + 18)) * Math.pow(scale, 1.3);
      for (const side of [-1, 1]) {
        const px = vx + side * (30 + 145 * scale);
        const potW = 24 * scale;
        const potH = 22 * scale;
        ctx.fillStyle = isNight ? "#14532d" : "#f8fafc";
        ctx.fillRect(px - potW / 2, pyBase - potH, potW, potH);
        ctx.strokeStyle = isNight ? "#22c55e" : "#15803d";
        ctx.lineWidth = Math.max(1.5, 4 * scale);
        ctx.beginPath();
        ctx.moveTo(px, pyBase - potH);
        ctx.lineTo(px, pyBase - 125 * scale);
        ctx.stroke();
        // Leaves
        ctx.fillStyle = isNight ? "rgba(34, 197, 94, 0.52)" : "#15803d";
        for (let lf = 0; lf < 3; lf++) {
          ctx.beginPath();
          ctx.ellipse(px + side * (-8 * scale) * (lf % 2 ? 1 : -1), pyBase - (48 + lf * 24) * scale, 12 * scale, 7 * scale, 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
        // Melon fruit
        const mx = px - side * 8 * scale;
        const my = pyBase - 54 * scale;
        ctx.fillStyle = melonColor;
        ctx.beginPath();
        ctx.arc(mx, my, Math.max(3, 10 * scale), 0, Math.PI * 2);
        ctx.fill();

        // Highlight AI vision box on foreground pair (d === 1)
        if (d === 1 && !isAlarm) {
          const idTag = side < 0 ? `A${getRailPairIdx(state.camRailM)}` : `C${getRailPairIdx(state.camRailM)}`;
          const labelTxt = state.stageKey === "harvest" ? `${idTag}: Chín 94%` : `${idTag}: Khỏe 100%`;
          const bx = mx - 18;
          const by = my - 18;
          ctx.strokeStyle = "#4ade80";
          ctx.lineWidth = 1.6;
          ctx.strokeRect(bx, by, 36, 36);
          ctx.fillStyle = "rgba(21, 128, 61, 0.85)";
          ctx.fillRect(bx, by - 14, 72, 13);
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 9px Segoe UI, sans-serif";
          ctx.fillText(labelTxt, bx + 4, by - 4);
        }
      }
    }

    // Intruder silhouette inside corridor
    if (isAlarm) {
      const walkX = vx + Math.sin(sec * 2.2) * 14;
      const figH = 122;
      const figY = H - 22;
      drawIntruderBox(ctx, walkX, figY, figH, sec, strobeOn);
    }
  } else {
    // --- CAM 02: FRONT ENTRANCE SLIDING DOOR & EXTERIOR PERIMETER ---
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    if (isNight) {
      bgGrad.addColorStop(0, "#02130b");
      bgGrad.addColorStop(0.55, "#062316");
      bgGrad.addColorStop(1, "#0b2e1d");
    } else {
      bgGrad.addColorStop(0, "#0284c7");
      bgGrad.addColorStop(0.52, "#bae6fd");
      bgGrad.addColorStop(1, "#3f6212");
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Distant pine hill silhouette
    ctx.fillStyle = isNight ? "#041c11" : "#14532d";
    ctx.beginPath();
    ctx.moveTo(0, H * 0.56);
    ctx.quadraticCurveTo(W * 0.25, H * 0.38, W * 0.55, H * 0.50);
    ctx.quadraticCurveTo(W * 0.8, H * 0.35, W, H * 0.52);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    // Exterior concrete walkway
    ctx.fillStyle = isNight ? "#153224" : "#cbd5e1";
    ctx.beginPath();
    ctx.moveTo(W * 0.30, H);
    ctx.lineTo(W * 0.42, H * 0.62);
    ctx.lineTo(W * 0.58, H * 0.62);
    ctx.lineTo(W * 0.70, H);
    ctx.closePath();
    ctx.fill();

    // Greenhouse Front Gable + Sliding Door
    ctx.fillStyle = isNight ? "rgba(16, 185, 129, 0.14)" : "rgba(224, 242, 254, 0.45)";
    ctx.strokeStyle = isNight ? "#22c55e" : "#94a3b8";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(W * 0.20, H * 0.66);
    ctx.lineTo(W * 0.20, H * 0.42);
    ctx.quadraticCurveTo(W * 0.50, H * 0.14, W * 0.80, H * 0.42);
    ctx.lineTo(W * 0.80, H * 0.66);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Center Sliding Door + Signboard
    ctx.strokeStyle = isNight ? "#4ade80" : "#1e293b";
    ctx.strokeRect(W * 0.43, H * 0.38, W * 0.14, H * 0.28);
    // Lock LED on door frame
    ctx.fillStyle = state.camDoorLocked ? "#22c55e" : "#f59e0b";
    ctx.beginPath();
    ctx.arc(W * 0.555, H * 0.52, 4, 0, Math.PI * 2);
    ctx.fill();

    // GREEN INFO board right of door
    ctx.fillStyle = isNight ? "#064e3b" : "#14532d";
    ctx.fillRect(W * 0.60, H * 0.50, 74, 28);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 8px Segoe UI, sans-serif";
    ctx.fillText("GREEN INFO", W * 0.614, H * 0.55);

    // Blue PE Tank on left
    ctx.fillStyle = isNight ? "#0c4a6e" : "#0284c7";
    ctx.fillRect(W * 0.08, H * 0.48, 36, 48);

    // Intruder near front sliding door!
    if (isAlarm) {
      const ix = W * 0.48 + Math.sin(sec * 2.5) * 24;
      drawIntruderBox(ctx, ix, H * 0.84, 96, sec, strobeOn);
    }
  }

  // Flashlight / Floodlight Strobe Overlay when siren/lights ON
  if (strobeOn) {
    ctx.fillStyle = Math.floor(sec * 10) % 2 === 0 ? "rgba(239, 68, 68, 0.18)" : "rgba(255, 255, 255, 0.18)";
    ctx.fillRect(0, 0, W, H);
  }

  // Night vision subtle vignette & scanlines
  if (isNight) {
    ctx.fillStyle = "rgba(34, 197, 94, 0.06)";
    for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
  }

  // CCTV Top HUD Overlay
  ctx.fillStyle = "rgba(2, 6, 23, 0.68)";
  ctx.fillRect(0, 0, W, 28);
  // Flashing REC dot
  if (Math.floor(sec * 2) % 2 === 0) {
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(14, 14, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 10.5px Segoe UI, sans-serif";
  const camTitle =
    state.camActiveId === "cam1"
      ? `LIVE CAM-01 • RAY ${state.camRailM.toFixed(1)}m / 12m`
      : "LIVE CAM-02 • CỬA LÙA & RÀO NGOÀI";
  ctx.fillText(camTitle, 24, 18);

  const hudRight = `${isNight ? "IR ĐÊM" : "NGÀY HD"} • ${nowTimeStr()}`;
  ctx.textAlign = "right";
  ctx.fillStyle = isAlarm ? "#fca5a5" : "#86efac";
  ctx.fillText(hudRight, W - 10, 18);
  ctx.textAlign = "left";

  // Red Border Flash on Intrusion
  if (isAlarm) {
    ctx.strokeStyle = strobeOn ? "#ffffff" : "#ef4444";
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, W - 4, H - 4);
  }

  ctx.restore();
}

function drawIntruderBox(ctx, cx, footY, h, sec, strobeOn) {
  const headY = footY - h;
  const w = h * 0.42;
  // Silhouette body + hood + flashlight/bag
  ctx.fillStyle = "#090d16";
  ctx.beginPath();
  ctx.arc(cx, headY + 13, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(cx - w * 0.42, headY + 24, w * 0.84, h * 0.45);
  // Legs stride
  const stride = Math.sin(sec * 6) * 8;
  ctx.lineWidth = 8;
  ctx.strokeStyle = "#090d16";
  ctx.beginPath();
  ctx.moveTo(cx - 7, footY - 34);
  ctx.lineTo(cx - 10 + stride, footY);
  ctx.moveTo(cx + 7, footY - 34);
  ctx.lineTo(cx + 10 - stride, footY);
  ctx.stroke();

  // Pulsing Red AI Bounding Box
  const bx = cx - w * 0.62;
  const by = headY - 4;
  const bw = w * 1.24;
  const bh = h + 10;
  ctx.strokeStyle = strobeOn ? "#fef08a" : "#ef4444";
  ctx.lineWidth = 2.4;
  ctx.strokeRect(bx, by, bw, bh);

  // Corner brackets + Alert label tag
  ctx.fillStyle = "#dc2626";
  const lblW = 148;
  const lx = Math.max(6, Math.min(480 - lblW - 6, bx));
  ctx.fillRect(lx, Math.max(30, by - 19), lblW, 17);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 9.5px Segoe UI, sans-serif";
  ctx.fillText("CẢNH BÁO NGƯỜI LẠ • AI 98%", lx + 5, Math.max(42, by - 7));
}

function captureEvidenceSnapshot(reasonTag, msgText, isDanger = false, autoDownload = false) {
  drawCameraFrame(performance.now());
  const canvas = document.getElementById("cam-canvas");
  let dataUrl = "";
  try {
    dataUrl = canvas ? canvas.toDataURL("image/png") : "";
  } catch (_) {}
  state.camEvents.unshift({
    time: nowTimeStr(),
    tag: reasonTag,
    danger: isDanger,
    msg: msgText,
    thumb: dataUrl,
  });
  if (state.camEvents.length > 10) state.camEvents.length = 10;

  if (autoDownload && dataUrl) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `GreenInfo_Cam_${state.camActiveId}_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  renderCameraSecurityUI();
}

function triggerIntrusionSimulation(forceState = null, publishMqtt = true) {
  const next = forceState !== null ? forceState : !state.camIntruderActive;
  state.camIntruderActive = next;
  if (next) {
    state.camGuardArmed = true;
    state.camNightMode = true;
    state.camSirenActive = true;
    playSirenTone(2);
    captureEvidenceSnapshot(
      "BÁO ĐỘNG ĐỎ",
      `Phát hiện người lạ tại ${state.camActiveId === "cam1" ? "Lối đi giữa (gần Cửa lùa)" : "Cửa lùa & Rào 32 Mesh"}! Đã bật Còi 110dB + Đèn pha.`,
      true,
      false
    );
    showToast("CẢNH BÁO! Camera AI phát hiện người lạ xâm nhập!");
  } else {
    state.camSirenActive = false;
    state.camEvents.unshift({
      time: nowTimeStr(),
      tag: "Đã xác nhận",
      danger: false,
      msg: "Chủ vườn đã kiểm tra & tắt còi báo động. Tiếp tục canh gác AI.",
      thumb: "",
    });
    showToast("Đã tắt báo động — Nhà vòm trở lại trạng thái An toàn");
  }
  if (publishMqtt) {
    sendAppCmd({ intruder: state.camIntruderActive, siren: state.camSirenActive });
  }
  renderAll();
}

function renderCameraSecurityUI() {
  const alarm = state.camIntruderActive;

  // Global Push Banner + Tab Dot + Sim Buttons
  const igb = document.getElementById("intruder-global-banner");
  if (igb) igb.classList.toggle("hidden", !alarm);
  const tabDot = document.getElementById("tab-cam-dot");
  if (tabDot) tabDot.classList.toggle("alarm", alarm);

  for (const id of ["btn-sb-intruder", "btn-app-intruder"]) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("active", alarm);
  }

  // Tab 1 Overview Glance Card
  const glance = document.getElementById("ov-cam-glance");
  if (glance) {
    glance.classList.toggle("alarm", alarm);
    document.getElementById("ov-cam-title").textContent = alarm
      ? "BÁO ĐỘNG ĐỎ: Phát hiện người lạ tại vòm!"
      : `Camera AI & Chống trộm: ${state.camGuardArmed ? "Đang trực 24/7" : "Chỉ xem trực tiếp"}`;
    document.getElementById("ov-cam-sub").textContent = alarm
      ? "Còi 110dB + Đèn pha đang hú • Bấm Xem Cam kiểm tra ngay!"
      : `2 Cam dùng chung (Hành lang 12 m + Cửa lùa) • Cửa ${state.camDoorLocked ? "đã khóa" : "đang mở"}`;
  }

  // Tab 5 Status Card & Viewport
  const stCard = document.getElementById("cam-status-card");
  if (stCard) {
    stCard.classList.toggle("alarm", alarm);
    document.getElementById("cam-guard-pill").textContent = alarm
      ? "KHẨN CẤP: PHÁT HIỆN NGƯỜI LẠ 98%"
      : state.camGuardArmed
        ? "AN NINH: AI CANH GÁC BẬT"
        : "CHẾ ĐỘ CHỈ XEM LIVE";
    document.getElementById("cam-status-title").textContent = alarm
      ? "BÁO ĐỘNG XÂM NHẬP BAN ĐÊM!"
      : "Camera AI Trực tiếp & Chống trộm";
    document.getElementById("cam-status-desc").textContent = alarm
      ? "AI nhận diện dáng người đang tiến vào khu vực cửa lùa / lối đi. Còi 110dB & Đèn pha đã kích hoạt tự động!"
      : "Ban ngày quét 84 gốc dưa • Ban đêm chuyển AI nhận diện người lạ + còi hú 110dB + báo điện thoại < 2s.";
    document.getElementById("cam-lock-tag").textContent = state.camDoorLocked ? "CỬA KHÓA" : "ĐANG MỞ";
  }

  const vp = document.getElementById("cam-viewport");
  if (vp) vp.classList.toggle("alarm", alarm);

  document.querySelectorAll("[data-cam-src]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.camSrc === state.camActiveId);
  });

  // Control toggles & Slider
  const btnIr = document.getElementById("btn-cam-ir");
  if (btnIr) btnIr.classList.toggle("active", state.camNightMode);
  const btnGuard = document.getElementById("btn-cam-guard");
  if (btnGuard) {
    btnGuard.classList.toggle("active", state.camGuardArmed);
    btnGuard.querySelector("span").textContent = state.camGuardArmed ? "AI Canh trộm: BẬT" : "AI Canh trộm: TẮT";
  }
  const btnPatrol = document.getElementById("btn-cam-patrol");
  if (btnPatrol) btnPatrol.classList.toggle("active", state.camAutoPatrol);

  const railWrap = document.getElementById("cam-rail-control-wrap");
  if (railWrap) railWrap.classList.toggle("disabled", state.camActiveId !== "cam1");
  const railSlider = document.getElementById("cam-rail-slider");
  if (railSlider) railSlider.value = state.camRailM.toFixed(1);
  const railReadout = document.getElementById("cam-rail-readout");
  if (railReadout) {
    const pIdx = getRailPairIdx(state.camRailM);
    railReadout.textContent = `y = ${state.camRailM.toFixed(1)} m • Cặp A${pIdx} / C${pIdx}`;
  }

  // 4 Emergency Action Buttons
  const btnIntr = document.getElementById("btn-cam-test-intruder");
  if (btnIntr) {
    btnIntr.classList.toggle("active", alarm);
    document.getElementById("lbl-btn-intruder").textContent = alarm ? "Đã xử lý (Tắt báo động)" : "Giả lập Trộm vào";
    document.getElementById("sub-btn-intruder").textContent = alarm ? "Xác nhận an toàn ngay" : "Test phát hiện người lạ";
  }

  const btnSiren = document.getElementById("btn-cam-siren");
  if (btnSiren) {
    btnSiren.classList.toggle("active", state.camSirenActive);
    document.getElementById("lbl-btn-siren").textContent = state.camSirenActive ? "ĐANG HÚ CÒI + ĐÈN PHA" : "Bật Còi 110dB + Đèn";
    document.getElementById("sub-btn-siren").textContent = state.camSirenActive ? "Chạm để tắt còi tại vòm" : "Đuổi trộm tại chỗ";
  }

  const btnLock = document.getElementById("btn-cam-lock");
  if (btnLock) {
    btnLock.classList.toggle("unlocked", !state.camDoorLocked);
    document.getElementById("lbl-btn-lock").textContent = state.camDoorLocked ? "Chốt cửa: ĐANG KHÓA" : "Chốt cửa: ĐANG MỞ";
  }

  // Event Log & Thumbnails
  const logCount = document.getElementById("cam-log-count");
  if (logCount) logCount.textContent = `${state.camEvents.length} sự kiện`;
  const logList = document.getElementById("cam-event-list");
  if (logList) {
    logList.innerHTML = state.camEvents
      .map(
        (ev) => `
      <div class="cel-item ${ev.danger ? "danger" : ""}">
        <div class="cel-txt">
          <div class="cel-top"><span class="cel-tag">${ev.tag}</span><span>${ev.time}</span></div>
          <div class="cel-msg">${ev.msg}</div>
        </div>
        ${ev.thumb ? `<img class="cel-thumb" src="${ev.thumb}" alt="Ảnh bằng chứng" />` : ""}
      </div>`
      )
      .join("");
  }
}

// Camera Tab Event Bindings
document.querySelectorAll("[data-cam-src]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.camActiveId = btn.dataset.camSrc;
    renderCameraSecurityUI();
    drawCameraFrame(performance.now());
  });
});

document.getElementById("btn-cam-ir")?.addEventListener("click", () => {
  state.camNightMode = !state.camNightMode;
  renderCameraSecurityUI();
  drawCameraFrame(performance.now());
  showToast(state.camNightMode ? "Đã bật chế độ Hồng ngoại Đêm (IR)" : "Đã chuyển về chế độ Ngày có màu");
});

document.getElementById("btn-cam-guard")?.addEventListener("click", () => {
  state.camGuardArmed = !state.camGuardArmed;
  renderCameraSecurityUI();
  showToast(state.camGuardArmed ? "Đã BẬT AI Canh trộm tự động" : "Đã TẮT cảnh báo trộm tạm thời");
});

document.getElementById("btn-cam-patrol")?.addEventListener("click", () => {
  state.camAutoPatrol = !state.camAutoPatrol;
  renderCameraSecurityUI();
});

document.getElementById("cam-rail-slider")?.addEventListener("input", (e) => {
  state.camAutoPatrol = false;
  state.camRailM = Number(e.target.value);
  renderCameraSecurityUI();
  drawCameraFrame(performance.now());
});

for (const id of ["btn-cam-test-intruder", "btn-sb-intruder", "btn-app-intruder"]) {
  document.getElementById(id)?.addEventListener("click", () => {
    triggerIntrusionSimulation();
    if (state.camIntruderActive && (id === "btn-sb-intruder" || id === "btn-app-intruder")) {
      switchTab("camera");
    }
  });
}

document.getElementById("btn-igb-view")?.addEventListener("click", () => switchTab("camera"));
document.getElementById("btn-igb-clear")?.addEventListener("click", () => triggerIntrusionSimulation(false));

document.getElementById("btn-cam-siren")?.addEventListener("click", () => {
  state.camSirenActive = !state.camSirenActive;
  if (state.camSirenActive) playSirenTone(2);
  sendAppCmd({ siren: state.camSirenActive });
  renderCameraSecurityUI();
  drawCameraFrame(performance.now());
  showToast(state.camSirenActive ? "Đang hú Còi 110dB + Nháy Đèn pha rơ-le 12V!" : "Đã tắt còi hú & đèn pha");
});

document.getElementById("btn-cam-lock")?.addEventListener("click", () => {
  state.camDoorLocked = !state.camDoorLocked;
  sendAppCmd({ door_lock: state.camDoorLocked });
  state.camEvents.unshift({
    time: nowTimeStr(),
    tag: "Chốt cửa",
    danger: false,
    msg: state.camDoorLocked ? "Chủ vườn đã KHÓA CHẶT chốt từ cửa lùa." : "Chủ vườn đã MỞ KHÓA cửa lùa từ xa.",
    thumb: "",
  });
  renderCameraSecurityUI();
  drawCameraFrame(performance.now());
  showToast(state.camDoorLocked ? "Cửa lùa đã KHÓA CHẶT qua Relay 12V" : "Đã MỞ KHÓA cửa lùa từ xa");
});

for (const snapId of ["btn-cam-snapshot", "btn-cam-overlay-snap"]) {
  document.getElementById(snapId)?.addEventListener("click", () => {
    captureEvidenceSnapshot(
      state.camIntruderActive ? "Bằng chứng Đỏ" : "Ảnh chụp tay",
      `Lưu ảnh bằng chứng từ ${state.camActiveId === "cam1" ? "Cam 01 Hành lang" : "Cam 02 Cửa lùa"}.`,
      state.camIntruderActive,
      true
    );
    showToast("Đã chụp ảnh bằng chứng & lưu vào Nhật ký!");
  });
}

// Smooth Camera Patrol & CCTV Render Loop (~20fps when Camera tab open)
let lastCamDraw = 0;
function camLoop(now) {
  if (state.camAutoPatrol && state.camActiveId === "cam1" && state.activeTab === "camera") {
    state.camRailM = 6.0 + 4.8 * Math.sin(now * 0.00045 - 0.35);
    const slider = document.getElementById("cam-rail-slider");
    const readout = document.getElementById("cam-rail-readout");
    if (slider) slider.value = state.camRailM.toFixed(1);
    if (readout) {
      readout.textContent = `y = ${state.camRailM.toFixed(1)} m • Cặp A${getRailPairIdx(state.camRailM)} / C${getRailPairIdx(state.camRailM)}`;
    }
  }
  if (state.activeTab === "camera" && now - lastCamDraw >= 48) {
    lastCamDraw = now;
    drawCameraFrame(now);
  }
  requestAnimationFrame(camLoop);
}
requestAnimationFrame(camLoop);

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
drawCameraFrame(performance.now());
