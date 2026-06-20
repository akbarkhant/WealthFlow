import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus } from 'lucide-react';
import './ImportButton.css';

/**
 * ImportButton
 * 
 * A button component that navigates to the transaction import page.
 * Perfect for adding to the Transactions page header.
 * 
 * @param {Object} props
 * @param {string} [props.variant='primary'] - Button style: 'primary', 'secondary', 'outline', 'icon'
 * @param {string} [props.size='medium'] - Button size: 'small', 'medium', 'large'
 * @param {boolean} [props.showIcon=true] - Whether to show the upload icon
 * @param {boolean} [props.fullWidth=false] - Make button full width
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.label='Import Transactions'] - Button label text
 * @param {boolean} [props.useUploadIcon=true] - Use upload icon instead of plus
 * 
 * @example
 * // In Transactions page header
 * <ImportButton label="Import Data" />
 * 
 * @example
 * // Compact icon button
 * <ImportButton variant="icon" />
 * 
 * @example
 * // Secondary button
 * <ImportButton variant="secondary" size="large" />
 */
const ImportButton = ({
  variant = 'primary',
  size = 'medium',
  showIcon = true,
  fullWidth = false,
  className = '',
  label = 'Import Transactions',
  useUploadIcon = true,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/transactions/import-page');
  };

  const IconComponent = useUploadIcon ? Upload : Plus;

  return (
    <button
      onClick={handleClick}
      className={`import-button import-button-${variant} import-button-${size} ${
        fullWidth ? 'import-button-full-width' : ''
      } ${className}`}
      type="button"
      aria-label={label}
    >
      {showIcon && <IconComponent size={size === 'small' ? 16 : size === 'large' ? 22 : 18} />}
      <span>{label}</span>
    </button>
  );
};

export default ImportButton;