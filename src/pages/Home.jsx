import React, { useEffect, useState, useRef, useMemo  } from "react";
import SanGrid from "../components/SanGrid";
import PopupDatSan from "../components/PopupDatSan";
import FooterMap from "../components/FooterMap";
import TraCuuPopup from "../components/TraCuuPopup";

const GIO_MO = 6;                                                                        // thay đổi giờ mở sân
const GIO_DONG = 23;                                                                     // thay đổi giờ đóng sân
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

const getToday = () => {
  const tzOffset = 7 * 60 * 60 * 1000; // UTC+7
  const local = new Date(Date.now() + tzOffset);
  return local.toISOString().split("T")[0];
};

                                                      // LocalStorage helpers
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

const tinhSlotTrong = (daDat, ngay) => {
  const start = GIO_MO * 60;
  const end = GIO_DONG * 60;

  const datTrongNgay = (daDat || []).filter((d) => d.ngay === ngay);
  const datMins = datTrongNgay
    .map((d) => ({
      start: toMinutes(d.gioBatDau),
      end: toMinutes(d.gioKetThuc),
      ...d,
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

    slots.push({
      gioBatDau: toTime(d.start),
      gioKetThuc: toTime(d.end),
      trangThai: "dat",
      chiaSe: d.chiaSe || false,
      ten: d.ten || "",
      soDienThoai: d.soDienThoai || "",
    });

    current = d.end;
  }

  if (current < end) {
    slots.push({
      gioBatDau: toTime(current),
      gioKetThuc: toTime(end),
      trangThai: "trong",
    });
  }

  // ✅ Nếu là hôm nay thì xử lý trạng thái các slot trống theo giờ hiện tại
  const homNay = getToday();
  if (ngay === homNay) {
    const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    return slots.map((slot) => {
      const batDau = toMinutes(slot.gioBatDau);

      if (slot.trangThai === "trong") {
        // Nếu đã quá giờ bắt đầu + 15 phút → chuyển thành "dat"
        if (nowMinutes < batDau + 15) {
          return {
            ...slot,
            trangThai: "trong",
            chiaSe: false,
            ten: "",
            soDienThoai: "",
          };
        }
      }

      return slot;
    });
  }

  return slots;
};

                                                      // Tính slot trống và đã đặt
                                                      

const Home = () => {
  const [danhSachSan, setDanhSachSan] = useState([]);
  const [ngayChon, setNgayChon] = useState(getToday());
  const [popup, setPopup] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showThongBao, setShowThongBao] = useState(false);

  const [tuKhoa, setTuKhoa] = useState("");
  const [ketQua, setKetQua] = useState([]);
  const [showTraCuu, setShowTraCuu] = useState(false);
  const [isSoDienThoai, setIsSoDienThoai] = useState(false);
  const [version, setVersion] = useState(0);
  const resetChonSlotRef = useRef(null); 

  const today = getToday();

                                                      // Load từ localStorage
  useEffect(() => {
    const data = LAY_DATA_LS();
    if (data.length > 0) {
      setDanhSachSan(data);
    } else {
      setDanhSachSan([
        { ten: "Sân 1", giaThue: 70000, daDat: [] },                                     // thay đổi giá sân 1
        { ten: "Sân 2", giaThue: 70000, daDat: [] },                                     // thay đổi giá sân 2
        //{ ten: "Sân 3", giaThue: 70000, daDat: [] },                                  // thêm sân mới ở đây:
      ]);
    }
  }, []);

  useEffect(() => {
    LUU_DATA_LS(danhSachSan);
  }, [danhSachSan]);

  useEffect(() => {
    if (ngayChon < today) {
      alert("Không thể chọn ngày trong quá khứ!");
      setNgayChon(today);
    }
  }, [ngayChon, today]);

                                                    // Thông báo không còn slot trống
  useEffect(() => {
    const khongConSlot = !danhSachSan.some((san) => {
      const slots = tinhSlotTrong(san.daDat, ngayChon);
      return slots.some((s) => s.trangThai === "trong");
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
  
  const slots = data.slots && data.slots.length > 0
      ? data.slots
      : [{
          gioBatDau: data.gioBatDau,
          gioKetThuc: data.gioKetThuc,
        }];
  
      if (data.slots && data.slots.length > 0) {
        data.slots.forEach((s) => {
          ds[idx].daDat.push({
            ten: data.ten,
            soDienThoai: data.soDienThoai,
            ngay: data.ngay,
            gioBatDau: s.gioBatDau,
            gioKetThuc: s.gioKetThuc,
            tongTien: data.san.giaThue || 70000,
            chiaSe: s.chiaSe === true, // ✅ lấy từ từng slot
            thoiGianDat: Date.now(),
          });
          
        });
      } else {
        ds[idx].daDat.push({
          ten: data.ten,
          soDienThoai: data.soDienThoai,
          ngay: data.ngay,
          gioBatDau: data.gioBatDau,
          gioKetThuc: data.gioKetThuc,
          tongTien: data.tongTien,
          chiaSe: data.chiaSe === true,
          thoiGianDat: Date.now(),
        });
      }
  
    setDanhSachSan(ds);

    if (resetChonSlotRef.current) resetChonSlotRef.current();
    
    setPopup(false);
    alert(" Đặt sân thành công!");
  };

  const handleNgayChange = (e) => {
    const value = e.target.value;
    if (value < today) {
      alert(" Không thể chọn ngày trong quá khứ!");
      setNgayChon(today);
    } else {
      setNgayChon(value);
    }
  };

  const handleTraCuu = () => {
    const ketQuaTim = [];
    const sdtRegex = /^[0-9]{10}$/;
  
    danhSachSan.forEach((san) => {
      san.daDat.forEach((dat) => {
                                                      // Chỉ chấp nhận kết quả nếu tên hoặc sđt trùng khớp chính xác
        if (
          dat.ten.toLowerCase() === tuKhoa.toLowerCase() ||
          dat.soDienThoai === tuKhoa
        ) {
          if (sdtRegex.test(tuKhoa)) {
            ketQuaTim.push({ ...dat, thoiGianDat: dat.thoiGianDat, san: san.ten });
          } else {
            ketQuaTim.push({
              ten: dat.ten,
              san: san.ten,
              gioBatDau: dat.gioBatDau,
              gioKetThuc: dat.gioKetThuc,
              ngay: dat.ngay,
              thoiGianDat: dat.thoiGianDat,
            });
          }
        }
      });
    });
  
    setIsSoDienThoai(sdtRegex.test(tuKhoa));
    setKetQua(ketQuaTim);
    setShowTraCuu(true);
  };

  const danhSachSanRender = useMemo(() => {
    return danhSachSan.map((san) => ({
      ...san,
      thoiGian: tinhSlotTrong(san.daDat, ngayChon),
    }));
  }, [danhSachSan, ngayChon, version]); // ✅ ép render lại khi version thay đổi

  return (
    <div className="relative min-h-screen p-6 max-w-4xl mx-auto bg-blur rounded-xl shadow-lg">
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

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Nhập tên hoặc số điện thoại"
          className="border p-2 flex-1 capitalize"
          value={tuKhoa}
          onChange={(e) => setTuKhoa(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleTraCuu();
          }}
        />
        <button
          className="bg-black text-white px-4 rounded"
          onClick={handleTraCuu}
        >
          Tìm
        </button>
      </div>

      {showThongBao && (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded mb-4 shadow text-center">
          ⚠️ Không còn sân trống vào ngày được chọn.
        </div>
      )}

<SanGrid
  danhSachSan={danhSachSanRender}
  ngayChon={ngayChon}
  onDatNhieuSlot={(slots) => {
    const [chonDau] = slots;

    setSelected({
      san: chonDau.san,
      slot: chonDau.slot,
      slots: slots.map((s) => s.slot),  // ✅ Truyền danh sách các slot
    });

    setPopup(true);
  }}
  onResetSlotDaChon={(resetFn) => (resetChonSlotRef.current = resetFn)}
/>

      <FooterMap />

      {popup && selected && (
  <PopupDatSan
    san={selected.san}
    slot={selected.slot}
    slots={selected.slots || []}  // 
    ngayMacDinh={ngayChon}
    onClose={() => setPopup(false)}
    onDat={handleDatSan}
  />
)}

      {showTraCuu && (
        <TraCuuPopup
        ketQua={ketQua}
        isSoDienThoai={isSoDienThoai}
        onClose={() => setShowTraCuu(false)}
        onCapNhat={(dsMoi) => {
          setDanhSachSan(dsMoi);
          LUU_DATA_LS(dsMoi);
          setVersion(prev => prev + 1); // ✅ ép re-render SanGrid
        }}
      />
      )}
    </div>
  );
};

export default Home;
