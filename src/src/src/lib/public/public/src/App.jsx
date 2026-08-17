import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus, Trash2, Edit2, Copy, ChevronDown, ChevronRight, AlertTriangle,
  Printer, ArrowLeft, X, Check, LayoutDashboard, Map, Building2, Car,
  Plane, TrainFront, Trees, Compass, Users, FileText, Coins, Settings,
  Search, ChevronUp, GripVertical, Info, TriangleAlert
} from "lucide-react";

/* ============================================================
   CONSTANTS
============================================================ */
const CURRENCIES = ["KES", "USD", "EUR", "GBP"];
const ROOM_TYPES = ["single", "double", "twin", "triple", "childSharing", "childOwnRoom"];
const ROOM_LABELS = {
  single: "Single", double: "Double", twin: "Twin", triple: "Triple",
  childSharing: "Child sharing (in parent room)", childOwnRoom: "Child — own room",
};
const MEAL_PLANS = ["Bed & Breakfast", "Half Board", "Full Board", "All-Inclusive"];
const STATUSES = ["Draft", "Costed", "Quoted", "Confirmed", "Deposit Paid", "Fully Paid", "Completed", "Cancelled"];
const STATUS_COLOR = {
  Draft: "#8a8672", Costed: "#8a8672", Quoted: "#b8934a", Confirmed: "#5c7a63",
  "Deposit Paid": "#5c7a63", "Fully Paid": "#5c7a63", Completed: "#5c7a63", Cancelled: "#a94438",
};
const TRANSPORT_MODES = [
  { key: "perDay", label: "Per day" },
  { key: "oneWay", label: "One-way transfer" },
  { key: "return", label: "Return transfer" },
  { key: "perKm", label: "Per kilometre" },
];
const ACTIVITY_PRICING = [
  { key: "perPerson", label: "Per person" },
  { key: "perVehicle", label: "Per vehicle" },
  { key: "perGroup", label: "Per group" },
];

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const fmt = (n) => {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return Math.round(n).toLocaleString("en-KE");
};
const todayISO = () => new Date().toISOString().slice(0, 10);
const money = (n, cur) => `${cur} ${fmt(n)}`;

/* ============================================================
   SAMPLE DATA  (fictional, illustrative — not live supplier prices)
============================================================ */
const SAMPLE = () => ({
  exchangeRates: { KES: 1, USD: 129, EUR: 140, GBP: 163 },
  childAgeBands: [
    { name: "Infant", maxAge: 2 },
    { name: "Child", maxAge: 11 },
    { name: "Teenager", maxAge: 17 },
  ],
  properties: [
    {
      id: uid(), name: "Sirikoi Lodge", location: "Lewa / Laikipia", category: "Luxury",
      supplier: "Sirikoi Reservations", currency: "KES", commissionPct: 15,
      rateSets: [{ id: uid(), season: "Standard 2027", validFrom: "2027-01-01", validTo: "2027-12-19",
        mealPlan: "Full Board", single: 95000, double: 70000, twin: 70000, triple: 65000,
        childSharing: 21000, childOwnRoom: 46000, singleSupplement: 25000 }],
      notes: "Rack rates shown net of commission are illustrative sample figures only.",
    },
    {
      id: uid(), name: "Sarara Camp", location: "Namunyak Conservancy, Samburu", category: "Ultra Luxury",
      supplier: "Sarara Reservations", currency: "USD", commissionPct: 15,
      rateSets: [{ id: uid(), season: "Peak 2027", validFrom: "2027-07-01", validTo: "2027-10-31",
        mealPlan: "All-Inclusive", single: 1450, double: 1050, twin: 1050, triple: 980,
        childSharing: 420, childOwnRoom: 850, singleSupplement: 400 },
        { id: uid(), season: "Standard 2027", validFrom: "2027-01-01", validTo: "2027-06-30",
        mealPlan: "All-Inclusive", single: 1150, double: 850, twin: 850, triple: 790,
        childSharing: 340, childOwnRoom: 680, singleSupplement: 300 }],
      notes: "Sample figures.",
    },
    {
      id: uid(), name: "Elephant Bedroom Camp", location: "Samburu National Reserve", category: "Luxury",
      supplier: "Atua Enkop", currency: "USD", commissionPct: 15,
      rateSets: [{ id: uid(), season: "Standard 2027", validFrom: "2027-01-01", validTo: "2027-12-31",
        mealPlan: "Full Board", single: 620, double: 460, twin: 460, triple: 430,
        childSharing: 180, childOwnRoom: 350, singleSupplement: 160 }],
      notes: "Sample figures.",
    },
    {
      id: uid(), name: "Hemingways Nairobi", location: "Karen, Nairobi", category: "Luxury (city)",
      supplier: "Hemingways Collection", currency: "USD", commissionPct: 10,
      rateSets: [{ id: uid(), season: "Standard 2027", validFrom: "2027-01-01", validTo: "2027-12-31",
        mealPlan: "Bed & Breakfast", single: 420, double: 310, twin: 310, triple: 290,
        childSharing: 90, childOwnRoom: 220, singleSupplement: 110 }],
      notes: "Sample figures.",
    },
    {
      id: uid(), name: "Angama Mara", location: "Maasai Mara", category: "Ultra Luxury",
      supplier: "Angama Reservations", currency: "USD", commissionPct: 15,
      rateSets: [{ id: uid(), season: "Peak 2027", validFrom: "2027-07-01", validTo: "2027-10-31",
        mealPlan: "Full Board", single: 1650, double: 1150, twin: 1150, triple: 1080,
        childSharing: 380, childOwnRoom: 780, singleSupplement: 500 }],
      notes: "Sample figures.",
    },
    {
      id: uid(), name: "Tortilis Camp", location: "Amboseli", category: "Luxury",
      supplier: "Elewana Collection", currency: "USD", commissionPct: 12,
      rateSets: [{ id: uid(), season: "Standard 2027", validFrom: "2027-01-01", validTo: "2027-12-31",
        mealPlan: "Full Board", single: 690, double: 480, twin: 480, triple: 450,
        childSharing: 190, childOwnRoom: 360, singleSupplement: 210 }],
      notes: "Sample figures.",
    },
    {
      id: uid(), name: "Finch Hattons", location: "Tsavo West", category: "Luxury",
      supplier: "Finch Hattons Reservations", currency: "USD", commissionPct: 12,
      rateSets: [{ id: uid(), season: "Standard 2027", validFrom: "2027-01-01", validTo: "2027-12-31",
        mealPlan: "Full Board", single: 610, double: 430, twin: 430, triple: 400,
        childSharing: 170, childOwnRoom: 320, singleSupplement: 180 }],
      notes: "Sample figures.",
    },
    {
      id: uid(), name: "AfroChic Diani", location: "Diani Beach", category: "Boutique",
      supplier: "AfroChic Reservations", currency: "USD", commissionPct: 10,
      rateSets: [{ id: uid(), season: "Standard 2027", validFrom: "2027-01-01", validTo: "2027-12-31",
        mealPlan: "Bed & Breakfast", single: 340, double: 240, twin: 240, triple: 220,
        childSharing: 70, childOwnRoom: 160, singleSupplement: 90 }],
      notes: "Sample figures.",
    },
  ],
  vehicles: [
    { id: uid(), name: "4x4 Land Cruiser (pop-up, 5-seat)", type: "Safari 4x4", seats: 5, ratePerDay: 22000, ratePerKm: 180, oneWay: 15000, return: 26000, driverCost: 3500, currency: "KES", notes: "Owner-operated unit." },
    { id: uid(), name: "4x4 Land Cruiser (7-seat)", type: "Safari 4x4", seats: 7, ratePerDay: 26000, ratePerKm: 200, oneWay: 18000, return: 32000, driverCost: 3500, currency: "KES", notes: "Sample rate." },
    { id: uid(), name: "11-Seater Safari Van", type: "Van", seats: 11, ratePerDay: 20000, ratePerKm: 160, oneWay: 14000, return: 24000, driverCost: 3000, currency: "KES", notes: "Sample rate." },
    { id: uid(), name: "Luxury SUV (Nairobi transfers)", type: "SUV", seats: 4, ratePerDay: 18000, ratePerKm: 150, oneWay: 6000, return: 10000, driverCost: 3000, currency: "KES", notes: "Airport / city transfers." },
  ],
  flights: [
    { id: uid(), operator: "Safarilink", route: "Nairobi Wilson → Samburu", from: "Wilson (WIL)", to: "Samburu (UAS)", adultFare: 220, childFare: 165, infantFare: 30, currency: "USD", notes: "One-way, sample fare." },
    { id: uid(), operator: "Safarilink", route: "Nairobi Wilson → Maasai Mara", from: "Wilson (WIL)", to: "Mara (various)", adultFare: 250, childFare: 190, infantFare: 30, currency: "USD", notes: "One-way, sample fare." },
    { id: uid(), operator: "AirKenya", route: "Nairobi Wilson → Amboseli", from: "Wilson (WIL)", to: "Amboseli (ASV)", adultFare: 190, childFare: 140, infantFare: 25, currency: "USD", notes: "One-way, sample fare." },
    { id: uid(), operator: "Kenya Airways", route: "Nairobi JKIA → Ukunda (Diani)", from: "JKIA", to: "Ukunda (UKA)", adultFare: 145, childFare: 120, infantFare: 20, currency: "USD", notes: "One-way, sample fare." },
    { id: uid(), operator: "Tropic Air (charter)", route: "Nairobi Wilson → Samburu (helicopter)", from: "Wilson (WIL)", to: "Samburu", adultFare: 950, childFare: 950, infantFare: 950, currency: "USD", notes: "Charter — priced per seat equivalent, sample only." },
  ],
  trains: [
    { id: uid(), route: "Nairobi → Mombasa", trainClass: "First Class", adultFare: 3000, childFare: 1500, transferCost: 2500, currency: "KES", notes: "SGR, sample fare." },
    { id: uid(), route: "Nairobi → Mombasa", trainClass: "Economy", adultFare: 1000, childFare: 500, transferCost: 1500, currency: "KES", notes: "SGR, sample fare." },
  ],
  parks: [
    { id: uid(), name: "Samburu National Reserve", type: "National Reserve", adultNonRes: 100, adultRes: 1000, childRate: 60, vehicleFee: 30, guideFee: 20, currency: "USD", notes: "Sample rate, per day." },
    { id: uid(), name: "Buffalo Springs National Reserve", type: "National Reserve", adultNonRes: 100, adultRes: 1000, childRate: 60, vehicleFee: 30, guideFee: 20, currency: "USD", notes: "Sample rate, per day." },
    { id: uid(), name: "Namunyak Conservancy (Sarara)", type: "Community Conservancy", adultNonRes: 90, adultRes: 90, childRate: 45, vehicleFee: 0, guideFee: 0, currency: "USD", notes: "Conservancy fee, typically bundled — sample." },
    { id: uid(), name: "Maasai Mara National Reserve", type: "National Reserve", adultNonRes: 200, adultRes: 1500, childRate: 100, vehicleFee: 0, guideFee: 0, currency: "USD", notes: "Sample rate, per day." },
    { id: uid(), name: "Amboseli National Park", type: "National Park", adultNonRes: 90, adultRes: 1000, childRate: 50, vehicleFee: 0, guideFee: 0, currency: "USD", notes: "Sample rate, per day." },
    { id: uid(), name: "Tsavo East National Park", type: "National Park", adultNonRes: 60, adultRes: 500, childRate: 35, vehicleFee: 0, guideFee: 0, currency: "USD", notes: "Sample rate, per day." },
  ],
  activities: [
    { id: uid(), name: "Morning / Evening Game Drive", location: "Any", pricingType: "perVehicle", adultPrice: 0, childPrice: 0, groupPrice: 8000, duration: "3 hrs", currency: "KES", notes: "Sample, per vehicle." },
    { id: uid(), name: "Walking Safari with Armed Ranger", location: "Samburu / Laikipia", pricingType: "perPerson", adultPrice: 45, childPrice: 25, groupPrice: 0, duration: "2 hrs", currency: "USD", notes: "Sample." },
    { id: uid(), name: "Samburu Cultural Village Visit", location: "Samburu", pricingType: "perPerson", adultPrice: 25, childPrice: 15, groupPrice: 0, duration: "1.5 hrs", currency: "USD", notes: "Sample; community fee." },
    { id: uid(), name: "Lake Turkana Sundowner & Cultural Experience", location: "Lake Turkana", pricingType: "perGroup", adultPrice: 0, childPrice: 0, groupPrice: 35000, duration: "3 hrs", currency: "KES", notes: "Includes Turkana Boy site visit — sample." },
    { id: uid(), name: "Camel Safari", location: "Samburu / Laikipia", pricingType: "perPerson", adultPrice: 35, childPrice: 20, groupPrice: 0, duration: "2 hrs", currency: "USD", notes: "Sample." },
    { id: uid(), name: "Bush Breakfast / Sundowner", location: "Any", pricingType: "perGroup", adultPrice: 0, childPrice: 0, groupPrice: 250, duration: "1.5 hrs", currency: "USD", notes: "Sample." },
    { id: uid(), name: "Boat Ride (Mara River)", location: "Maasai Mara", pricingType: "perPerson", adultPrice: 30, childPrice: 20, groupPrice: 0, duration: "1 hr", currency: "USD", notes: "Sample." },
    { id: uid(), name: "Helicopter Excursion (add-on)", location: "Samburu / Laikipia", pricingType: "perGroup", adultPrice: 0, childPrice: 0, groupPrice: 1800, duration: "45 min", currency: "USD", notes: "Tropic Air, sample." },
  ],
  staff: [
    { id: uid(), name: "Driver-Guide (KPSGA Bronze)", role: "Driver / Guide", dailyRate: 4500, allowance: 1500, currency: "KES", notes: "Sample." },
    { id: uid(), name: "Senior Safari Guide (KPSGA Silver/Gold)", role: "Specialist Guide", dailyRate: 9000, allowance: 2000, currency: "KES", notes: "Sample." },
    { id: uid(), name: "Walking Guide", role: "Walking Guide", dailyRate: 6000, allowance: 1500, currency: "KES", notes: "Sample." },
    { id: uid(), name: "Local Community Guide", role: "Community Guide", dailyRate: 3000, allowance: 500, currency: "KES", notes: "Sample." },
  ],
  suppliers: [
    { id: uid(), name: "Sarara Reservations", category: "Accommodation", contact: "reservations@sarara.example", phone: "+254 700 000 001", location: "Samburu", currency: "USD", paymentTerms: "50% deposit, balance 60 days prior", commissionPct: 15, notes: "Sample." },
    { id: uid(), name: "Safarilink", category: "Air Charter", contact: "res@safarilink.example", phone: "+254 700 000 002", location: "Nairobi", currency: "USD", paymentTerms: "Full payment on booking", commissionPct: 8, notes: "Sample." },
  ],
  itineraries: [],
});

