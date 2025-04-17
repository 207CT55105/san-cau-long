import React, { useEffect, useState } from "react";
import SanGrid from "../components/SanGrid";
import PopupDatSan from "../components/PopupDatSan";
import FooterMap from "../components/FooterMap";

const GIO_MO = 6;
const GIO_DONG = 23;
const MAX_NGAY = 30;

// Helpers
const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const toTime = (minutes) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  return `${h}:00`;
};

const congNgay = (ngayISO, soNgay) => {
  const d = new Date(ngayISO);
  d.setDate(d.getDate() + soNgay);
  return d.toISOString().split("T")[0];
};

const getToday = () => new Date().toISOString().split("T")[0];

// LocalStorage
const LAY_DATA_LS = () => {
  try {
    return JSON.parse(localStorage.getItem("danhSachSan")) || [];
  } catch {
    return [];
  }
};

const LUU_DATA_LS = (data) => {
  localStorage.setItem("danhSachSan", JSON.stringify(data));
};

// Tính slot trống, loại slot đã quá 15 phút
const tinhSlotTrong = (daDat, ngay) => {
  const start = GIO_MO * 60;
  const end = GIO_DONG * 60;

  const datHomNay = (daDat || []).filter((d) => d.ngay === ngay);
  const datMins = datHomNay
    .map((d) => ({
      start: toMinutes(d.gioBatDau),
      end: toMinutes(d.gioKetThuc),
    }))
    .sort((a, b) => a.start - b.start);

  const slots = [];
  let current = start;

  for (const d of datMins) {
    if (d.start > current) {
      slots.push({
        gioBatDau: toTime(current),
        gioKetThuc: toTime(d.start),
        trangThai: "trong",
      });
    }
    current = Math.max(current, d.end);
  }

  if (current < end) {
    slots.push({
      gioBatDau: toTime(current),
      gioKetThuc: toTime(end),
      trangThai: "trong",
    });
  }

  // ✅ Nếu hôm nay → loại slot trễ hơn 15 phút
  const homNay = getToday();
  if (ngay === homNay) {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return slots.filter((slot) => {
      const batDau = toMinutes(slot.gioBatDau);
      return batDau > nowMinutes - 15;
    });
  }

  return slots;
};

const Home = () => {
  const [danhSachSan, setDanhSachSan] = useState([]);
  const [ngayChon, setNgayChon] = useState(getToday());
  const [popup, setPopup] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showThongBao, setShowThongBao] = useState(false);

  const today = getToday();

  // Load sân từ localStorage
  useEffect(() => {
    const data = LAY_DATA_LS();
    if (data.length > 0) {
      setDanhSachSan(data);
    } else {
      setDanhSachSan([
        { ten: "Sân 1", giaThue: 70000, daDat: [] },
        { ten: "Sân 2", giaThue: 80000, daDat: [] },
      ]);
    }
  }, []);

  // Lưu lại nếu thay đổi
  useEffect(() => {
    LUU_DATA_LS(danhSachSan);
  }, [danhSachSan]);

  // ✅ CỨNG: Nếu ngày < hôm nay → reset
  useEffect(() => {
    if (ngayChon < today) {
      alert("⛔ Không thể chọn ngày trong quá khứ!");
      setNgayChon(today);
    }
  }, [ngayChon, today]);

  // Hiển thị thông báo nếu không còn slot
  useEffect(() => {
    const khongConSlot = !danhSachSan.some((san) => {
      const slots = tinhSlotTrong(san.daDat, ngayChon);
      return slots.length > 0;
    });

    setShowThongBao(khongConSlot);
  }, [ngayChon, danhSachSan]);

  const handleClickSlot = (san, slot) => {
    setSelected({ san, slot });
    setPopup(true);
  };

  const handleDatSan = (data) => {
    const ds = [...danhSachSan];
    const idx = ds.findIndex((s) => s.ten === data.san.ten);
    if (idx === -1) return;

    ds[idx].daDat.push({
      ngay: data.ngay,
      gioBatDau: data.gioBatDau,
      gioKetThuc: data.gioKetThuc,
    });

    setDanhSachSan(ds);
    setPopup(false);
    alert("✅ Đặt sân thành công!");
  };

  const handleNgayChange = (e) => {
    const value = e.target.value;
    const today = getToday();

    if (value < today) {
      alert("❌ Không thể chọn ngày trong quá khứ!");
      setNgayChon(today);
    } else {
      setNgayChon(value);
    }
  };

  const danhSachSanRender =
    ngayChon < today
      ? []
      : danhSachSan.map((san) => ({
          ...san,
          thoiGian: tinhSlotTrong(san.daDat, ngayChon),
        }));

  return (
    <div className="p-6 max-w-4xl mx-auto bg-blur rounded-xl shadow-lg relative">
      <h1 className="text-2xl font-bold mb-4 text-center">Đặt Sân Cầu Lông Victor 🏸</h1>

      <label className="block font-medium mb-2">Chọn ngày:</label>
      <input
        type="date"
        className="border p-2 mb-4 w-full"
        value={ngayChon}
        min={today}
        max={congNgay(today, MAX_NGAY)}
        onChange={handleNgayChange}
      />

      {showThongBao && (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded mb-4 shadow text-center">
          ⚠️ Không còn sân trống vào ngày được chọn.
        </div>
      )}

      <SanGrid
        danhSachSan={danhSachSanRender}
        ngayChon={ngayChon}
        onClickSlot={handleClickSlot}
      />

      <FooterMap />

      {popup && selected && (
        <PopupDatSan
          san={selected.san}
          slot={selected.slot}
          ngayMacDinh={ngayChon}
          onClose={() => setPopup(false)}
          onDat={handleDatSan}
        />
      )}
    </div>
  );
};

export default Home;
