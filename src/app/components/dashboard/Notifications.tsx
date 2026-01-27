// app/components/Notifications.tsx
'use client'

import { useRef, useEffect, useState } from 'react'

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
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    // If more than a week, show date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getNotificationIcon = (type: string) => {
    const typeLower = type.toLowerCase()
    switch(typeLower) {
      case 'info':
        return '💡'
      case 'warning':
        return '⚠️'
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'quote_created':
      case 'quote_expiring':
      case 'quote_expired':
        return '📋'
      case 'payment_success':
      case 'payment_failed':
        return '💰'
      case 'policy_issued':
      case 'policy_active':
      case 'policy_expiring':
      case 'policy_expired':
        return '📄'
      case 'document_approved':
      case 'document_rejected':
      case 'document_required':
      case 'document_missing':
        return '📎'
      case 'claim_submitted':
      case 'claim_approved':
      case 'claim_rejected':
      case 'claim_requires_info':
      case 'claim_paid':
        return '🛡️'
      case 'system_alert':
        return '🔔'
      default:
        return '📢'
    }
  }

  const getNotificationColor = (type: string) => {
    const typeLower = type.toLowerCase()
    switch(typeLower) {
      case 'info':
      case 'quote_created':
      case 'claim_submitted':
        return 'bg-blue-50 border-blue-100'
      case 'warning':
      case 'quote_expiring':
      case 'policy_expiring':
      case 'document_missing':
        return 'bg-amber-50 border-amber-100'
      case 'success':
      case 'quote_approved':
      case 'payment_success':
      case 'policy_issued':
      case 'document_approved':
      case 'claim_approved':
      case 'claim_paid':
        return 'bg-emerald-50 border-emerald-100'
      case 'error':
      case 'quote_expired':
      case 'policy_expired':
      case 'document_rejected':
      case 'claim_rejected':
      case 'payment_failed':
        return 'bg-red-50 border-red-100'
      default:
        return 'bg-gray-50 border-gray-100'
    }
  }

  const handleDelete = async (id: string) => {
    if (!onDelete) return
    
    setDeletingId(id)
    try {
      await onDelete(id)
    } catch (error) {
      console.error('Error deleting notification:', error)
    } finally {
      setDeletingId(null)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed xl:absolute top-20 xl:top-16 right-4 xl:right-0 w-[calc(100vw-32px)] xl:w-[420px] max-h-[500px] bg-white rounded-xl shadow-xl border border-gray-200 z-[9999] overflow-hidden notifications-dropdown"
      ref={notificationsRef}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#fafcff]">
        <div>
          <h3 className="font-montserrat text-lg font-medium text-black">Notifications</h3>
          <p className="font-inter text-xs text-gray-500">
            {isLoading ? 'Loading...' : unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="font-inter text-sm text-[#2563eb] hover:text-[#1d4ed8] transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="overflow-y-auto max-h-[400px]">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="font-inter text-sm text-gray-500">Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-inter text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        <span className="font-inter text-xs text-gray-500 whitespace-nowrap ml-2">
                          {getTimeAgo(notification.created_at)}
                        </span>
                        {onDelete && (
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                            disabled={deletingId === notification.id}
                            aria-label="Delete notification"
                          >
                            {deletingId === notification.id ? (
                              <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="font-inter text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      {!notification.read && (
                        <div className="inline-flex items-center gap-1">
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          <span className="font-inter text-xs text-blue-600">Unread</span>
                        </div>
                      )}
                      {!notification.read && (
                        <button
                          onClick={() => onMarkAsRead(notification.id)}
                          className="font-inter text-xs text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔔</span>
            </div>
            <h4 className="font-inter text-base font-medium text-gray-900 mb-1">
              No notifications yet
            </h4>
            <p className="font-inter text-sm text-gray-500">
              We'll notify you when something arrives
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-white">
        {notifications.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="font-inter text-xs text-gray-500">
              Showing {notifications.length} notifications
            </span>
            {onDelete && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all notifications?')) {
                    notifications.forEach(n => onDelete(n.id))
                  }
                }}
                className="font-inter text-xs text-gray-500 hover:text-red-500 transition-colors"
                disabled={notifications.length === 0}
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .notifications-dropdown {
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          animation: slideDown 0.2s ease-out;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @media screen and (max-width: 1280px) {
          .notifications-dropdown {
            position: fixed;
            top: 80px;
            right: 16px;
            left: 16px;
            width: auto;
          }
        }
      `}</style>
    </div>
  )
}