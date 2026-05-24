import '../../styles/components/feedback.css';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="feedback-empty">
      {Icon && <Icon size={32} />}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
