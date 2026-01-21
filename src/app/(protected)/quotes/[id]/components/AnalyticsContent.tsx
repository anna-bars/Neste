import { Sparkles, Code, Rocket, Clock, BadgeCheck } from 'lucide-react';
import { QuoteData } from '../types';

interface AnalyticsContentProps {
  quoteData: QuoteData;
  formatDateTime: (dateString: string) => string;
}

export default function AnalyticsContent({ quoteData, formatDateTime }: AnalyticsContentProps) {
  return (
    <div className="bg-white/90 rounded-2xl border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Analytics</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-300">
            <h3 className="font-semibold text-gray-900 mb-3">Risk Score</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl font-bold text-blue-600">78</span>
              <div className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Good</div>
            </div>
            <div className="h-2 w-full bg-gray-300 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: '78%' }}></div>
            </div>
            <p className="text-xs text-gray-600 mt-2">Based on cargo type and route analysis</p>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-300">
            <h3 className="font-semibold text-gray-900 mb-3">Cost Efficiency</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl font-bold text-emerald-600">92%</span>
              <div className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">Optimal</div>
            </div>
            <div className="h-2 w-full bg-gray-300 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full" style={{ width: '92%' }}></div>
            </div>
            <p className="text-xs text-gray-600 mt-2">Premium vs industry average</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-300">
          <h3 className="font-semibold text-gray-900 mb-4">Timeline Analysis</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Quote Created</p>
                  <p className="text-xs text-gray-600">{formatDateTime(quoteData.created_at)}</p>
                </div>
              </div>
              <BadgeCheck className="w-5 h-5 text-emerald-500" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center">
                  <Code className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">AI Analysis</p>
                  <p className="text-xs text-gray-600">Processing risk assessment</p>
                </div>
              </div>
              <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Activation</p>
                  <p className="text-xs text-gray-600">Ready for deployment</p>
                </div>
              </div>
              <div className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">Pending</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}