import React, { useState } from 'react';
import { Building } from 'lucide-react';
import Button from '../common/Button';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface ChurchIdModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ChurchIdModal: React.FC<ChurchIdModalProps> = ({ onClose, onSuccess }) => {
  const [churchId, setChurchId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!churchId.trim()) {
      toast.error('Please enter a church ID');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ church_id: churchId.trim() })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      toast.success('Church ID updated successfully');
      onSuccess();
    } catch (error: any) {
      console.error('Error updating church ID:', error);
      toast.error(error.message || 'Failed to update church ID');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <Building className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Set Your Church ID</h2>
          <p className="mt-2 text-sm text-gray-500">
            You need to set your church ID before you can create content.
            Contact your administrator if you don't know your church ID.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="churchId" className="block text-sm font-medium text-gray-700 mb-1">
              Church ID
            </label>
            <input
              id="churchId"
              type="text"
              value={churchId}
              onChange={(e) => setChurchId(e.target.value)}
              className="input"
              placeholder="Enter your church ID"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
            >
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChurchIdModal;