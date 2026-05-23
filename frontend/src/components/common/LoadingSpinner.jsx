export default function LoadingSpinner({ fullPage }) {
  return (
    <div className={`spinner-wrap${fullPage ? ' full-page' : ''}`}>
      <div className="spinner" />
    </div>
  )
}
