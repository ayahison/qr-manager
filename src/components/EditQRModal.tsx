import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { QRLink } from '../lib/supabase';

interface EditQRModalProps {
  isOpen: boolean;
  qrLink: QRLink | null;
  onClose: () => void;
  onSubmit: (id: string, label: string, url: string) => Promise<void>;
}

export const EditQRModal = ({ isOpen, qrLink, onClose, onSubmit }: EditQRModalProps) => {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (qrLink) {
      setLabel(qrLink.label);
      setUrl(qrLink.target_url);
    }
  }, [qrLink]);

  if (!isOpen || !qrLink) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!label.trim() || !url.trim()) {
      setError('Label and URL are required');
      return;
    }

    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(qrLink.id, label, url);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update QR code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit QR Code</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="edit-label" className="block text-sm font-medium text-gray-700 mb-1">
                Label
              </label>
              <input
                type="text"
                id="edit-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g., Company Website"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="edit-url" className="block text-sm font-medium text-gray-700 mb-1">
                Destination URL
              </label>
              <input
                type="text"
                id="edit-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="https://example.com"
                disabled={loading}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The QR code image will remain the same. Only the destination URL will be updated.
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
