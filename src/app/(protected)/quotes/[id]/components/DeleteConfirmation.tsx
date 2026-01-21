import { Trash2 } from 'lucide-react';

interface DeleteConfirmationProps {
  onCancel: () => void;
  onDelete: () => void;
}

export default function DeleteConfirmation({ onCancel, onDelete }: DeleteConfirmationProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-xl">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Delete Quote</h3>
            <p className="text-gray-600 text-sm">Are you sure you want to delete this quote? This action cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="flex-1 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}