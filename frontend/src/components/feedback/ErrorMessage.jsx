import { AlertCircle } from 'lucide-react';
import '../../styles/components/feedback.css';

export default function ErrorMessage({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="feedback-error" role="alert">
      <AlertCircle size={28} />
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {onRetry && (
        <button className="btn btn-primary" type="button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
