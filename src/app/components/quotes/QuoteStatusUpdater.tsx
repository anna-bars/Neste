'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface QuoteStatusUpdaterProps {
  quoteId: string;
  initialStatus: string;
  onStatusChange?: (newStatus: string) => void;
  autoRedirect?: boolean;
  checkInterval?: number; // milliseconds
}

export default function QuoteStatusUpdater({
  quoteId,
  initialStatus,
  onStatusChange,
  autoRedirect = true,
  checkInterval = 10000 // Check every 10 seconds
}: QuoteStatusUpdaterProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState('');

  const supabase = createClient();

  const checkStatus = async () => {
    if (!quoteId || isChecking) return;

    setIsChecking(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('status, rejection_reason, approved_at')
        .eq('id', quoteId)
        .single();

      if (error) throw error;

      if (data.status !== currentStatus) {
        setCurrentStatus(data.status);
        onStatusChange?.(data.status);

        // Auto-redirect based on new status
        if (autoRedirect) {
          switch (data.status) {
            case 'approved':
              router.push(`/quotes/new/insurance?quote_id=${quoteId}&approved=true`);
              break;
            case 'rejected':
              router.push(`/quotes/${quoteId}/rejected`);
              break;
            case 'expired':
              router.push(`/quotes/${quoteId}/expired`);
              break;
          }
        }
      }

      setLastChecked(new Date());
    } catch (err) {
      console.error('Error checking quote status:', err);
      setError(err instanceof Error ? err.message : 'Failed to check status');
    } finally {
      setIsChecking(false);
    }
  };

  // Initial check
  useEffect(() => {
    checkStatus();
  }, [quoteId]);

  // Periodic checking
  useEffect(() => {
    if (currentStatus === 'under_review' || currentStatus === 'needs_info') {
      const interval = setInterval(checkStatus, checkInterval);
      return () => clearInterval(interval);
    }
  }, [currentStatus, checkInterval]);

  const getStatusConfig = () => {
    switch (currentStatus) {
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          text: 'Approved',
          description: 'Your quote has been approved'
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          text: 'Rejected',
          description: 'Your quote has been rejected'
        };
      case 'under_review':
        return {
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          text: 'Under Review',
          description: 'Your quote is being reviewed'
        };
      case 'needs_info':
        return {
          icon: AlertCircle,
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          text: 'Needs Information',
          description: 'Additional information required'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          text: 'Processing',
          description: 'Your quote is being processed'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const Icon = statusConfig.icon;

  return (
    <div className={`p-4 rounded-lg border ${statusConfig.borderColor} ${statusConfig.bgColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
            <Icon className={`w-5 h-5 ${statusConfig.color}`} />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{statusConfig.text}</h3>
            <p className="text-sm text-gray-600">{statusConfig.description}</p>
          </div>
        </div>
        
        {(currentStatus === 'under_review' || currentStatus === 'needs_info') && (
          <div className="text-right">
            <button
              onClick={checkStatus}
              disabled={isChecking}
              className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              {isChecking ? 'Checking...' : 'Check Status'}
            </button>
            {lastChecked && (
              <p className="text-xs text-gray-500 mt-1">
                Last checked: {lastChecked.toLocaleTimeString()}
              </p>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}
      
      {/* Progress indicator for under review */}
      {(currentStatus === 'under_review' || currentStatus === 'needs_info') && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Review in progress</span>
            <span>Estimated: Within 24 hours</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: isChecking ? '70%' : '40%',
                animation: isChecking ? 'pulse 2s infinite' : 'none'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}