/* ============================================================
   PERSISTENCE
============================================================ */
const STORAGE_KEY = "lengila-costing-app-v1";
async function loadState() {
  try {
    const res = await window.storage.get(STORAGE_KEY, false);
    if (res && res.value) return JSON.parse(res.value);
  } catch (e) { /* not found or error -> fall through */ }
  return SAMPLE();
}
async function saveState(state) {
  try { await window.storage.set(STORAGE_KEY, JSON.stringify(state), false); }
  catch (e) { console.error("Save failed", e); }
}

/* ============================================================
   CALCULATION ENGINE
============================================================ */
function convert(amount, fromCur, toCur, rates) {
  if (!amount) return 0;
  const from = rates[fromCur] ?? 1, to = rates[toCur] ?? 1;
  return (amount * from) / to;
}

function ageCategory(age, bands) {
  if (age === "" || age === null || age === undefined) return "Unknown";
  const a = Number(age);
  for (const b of bands) if (a <= b.maxAge) return b.name;
  return "Adult";
}

// Returns { cost, adultCost, childCost, formula, warnings[] } in the itinerary's costing currency
function calcItem(item, ctx) {
  const { rates, costingCurrency, db } = ctx;
  const warn = [];
  const toCosting = (amt, cur) => convert(amt, cur, costingCurrency, rates);

  if (item.type === "accommodation") {
    const prop = db.properties.find((p) => p.id === item.propertyId);
    if (!prop) return { cost: 0, adultCost: 0, childCost: 0, formula: "Property not found", warnings: ["RATE NOT FOUND — property missing"] };
    const rs = prop.rateSets.find((r) => r.id === item.rateSetId) || prop.rateSets[0];
    if (!rs) return { cost: 0, adultCost: 0, childCost: 0, formula: "No rate set on file", warnings: ["RATE NOT FOUND — no rate set"] };
    if (ctx.tripStart && (rs.validTo < ctx.tripStart || rs.validFrom > ctx.tripEnd)) {
      warn.push(`Selected rate "${rs.season}" may not cover travel dates (valid ${rs.validFrom} – ${rs.validTo})`);
    }
    let adultCost = 0, childCost = 0, lines = [];
    (item.rooms || []).forEach((room) => {
      const rate = rs[room.roomType];
      if (rate === undefined || rate === null) { warn.push(`Missing ${ROOM_LABELS[room.roomType]} rate at ${prop.name}`); return; }
      const nights = item.nights || 1;
      const roomTotal = rate * nights * (room.count || 1);
      const roomKes = toCosting(roomTotal, prop.currency);
      if (room.roomType === "childSharing" || room.roomType === "childOwnRoom") childCost += roomKes;
      else adultCost += roomKes;
      lines.push(`${room.count}× ${ROOM_LABELS[room.roomType]} × ${nights}n × ${prop.currency} ${fmt(rate)} = ${prop.currency} ${fmt(roomTotal)}`);
    });
    return {
      cost: adultCost + childCost, adultCost, childCost,
      formula: `${prop.name} (${rs.season}, ${rs.mealPlan}):\n${lines.join("\n")}`,
      warnings: warn,
    };
  }

  if (item.type === "transport") {
    const v = db.vehicles.find((x) => x.id === item.vehicleId);
    if (!v) return { cost: 0, adultCost: 0, childCost: 0, formula: "Vehicle not found", warnings: ["RATE NOT FOUND — vehicle missing"] };
    let base = 0, label = "";
    if (item.mode === "perDay") { base = v.ratePerDay * (item.qty || 1); label = `${v.currency} ${fmt(v.ratePerDay)}/day × ${item.qty || 1} day(s)`; }
    else if (item.mode === "oneWay") { base = v.oneWay * (item.qty || 1); label = `${v.currency} ${fmt(v.oneWay)} one-way × ${item.qty || 1}`; }
    else if (item.mode === "return") { base = v.return * (item.qty || 1); label = `${v.currency} ${fmt(v.return)} return × ${item.qty || 1}`; }
    else if (item.mode === "perKm") { base = v.ratePerKm * (item.qty || 1); label = `${v.currency} ${fmt(v.ratePerKm)}/km × ${item.qty || 1} km`; }
    let driver = 0;
    if (item.includeDriver && item.mode === "perDay") { driver = v.driverCost * (item.qty || 1); }
    const total = toCosting(base + driver, v.currency);
    return {
      cost: total, adultCost: total, childCost: 0,
      formula: `${v.name}: ${label}${driver ? ` + driver ${v.currency} ${fmt(v.driverCost)} × ${item.qty || 1}` : ""} = ${v.currency} ${fmt(base + driver)}`,
      warnings: [],
    };
  }

  if (item.type === "flight" || item.type === "train") {
    const list = item.type === "flight" ? db.flights : db.trains;
    const f = list.find((x) => x.id === item.refId);
    if (!f) return { cost: 0, adultCost: 0, childCost: 0, formula: "Fare not found", warnings: ["RATE NOT FOUND — fare missing"] };
    const mult = item.tripType === "return" ? 2 : 1;
    const adultFare = f.adultFare, childFare = f.childFare ?? f.adultFare, infantFare = f.infantFare ?? 0;
    const transfer = f.transferCost || 0;
    const adultsCost = adultFare * (item.adults || 0) * mult;
    const childrenCost = childFare * (item.children || 0) * mult;
    const infantsCost = (infantFare || 0) * (item.infants || 0) * mult;
    const transferTotal = transfer * ((item.adults || 0) + (item.children || 0));
    const adultKes = toCosting(adultsCost + transferTotal * (item.adults / Math.max(1, (item.adults||0)+(item.children||0))), f.currency);
    const childKes = toCosting(childrenCost + infantsCost, f.currency);
    return {
      cost: toCosting(adultsCost + childrenCost + infantsCost + transferTotal, f.currency),
      adultCost: adultKes, childCost: childKes,
      formula: `${item.route || f.route}${item.tripType === "return" ? " (return)" : " (one-way)"}:\n${item.adults || 0} adult × ${f.currency} ${fmt(adultFare)}${mult===2?" ×2":""} + ${item.children || 0} child × ${f.currency} ${fmt(childFare)}${mult===2?" ×2":""}${item.infants ? ` + ${item.infants} infant × ${f.currency} ${fmt(infantFare)}` : ""}${transfer ? ` + transfers ${f.currency} ${fmt(transferTotal)}` : ""}`,
      warnings: [],
    };
  }

  if (item.type === "park") {
    const p = db.parks.find((x) => x.id === item.parkId);
    if (!p) return { cost: 0, adultCost: 0, childCost: 0, formula: "Park fee not found", warnings: ["RATE NOT FOUND — park missing"] };
    const days = item.days || 1;
    const adultTotal = p.adultNonRes * (item.adults || 0) * days;
    const childTotal = p.childRate * (item.children || 0) * days;
    const vehicleTotal = (p.vehicleFee || 0) * (item.vehicles || 1) * days;
    const guideTotal = (p.guideFee || 0) * days;
    const adultKes = toCosting(adultTotal + vehicleTotal + guideTotal, p.currency);
    const childKes = toCosting(childTotal, p.currency);
    return {
      cost: adultKes + childKes, adultCost: adultKes, childCost: childKes,
      formula: `${p.name}: ${item.adults || 0} adult × ${p.currency} ${fmt(p.adultNonRes)} × ${days}d + ${item.children || 0} child × ${p.currency} ${fmt(p.childRate)} × ${days}d${p.vehicleFee ? ` + vehicle fee ${p.currency} ${fmt(p.vehicleFee)} × ${days}d` : ""}${p.guideFee ? ` + guide fee ${p.currency} ${fmt(p.guideFee)} × ${days}d` : ""}`,
      warnings: [],
    };
  }

  if (item.type === "activity") {
    const a = db.activities.find((x) => x.id === item.activityId);
    if (!a) return { cost: 0, adultCost: 0, childCost: 0, formula: "Activity not found", warnings: ["RATE NOT FOUND — activity missing"] };
    let total = 0, label = "";
    if (a.pricingType === "perPerson") {
      total = a.adultPrice * (item.adults || 0) + (a.childPrice ?? a.adultPrice) * (item.children || 0);
      label = `${item.adults || 0} adult × ${a.currency} ${fmt(a.adultPrice)} + ${item.children || 0} child × ${a.currency} ${fmt(a.childPrice)}`;
    } else if (a.pricingType === "perVehicle") {
      total = a.groupPrice * (item.qty || 1);
      label = `${a.currency} ${fmt(a.groupPrice)} × ${item.qty || 1} vehicle(s)`;
    } else {
      total = a.groupPrice * (item.qty || 1);
      label = `${a.currency} ${fmt(a.groupPrice)} × ${item.qty || 1} group(s)`;
    }
    const totalKes = toCosting(total, a.currency);
    const share = (item.adults || 0) + (item.children || 0) || 1;
    const adultKes = a.pricingType === "perPerson" ? toCosting(a.adultPrice * (item.adults || 0), a.currency) : totalKes;
    const childKes = a.pricingType === "perPerson" ? toCosting((a.childPrice ?? a.adultPrice) * (item.children || 0), a.currency) : 0;
    return { cost: totalKes, adultCost: adultKes, childCost: childKes, formula: `${a.name}: ${label}`, warnings: [] };
  }

  if (item.type === "staff") {
    const s = db.staff.find((x) => x.id === item.staffId);
    if (!s) return { cost: 0, adultCost: 0, childCost: 0, formula: "Guide/staff not found", warnings: ["RATE NOT FOUND — staff missing"] };
    const days = item.days || 1;
    const total = (s.dailyRate + (s.allowance || 0)) * days;
    const totalKes = toCosting(total, s.currency);
    return {
      cost: totalKes, adultCost: totalKes, childCost: 0,
      formula: `${s.name}: (${s.currency} ${fmt(s.dailyRate)} rate + ${s.currency} ${fmt(s.allowance || 0)} allowance) × ${days} day(s) = ${s.currency} ${fmt(total)}`,
      warnings: [],
    };
  }

  if (item.type === "other") {
    const total = (item.unitCost || 0) * (item.qty || 1);
    const totalKes = toCosting(total, item.currency || costingCurrency);
    return {
      cost: totalKes, adultCost: totalKes, childCost: 0,
      formula: `${item.description || "Other cost"}: ${item.currency || costingCurrency} ${fmt(item.unitCost || 0)} × ${item.qty || 1} = ${item.currency || costingCurrency} ${fmt(total)}`,
      warnings: [],
    };
  }

  return { cost: 0, adultCost: 0, childCost: 0, formula: "", warnings: [] };
}

