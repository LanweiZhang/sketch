import React from 'react';
import './checkbox.scss';
// it's actually radio box..
// based on https://www.w3schools.com/howto/howto_css_custom_checkbox.asp
type checkboxType = 'radio' | 'checkbox';
export function Checkbox (props:{
  name?:string;
  value?:string | number;
  checked:boolean;
  onChange?:(() => void);
  disabled?:boolean;
  label?:string;
  type?:checkboxType;
  style?:React.CSSProperties;
  className?:string;
}) {
  const type = props.type ? props.type : 'checkbox';
  return (
    <label
      className={`input-checkbox-container${
        props.className ? ' ' + props.className : ''}`}
      onClick={props.onChange}>
      { props.label && props.label }
      <input type={type}
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