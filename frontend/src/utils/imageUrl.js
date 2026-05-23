// Get the full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/400'
  
  // If it's already a full URL (including Cloudinary), return it
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // If it's a relative path (legacy), prepend the backend URL
  const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
  return `${backendUrl}${imagePath}`
}

// Get multiple image URLs
export const getImageUrls = (images) => {
  if (!images || !Array.isArray(images)) return []
  return images.map(img => getImageUrl(img))
}
