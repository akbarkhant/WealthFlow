import React, { useState } from 'react';
import { useGoals } from '../hooks/useGoals'; // Import custom hook
import { MilestoneNode } from '../components/GoalPage/MilestoneNode';
import '../styles/pages/GoalsPage.css';
import DashboardLayout from '../layouts/DashboardLayout'

export default function GoalsPage() {
  // All state variables and API configurations are abstracted down to 1 line!
  const { goals, loading, error, fuelGoal } = useGoals();
  
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openFuelDrawer = (goal) => {
    setSelectedGoal(goal);
    setIsDrawerOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const result = await fuelGoal(selectedGoal.id, contributionAmount);
    if (result.success) {
      setIsDrawerOpen(false);
    }
  };

  if (loading) return <div className="goals-loader">Loading Tracking Engine Matrix...</div>;

  return (
    <DashboardLayout>
      <div className="goals-page-container">
        <div className="goals-header">
          <h1>Savings Milestones</h1>
          {error && <div className="error-banner">{error}</div>}
        </div>

      <div className="milestone-track">
        {goals.map((goal) => (
          <MilestoneNode key={goal.id} goal={goal} onFuelClick={openFuelDrawer} />
        ))}
      </div>
      
      {/* ... keeping your drawer rendering markup identical to before ... */}
    </div>
    </DashboardLayout>
  );
}