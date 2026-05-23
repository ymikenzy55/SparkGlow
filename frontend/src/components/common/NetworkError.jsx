import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
export default function NetworkError() {
  const [offline, setOffline] = useState(!navigator.onLine)
  const [showBack, setShowBack] = useState(false)
  useEffect(() => {
    const goOff = () => setOffline(true)
    const goOn = () => { setOffline(false); setShowBack(true); setTimeout(() => setShowBack(false), 3000) }
    window.addEventListener('offline', goOff)
    window.addEventListener('online', goOn)
    return () => { window.removeEventListener('offline', goOff); window.removeEventListener('online', goOn) }
  }, [])
  return (
    <AnimatePresence>
      {(offline || showBack) && (
        <motion.div
          className={`network-banner${showBack && !offline ? ' network-back' : ''}`}
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        >
          {offline ? '⚠ No internet connection' : '✓ Connection restored'}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
