import React from "react";

<<<<<<< HEAD
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
=======
const SanGrid = ({ danhSachSan, onClickSlot, ngayChon }) => {
  const now = new Date();
  const ngayHomNay = now.toISOString().split("T")[0];

  let gioToiThieu = 6;

  if (ngayChon === ngayHomNay) {
    const minutesNow = now.getMinutes();
    const hoursNow = now.getHours();
    gioToiThieu = minutesNow >= 15 ? hoursNow + 1 : hoursNow;
    if (gioToiThieu < 6) gioToiThieu = 6;
    if (gioToiThieu > 23) gioToiThieu = 23;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {danhSachSan.map((san, sanIndex) => {
        const khungGioHienThi = san.thoiGian.filter((slot) => {
          const [startHour] = slot.gioBatDau.split(":").map(Number);
          return ngayChon === ngayHomNay ? startHour >= gioToiThieu : true;
        });

        return (
          <div key={sanIndex} className="border p-3 rounded">
            <h3 className="text-lg font-semibold mb-2">{san.ten}</h3>
            {khungGioHienThi.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {khungGioHienThi.map((slot, index) => (
                  <div
                    key={index}
                    onClick={() =>
                      slot.trangThai === "trong" && onClickSlot(san, slot)
                    }
                    className={`border px-3 py-2 rounded text-center cursor-pointer ${
                      slot.trangThai === "trong"
                        ? "bg-white hover:bg-green-100"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    {slot.gioBatDau} - {slot.gioKetThuc}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">Không còn khung giờ khả dụng.</p>
            )}
          </div>
        );
      })}
>>>>>>> 7880dffa103f392e480f997f247c679768359d62
    </div>
  );
};

export default SanGrid;
