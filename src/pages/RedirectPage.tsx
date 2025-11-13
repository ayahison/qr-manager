import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getQRLinkByCode,
  incrementScanCount,
  recordScan,
} from "../lib/qr-service";
import { QrCode } from "lucide-react";

export const RedirectPage = () => {
  const { code } = useParams<{ code: string }>();
  const [status, setStatus] = useState<"loading" | "redirecting" | "not-found">(
    "loading"
  );

  useEffect(() => {
    const handleRedirect = async () => {
      if (!code) {
        setStatus("not-found");
        return;
      }

      try {
        const qrLink = await getQRLinkByCode(code);

        if (!qrLink) {
          setStatus("not-found");
          return;
        }

        setStatus("redirecting");

        await incrementScanCount(qrLink.id);

        const userAgent = navigator.userAgent;
        const referrer = document.referrer || undefined;

        await recordScan(qrLink.id, userAgent, undefined, referrer);

        // GANTI BAGIAN INI - redirect langsung tanpa delay
        window.location.replace(qrLink.target_url);
      } catch (error) {
        console.error("Redirect error:", error);
        setStatus("not-found");
      }
    };

    handleRedirect();
  }, [code]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Loading...
          </h2>
          <p className="text-gray-600">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (status === "redirecting") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-bounce mb-6">
            <QrCode className="w-16 h-16 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Redirecting...
          </h2>
          <p className="text-gray-600">You will be redirected shortly</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="text-red-400 mb-4">
          <QrCode className="w-20 h-20 mx-auto" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          QR Code Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          This QR code does not exist or has been deleted. Please contact the QR
          code creator for more information.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
};
