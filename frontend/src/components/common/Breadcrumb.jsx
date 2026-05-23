import { Link, useLocation } from 'react-router-dom'
import { FiChevronRight, FiHome } from 'react-icons/fi'

export default function Breadcrumb() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter(x => x)

  const formatName = (str) => {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="breadcrumb">
      <Link to="/">
        <FiHome size={14} />
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
        const isLast = index === pathnames.length - 1

        return (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiChevronRight size={12} />
            {isLast ? (
              <span>{formatName(name)}</span>
            ) : (
              <Link to={routeTo}>{formatName(name)}</Link>
            )}
          </div>
        )
      })}
    </div>
  )
}
