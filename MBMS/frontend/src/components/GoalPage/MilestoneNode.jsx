import React from 'react';
import '../../styles/pages/GoalsPage.css';

export function MilestoneNode({ goal, onFuelClick }) {
  // Extract database schema states returned from controller calculations pipeline
  const isCompleted = goal.status === 'COMPLETED';
  const isOverdrive = goal.allow_overflow && Number(goal.progress) > 100;
  
  let skinClass = 'status-active';
  if (isCompleted) skinClass = 'status-completed';
  if (isOverdrive) skinClass = 'status-overdrive';

  // Dynamic SVG Circular Progress math expressions
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const visualPercentage = Math.min(Number(goal.progress || 0), 100);
  const strokeDashoffset = circumference - (visualPercentage / 100) * circumference;

  return (
    <div className={`milestone-node ${skinClass}`}>
      <div className="node-avatar-sphere" onClick={() => onFuelClick(goal)}>
        <span>{goal.icon || '🎯'}</span>

        <svg className="progress-svg">
          <circle className="progress-circle-bg" cx="49" cy="49" r={radius} />
          <circle 
            className="progress-circle-bar" 
            cx="49" 
            cy="49" 
            r={radius} 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        {isCompleted && <div className="achievement-badge">✨</div>}
        <div className="percentage-bubble">{Math.round(goal.progress || 0)}%</div>
      </div>

      <div className="node-card-wrapper">
        <h3>{goal.name}</h3>
        <p>
          {/* Format live database floats back to aesthetic presentation text blocks */}
          {Number(goal.current_amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})} / {Number(goal.target_amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})} {goal.currency}
        </p>
        {!isCompleted && (
          <button className="fuel-action-btn" onClick={() => onFuelClick(goal)}>
            Fuel Node
          </button>
        )}
      </div>
    </div>
  );
}