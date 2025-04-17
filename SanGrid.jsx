import React from "react";

const SanGrid = ({ danhSachSan, onClickSlot }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {danhSachSan.map((san) =>
        san.thoiGian.map((slot, index) => (
          <div
            key={`${san.ten}-${index}`}
            onClick={() => slot.trangThai === "trong" && onClickSlot(san, slot)}
            className={`border p-2 rounded cursor-pointer text-center ${
              slot.trangThai === "trong"
                ? "bg-white hover:bg-gray-100"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            <p className="font-bold">{san.ten}</p>
            <p>{slot.gioBatDau} - {slot.gioKetThuc}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default SanGrid;
