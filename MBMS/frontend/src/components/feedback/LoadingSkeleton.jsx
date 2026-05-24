import '../../styles/components/feedback.css';

export function LoadingSkeleton({ rows = 1, className = '' }) {
  return (
    <div className={`skeleton-stack ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div className="skeleton skeleton-block" key={i} />
      ))}
    </div>
  );
}

export function TableRowSkeleton({ rows = 5 }) {
  return (
    <div className="table-skeleton" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div className="skeleton transaction-row-skeleton" key={i} />
      ))}
    </div>
  );
}

export function MetricCardSkeleton({ count = 4 }) {
  return (
    <div className="metrics-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton dashboard-skeleton-card" key={i} />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return <div className="skeleton chart-skeleton" aria-hidden="true" />;
}

export default LoadingSkeleton;
