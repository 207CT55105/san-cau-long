import React, { useState } from "react";

const ThanhToanPopup = ({ thongTinDatSan, onXacNhanThanhToan, onHuy }) => {
  const [phuongThuc, setPhuongThuc] = useState("MOMO");
  const [dangThanhToan, setDangThanhToan] = useState(false);

  const handleThanhToan = () => {
    setDangThanhToan(true);

    // Mô phỏng delay xử lý thanh toán
    setTimeout(() => {
      setDangThanhToan(false);
      alert("💸 Thanh toán thành công!");
      onXacNhanThanhToan({
        ...thongTinDatSan,
        phuongThucThanhToan: phuongThuc,
        trangThaiThanhToan: "Đã thanh toán",
      });
    }, 1500);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onMouseDown={onHuy}
    >
      <div
        className="bg-white p-6 rounded w-full max-w-md"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Chọn phương thức thanh toán</h2>

        <div className="flex flex-col gap-3">
          {["MOMO", "VNPAY", "ZaloPay"].map((pt) => (
            <label key={pt} className="flex items-center gap-2">
              <input
                type="radio"
                value={pt}
                checked={phuongThuc === pt}
                onChange={() => setPhuongThuc(pt)}
              />
              {pt}
            </label>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button onClick={onHuy} className="text-gray-600">
            Huỷ
          </button>
          <button
            className="bg-black text-white px-4 py-2 rounded"
            onClick={handleThanhToan}
            disabled={dangThanhToan}
          >
            {dangThanhToan ? "Đang xử lý..." : "Thanh toán"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThanhToanPopup;
