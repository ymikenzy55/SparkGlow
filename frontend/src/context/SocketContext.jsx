import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    newSocket.on('connect', () => {
      // Socket connected
      
      // Join appropriate room based on user role
      if (user) {
        if (user.role === 'admin') {
          newSocket.emit('join-admin')
        } else {
          newSocket.emit('join-user', user._id)
        }
      }
    })

    newSocket.on('connect_error', (error) => {
      // Socket connection error (will retry automatically)
    })

    newSocket.on('disconnect', (reason) => {
      // Socket disconnected
    })

    newSocket.on('reconnect', (attemptNumber) => {
      // Socket reconnected
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [user])

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be used within SocketProvider')
  return ctx
}
