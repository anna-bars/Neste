// app/components/Notifications.tsx
'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  XCircle, 
  FileText, 
  CreditCard,
  Shield,
  AlertTriangle,
  Clock,
  X,
  Check,
  Zap,
  Loader2,
  CircleDashed
} from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error' | string
  read: boolean
  created_at: string
}

interface NotificationsProps {
  isOpen: boolean
  onClose: () => void
  notifications: Notification[]
  unreadCount: number
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDelete?: (id: string) => void
  isLoading?: boolean
}

export default function Notifications({ 
  isOpen, 
  onClose, 
  notifications, 
  unreadCount, 
  onMarkAsRead, 
  onMarkAllAsRead,
  onDelete,
  isLoading = false
}: NotificationsProps) {
  const notificationsRef = useRef<HTMLDivElement>(null)
  const [autoReadTimeouts, setAutoReadTimeouts] = useState<Record<string, NodeJS.Timeout>>({})
  const [autoMarkReadEnabled, setAutoMarkReadEnabled] = useState(true)
  const [clickedNotificationId, setClickedNotificationId] = useState<string | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(autoReadTimeouts).forEach(timeout => {
        clearTimeout(timeout)
      })
    }
  }, [autoReadTimeouts])

  const handleNotificationClick = useCallback((notification: Notification) => {
    if (notification.read) return

    // Set clicked state for visual feedback
    setClickedNotificationId(notification.id)

    // Clear existing timeout if any
    if (autoReadTimeouts[notification.id]) {
      clearTimeout(autoReadTimeouts[notification.id])
    }

    // If auto-read is enabled, set timeout to mark as read after 3 seconds
    if (autoMarkReadEnabled) {
      const timeoutId = setTimeout(() => {
        onMarkAsRead(notification.id)
        
        // Remove timeout from state
        setAutoReadTimeouts(prev => {
          const newTimeouts = { ...prev }
          delete newTimeouts[notification.id]
          return newTimeouts
        })
        
        // Reset clicked state
        setClickedNotificationId(null)
      }, 3000)

      // Store timeout ID
      setAutoReadTimeouts(prev => ({
        ...prev,
        [notification.id]: timeoutId
      }))
    } else {
      // If auto-read is disabled, mark as read immediately
      onMarkAsRead(notification.id)
      
      // Reset clicked state after a short delay
      setTimeout(() => {
        setClickedNotificationId(null)
      }, 500)
    }

  }, [onMarkAsRead, autoReadTimeouts, autoMarkReadEnabled])

  const handleCancelAutoRead = useCallback((notificationId: string) => {
    if (autoReadTimeouts[notificationId]) {
      clearTimeout(autoReadTimeouts[notificationId])
      setAutoReadTimeouts(prev => {
        const newTimeouts = { ...prev }
        delete newTimeouts[notificationId]
        return newTimeouts
      })
    }
    setClickedNotificationId(null)
  }, [autoReadTimeouts])

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getNotificationIcon = (type: string, isRead: boolean) => {
    const typeLower = type.toLowerCase()
    const iconClass = `w-5 h-5 ${isRead ? 'text-gray-400' : ''}`
    
    switch(typeLower) {
      case 'info':
        return <Info className={iconClass} />
      case 'warning':
        return <AlertTriangle className={iconClass} />
      case 'success':
        return <CheckCircle className={iconClass} />
      case 'error':
        return <XCircle className={iconClass} />
      case 'quote_created':
      case 'quote_expiring':
      case 'quote_expired':
        return <FileText className={iconClass} />
      case 'payment_success':
      case 'payment_failed':
        return <CreditCard className={iconClass} />
      case 'policy_issued':
      case 'policy_active':
      case 'policy_expiring':
      case 'policy_expired':
        return <FileText className={iconClass} />
      case 'document_approved':
      case 'document_rejected':
      case 'document_required':
      case 'document_missing':
        return <FileText className={iconClass} />
      case 'claim_submitted':
      case 'claim_approved':
      case 'claim_rejected':
      case 'claim_requires_info':
      case 'claim_paid':
        return <Shield className={iconClass} />
      case 'system_alert':
        return <AlertCircle className={iconClass} />
      default:
        return <Bell className={iconClass} />
    }
  }

  const getNotificationColor = (type: string) => {
    const typeLower = type.toLowerCase()
    switch(typeLower) {
      case 'info':
      case 'quote_created':
      case 'claim_submitted':
        return 'bg-blue-50 border-blue-200 text-blue-600'
      case 'warning':
      case 'quote_expiring':
      case 'policy_expiring':
      case 'document_missing':
        return 'bg-amber-50 border-amber-200 text-amber-600'
      case 'success':
      case 'quote_approved':
      case 'payment_success':
      case 'policy_issued':
      case 'document_approved':
      case 'claim_approved':
      case 'claim_paid':
        return 'bg-emerald-50 border-emerald-200 text-emerald-600'
      case 'error':
      case 'quote_expired':
      case 'policy_expired':
      case 'document_rejected':
      case 'claim_rejected':
      case 'payment_failed':
        return 'bg-red-50 border-red-200 text-red-600'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600'
    }
  }

  const handleMarkAllAsReadWithClear = () => {
    // Clear all auto-read timeouts
    Object.values(autoReadTimeouts).forEach(timeout => {
      clearTimeout(timeout)
    })
    setAutoReadTimeouts({})
    setClickedNotificationId(null)
    
    // Mark all as read
    onMarkAllAsRead()
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed xl:absolute top-16 xl:top-12 right-4 xl:right-0 w-[calc(100vw-32px)] xl:w-[440px] max-h-[calc(100vh-100px)] bg-white rounded-lg shadow-lg border border-gray-200 z-[9999] overflow-hidden"
      ref={notificationsRef}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-5 h-5 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Notifications</h3>
            <p className="text-xs text-gray-500">
              {isLoading ? 'Loading...' : unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
          aria-label="Close notifications"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Auto-read toggle */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${autoMarkReadEnabled ? 'bg-blue-600' : 'bg-gray-300'}`} />
          <span className="text-xs font-medium text-gray-700">
            {autoMarkReadEnabled ? 'Auto-read enabled' : 'Auto-read disabled'}
          </span>
        </div>
        <button
          onClick={() => setAutoMarkReadEnabled(!autoMarkReadEnabled)}
          className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
            autoMarkReadEnabled 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <Zap className="w-3 h-3" />
          {autoMarkReadEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Auto-read info */}
      {autoMarkReadEnabled && unreadCount > 0 && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
          <p className="text-xs text-blue-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Click on notifications to auto-mark as read in 3 seconds
          </p>
        </div>
      )}

      {/* Notifications List */}
      <div className="overflow-y-auto max-h-[420px]">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => {
              const hasAutoReadTimeout = !!autoReadTimeouts[notification.id]
              const isAutoReadInProgress = hasAutoReadTimeout && !notification.read
              const isClicked = clickedNotificationId === notification.id
              
              return (
                <div
                  key={notification.id}
                  data-notification-id={notification.id}
                  className={`p-4 transition-colors cursor-pointer ${
                    !notification.read 
                      ? 'bg-gray-50 hover:bg-gray-100' 
                      : 'hover:bg-gray-50'
                  } ${isClicked ? 'bg-blue-50' : ''}`}
                  onClick={() => !notification.read && handleNotificationClick(notification)}
                >
                  <div className="flex gap-3 items-start">
                    {/* Icon Container */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                      getNotificationColor(notification.type)
                    } relative flex-shrink-0`}>
                      {getNotificationIcon(notification.type, notification.read)}
                      
                      {isAutoReadInProgress && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center border border-white">
                          <CircleDashed className="w-2.5 h-2.5 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-3 mb-1">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className={`text-sm font-semibold truncate ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[11px] font-medium rounded-full">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                New
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className={`text-xs whitespace-nowrap ${
                            !notification.read ? 'text-gray-700 font-medium' : 'text-gray-500'
                          }`}>
                            {getTimeAgo(notification.created_at)}
                          </span>
                          
                          {/* Mark as read button for unread notifications */}
                          {!notification.read && !isAutoReadInProgress && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onMarkAsRead(notification.id)
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700 transition-colors px-2 py-1 rounded hover:bg-blue-50 flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <p className={`text-sm mb-2 line-clamp-2 ${
                        !notification.read ? 'text-gray-800' : 'text-gray-600'
                      }`}>
                        {notification.message}
                      </p>
                      
                      {/* Auto-read progress bar */}
                      {isAutoReadInProgress && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">
                              Marking as read in 3 seconds
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCancelAutoRead(notification.id)
                              }}
                              className="text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 rounded hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full animate-progress-bar" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-base font-semibold text-gray-900 mb-2">
              All caught up
            </h4>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              You don't have any notifications at the moment.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
            </span>
            
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsReadWithClear}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors px-3 py-1.5 rounded hover:bg-blue-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <CheckCircle className="w-4 h-4" />
                Mark all as read
              </button>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes progress-bar {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        
        .animate-progress-bar {
          animation: progress-bar 3s linear forwards;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Modern scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        @media screen and (max-width: 1280px) {
          .notifications-dropdown {
            position: fixed;
            top: 20px;
            right: 16px;
            left: 16px;
            width: auto;
            max-height: calc(100vh - 40px);
          }
        }
      `}</style>
    </div>
  )
}