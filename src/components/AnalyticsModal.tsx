import { useState, useEffect } from 'react';
import { X, Calendar, Smartphone } from 'lucide-react';
import { QRLink, QRScan } from '../lib/supabase';
import { getQRAnalytics } from '../lib/qr-service';

interface AnalyticsModalProps {
  isOpen: boolean;
  qrLink: QRLink | null;
  onClose: () => void;
}

export const AnalyticsModal = ({ isOpen, qrLink, onClose }: AnalyticsModalProps) => {
  const [scans, setScans] = useState<QRScan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && qrLink) {
      loadAnalytics();
    }
  }, [isOpen, qrLink]);

  const loadAnalytics = async () => {
    if (!qrLink) return;
    setLoading(true);
    try {
      const data = await getQRAnalytics(qrLink.id);
      setScans(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !qrLink) return null;

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScansByDate = () => {
    const grouped: { [key: string]: number } = {};
    scans.forEach((scan) => {
      const date = new Date(scan.scanned_at).toLocaleDateString();
      grouped[date] = (grouped[date] || 0) + 1;
    });
    return grouped;
  };

  const scansByDate = getScansByDate();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
            <p className="text-sm text-gray-600 mt-1">{qrLink.label}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 mb-1">Total Scans</div>
                <div className="text-3xl font-bold text-blue-900">{qrLink.scan_count}</div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 mb-1">Unique Days</div>
                <div className="text-3xl font-bold text-green-900">
                  {Object.keys(scansByDate).length}
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-orange-600 mb-1">Avg. per Day</div>
                <div className="text-3xl font-bold text-orange-900">
                  {Object.keys(scansByDate).length > 0
                    ? Math.round(qrLink.scan_count / Object.keys(scansByDate).length)
                    : 0}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-600">Loading analytics...</div>
            ) : scans.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <BarChart3 className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-600">No scans yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Analytics will appear here once someone scans this QR code
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Scans</h3>
                <div className="space-y-3">
                  {scans.slice(0, 20).map((scan) => (
                    <div
                      key={scan.id}
                      className="bg-gray-50 rounded-lg p-4 flex items-start gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm text-gray-900 mb-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{formatDateTime(scan.scanned_at)}</span>
                        </div>
                        {scan.user_agent && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Smartphone className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{scan.user_agent}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {scans.length > 20 && (
                  <div className="text-center mt-4 text-sm text-gray-500">
                    Showing 20 of {scans.length} scans
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BarChart3 = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </svg>
);