function calcItinerary(itin, db, rates) {
  const ctx = { rates, costingCurrency: itin.costingCurrency, db, tripStart: itin.startDate, tripEnd: itin.endDate };
  const byCategory = { accommodation: 0, transport: 0, flight: 0, train: 0, park: 0, activity: 0, staff: 0, other: 0 };
  let netCost = 0, adultCost = 0, childCost = 0;
  const warnings = [];
  const dayResults = (itin.days || []).map((day) => {
    const itemResults = (day.items || []).map((item) => {
      const r = calcItem(item, ctx);
      netCost += r.cost; adultCost += r.adultCost; childCost += r.childCost;
      const cat = item.type === "flight" || item.type === "train" ? item.type : item.type;
      byCategory[cat] = (byCategory[cat] || 0) + r.cost;
      r.warnings.forEach((w) => warnings.push(`${day.title || "Day"}: ${w}`));
      return { item, ...r };
    });
    const dayTotal = itemResults.reduce((s, r) => s + r.cost, 0);
    return { day, itemResults, dayTotal };
  });
  // itinerary-level other costs
  (itin.otherCosts || []).forEach((oc) => {
    const total = (oc.unitCost || 0) * (oc.qty || 1);
    const totalKes = convert(total, oc.currency || itin.costingCurrency, itin.costingCurrency, rates);
    netCost += totalKes; adultCost += totalKes; byCategory.other += totalKes;
  });

  const contingency = itin.contingencyEnabled ? netCost * ((itin.contingencyPct || 0) / 100) : 0;
  const totalCost = netCost + contingency;

  let sellingPrice = 0, profit = 0, marginPct = 0, markupPct = 0;
  const mv = Number(itin.markupValue) || 0;
  if (itin.markupMode === "percent") {
    sellingPrice = totalCost * (1 + mv / 100);
    profit = sellingPrice - totalCost;
    markupPct = mv;
    marginPct = sellingPrice ? (profit / sellingPrice) * 100 : 0;
  } else if (itin.markupMode === "margin") {
    const denom = 1 - mv / 100;
    sellingPrice = denom > 0 ? totalCost / denom : totalCost;
    profit = sellingPrice - totalCost;
    marginPct = mv;
    markupPct = totalCost ? (profit / totalCost) * 100 : 0;
  } else if (itin.markupMode === "fixedProfit") {
    profit = mv;
    sellingPrice = totalCost + profit;
    marginPct = sellingPrice ? (profit / sellingPrice) * 100 : 0;
    markupPct = totalCost ? (profit / totalCost) * 100 : 0;
  } else if (itin.markupMode === "fixedPrice") {
    sellingPrice = mv;
    profit = sellingPrice - totalCost;
    marginPct = sellingPrice ? (profit / sellingPrice) * 100 : 0;
    markupPct = totalCost ? (profit / totalCost) * 100 : 0;
  }

  const pax = (itin.adults || 0) + (itin.children || 0);
  const adultsN = itin.adults || 0, childrenN = itin.children || 0;
  // proportion shared (transport/staff/other/adultCost-lumped) costs across pax by headcount for per-person view
  const sharedCost = adultCost; // adultCost already includes transport/staff/other + adult-attributed accommodation/park/activity/flight
  const perAdultCost = adultsN ? (sharedCost * (adultsN / pax || 1)) / adultsN + 0 : 0;
  // simpler & more transparent: split adultCost across adults, childCost across children
  const perAdultCostSimple = adultsN ? adultCost / adultsN : 0;
  const perChildCostSimple = childrenN ? childCost / childrenN : 0;
  const perAdultSell = adultsN && netCost ? perAdultCostSimple * (sellingPrice / totalCost || 1) : 0;
  const perChildSell = childrenN && netCost ? perChildCostSimple * (sellingPrice / totalCost || 1) : 0;

  return {
    dayResults, byCategory, netCost, adultCost, childCost, contingency, totalCost,
    sellingPrice, profit, marginPct, markupPct, warnings,
    pax, perAdultCostSimple, perChildCostSimple, perAdultSell, perChildSell,
  };
}

