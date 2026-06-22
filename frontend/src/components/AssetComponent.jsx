import React, { useState } from 'react';
import { SUPPORTED_CURRENCIES } from '../hooks/useCurrency'; // Adjust path if needed

export default function CreateAssetModal({ isOpen, onClose, onAssetCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'currency', // Default type selection
    quantity: '1',
    currency: 'USD',
    purchase_price: '',
    purchase_date: new Date().toISOString().split('T')[0],
    institution_or_location: '',
    note: '',
    exchange_rate_used: '1.0'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState(null);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (e) => {
    const nextType = e.target.value;
    setFormData((prev) => ({
      ...prev,
      type: nextType,
      // Default properties to 1 automatically to protect backend parsing metrics
      quantity: nextType === 'property' ? '1' : prev.quantity
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors(null);

    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        onAssetCreated(result.data);
        onClose();
      } else {
        // Formats Zod errors array if present, otherwise maps plain string text messages
        if (result.errors) {
          setFormErrors(result.errors.map(err => `${err.path.join('. ')}: ${err.message}`));
        } else {
          setFormErrors([result.error || 'Failed to register asset.']);
        }
      }
    } catch (err) {
      setFormErrors(['A network error occurred while submitting form state.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Visibility triggers based on asset category rules
  const showQuantityInput = formData.type !== 'property';
  const showLocationInput = formData.type === 'property' || formData.type === 'valuable';

  return (
    <div className="wf-modal-overlay" onClick={onClose}>
      <div className="wf-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="wf-modal-header">
          <h2 className="wf-modal-title">Track New Asset</h2>
          <button className="wf-modal-close-btn" onClick={onClose}>&times;</button>
        </div>

        {formErrors && (
          <div className="wf-modal-error-summary">
            {formErrors.map((msg, idx) => <p key={idx} className="wf-error-text">{msg}</p>)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="wf-modal-form">
          <div className="wf-form-row">
            <div className="wf-form-group">
              <label className="wf-form-label">Asset Classification Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Cold Wallet Ledger or Real Estate Rental"
                required
                className="wf-form-input"
              />
            </div>

            <div className="wf-form-group">
              <label className="wf-form-label">Asset Category Type</label>
              <select name="type" value={formData.type} onChange={handleTypeChange} className="wf-form-select">
                <option value="currency">Fiat Currency Cash</option>
                <option value="digital">Digital Crypto Asset</option>
                <option value="property">Real Estate Property</option>
                <option value="valuable">Physical Valuable (Gold/Jewelry)</option>
              </select>
            </div>
          </div>

          <div className="wf-form-row">
            <div className="wf-form-group">
              <label className="wf-form-label">Primary Valuation Currency</label>
              <select name="currency" value={formData.currency} onChange={handleInputChange} className="wf-form-select">
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} — {c.label}</option>
                ))}
              </select>
            </div>

            {showQuantityInput ? (
              <div className="wf-form-group">
                <label className="wf-form-label">Quantity / Balance Held</label>
                <input
                  type="number"
                  name="quantity"
                  step="any"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  className="wf-form-input"
                />
              </div>
            ) : (
              <div className="wf-form-group">
                <label className="wf-form-label">Quantity / Balance Fixed</label>
                <input type="text" value="1.00 (Fixed Value Asset)" disabled className="wf-form-input disabled" />
              </div>
            )}
          </div>

          <div className="wf-form-row">
            <div className="wf-form-group">
              <label className="wf-form-label">Total Purchase Cost / Initial Worth</label>
              <input
                type="number"
                name="purchase_price"
                step="any"
                value={formData.purchase_price}
                onChange={handleInputChange}
                required
                placeholder="0.00"
                className="wf-form-input"
              />
            </div>

            <div className="wf-form-group">
              <label className="wf-form-label">Acquisition Date</label>
              <input
                type="date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleInputChange}
                required
                className="wf-form-input"
              />
            </div>
          </div>

          {showLocationInput && (
            <div className="wf-form-group">
              <label className="wf-form-label">Institution Custodian or Physical Address Location</label>
              <input
                type="text"
                name="institution_or_location"
                value={formData.institution_or_location}
                onChange={handleInputChange}
                placeholder="e.g. Binance Exchange, Bank Storage, or City Zip Code"
                className="wf-form-input"
              />
            </div>
          )}

          <div className="wf-form-group">
            <label className="wf-form-label">Portfolio Internal Log Notes (Optional)</label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleInputChange}
              rows="2"
              placeholder="Add contextual details regarding transaction logs..."
              className="wf-form-textarea"
            />
          </div>

          <div className="wf-modal-actions">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="wf-btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="wf-btn-primary">
              {isSubmitting ? 'Registering...' : 'Confirm Asset Creation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}