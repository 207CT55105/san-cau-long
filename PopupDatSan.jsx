import React, { useState, useEffect } from "react";
import ThanhToanPopup from "./ThanhToanPopup";

const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const toTime = (minutes) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  return `${h}:00`;
};

const PopupDatSan = ({ san, slot, ngayMacDinh, onClose, onDat }) => {
  const [ten, setTen] = useState("");
  const [soDienThoai, setSoDienThoai] = useState("");
  const [ngay, setNgay] = useState(ngayMacDinh || "");
  const [gioBatDau, setGioBatDau] = useState(slot?.gioBatDau || "06:00");
  const [thoiLuong, setThoiLuong] = useState(1);
  const [gioKetThuc, setGioKetThuc] = useState("");
  const [showThanhToan, setShowThanhToan] = useState(false);
  const giaTheoGio = san.giaThue || 70000;

  // ✅ Đồng bộ giờ bắt đầu từ slot
  useEffect(() => {
    if (slot?.gioBatDau) setGioBatDau(slot.gioBatDau);
    if (slot?.gioKetThuc) setThoiLuong(1); // Reset về 1 giờ đầu
  }, [slot]);

  // ✅ Tính giờ kết thúc
  useEffect(() => {
    const start = toMinutes(gioBatDau);
    const ketThuc = start + thoiLuong * 60;
    const gioToiDa = toMinutes(slot.gioKetThuc);

    if (ketThuc > gioToiDa) {
      setGioKetThuc("Không hợp lệ");
    } else {
      setGioKetThuc(toTime(ketThuc));
    }
  }, [gioBatDau, thoiLuong, slot]);

  // ✅ Sinh giờ bắt đầu hợp lệ trong khoảng slot
  const generateStartTimeOptions = () => {
    const start = toMinutes(slot.gioBatDau);
    const end = toMinutes(slot.gioKetThuc);
    const options = [];

    for (let m = start; m < end; m += 60) {
      options.push(toTime(m));
    }

    return options;
  };

  // ✅ Tính thời lượng hợp lệ từ giờ bắt đầu đến giới hạn slot
  const maxThoiLuong = () => {
    const gioBD = toMinutes(gioBatDau);
    const gioKT = toMinutes(slot.gioKetThuc);
    return Math.floor((gioKT - gioBD) / 60);
  };

  const handleMoThanhToan = () => {
    if (!ten.trim()) return alert("Vui lòng nhập tên người đặt.");
    if (!soDienThoai.trim()) return alert("Vui lòng nhập số điện thoại.");
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(soDienThoai.trim()))
      return alert("Số điện thoại không hợp lệ. Vui lòng nhập đúng 10 chữ số.");
    if (gioKetThuc === "Không hợp lệ")
      return alert("Thời gian kết thúc vượt quá khung giờ trống. Vui lòng chọn lại.");

    setShowThanhToan(true);
  };

  const duLieuDatSan = {
    ten,
    soDienThoai,
    ngay,
    gioBatDau,
    gioKetThuc,
    thoiLuong,
    san,
    tongTien: giaTheoGio * thoiLuong,
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        onMouseDown={onClose}
      >
        <div
          className="bg-white p-6 rounded w-full max-w-md"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold mb-4">Đặt sân {san.ten}</h2>

          <label className="block mt-2">Ngày đặt:</label>
          <input
            type="date"
            className="w-full border p-2"
            value={ngay}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setNgay(e.target.value)}
          />

          <label className="block mt-2">Giờ bắt đầu:</label>
          <select
            className="w-full border p-2"
            value={gioBatDau}
            onChange={(e) => setGioBatDau(e.target.value)}
          >
            {generateStartTimeOptions().map((gio) => (
              <option key={gio} value={gio}>
                {gio}
              </option>
            ))}
          </select>

          <label className="block mt-2">Thời lượng (giờ):</label>
          <input
            type="number"
            className="w-full border p-2"
            min={1}
            max={maxThoiLuong()}
            value={thoiLuong}
            onChange={(e) => setThoiLuong(Number(e.target.value))}
          />

          <div className="mt-2 text-sm text-gray-600">
            ⏱ Giờ kết thúc: <strong>{gioKetThuc}</strong> <br />
            💰 Tổng tiền:{" "}
            <strong>{(giaTheoGio * thoiLuong).toLocaleString()}đ</strong>
          </div>

          <input
            type="text"
            placeholder="*Tên người đặt"
            value={ten}
            onChange={(e) => setTen(e.target.value)}
            className="w-full border p-2 mt-4"
          />
          <input
            type="tel"
            placeholder="* Số điện thoại (Zalo)"
            value={soDienThoai}
            onChange={(e) => setSoDienThoai(e.target.value)}
            className="w-full border p-2 mt-2"
          />

          <div className="flex justify-end gap-4 mt-4">
            <button onClick={onClose} className="text-gray-600">
              Huỷ
            </button>
            <button
              className="bg-black text-white px-4 py-2 rounded"
              onClick={handleMoThanhToan}
            >
              Đặt sân
            </button>
          </div>
        </div>
      </div>

      {showThanhToan && (
        <ThanhToanPopup
          thongTinDatSan={duLieuDatSan}
          onXacNhanThanhToan={(data) => {
            onDat(data);
            setShowThanhToan(false);
            onClose();
          }}
          onHuy={() => setShowThanhToan(false)}
        />
      )}
    </>
  );
};

export default PopupDatSan;
