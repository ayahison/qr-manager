import { useState, useEffect } from 'react';
import { Plus, QrCode } from 'lucide-react';
import { QRLink } from '../lib/supabase';
import { generateQRCode, getAllQRLinks, updateQRLink, deleteQRLink } from '../lib/qr-service';
import { CreateQRModal } from '../components/CreateQRModal';
import { EditQRModal } from '../components/EditQRModal';
import { QRCodeCard } from '../components/QRCodeCard';
import { AnalyticsModal } from '../components/AnalyticsModal';

export const Dashboard = () => {
  const [qrLinks, setQrLinks] = useState<QRLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedQRLink, setSelectedQRLink] = useState<QRLink | null>(null);

  useEffect(() => {
    loadQRLinks();
  }, []);

  const loadQRLinks = async () => {
    setLoading(true);
    try {
      const data = await getAllQRLinks();
      setQrLinks(data);
    } catch (error) {
      console.error('Failed to load QR links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (label: string, url: string) => {
    const { qrLink } = await generateQRCode(url, label);
    setQrLinks([qrLink, ...qrLinks]);
  };

  const handleEdit = async (id: string, label: string, url: string) => {
    const updated = await updateQRLink(id, url, label);
    setQrLinks(qrLinks.map((qr) => (qr.id === id ? updated : qr)));
    setSelectedQRLink(null);
  };

  const handleDelete = async (id: string) => {
    await deleteQRLink(id);
    setQrLinks(qrLinks.filter((qr) => qr.id !== id));
  };

  const handleOpenEdit = (qrLink: QRLink) => {
    setSelectedQRLink(qrLink);
    setShowEditModal(true);
  };

  const handleOpenAnalytics = (qrLink: QRLink) => {
    setSelectedQRLink(qrLink);
    setShowAnalyticsModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-3 rounded-lg">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dynamic QR Manager</h1>
              <p className="text-gray-600 mt-1">Create and manage your dynamic QR codes</p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Create QR Code</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading QR codes...</p>
            </div>
          </div>
        ) : qrLinks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <QrCode className="w-20 h-20 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No QR Codes Yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first dynamic QR code
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First QR Code</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Total QR Codes: <span className="font-semibold text-gray-900">{qrLinks.length}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {qrLinks.map((qrLink) => (
                <QRCodeCard
                  key={qrLink.id}
                  qrLink={qrLink}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                  onViewAnalytics={handleOpenAnalytics}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <CreateQRModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
      />

      <EditQRModal
        isOpen={showEditModal}
        qrLink={selectedQRLink}
        onClose={() => {
          setShowEditModal(false);
          setSelectedQRLink(null);
        }}
        onSubmit={handleEdit}
      />

      <AnalyticsModal
        isOpen={showAnalyticsModal}
        qrLink={selectedQRLink}
        onClose={() => {
          setShowAnalyticsModal(false);
          setSelectedQRLink(null);
        }}
      />
    </div>
  );
};
