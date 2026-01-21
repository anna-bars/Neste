import { Terminal } from 'lucide-react';

export default function SupportCard() {
  return (
    <div className="bg-white/90 rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl">
          <Terminal className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Support</h3>
          <p className="text-sm text-gray-600">24/7 assistance</p>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-6">
        Our team is here to help with any questions about your shipment protection.
      </p>
      
      <button className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-0.5">
        Contact Support
      </button>
    </div>
  );
}