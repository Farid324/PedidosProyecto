// src/components/common/inputs/Select.jsx
function Select({
  label,
  value,
  onChange,
  name,
  options = [], // [{value, label}]
  placeholder = 'Seleccione...',
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
export default Select;
