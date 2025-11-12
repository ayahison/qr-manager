import { Download, Edit, Trash2, ExternalLink, BarChart3 } from 'lucide-react';
import { QRLink } from '../lib/supabase';
import { useState, useEffect } from 'react';
import { regenerateQRImage } from '../lib/qr-service';

interface QRCodeCardProps {
  qrLink: QRLink;
  onEdit: (qrLink: QRLink) => void;
  onDelete: (id: string) => void;
  onViewAnalytics: (qrLink: QRLink) => void;
}

export const QRCodeCard = ({ qrLink, onEdit, onDelete, onViewAnalytics }: QRCodeCardProps) => {
  const [qrImage, setQrImage] = useState<string>('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const loadQRImage = async () => {
      const image = await regenerateQRImage(qrLink.short_url);
      setQrImage(image);
    };
    loadQRImage();
  }, [qrLink.short_url]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `qr-${qrLink.code}.png`;
    link.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex flex-col items-center">
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          {qrImage && (
            <img src={qrImage} alt={`QR Code for ${qrLink.label}`} className="w-48 h-48" />
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 text-center">
          {qrLink.label}
        </h3>

        <div className="w-full space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Short URL:</span>
            <a
              href={qrLink.short_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              {qrLink.code}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Target:</span>
            <a
              href={qrLink.target_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 truncate max-w-[180px]"
              title={qrLink.target_url}
            >
              {new URL(qrLink.target_url).hostname}
            </a>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Scans:</span>
            <span className="font-semibold text-gray-900">{qrLink.scan_count}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Created:</span>
            <span className="text-gray-700">{formatDate(qrLink.created_at)}</span>
          </div>
        </div>

        <div className="flex gap-2 w-full">
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            title="Download QR Code"
          >
            <Download className="w-4 h-4" />
            Download
          </button>

          <button
            onClick={() => onViewAnalytics(qrLink)}
            className="flex items-center justify-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="View Analytics"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onEdit(qrLink)}
            className="flex items-center justify-center px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center justify-center px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete QR Code?</h3>
            <p className="text-gray-600 mb-6">
              This will permanently delete the QR code and all its analytics data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(qrLink.id);
                  setShowConfirm(false);
                }}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
