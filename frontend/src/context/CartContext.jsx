import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CartContext = createContext(null)
const CART_KEY = 'sg_cart'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || [] } catch { return [] }
  })
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((product, quantity = 1) => {
    setItems(prev => {
      const exists = prev.find(i => i._id === product._id)
      if (exists) return prev.map(i => i._id === product._id ? { ...i, qty: i.qty + quantity } : i)
      return [...prev, { ...product, qty: quantity }]
    })
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((id) => setItems(prev => prev.filter(i => i._id !== id)), [])

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return
    setItems(prev => prev.map(i => i._id === id ? { ...i, qty } : i))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  const count = items.reduce((s, i) => s + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, count, total, isOpen, setIsOpen, addItem, removeItem, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
