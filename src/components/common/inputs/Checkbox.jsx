// src/components/common/inputs/Checkbox.jsx
function Checkbox({ label, checked, onChange, name, className = '' }) {
  return (
    <label className={`inline-flex items-center gap-2 text-sm ${className}`}>
      <input type="checkbox" name={name} checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}
export default Checkbox;