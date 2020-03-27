import React from 'react';
import './checkbox.scss';

export function Checkbox (props:{
  name?:string;
  value?:string | number;
  checked:boolean;
  onChange?:(() => void);
  disabled?:boolean;
  label?:string;
  style?:React.CSSProperties;
  className?:string;
}) {

  return (
    <label className="input-checkbox-container"
      onClick={props.onChange}>
      { props.label && props.label }
      <input type="radio"
        name={props.name}
        value={props.value}
        checked={props.checked}
        readOnly={true}
        onClick = {(e) => {
          e.stopPropagation();
        }}
      />
      <span className="checkmark"></span>
    </label>
  );
}