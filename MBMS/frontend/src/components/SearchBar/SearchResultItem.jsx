import '../../styles/components/search-bar.css';

function highlight(text, query) {
  if (!text) {
    return null;
  }

  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return text;
  }

  const escaped = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = String(text).split(new RegExp(`(${escaped})`, 'gi'));

  return parts.map((part, index) => (
    part.toLowerCase() === normalizedQuery.toLowerCase()
      ? <mark key={`${part}-${index}`} className="sb-highlight">{part}</mark>
      : part
  ));
}

function formatAmount(amount, currency) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      signDisplay: 'never',
    }).format(Number(amount || 0));
  } catch {
    return `${currency || 'USD'} ${Number(amount || 0).toFixed(2)}`;
  }
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function SearchResultItem({ transaction, query, onSelect }) {
  const isExpense = transaction.type === 'expense';
  const category = transaction.categoryName || transaction.category;
  const description = transaction.description || category || 'Transaction';
  const formattedAmount = formatAmount(transaction.amount, transaction.currency);
  const formattedDate = formatDate(transaction.date);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(transaction);
    }
  };

  return (
    <div
      className="sb-result-item"
      role="option"
      tabIndex={0}
      onClick={() => onSelect(transaction)}
      onKeyDown={handleKeyDown}
      aria-label={`${description}, ${formattedAmount}${formattedDate ? `, ${formattedDate}` : ''}`}
    >
      <div className="sb-result-main">
        <span className="sb-description">
          {highlight(description, query)}
        </span>
        {category && (
          <span className="sb-category">
            {highlight(category, query)}
          </span>
        )}
      </div>

      <div className="sb-result-meta">
        <span className={`sb-amount ${isExpense ? 'sb-expense' : 'sb-income'}`}>
          {isExpense ? '-' : '+'}{formattedAmount}
        </span>
        {formattedDate && <span className="sb-date">{formattedDate}</span>}
      </div>
    </div>
  );
}
