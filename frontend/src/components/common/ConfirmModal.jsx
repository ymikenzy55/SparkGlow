import { motion, AnimatePresence } from 'framer-motion'
import { FiAlertTriangle, FiX } from 'react-icons/fi'

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning' // 'warning', 'danger', 'info'
}) {
  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const typeStyles = {
    warning: {
      icon: <FiAlertTriangle />,
      iconBg: 'var(--gold)',
      confirmBtn: 'btn-primary'
    },
    danger: {
      icon: <FiAlertTriangle />,
      iconBg: '#e53935',
      confirmBtn: 'btn-danger'
    },
    info: {
      icon: <FiAlertTriangle />,
      iconBg: 'var(--primary)',
      confirmBtn: 'btn-primary'
    }
  }

  const style = typeStyles[type] || typeStyles.warning

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="confirm-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Modal */}
          <motion.div
            className="confirm-modal-container"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-modal-content">
              {/* Close Button */}
              <button className="confirm-modal-close-btn" onClick={onClose}>
                <FiX />
              </button>

              {/* Icon */}
              <div className="confirm-modal-icon" style={{ background: style.iconBg }}>
                {style.icon}
              </div>

              {/* Title */}
              <h3 className="confirm-modal-title">{title}</h3>

              {/* Message */}
              <p className="confirm-modal-message">{message}</p>

              {/* Actions */}
              <div className="confirm-modal-actions">
                <button 
                  className="btn btn-outline" 
                  onClick={onClose}
                >
                  {cancelText}
                </button>
                <button 
                  className={`btn ${style.confirmBtn}`}
                  onClick={handleConfirm}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
