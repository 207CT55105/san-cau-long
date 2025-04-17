import React from "react";

const FooterMap = () => {
  return (
    <div className="mt-10 border-t pt-4 text-center">
      <h3 className="font-semibold mb-2">Địa chỉ sân:</h3>
      <iframe
        src="https://www.google.com/maps?q=140/11+B%C3%ACnh+Qu%E1%BB%9Bi,+Ph%C6%B0%E1%BB%9Dng+27,+B%C3%ACnh+Th%E1%BA%A1nh,+HCM&output=embed"
        width="100%"
        height="300"
        allowFullScreen
        loading="lazy"
        className="rounded"
        title="Địa chỉ sân cầu lông"
      ></iframe>
    </div>
  );
};

export default FooterMap;
