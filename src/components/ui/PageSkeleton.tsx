import Skeleton from './Skeleton'

function PageSkeleton() {
  return (
    <div aria-label="Loading page content" className="page-loading container" role="status">
      <div className="page-loading__heading">
        <Skeleton height="0.75rem" width="9rem" />
        <Skeleton height="3.5rem" width="min(22rem, 80vw)" />
        <Skeleton height="1rem" width="min(32rem, 90vw)" />
      </div>
      <div className="page-loading__grid">
        {[0, 1, 2].map((item) => (
          <div className="page-loading__card" key={item}>
            <Skeleton className="page-loading__image" height="auto" />
            <Skeleton height="0.8rem" width="42%" />
            <Skeleton height="1.5rem" width="78%" />
            <Skeleton height="0.8rem" width="58%" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading page content</span>
    </div>
  )
}

export default PageSkeleton