/* ============================================================
   GENERIC UI PRIMITIVES
============================================================ */
const Card = ({ children, className = "" }) => (
  <div className={`bg-[#22241d] border border-[#3a3c30] rounded-sm ${className}`}>{children}</div>
);
const SectionLabel = ({ children }) => (
  <div className="text-[11px] tracking-[0.14em] uppercase text-[#8a8672] font-medium mb-2">{children}</div>
);
const Btn = ({ children, onClick, variant = "default", className = "", type = "button", disabled }) => {
  const base = "inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] rounded-sm transition-colors font-medium disabled:opacity-40";
  const styles = {
    default: "bg-[#c08a28] text-[#1c1e1b] hover:bg-[#d49b34]",
    ghost: "bg-transparent text-[#c9c4b3] border border-[#3a3c30] hover:border-[#c08a28] hover:text-[#c08a28]",
    danger: "bg-transparent text-[#c9776a] border border-[#4a2f2b] hover:bg-[#3a2320]",
    subtle: "bg-[#2b2d24] text-[#c9c4b3] hover:bg-[#33362a]",
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
};
const Field = ({ label, children }) => (
  <label className="block">
    <div className="text-[11px] text-[#8a8672] mb-1">{label}</div>
    {children}
  </label>
);
const inputCls = "w-full bg-[#1c1e1b] border border-[#3a3c30] rounded-sm px-2.5 py-1.5 text-[13px] text-[#e8e3d8] focus:outline-none focus:border-[#c08a28]";
const TextInput = (props) => <input {...props} className={`${inputCls} ${props.className || ""}`} />;
const Select = ({ children, ...props }) => <select {...props} className={`${inputCls} ${props.className || ""}`}>{children}</select>;

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto py-8 px-4" onClick={onClose}>
      <div className={`bg-[#22241d] border border-[#3a3c30] rounded-sm w-full ${wide ? "max-w-3xl" : "max-w-lg"} shadow-2xl`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#3a3c30]">
          <div className="font-serif text-[17px] text-[#e8e3d8]">{title}</div>
          <button onClick={onClose} className="text-[#8a8672] hover:text-[#e8e3d8]"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Warn({ children }) {
  return (
    <div className="flex items-start gap-2 text-[12px] text-[#d49b34] bg-[#2e2712] border border-[#4a3a15] rounded-sm px-2.5 py-1.5">
      <TriangleAlert size={13} className="mt-0.5 shrink-0" /> <span>{children}</span>
    </div>
  );
}

/* ============================================================
   GENERIC EDITABLE TABLE (for vehicles, flights, trains, parks, activities, staff, suppliers)
============================================================ */
function GenericTable({ title, icon: Icon, schema, rows, setRows, currencies = CURRENCIES }) {
  const [editing, setEditing] = useState(null); // row object or null
  const [query, setQuery] = useState("");
  const blank = () => {
    const o = { id: uid() };
    schema.forEach((f) => (o[f.key] = f.type === "number" ? 0 : f.type === "select" ? (f.options ? f.options[0] : "") : ""));
    return o;
  };
  const save = (row) => {
    setRows((prev) => {
      const exists = prev.some((r) => r.id === row.id);
      return exists ? prev.map((r) => (r.id === row.id ? row : r)) : [...prev, row];
    });
    setEditing(null);
  };
  const del = (id) => setRows((prev) => prev.filter((r) => r.id !== id));
  const dup = (row) => setRows((prev) => [...prev, { ...row, id: uid(), name: row.name ? row.name + " (copy)" : undefined }]);
  const filtered = rows.filter((r) => JSON.stringify(r).toLowerCase().includes(query.toLowerCase()));
  const mainField = schema[0].key;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-[#c08a28]" />
          <h2 className="font-serif text-[22px] text-[#e8e3d8]">{title}</h2>
          <span className="text-[12px] text-[#8a8672]">({rows.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-[#8a8672]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="bg-[#1c1e1b] border border-[#3a3c30] rounded-sm pl-7 pr-2 py-1.5 text-[13px] text-[#e8e3d8] focus:outline-none focus:border-[#c08a28] w-44" />
          </div>
          <Btn onClick={() => setEditing(blank())}><Plus size={14} /> Add</Btn>
        </div>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="border-b border-[#3a3c30] text-left text-[#8a8672]">
              {schema.slice(0, 6).map((f) => <th key={f.key} className="px-3 py-2 font-medium whitespace-nowrap">{f.label}</th>)}
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-[#2b2d24] hover:bg-[#262820]">
                {schema.slice(0, 6).map((f) => (
                  <td key={f.key} className="px-3 py-2 text-[#c9c4b3] whitespace-nowrap max-w-[220px] truncate">
                    {f.type === "number" ? (f.money ? fmt(r[f.key]) : r[f.key]) : (r[f.key] || "—")}
                  </td>
                ))}
                <td className="px-3 py-2 text-right whitespace-nowrap">
                  <button onClick={() => setEditing(r)} className="text-[#8a8672] hover:text-[#c08a28] mr-2"><Edit2 size={13} /></button>
                  <button onClick={() => dup(r)} className="text-[#8a8672] hover:text-[#c08a28] mr-2"><Copy size={13} /></button>
                  <button onClick={() => del(r.id)} className="text-[#8a8672] hover:text-[#a94438]"><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="px-3 py-6 text-center text-[#8a8672]">No entries. Add your first one.</td></tr>}
          </tbody>
        </table>
      </Card>
      {editing && (
        <Modal title={editing[mainField] ? `Edit — ${editing[mainField]}` : `New ${title.replace(/s$/, "")}`} onClose={() => setEditing(null)} wide>
          <div className="grid grid-cols-2 gap-3.5">
            {schema.map((f) => (
              <div key={f.key} className={f.wide ? "col-span-2" : ""}>
                <Field label={f.label}>
                  {f.type === "select" ? (
                    <Select value={editing[f.key]} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}>
                      {(f.key === "currency" ? currencies : f.options).map((o) => <option key={o} value={o}>{o}</option>)}
                    </Select>
                  ) : (
                    <TextInput type={f.type === "number" ? "number" : "text"} value={editing[f.key]}
                      onChange={(e) => setEditing({ ...editing, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })} />
                  )}
                </Field>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-[#3a3c30]">
            <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
            <Btn onClick={() => save(editing)}><Check size={14} /> Save</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

const SCHEMAS = {
  vehicles: [
    { key: "name", label: "Vehicle" }, { key: "type", label: "Type" }, { key: "seats", label: "Seats", type: "number" },
    { key: "ratePerDay", label: "Rate/Day", type: "number", money: true }, { key: "oneWay", label: "One-way", type: "number", money: true },
    { key: "return", label: "Return", type: "number", money: true }, { key: "ratePerKm", label: "Rate/Km", type: "number", money: true },
    { key: "driverCost", label: "Driver/Day", type: "number", money: true }, { key: "currency", label: "Currency", type: "select" },
    { key: "notes", label: "Notes", wide: true },
  ],
  flights: [
    { key: "route", label: "Route" }, { key: "operator", label: "Operator" }, { key: "from", label: "From" }, { key: "to", label: "To" },
    { key: "adultFare", label: "Adult Fare", type: "number", money: true }, { key: "childFare", label: "Child Fare", type: "number", money: true },
    { key: "infantFare", label: "Infant Fare", type: "number", money: true }, { key: "currency", label: "Currency", type: "select" },
    { key: "notes", label: "Notes", wide: true },
  ],
  trains: [
    { key: "route", label: "Route" }, { key: "trainClass", label: "Class" },
    { key: "adultFare", label: "Adult Fare", type: "number", money: true }, { key: "childFare", label: "Child Fare", type: "number", money: true },
    { key: "transferCost", label: "Transfer Cost", type: "number", money: true }, { key: "currency", label: "Currency", type: "select" },
    { key: "notes", label: "Notes", wide: true },
  ],
  parks: [
    { key: "name", label: "Park / Conservancy" }, { key: "type", label: "Type" },
    { key: "adultNonRes", label: "Adult Non-Res", type: "number", money: true }, { key: "adultRes", label: "Adult Resident", type: "number", money: true },
    { key: "childRate", label: "Child Rate", type: "number", money: true }, { key: "vehicleFee", label: "Vehicle Fee", type: "number", money: true },
    { key: "guideFee", label: "Guide Fee", type: "number", money: true }, { key: "currency", label: "Currency", type: "select" },
    { key: "notes", label: "Notes", wide: true },
  ],
  activities: [
    { key: "name", label: "Activity" }, { key: "location", label: "Location" },
    { key: "pricingType", label: "Priced By", type: "select", options: ACTIVITY_PRICING.map((p) => p.key) },
    { key: "adultPrice", label: "Adult Price", type: "number", money: true }, { key: "childPrice", label: "Child Price", type: "number", money: true },
    { key: "groupPrice", label: "Vehicle/Group Price", type: "number", money: true }, { key: "duration", label: "Duration" },
    { key: "currency", label: "Currency", type: "select" }, { key: "notes", label: "Notes", wide: true },
  ],
  staff: [
    { key: "name", label: "Name" }, { key: "role", label: "Role" },
    { key: "dailyRate", label: "Daily Rate", type: "number", money: true }, { key: "allowance", label: "Allowance/Day", type: "number", money: true },
    { key: "currency", label: "Currency", type: "select" }, { key: "notes", label: "Notes", wide: true },
  ],
  suppliers: [
    { key: "name", label: "Supplier" }, { key: "category", label: "Category" }, { key: "contact", label: "Email" },
    { key: "phone", label: "Phone" }, { key: "location", label: "Location" }, { key: "currency", label: "Currency", type: "select" },
    { key: "paymentTerms", label: "Payment Terms" }, { key: "commissionPct", label: "Commission %", type: "number" },
    { key: "notes", label: "Notes", wide: true },
  ],
};

/* ============================================================
   ACCOMMODATION (PROPERTIES) — dedicated editor (nested rate sets)
============================================================ */
function PropertiesView({ properties, setProperties }) {
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");
  const blank = () => ({ id: uid(), name: "", location: "", category: "", supplier: "", currency: "USD", commissionPct: 15, notes: "", rateSets: [] });
  const blankRateSet = () => ({ id: uid(), season: "New Season", validFrom: "2027-01-01", validTo: "2027-12-31", mealPlan: "Full Board", single: 0, double: 0, twin: 0, triple: 0, childSharing: 0, childOwnRoom: 0, singleSupplement: 0 });

  const save = (p) => { setProperties((prev) => prev.some((x) => x.id === p.id) ? prev.map((x) => x.id === p.id ? p : x) : [...prev, p]); setEditing(null); };
  const del = (id) => setProperties((prev) => prev.filter((x) => x.id !== id));
  const dup = (p) => setProperties((prev) => [...prev, { ...p, id: uid(), name: p.name + " (copy)", rateSets: p.rateSets.map((r) => ({ ...r, id: uid() })) }]);
  const filtered = properties.filter((p) => JSON.stringify(p).toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building2 size={18} className="text-[#c08a28]" />
          <h2 className="font-serif text-[22px] text-[#e8e3d8]">Accommodation</h2>
          <span className="text-[12px] text-[#8a8672]">({properties.length} properties)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-[#8a8672]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="bg-[#1c1e1b] border border-[#3a3c30] rounded-sm pl-7 pr-2 py-1.5 text-[13px] text-[#e8e3d8] focus:outline-none focus:border-[#c08a28] w-44" />
          </div>
          <Btn onClick={() => setEditing(blank())}><Plus size={14} /> Add Property</Btn>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((p) => (
          <Card key={p.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-serif text-[16px] text-[#e8e3d8]">{p.name}</div>
                <div className="text-[12px] text-[#8a8672]">{p.location} · {p.category}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(p)} className="text-[#8a8672] hover:text-[#c08a28]"><Edit2 size={13} /></button>
                <button onClick={() => dup(p)} className="text-[#8a8672] hover:text-[#c08a28]"><Copy size={13} /></button>
                <button onClick={() => del(p.id)} className="text-[#8a8672] hover:text-[#a94438]"><Trash2 size={13} /></button>
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              {p.rateSets.length === 0 && <div className="text-[12px] text-[#a94438]">No rate set on file — RATE NOT FOUND</div>}
              {p.rateSets.map((r) => (
                <div key={r.id} className="text-[11.5px] text-[#c9c4b3] bg-[#1c1e1b] rounded-sm px-2.5 py-1.5 flex justify-between">
                  <span>{r.season} <span className="text-[#8a8672]">({r.validFrom}→{r.validTo}, {r.mealPlan})</span></span>
                  <span className="font-mono text-[#c08a28]">{p.currency} {fmt(r.double)}/dbl pp</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {editing && (
        <Modal title={editing.name ? `Edit — ${editing.name}` : "New Property"} onClose={() => setEditing(null)} wide>
          <div className="grid grid-cols-2 gap-3.5 mb-5">
            <Field label="Property Name"><TextInput value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="Location"><TextInput value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} /></Field>
            <Field label="Category"><TextInput value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="e.g. Luxury, Ultra Luxury" /></Field>
            <Field label="Supplier / Contact"><TextInput value={editing.supplier} onChange={(e) => setEditing({ ...editing, supplier: e.target.value })} /></Field>
            <Field label="Currency">
              <Select value={editing.currency} onChange={(e) => setEditing({ ...editing, currency: e.target.value })}>
                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Commission %"><TextInput type="number" value={editing.commissionPct} onChange={(e) => setEditing({ ...editing, commissionPct: Number(e.target.value) })} /></Field>
            <div className="col-span-2"><Field label="Notes"><TextInput value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></Field></div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <SectionLabel>Rate Sets (season / validity)</SectionLabel>
            <Btn variant="subtle" onClick={() => setEditing({ ...editing, rateSets: [...editing.rateSets, blankRateSet()] })}><Plus size={13} /> Add Rate Set</Btn>
          </div>
          <div className="space-y-3">
            {editing.rateSets.map((rs, i) => (
              <Card key={rs.id} className="p-3">
                <div className="grid grid-cols-4 gap-2.5 mb-2.5">
                  <Field label="Season Name"><TextInput value={rs.season} onChange={(e) => { const rss = [...editing.rateSets]; rss[i] = { ...rs, season: e.target.value }; setEditing({ ...editing, rateSets: rss }); }} /></Field>
                  <Field label="Valid From"><TextInput type="date" value={rs.validFrom} onChange={(e) => { const rss = [...editing.rateSets]; rss[i] = { ...rs, validFrom: e.target.value }; setEditing({ ...editing, rateSets: rss }); }} /></Field>
                  <Field label="Valid To"><TextInput type="date" value={rs.validTo} onChange={(e) => { const rss = [...editing.rateSets]; rss[i] = { ...rs, validTo: e.target.value }; setEditing({ ...editing, rateSets: rss }); }} /></Field>
                  <Field label="Meal Plan">
                    <Select value={rs.mealPlan} onChange={(e) => { const rss = [...editing.rateSets]; rss[i] = { ...rs, mealPlan: e.target.value }; setEditing({ ...editing, rateSets: rss }); }}>
                      {MEAL_PLANS.map((m) => <option key={m}>{m}</option>)}
                    </Select>
                  </Field>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {["single", "double", "twin", "triple", "childSharing", "childOwnRoom", "singleSupplement"].map((k) => (
                    <Field key={k} label={ROOM_LABELS[k] || "Single Suppl."}>
                      <TextInput type="number" value={rs[k]} onChange={(e) => { const rss = [...editing.rateSets]; rss[i] = { ...rs, [k]: Number(e.target.value) }; setEditing({ ...editing, rateSets: rss }); }} />
                    </Field>
                  ))}
                </div>
                <div className="flex justify-end mt-2">
                  <button onClick={() => setEditing({ ...editing, rateSets: editing.rateSets.filter((x) => x.id !== rs.id) })} className="text-[11px] text-[#a94438] hover:underline">Remove rate set</button>
                </div>
              </Card>
            ))}
            {editing.rateSets.length === 0 && <div className="text-[12px] text-[#8a8672]">No rate sets yet — add one so this property can be costed.</div>}
          </div>

          <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-[#3a3c30]">
            <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
            <Btn onClick={() => save(editing)}><Check size={14} /> Save Property</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ============================================================
   CURRENCIES + SETTINGS
============================================================ */
function CurrenciesView({ rates, setRates }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><Coins size={18} className="text-[#c08a28]" /><h2 className="font-serif text-[22px] text-[#e8e3d8]">Currencies & Exchange Rates</h2></div>
      <Card className="p-4 max-w-md">
        <div className="text-[12px] text-[#8a8672] mb-3">KES per 1 unit of foreign currency. Update manually as rates move.</div>
        <div className="space-y-2.5">
          {CURRENCIES.filter((c) => c !== "KES").map((c) => (
            <div key={c} className="flex items-center gap-3">
              <div className="w-14 text-[13px] text-[#c9c4b3]">1 {c} =</div>
              <TextInput type="number" value={rates[c]} onChange={(e) => setRates({ ...rates, [c]: Number(e.target.value) })} className="w-32" />
              <div className="text-[13px] text-[#8a8672]">KES</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SettingsView({ bands, setBands }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><Settings size={18} className="text-[#c08a28]" /><h2 className="font-serif text-[22px] text-[#e8e3d8]">Settings</h2></div>
      <Card className="p-4 max-w-md">
        <SectionLabel>Child Age Categories (editable thresholds)</SectionLabel>
        <div className="space-y-2.5">
          {bands.map((b, i) => (
            <div key={i} className="flex items-center gap-3">
              <TextInput value={b.name} onChange={(e) => { const nb = [...bands]; nb[i] = { ...b, name: e.target.value }; setBands(nb); }} className="w-32" />
              <div className="text-[12px] text-[#8a8672]">up to age</div>
              <TextInput type="number" value={b.maxAge} onChange={(e) => { const nb = [...bands]; nb[i] = { ...b, maxAge: Number(e.target.value) }; setBands(nb); }} className="w-20" />
            </div>
          ))}
          <div className="text-[12px] text-[#8a8672]">Above the highest threshold = Adult.</div>
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   ITINERARY LIST
============================================================ */
function ItinerariesList({ itineraries, db, rates, onOpen, onCreate, onDelete, onDuplicate }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><Map size={18} className="text-[#c08a28]" /><h2 className="font-serif text-[22px] text-[#e8e3d8]">Itineraries</h2></div>
        <Btn onClick={onCreate}><Plus size={14} /> New Itinerary</Btn>
      </div>
      {itineraries.length === 0 && <Card className="p-8 text-center text-[#8a8672]">No itineraries yet. Start a new one to build a costing.</Card>}
      <div className="space-y-2.5">
        {itineraries.map((it) => {
          const calc = calcItinerary(it, db, rates);
          return (
            <Card key={it.id} className="p-4 flex items-center justify-between hover:border-[#c08a28] cursor-pointer" onClick={() => onOpen(it.id)}>
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="font-serif text-[16px] text-[#e8e3d8]">{it.name || "Untitled Itinerary"}</span>
                  <span className="text-[10.5px] uppercase tracking-wide px-1.5 py-0.5 rounded-sm" style={{ color: STATUS_COLOR[it.status], border: `1px solid ${STATUS_COLOR[it.status]}` }}>{it.status}</span>
                </div>
                <div className="text-[12px] text-[#8a8672] mt-0.5">{it.client || "No client set"} · {it.adults} adults, {it.children} children · {it.startDate || "—"} → {it.endDate || "—"}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-[11px] text-[#8a8672]">Selling Price</div>
                  <div className="font-mono text-[15px] text-[#c08a28]">{money(calc.sellingPrice, it.costingCurrency)}</div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onDuplicate(it.id); }} className="text-[#8a8672] hover:text-[#c08a28]"><Copy size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(it.id); }} className="text-[#8a8672] hover:text-[#a94438]"><Trash2 size={14} /></button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   ADD ITEM MODAL (within itinerary day)
============================================================ */
function AddItemModal({ day, db, itin, onClose, onAdd, editingItem }) {
  const [type, setType] = useState(editingItem?.type || "accommodation");
  const [item, setItem] = useState(editingItem || null);

  useEffect(() => {
    if (editingItem) { setType(editingItem.type); setItem(editingItem); return; }
    if (type === "accommodation") setItem({ id: uid(), type, propertyId: "", rateSetId: "", nights: 1, rooms: [] });
    else if (type === "transport") setItem({ id: uid(), type, vehicleId: "", mode: "perDay", qty: 1, includeDriver: true });
    else if (type === "flight") setItem({ id: uid(), type, refId: "", tripType: "oneWay", adults: itin.adults, children: itin.children, infants: 0 });
    else if (type === "train") setItem({ id: uid(), type, refId: "", tripType: "oneWay", adults: itin.adults, children: itin.children, infants: 0 });
    else if (type === "park") setItem({ id: uid(), type, parkId: "", adults: itin.adults, children: itin.children, days: 1, vehicles: 1 });
    else if (type === "activity") setItem({ id: uid(), type, activityId: "", adults: itin.adults, children: itin.children, qty: 1 });
    else if (type === "staff") setItem({ id: uid(), type, staffId: "", days: 1 });
    else if (type === "other") setItem({ id: uid(), type, description: "", category: "", unitCost: 0, qty: 1, currency: itin.costingCurrency });
  }, [type]);

  if (!item) return null;
  const set = (patch) => setItem({ ...item, ...patch });

  const addRoom = () => set({ rooms: [...(item.rooms || []), { id: uid(), roomType: "double", count: 1, adults: 2, children: 0 }] });
  const updRoom = (i, patch) => { const r = [...item.rooms]; r[i] = { ...r[i], ...patch }; set({ rooms: r }); };
  const delRoom = (i) => set({ rooms: item.rooms.filter((_, idx) => idx !== i) });

  const prop = db.properties.find((p) => p.id === item.propertyId);

  return (
    <Modal title={editingItem ? "Edit Line Item" : "Add Line Item"} onClose={onClose} wide>
      {!editingItem && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[["accommodation", "Accommodation", Building2], ["transport", "Transport", Car], ["flight", "Flight", Plane], ["train", "Train / SGR", TrainFront],
            ["park", "Park / Fee", Trees], ["activity", "Activity", Compass], ["staff", "Guide / Staff", Users], ["other", "Other Cost", FileText]].map(([k, l, I]) => (
            <button key={k} onClick={() => setType(k)} className={`flex flex-col items-center gap-1 py-2.5 rounded-sm border text-[11px] ${type === k ? "border-[#c08a28] text-[#c08a28] bg-[#2e2712]" : "border-[#3a3c30] text-[#8a8672] hover:border-[#5a5c4a]"}`}>
              <I size={16} /> {l}
            </button>
          ))}
        </div>
      )}

      {type === "accommodation" && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Property">
              <Select value={item.propertyId} onChange={(e) => set({ propertyId: e.target.value, rateSetId: "" })}>
                <option value="">Select…</option>
                {db.properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </Field>
            <Field label="Rate Set / Season">
              <Select value={item.rateSetId} onChange={(e) => set({ rateSetId: e.target.value })} disabled={!prop}>
                <option value="">{prop ? "Select…" : "Choose property first"}</option>
                {prop?.rateSets.map((r) => <option key={r.id} value={r.id}>{r.season} ({r.validFrom}→{r.validTo})</option>)}
              </Select>
            </Field>
            <Field label="Nights"><TextInput type="number" min={1} value={item.nights} onChange={(e) => set({ nights: Number(e.target.value) })} /></Field>
          </div>
          {!prop && <Warn>Select a property to load its rates.</Warn>}
          {prop && prop.rateSets.length === 0 && <Warn>RATE NOT FOUND — this property has no rate set on file.</Warn>}
          <div className="flex items-center justify-between">
            <SectionLabel>Room Configuration</SectionLabel>
            <Btn variant="subtle" onClick={addRoom}><Plus size={13} /> Add Room</Btn>
          </div>
          <div className="space-y-2">
            {(item.rooms || []).map((r, i) => (
              <div key={r.id} className="flex items-center gap-2 bg-[#1c1e1b] rounded-sm px-2.5 py-2">
                <Select value={r.roomType} onChange={(e) => updRoom(i, { roomType: e.target.value })} className="w-56">
                  {ROOM_TYPES.map((rt) => <option key={rt} value={rt}>{ROOM_LABELS[rt]}</option>)}
                </Select>
                <div className="text-[11px] text-[#8a8672]">× rooms</div>
                <TextInput type="number" min={1} value={r.count} onChange={(e) => updRoom(i, { count: Number(e.target.value) })} className="w-16" />
                <div className="text-[11px] text-[#8a8672]">adults</div>
                <TextInput type="number" min={0} value={r.adults} onChange={(e) => updRoom(i, { adults: Number(e.target.value) })} className="w-16" />
                <div className="text-[11px] text-[#8a8672]">children</div>
                <TextInput type="number" min={0} value={r.children} onChange={(e) => updRoom(i, { children: Number(e.target.value) })} className="w-16" />
                <button onClick={() => delRoom(i)} className="ml-auto text-[#8a8672] hover:text-[#a94438]"><Trash2 size={14} /></button>
              </div>
            ))}
            {(!item.rooms || item.rooms.length === 0) && <div className="text-[12px] text-[#8a8672]">No rooms added — accommodation configuration incomplete.</div>}
          </div>
          {(() => {
            const totalRoomAdults = (item.rooms || []).reduce((s, r) => s + (r.roomType !== "childSharing" && r.roomType !== "childOwnRoom" ? r.adults * r.count : 0), 0);
            const totalRoomChildren = (item.rooms || []).reduce((s, r) => s + ((r.roomType === "childSharing" || r.roomType === "childOwnRoom") ? r.children * r.count : 0), 0);
            if (item.rooms?.length && (totalRoomAdults !== itin.adults || totalRoomChildren !== itin.children))
              return <Warn>Room configuration ({totalRoomAdults} adults / {totalRoomChildren} children) doesn't match traveller count ({itin.adults} adults / {itin.children} children). Check before finalizing.</Warn>;
            return null;
          })()}
        </div>
      )}

      {type === "transport" && (
        <div className="grid grid-cols-3 gap-3">
          <Field label="Vehicle">
            <Select value={item.vehicleId} onChange={(e) => set({ vehicleId: e.target.value })}>
              <option value="">Select…</option>
              {db.vehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </Select>
          </Field>
          <Field label="Charge Basis">
            <Select value={item.mode} onChange={(e) => set({ mode: e.target.value })}>
              {TRANSPORT_MODES.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
            </Select>
          </Field>
          <Field label={item.mode === "perKm" ? "Kilometres" : item.mode === "perDay" ? "Days" : "Vehicles"}>
            <TextInput type="number" min={1} value={item.qty} onChange={(e) => set({ qty: Number(e.target.value) })} />
          </Field>
          {item.mode === "perDay" && (
            <label className="col-span-3 flex items-center gap-2 text-[12px] text-[#c9c4b3]">
              <input type="checkbox" checked={item.includeDriver} onChange={(e) => set({ includeDriver: e.target.checked })} /> Include driver cost
            </label>
          )}
          {!item.vehicleId && <div className="col-span-3"><Warn>Select a vehicle to price this transport line.</Warn></div>}
        </div>
      )}

      {(type === "flight" || type === "train") && (
        <div className="grid grid-cols-3 gap-3">
          <Field label={type === "flight" ? "Route" : "Route / Class"}>
            <Select value={item.refId} onChange={(e) => set({ refId: e.target.value })}>
              <option value="">Select…</option>
              {(type === "flight" ? db.flights : db.trains).map((f) => <option key={f.id} value={f.id}>{f.route}{f.trainClass ? " — " + f.trainClass : ""}</option>)}
            </Select>
          </Field>
          <Field label="Trip Type">
            <Select value={item.tripType} onChange={(e) => set({ tripType: e.target.value })}>
              <option value="oneWay">One-way</option><option value="return">Return</option>
            </Select>
          </Field>
          <div />
          <Field label="Adults"><TextInput type="number" min={0} value={item.adults} onChange={(e) => set({ adults: Number(e.target.value) })} /></Field>
          <Field label="Children"><TextInput type="number" min={0} value={item.children} onChange={(e) => set({ children: Number(e.target.value) })} /></Field>
          {type === "flight" && <Field label="Infants"><TextInput type="number" min={0} value={item.infants} onChange={(e) => set({ infants: Number(e.target.value) })} /></Field>}
          {!item.refId && <div className="col-span-3"><Warn>Select a route to price this fare.</Warn></div>}
        </div>
      )}

      {type === "park" && (
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-3">
            <Field label="Park / Conservancy">
              <Select value={item.parkId} onChange={(e) => set({ parkId: e.target.value })}>
                <option value="">Select…</option>
                {db.parks.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Adults"><TextInput type="number" min={0} value={item.adults} onChange={(e) => set({ adults: Number(e.target.value) })} /></Field>
          <Field label="Children"><TextInput type="number" min={0} value={item.children} onChange={(e) => set({ children: Number(e.target.value) })} /></Field>
          <Field label="Days"><TextInput type="number" min={1} value={item.days} onChange={(e) => set({ days: Number(e.target.value) })} /></Field>
          <Field label="Vehicles"><TextInput type="number" min={1} value={item.vehicles} onChange={(e) => set({ vehicles: Number(e.target.value) })} /></Field>
          {!item.parkId && <div className="col-span-3"><Warn>Select a park/conservancy to price this fee.</Warn></div>}
        </div>
      )}

      {type === "activity" && (
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-3">
            <Field label="Activity">
              <Select value={item.activityId} onChange={(e) => set({ activityId: e.target.value })}>
                <option value="">Select…</option>
                {db.activities.map((a) => <option key={a.id} value={a.id}>{a.name} — {a.location}</option>)}
              </Select>
            </Field>
          </div>
          {(() => {
            const a = db.activities.find((x) => x.id === item.activityId);
            if (a?.pricingType === "perPerson") return (<>
              <Field label="Adults"><TextInput type="number" min={0} value={item.adults} onChange={(e) => set({ adults: Number(e.target.value) })} /></Field>
              <Field label="Children"><TextInput type="number" min={0} value={item.children} onChange={(e) => set({ children: Number(e.target.value) })} /></Field>
            </>);
            return <Field label={a?.pricingType === "perVehicle" ? "Vehicles" : "Groups"}><TextInput type="number" min={1} value={item.qty} onChange={(e) => set({ qty: Number(e.target.value) })} /></Field>;
          })()}
          {!item.activityId && <div className="col-span-3"><Warn>Select an activity to price this line.</Warn></div>}
        </div>
      )}

      {type === "staff" && (
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Field label="Guide / Staff">
              <Select value={item.staffId} onChange={(e) => set({ staffId: e.target.value })}>
                <option value="">Select…</option>
                {db.staff.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.role}</option>)}
              </Select>
            </Field>
          </div>
          <Field label="Days"><TextInput type="number" min={1} value={item.days} onChange={(e) => set({ days: Number(e.target.value) })} /></Field>
          {!item.staffId && <div className="col-span-3"><Warn>Select a guide/staff member to price this line.</Warn></div>}
        </div>
      )}

      {type === "other" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Field label="Description"><TextInput value={item.description} onChange={(e) => set({ description: e.target.value })} placeholder="e.g. Visa assistance, laundry, tips" /></Field></div>
          <Field label="Category"><TextInput value={item.category} onChange={(e) => set({ category: e.target.value })} /></Field>
          <Field label="Currency"><Select value={item.currency} onChange={(e) => set({ currency: e.target.value })}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Unit Cost"><TextInput type="number" value={item.unitCost} onChange={(e) => set({ unitCost: Number(e.target.value) })} /></Field>
          <Field label="Quantity"><TextInput type="number" min={1} value={item.qty} onChange={(e) => set({ qty: Number(e.target.value) })} /></Field>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-[#3a3c30]">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn onClick={() => { onAdd(item); onClose(); }}><Check size={14} /> {editingItem ? "Save" : "Add to Day"}</Btn>
      </div>
    </Modal>
  );
}

/* ============================================================
   ITINERARY EDITOR
============================================================ */
const ITEM_ICON = { accommodation: Building2, transport: Car, flight: Plane, train: TrainFront, park: Trees, activity: Compass, staff: Users, other: FileText };
const ITEM_LABEL = { accommodation: "Accommodation", transport: "Transport", flight: "Flight", train: "Train / SGR", park: "Park Fee", activity: "Activity", staff: "Guide / Staff", other: "Other Cost" };

function ItineraryEditor({ itin, setItin, db, rates, onBack, onGoQuote }) {
  const [dayModal, setDayModal] = useState(null); // { dayId, editingItem }
  const [expanded, setExpanded] = useState({});
  const [showFormula, setShowFormula] = useState(null);
  const calc = useMemo(() => calcItinerary(itin, db, rates), [itin, db, rates]);

  const patch = (p) => setItin({ ...itin, ...p });
  const addDay = () => patch({ days: [...(itin.days || []), { id: uid(), title: `Day ${(itin.days?.length || 0) + 1}`, location: "", date: "", items: [] }] });
  const dupDay = (id) => {
    const d = itin.days.find((x) => x.id === id);
    const copy = { ...d, id: uid(), title: d.title + " (copy)", items: d.items.map((i) => ({ ...i, id: uid() })) };
    const idx = itin.days.findIndex((x) => x.id === id);
    const nd = [...itin.days]; nd.splice(idx + 1, 0, copy); patch({ days: nd });
  };
  const delDay = (id) => patch({ days: itin.days.filter((d) => d.id !== id) });
  const moveDay = (id, dir) => {
    const idx = itin.days.findIndex((d) => d.id === id);
    const swap = idx + dir;
    if (swap < 0 || swap >= itin.days.length) return;
    const nd = [...itin.days]; [nd[idx], nd[swap]] = [nd[swap], nd[idx]]; patch({ days: nd });
  };
  const updDay = (id, p) => patch({ days: itin.days.map((d) => d.id === id ? { ...d, ...p } : d) });
  const addItem = (dayId, item) => updDay(dayId, { items: [...(itin.days.find((d) => d.id === dayId).items), item] });
  const editItem = (dayId, item) => updDay(dayId, { items: itin.days.find((d) => d.id === dayId).items.map((i) => i.id === item.id ? item : i) });
  const delItem = (dayId, itemId) => updDay(dayId, { items: itin.days.find((d) => d.id === dayId).items.filter((i) => i.id !== itemId) });

  const otherCosts = itin.otherCosts || [];
  const addOther = () => patch({ otherCosts: [...otherCosts, { id: uid(), description: "", category: "", unitCost: 0, qty: 1, currency: itin.costingCurrency }] });
  const updOther = (id, p) => patch({ otherCosts: otherCosts.map((o) => o.id === id ? { ...o, ...p } : o) });
  const delOther = (id) => patch({ otherCosts: otherCosts.filter((o) => o.id !== id) });

  const CATS = [["accommodation", "Accommodation"], ["transport", "Transport"], ["flight", "Flights"], ["train", "Train/SGR"], ["park", "Park Fees"], ["activity", "Activities"], ["staff", "Guides/Staff"], ["other", "Other"]];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[#8a8672] hover:text-[#e8e3d8] text-[13px]"><ArrowLeft size={15} /> Itineraries</button>
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={onGoQuote}><FileText size={14} /> Quotation View</Btn>
        </div>
      </div>

      {/* Header config */}
      <Card className="p-4 mb-4">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Field label="Itinerary Name"><TextInput value={itin.name} onChange={(e) => patch({ name: e.target.value })} /></Field>
          <Field label="Client Name"><TextInput value={itin.client} onChange={(e) => patch({ client: e.target.value })} /></Field>
          <Field label="Status">
            <Select value={itin.status} onChange={(e) => patch({ status: e.target.value })}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</Select>
          </Field>
          <Field label="Nationality"><TextInput value={itin.nationality} onChange={(e) => patch({ nationality: e.target.value })} /></Field>
        </div>
        <div className="grid grid-cols-6 gap-3 mb-3">
          <Field label="Adults"><TextInput type="number" min={0} value={itin.adults} onChange={(e) => patch({ adults: Number(e.target.value) })} /></Field>
          <Field label="Children"><TextInput type="number" min={0} value={itin.children} onChange={(e) => {
            const n = Number(e.target.value);
            const ages = [...(itin.childAges || [])];
            while (ages.length < n) ages.push("");
            patch({ children: n, childAges: ages.slice(0, n) });
          }} /></Field>
          <Field label="Start Date"><TextInput type="date" value={itin.startDate} onChange={(e) => patch({ startDate: e.target.value })} /></Field>
          <Field label="End Date"><TextInput type="date" value={itin.endDate} onChange={(e) => patch({ endDate: e.target.value })} /></Field>
          <Field label="Costing Currency"><Select value={itin.costingCurrency} onChange={(e) => patch({ costingCurrency: e.target.value })}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
          <Field label="Client Currency"><Select value={itin.clientCurrency} onChange={(e) => patch({ clientCurrency: e.target.value })}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        </div>
        {itin.children > 0 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {itin.childAges.map((age, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-[#1c1e1b] rounded-sm px-2 py-1">
                <span className="text-[11px] text-[#8a8672]">Child {i + 1} age</span>
                <TextInput type="number" min={0} value={age} onChange={(e) => { const ages = [...itin.childAges]; ages[i] = e.target.value; patch({ childAges: ages }); }} className="w-14 !py-0.5" />
                <span className="text-[10.5px] text-[#c08a28]">{ageCategory(age, db.childAgeBands)}</span>
              </div>
            ))}
            {itin.childAges.some((a) => a === "") && <Warn>Child age required to determine applicable rate.</Warn>}
          </div>
        )}
      </Card>

      {/* Days */}
      <div className="flex items-center justify-between mb-2">
        <SectionLabel>Day-by-Day Itinerary</SectionLabel>
        <Btn onClick={addDay}><Plus size={14} /> Add Day</Btn>
      </div>
      <div className="space-y-3 mb-6">
        {(itin.days || []).map((day, dIdx) => {
          const dr = calc.dayResults.find((x) => x.day.id === day.id);
          const isOpen = expanded[day.id] !== false;
          return (
            <Card key={day.id}>
              <div className="flex items-center gap-2 px-4 py-3 cursor-pointer" onClick={() => setExpanded({ ...expanded, [day.id]: !isOpen })}>
                {isOpen ? <ChevronDown size={15} className="text-[#8a8672]" /> : <ChevronRight size={15} className="text-[#8a8672]" />}
                <TextInput value={day.title} onClick={(e) => e.stopPropagation()} onChange={(e) => updDay(day.id, { title: e.target.value })} className="w-40 !py-1" />
                <TextInput value={day.location} onClick={(e) => e.stopPropagation()} onChange={(e) => updDay(day.id, { location: e.target.value })} placeholder="Location / route" className="w-56 !py-1" />
                <TextInput type="date" value={day.date} onClick={(e) => e.stopPropagation()} onChange={(e) => updDay(day.id, { date: e.target.value })} className="w-40 !py-1" />
                <div className="ml-auto flex items-center gap-3">
                  <span className="font-mono text-[13px] text-[#c08a28]">{money(dr?.dayTotal || 0, itin.costingCurrency)}</span>
                  <button onClick={(e) => { e.stopPropagation(); moveDay(day.id, -1); }} className="text-[#8a8672] hover:text-[#e8e3d8]"><ChevronUp size={14} /></button>
                  <button onClick={(e) => { e.stopPropagation(); moveDay(day.id, 1); }} className="text-[#8a8672] hover:text-[#e8e3d8]"><ChevronDown size={14} /></button>
                  <button onClick={(e) => { e.stopPropagation(); dupDay(day.id); }} className="text-[#8a8672] hover:text-[#c08a28]"><Copy size={14} /></button>
                  <button onClick={(e) => { e.stopPropagation(); delDay(day.id); }} className="text-[#8a8672] hover:text-[#a94438]"><Trash2 size={14} /></button>
                </div>
              </div>
              {isOpen && (
                <div className="px-4 pb-4">
                  <div className="space-y-1.5">
                    {dr?.itemResults.map((ir) => {
                      const Icon = ITEM_ICON[ir.item.type];
                      return (
                        <div key={ir.item.id} className="flex items-center gap-2.5 bg-[#1c1e1b] rounded-sm px-3 py-2">
                          <Icon size={14} className="text-[#8a8672] shrink-0" />
                          <div className="text-[12.5px] text-[#c9c4b3] flex-1 truncate">{ITEM_LABEL[ir.item.type]}: {ir.formula.split("\n")[0]}</div>
                          {ir.warnings.length > 0 && <span title={ir.warnings.join("; ")}><AlertTriangle size={13} className="text-[#d49b34]" /></span>}
                          <button onClick={() => setShowFormula(ir)} className="text-[#8a8672] hover:text-[#c08a28]"><Info size={13} /></button>
                          <span className="font-mono text-[12.5px] text-[#e8e3d8] w-28 text-right">{money(ir.cost, itin.costingCurrency)}</span>
                          <button onClick={() => setDayModal({ dayId: day.id, editingItem: ir.item })} className="text-[#8a8672] hover:text-[#c08a28]"><Edit2 size={13} /></button>
                          <button onClick={() => delItem(day.id, ir.item.id)} className="text-[#8a8672] hover:text-[#a94438]"><Trash2 size={13} /></button>
                        </div>
                      );
                    })}
                    {(!day.items || day.items.length === 0) && <div className="text-[12px] text-[#8a8672] py-2">No line items yet.</div>}
                  </div>
                  <div className="mt-2.5">
                    <Btn variant="subtle" onClick={() => setDayModal({ dayId: day.id, editingItem: null })}><Plus size={13} /> Add Line Item</Btn>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
        {(!itin.days || itin.days.length === 0) && <Card className="p-6 text-center text-[#8a8672]">No days yet — add Day 1 to begin building the itinerary.</Card>}
      </div>

      {/* Other itinerary-level costs */}
      <div className="flex items-center justify-between mb-2">
        <SectionLabel>Other Costs (itinerary-level)</SectionLabel>
        <Btn variant="subtle" onClick={addOther}><Plus size={13} /> Add Cost</Btn>
      </div>
      <Card className="p-3 mb-6">
        {otherCosts.length === 0 && <div className="text-[12px] text-[#8a8672] px-1 py-1">e.g. visa assistance, insurance, tips, welcome package, emergency reserve.</div>}
        <div className="space-y-2">
          {otherCosts.map((o) => (
            <div key={o.id} className="flex items-center gap-2">
              <TextInput value={o.description} onChange={(e) => updOther(o.id, { description: e.target.value })} placeholder="Description" className="flex-1" />
              <TextInput value={o.category} onChange={(e) => updOther(o.id, { category: e.target.value })} placeholder="Category" className="w-32" />
              <Select value={o.currency} onChange={(e) => updOther(o.id, { currency: e.target.value })} className="w-24">{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</Select>
              <TextInput type="number" value={o.unitCost} onChange={(e) => updOther(o.id, { unitCost: Number(e.target.value) })} className="w-28" placeholder="Unit cost" />
              <TextInput type="number" value={o.qty} onChange={(e) => updOther(o.id, { qty: Number(e.target.value) })} className="w-20" placeholder="Qty" />
              <button onClick={() => delOther(o.id)} className="text-[#8a8672] hover:text-[#a94438]"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </Card>

      {/* Pricing */}
      <SectionLabel>Pricing</SectionLabel>
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <Field label="Pricing Method">
            <Select value={itin.markupMode} onChange={(e) => patch({ markupMode: e.target.value })}>
              <option value="percent">Markup %</option>
              <option value="margin">Target Margin %</option>
              <option value="fixedProfit">Fixed Profit</option>
              <option value="fixedPrice">Fixed Selling Price</option>
            </Select>
          </Field>
          <Field label={itin.markupMode === "percent" ? "Markup %" : itin.markupMode === "margin" ? "Target Margin %" : itin.markupMode === "fixedProfit" ? `Profit (${itin.costingCurrency})` : `Selling Price (${itin.costingCurrency})`}>
            <TextInput type="number" value={itin.markupValue} onChange={(e) => patch({ markupValue: Number(e.target.value) })} />
          </Field>
          <Field label="Contingency">
            <label className="flex items-center gap-2 h-[34px]"><input type="checkbox" checked={itin.contingencyEnabled} onChange={(e) => patch({ contingencyEnabled: e.target.checked })} /> <span className="text-[13px] text-[#c9c4b3]">Enabled</span></label>
          </Field>
          <Field label="Contingency %"><TextInput type="number" value={itin.contingencyPct} onChange={(e) => patch({ contingencyPct: Number(e.target.value) })} disabled={!itin.contingencyEnabled} /></Field>
        </div>
      </Card>

      {/* Dashboard */}
      <SectionLabel>Costing Summary</SectionLabel>
      {calc.warnings.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {calc.warnings.map((w, i) => <Warn key={i}>{w}</Warn>)}
        </div>
      )}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          ["Net Supplier Cost", calc.netCost, "#c9c4b3"],
          ["Total Cost (+contingency)", calc.totalCost, "#c9c4b3"],
          ["Selling Price", calc.sellingPrice, "#c08a28"],
          ["Profit", calc.profit, "#5c7a63"],
        ].map(([l, v, c]) => (
          <Card key={l} className="p-3.5">
            <div className="text-[11px] text-[#8a8672] mb-1">{l}</div>
            <div className="font-mono text-[19px]" style={{ color: c }}>{money(v, itin.costingCurrency)}</div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-3 mb-6">
        <Card className="p-3.5"><div className="text-[11px] text-[#8a8672] mb-1">Margin %</div><div className="font-mono text-[17px] text-[#e8e3d8]">{calc.marginPct.toFixed(1)}%</div></Card>
        <Card className="p-3.5"><div className="text-[11px] text-[#8a8672] mb-1">Markup %</div><div className="font-mono text-[17px] text-[#e8e3d8]">{calc.markupPct.toFixed(1)}%</div></Card>
        <Card className="p-3.5"><div className="text-[11px] text-[#8a8672] mb-1">Price / Adult</div><div className="font-mono text-[17px] text-[#e8e3d8]">{money(calc.perAdultSell, itin.costingCurrency)}</div></Card>
        <Card className="p-3.5"><div className="text-[11px] text-[#8a8672] mb-1">Price / Child</div><div className="font-mono text-[17px] text-[#e8e3d8]">{itin.children ? money(calc.perChildSell, itin.costingCurrency) : "—"}</div></Card>
      </div>

      <SectionLabel>Category Breakdown</SectionLabel>
      <Card className="p-4">
        {CATS.map(([k, l]) => {
          const v = calc.byCategory[k] || 0;
          const pct = calc.netCost ? (v / calc.netCost) * 100 : 0;
          return (
            <div key={k} className="flex items-center gap-3 mb-2 last:mb-0">
              <div className="w-32 text-[12px] text-[#c9c4b3]">{l}</div>
              <div className="flex-1 h-2 bg-[#1c1e1b] rounded-sm overflow-hidden"><div className="h-full bg-[#c08a28]" style={{ width: `${pct}%` }} /></div>
              <div className="w-14 text-right text-[11.5px] text-[#8a8672]">{pct.toFixed(0)}%</div>
              <div className="w-28 text-right font-mono text-[12.5px] text-[#e8e3d8]">{money(v, itin.costingCurrency)}</div>
            </div>
          );
        })}
      </Card>

      {dayModal && (
        <AddItemModal day={itin.days.find((d) => d.id === dayModal.dayId)} db={db} itin={itin} editingItem={dayModal.editingItem}
          onClose={() => setDayModal(null)}
          onAdd={(item) => dayModal.editingItem ? editItem(dayModal.dayId, item) : addItem(dayModal.dayId, item)} />
      )}
      {showFormula && (
        <Modal title="How this was calculated" onClose={() => setShowFormula(null)}>
          <pre className="whitespace-pre-wrap font-mono text-[12.5px] text-[#c9c4b3] leading-relaxed">{showFormula.formula}</pre>
          {showFormula.warnings.length > 0 && <div className="mt-3 space-y-1.5">{showFormula.warnings.map((w, i) => <Warn key={i}>{w}</Warn>)}</div>}
        </Modal>
      )}
    </div>
  );
}

/* ============================================================
   QUOTATION VIEW
============================================================ */
function QuotationView({ itin, db, rates, onBack }) {
  const [internal, setInternal] = useState(false);
  const calc = useMemo(() => calcItinerary(itin, db, rates), [itin, db, rates]);
  const clientRate = rates[itin.clientCurrency] ?? 1;
  const toClient = (kes) => convert(kes, itin.costingCurrency, itin.clientCurrency, rates);

  const destinations = [...new Set((itin.days || []).map((d) => d.location).filter(Boolean))];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 print:hidden">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[#8a8672] hover:text-[#e8e3d8] text-[13px]"><ArrowLeft size={15} /> Back to Itinerary</button>
        <div className="flex items-center gap-2">
          <Btn variant={internal ? "default" : "ghost"} onClick={() => setInternal(!internal)}>{internal ? "Viewing: Internal (cost + margin)" : "Viewing: Client Quotation"}</Btn>
          <Btn variant="ghost" onClick={() => window.print()}><Printer size={14} /> Print / Export PDF</Btn>
        </div>
      </div>

      <Card className="p-8 print:border-0 print:bg-white">
        <div className="flex items-start justify-between border-b border-[#3a3c30] pb-5 mb-5 print:border-black/20">
          <div>
            <div className="font-serif text-[26px] text-[#c08a28] print:text-black">Lengila Safaris</div>
            <div className="text-[11px] text-[#8a8672] tracking-wide print:text-black/60">NORTHERN KENYA · LUXURY EXPEDITIONS</div>
          </div>
          <div className="text-right text-[12px] text-[#8a8672] print:text-black/70">
            <div>Quotation Ref: {itin.id.slice(0, 8).toUpperCase()}</div>
            <div>Date: {todayISO()}</div>
            <div>Status: {itin.status}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <SectionLabel>Client</SectionLabel>
            <div className="text-[14px] text-[#e8e3d8] print:text-black">{itin.client || "—"}</div>
            <div className="text-[12px] text-[#8a8672] print:text-black/60">{itin.nationality}</div>
          </div>
          <div>
            <SectionLabel>Trip</SectionLabel>
            <div className="text-[14px] text-[#e8e3d8] print:text-black">{itin.name}</div>
            <div className="text-[12px] text-[#8a8672] print:text-black/60">{itin.startDate} → {itin.endDate} · {itin.days?.length || 0} days · {itin.adults} adults, {itin.children} children</div>
            <div className="text-[12px] text-[#8a8672] print:text-black/60">{destinations.join(" · ")}</div>
          </div>
        </div>

        <SectionLabel>Day-by-Day Itinerary</SectionLabel>
        <div className="mb-6 space-y-3">
          {(itin.days || []).map((d, i) => (
            <div key={d.id} className="border-l-2 border-[#3a3c30] pl-3 print:border-black/20">
              <div className="text-[13px] font-medium text-[#e8e3d8] print:text-black">Day {i + 1} — {d.title}{d.location ? ` · ${d.location}` : ""}</div>
              <ul className="text-[12px] text-[#8a8672] print:text-black/70 list-disc ml-4 mt-1">
                {d.items.map((it) => {
                  if (it.type === "accommodation") { const p = db.properties.find((x) => x.id === it.propertyId); return <li key={it.id}>Accommodation: {p?.name || "—"} ({it.nights} night{it.nights > 1 ? "s" : ""})</li>; }
                  if (it.type === "transport") { const v = db.vehicles.find((x) => x.id === it.vehicleId); return <li key={it.id}>Transport: {v?.name || "—"}</li>; }
                  if (it.type === "flight") { const f = db.flights.find((x) => x.id === it.refId); return <li key={it.id}>Flight: {f?.route || "—"}</li>; }
                  if (it.type === "train") { const f = db.trains.find((x) => x.id === it.refId); return <li key={it.id}>Train: {f?.route || "—"}</li>; }
                  if (it.type === "park") { const p = db.parks.find((x) => x.id === it.parkId); return <li key={it.id}>{p?.name || "—"} fees</li>; }
                  if (it.type === "activity") { const a = db.activities.find((x) => x.id === it.activityId); return <li key={it.id}>Activity: {a?.name || "—"}</li>; }
                  if (it.type === "staff") return null;
                  if (it.type === "other" && internal) return <li key={it.id}>{it.description}</li>;
                  return null;
                })}
              </ul>
            </div>
          ))}
        </div>

        {internal ? (
          <>
            <SectionLabel>Internal Costing (not for client)</SectionLabel>
            <div className="grid grid-cols-2 gap-2 text-[13px] mb-4">
              <div className="flex justify-between border-b border-dotted border-[#3a3c30] py-1"><span className="text-[#8a8672]">Net Supplier Cost</span><span className="font-mono text-[#e8e3d8]">{money(calc.netCost, itin.costingCurrency)}</span></div>
              <div className="flex justify-between border-b border-dotted border-[#3a3c30] py-1"><span className="text-[#8a8672]">Contingency</span><span className="font-mono text-[#e8e3d8]">{money(calc.contingency, itin.costingCurrency)}</span></div>
              <div className="flex justify-between border-b border-dotted border-[#3a3c30] py-1"><span className="text-[#8a8672]">Total Cost</span><span className="font-mono text-[#e8e3d8]">{money(calc.totalCost, itin.costingCurrency)}</span></div>
              <div className="flex justify-between border-b border-dotted border-[#3a3c30] py-1"><span className="text-[#8a8672]">Markup ({calc.markupPct.toFixed(1)}%)</span><span className="font-mono text-[#e8e3d8]">{money(calc.profit, itin.costingCurrency)}</span></div>
              <div className="flex justify-between border-b border-dotted border-[#3a3c30] py-1"><span className="text-[#8a8672]">Selling Price</span><span className="font-mono text-[#c08a28]">{money(calc.sellingPrice, itin.costingCurrency)}</span></div>
              <div className="flex justify-between border-b border-dotted border-[#3a3c30] py-1"><span className="text-[#8a8672]">Margin</span><span className="font-mono text-[#5c7a63]">{calc.marginPct.toFixed(1)}%</span></div>
            </div>
          </>
        ) : (
          <>
            <SectionLabel>Price</SectionLabel>
            <div className="bg-[#1c1e1b] print:bg-gray-50 rounded-sm p-4 mb-4">
              <div className="flex justify-between text-[15px] mb-1"><span className="text-[#c9c4b3] print:text-black/70">Total Price ({itin.clientCurrency})</span><span className="font-mono text-[20px] text-[#c08a28] print:text-black">{money(toClient(calc.sellingPrice), itin.clientCurrency)}</span></div>
              <div className="flex justify-between text-[12px]"><span className="text-[#8a8672]">Per Adult</span><span className="font-mono text-[#c9c4b3] print:text-black/70">{money(toClient(calc.perAdultSell), itin.clientCurrency)}</span></div>
              {itin.children > 0 && <div className="flex justify-between text-[12px]"><span className="text-[#8a8672]">Per Child</span><span className="font-mono text-[#c9c4b3] print:text-black/70">{money(toClient(calc.perChildSell), itin.clientCurrency)}</span></div>}
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-6 text-[12px] text-[#8a8672] print:text-black/60 mt-6 pt-5 border-t border-[#3a3c30] print:border-black/20">
          <div>
            <SectionLabel>Inclusions</SectionLabel>
            Accommodation as listed · Park & conservancy fees · Ground transport & driver-guide · Listed activities · Meals per stated plan
          </div>
          <div>
            <SectionLabel>Exclusions</SectionLabel>
            International flights · Visa fees · Travel insurance · Personal expenses · Gratuities (unless stated)
          </div>
          <div>
            <SectionLabel>Payment Terms</SectionLabel>
            30% deposit to confirm · Balance due 60 days before arrival
          </div>
          <div>
            <SectionLabel>Validity</SectionLabel>
            This quotation is valid for 14 days from the date above and subject to availability at time of confirmation.
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   DASHBOARD
============================================================ */
function Dashboard({ itineraries, db, rates, setView }) {
  const calcs = itineraries.map((it) => ({ it, calc: calcItinerary(it, db, rates) }));
  const totalRevenue = calcs.reduce((s, c) => s + convert(c.calc.sellingPrice, c.it.costingCurrency, "KES", rates), 0);
  const totalProfit = calcs.reduce((s, c) => s + convert(c.calc.profit, c.it.costingCurrency, "KES", rates), 0);
  const totalCost = calcs.reduce((s, c) => s + convert(c.calc.totalCost, c.it.costingCurrency, "KES", rates), 0);
  const avgMargin = calcs.length ? calcs.reduce((s, c) => s + c.calc.marginPct, 0) / calcs.length : 0;
  const confirmed = itineraries.filter((i) => ["Confirmed", "Deposit Paid", "Fully Paid", "Completed"].includes(i.status));

  return (
    <div>
      <div className="flex items-center gap-2 mb-5"><LayoutDashboard size={18} className="text-[#c08a28]" /><h2 className="font-serif text-[22px] text-[#e8e3d8]">Dashboard</h2></div>
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[["Total Quoted Revenue (KES)", totalRevenue, "#c08a28"], ["Total Cost (KES)", totalCost, "#c9c4b3"], ["Total Profit (KES)", totalProfit, "#5c7a63"], ["Avg. Margin", avgMargin.toFixed(1) + "%", "#e8e3d8"]].map(([l, v, c]) => (
          <Card key={l} className="p-4"><div className="text-[11px] text-[#8a8672] mb-1.5">{l}</div><div className="font-mono text-[20px]" style={{ color: c }}>{typeof v === "number" ? fmt(v) : v}</div></Card>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <SectionLabel>Itineraries by Status</SectionLabel>
          <div className="space-y-1.5">
            {STATUSES.map((s) => {
              const n = itineraries.filter((i) => i.status === s).length;
              if (!n) return null;
              return <div key={s} className="flex justify-between text-[13px]"><span style={{ color: STATUS_COLOR[s] }}>{s}</span><span className="text-[#c9c4b3]">{n}</span></div>;
            })}
            {itineraries.length === 0 && <div className="text-[12px] text-[#8a8672]">No itineraries yet.</div>}
          </div>
        </Card>
        <Card className="p-4">
          <SectionLabel>Most Recent Itineraries</SectionLabel>
          <div className="space-y-2">
            {itineraries.slice(-5).reverse().map((it) => (
              <div key={it.id} className="flex justify-between text-[13px] cursor-pointer hover:text-[#c08a28]" onClick={() => setView({ tab: "itinerary", id: it.id })}>
                <span className="text-[#c9c4b3]">{it.name}</span>
                <span className="font-mono text-[#8a8672]">{it.costingCurrency} {fmt(calcItinerary(it, db, rates).sellingPrice)}</span>
              </div>
            ))}
            {itineraries.length === 0 && <div className="text-[12px] text-[#8a8672]">Nothing costed yet — start a new itinerary.</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================================================
   ROOT APP
============================================================ */
const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "itineraries", label: "Itineraries", icon: Map },
  { key: "properties", label: "Accommodation", icon: Building2 },
  { key: "vehicles", label: "Transport", icon: Car },
  { key: "flights", label: "Flights", icon: Plane },
  { key: "trains", label: "SGR / Train", icon: TrainFront },
  { key: "parks", label: "Parks & Conservancies", icon: Trees },
  { key: "activities", label: "Activities", icon: Compass },
  { key: "staff", label: "Guides & Staff", icon: Users },
  { key: "suppliers", label: "Suppliers", icon: FileText },
  { key: "currencies", label: "Currencies", icon: Coins },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function App() {
  const [state, setState] = useState(null);
  const [view, setView] = useState({ tab: "dashboard" });
  const loaded = useRef(false);

  useEffect(() => { loadState().then((s) => { setState(s); loaded.current = true; }); }, []);
  useEffect(() => { if (loaded.current && state) saveState(state); }, [state]);

  if (!state) return <div className="min-h-screen bg-[#1c1e1b] flex items-center justify-center text-[#8a8672] font-mono text-sm">Loading costing system…</div>;

  const db = state;
  const setDb = (key) => (fn) => setState((prev) => ({ ...prev, [key]: typeof fn === "function" ? fn(prev[key]) : fn }));

  const createItinerary = () => {
    const it = {
      id: uid(), name: "New Safari Itinerary", client: "", nationality: "", status: "Draft",
      adults: 2, children: 0, childAges: [],
      startDate: "", endDate: "", costingCurrency: "KES", clientCurrency: "USD",
      markupMode: "percent", markupValue: 25, contingencyEnabled: true, contingencyPct: 3,
      days: [{ id: uid(), title: "Day 1", location: "", date: "", items: [] }],
      otherCosts: [],
    };
    setState((prev) => ({ ...prev, itineraries: [...prev.itineraries, it] }));
    setView({ tab: "itinerary", id: it.id });
  };
  const openItinerary = (id) => setView({ tab: "itinerary", id });
  const deleteItinerary = (id) => setState((prev) => ({ ...prev, itineraries: prev.itineraries.filter((i) => i.id !== id) }));
  const duplicateItinerary = (id) => setState((prev) => {
    const it = prev.itineraries.find((i) => i.id === id);
    const copy = { ...it, id: uid(), name: it.name + " (copy)", status: "Draft", days: it.days.map((d) => ({ ...d, id: uid(), items: d.items.map((i) => ({ ...i, id: uid() })) })) };
    return { ...prev, itineraries: [...prev.itineraries, copy] };
  });
  const setActiveItin = (patch) => setState((prev) => ({ ...prev, itineraries: prev.itineraries.map((i) => i.id === view.id ? (typeof patch === "function" ? patch(i) : patch) : i) }));
  const activeItin = view.id ? db.itineraries.find((i) => i.id === view.id) : null;

  return (
    <div className="min-h-screen bg-[#1c1e1b] text-[#c9c4b3]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        .font-serif { font-family: 'Newsreader', Georgia, serif; }
        input, select, button, textarea { font-family: 'Inter', system-ui, sans-serif; }
        .font-mono, table td.font-mono, span.font-mono { font-family: 'IBM Plex Mono', monospace; }
        input[type=number]::-webkit-inner-spin-button { opacity: 0.4; }
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
      <div className="flex">
        <div className="w-56 shrink-0 border-r border-[#2b2d24] min-h-screen px-3 py-5 print:hidden">
          <div className="px-2 mb-6">
            <div className="font-serif text-[19px] text-[#c08a28] leading-tight">Lengila</div>
            <div className="text-[10px] tracking-[0.18em] text-[#8a8672] uppercase">Costing Ledger</div>
          </div>
          <nav className="space-y-0.5">
            {NAV.map((n) => (
              <button key={n.key} onClick={() => setView({ tab: n.key })}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-[13px] transition-colors ${view.tab === n.key || (view.tab === "itinerary" && n.key === "itineraries") || (view.tab === "quotation" && n.key === "itineraries") ? "bg-[#2e2712] text-[#c08a28]" : "text-[#8a8672] hover:text-[#e8e3d8] hover:bg-[#242620]"}`}>
                <n.icon size={15} /> {n.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 px-8 py-6 max-w-[1400px]">
          {view.tab === "dashboard" && <Dashboard itineraries={db.itineraries} db={db} rates={db.exchangeRates} setView={setView} />}
          {view.tab === "itineraries" && <ItinerariesList itineraries={db.itineraries} db={db} rates={db.exchangeRates} onOpen={openItinerary} onCreate={createItinerary} onDelete={deleteItinerary} onDuplicate={duplicateItinerary} />}
          {view.tab === "itinerary" && activeItin && (
            <ItineraryEditor itin={activeItin} setItin={setActiveItin} db={db} rates={db.exchangeRates}
              onBack={() => setView({ tab: "itineraries" })} onGoQuote={() => setView({ tab: "quotation", id: activeItin.id })} />
          )}
          {view.tab === "quotation" && activeItin && (
            <QuotationView itin={activeItin} db={db} rates={db.exchangeRates} onBack={() => setView({ tab: "itinerary", id: activeItin.id })} />
          )}
          {view.tab === "properties" && <PropertiesView properties={db.properties} setProperties={setDb("properties")} />}
          {view.tab === "vehicles" && <GenericTable title="Transport" icon={Car} schema={SCHEMAS.vehicles} rows={db.vehicles} setRows={setDb("vehicles")} />}
          {view.tab === "flights" && <GenericTable title="Flights" icon={Plane} schema={SCHEMAS.flights} rows={db.flights} setRows={setDb("flights")} />}
          {view.tab === "trains" && <GenericTable title="SGR / Train" icon={TrainFront} schema={SCHEMAS.trains} rows={db.trains} setRows={setDb("trains")} />}
          {view.tab === "parks" && <GenericTable title="Parks & Conservancies" icon={Trees} schema={SCHEMAS.parks} rows={db.parks} setRows={setDb("parks")} />}
          {view.tab === "activities" && <GenericTable title="Activities" icon={Compass} schema={SCHEMAS.activities} rows={db.activities} setRows={setDb("activities")} />}
          {view.tab === "staff" && <GenericTable title="Guides & Staff" icon={Users} schema={SCHEMAS.staff} rows={db.staff} setRows={setDb("staff")} />}
          {view.tab === "suppliers" && <GenericTable title="Suppliers" icon={FileText} schema={SCHEMAS.suppliers} rows={db.suppliers} setRows={setDb("suppliers")} />}
          {view.tab === "currencies" && <CurrenciesView rates={db.exchangeRates} setRates={setDb("exchangeRates")} />}
          {view.tab === "settings" && <SettingsView bands={db.childAgeBands} setBands={setDb("childAgeBands")} />}
        </div>
      </div>
    </div>
  );
}
