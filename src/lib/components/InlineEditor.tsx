import React, { useState, useEffect, useRef } from 'react';
import { InlineEditorProps } from '../types';
import { safeParse } from '../utils';

const InlineEditor: React.FC<InlineEditorProps> = ({
  value,
  onSave,
  onCancel,
  onError,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize input value
    if (typeof value === 'string') {
      setInputValue(`"${value}"`);
    } else {
      setInputValue(JSON.stringify(value));
    }
    
    // Focus input
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [value]);

  const handleSave = () => {
    const parseResult = safeParse(inputValue);
    
    if (parseResult.success) {
      setError(null);
      onSave(parseResult.data);
    } else {
      const errorMsg = parseResult.error || 'Invalid value';
      setError(errorMsg);
      if (onError) {
        onError(new Error(errorMsg));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = () => {
    // Auto-save on blur if no error
    if (!error) {
      handleSave();
    }
  };

  return (
    <div className="jv-inline-editor">
      <input
        ref={inputRef}
        type="text"
        className={`jv-inline-input ${error ? 'jv-error' : ''}`}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        title={error || undefined}
      />
      
      <div className="jv-inline-actions">
        <button
          type="button"
          className="jv-action-button jv-save-button"
          onClick={handleSave}
          title="Save (Enter)"
        >
          ✓
        </button>
        
        <button
          type="button"
          className="jv-action-button jv-cancel-button"
          onClick={onCancel}
          title="Cancel (Escape)"
        >
          ✕
        </button>
      </div>
      
      {error && (
        <div className="jv-error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default InlineEditor;