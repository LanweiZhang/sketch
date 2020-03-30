import * as React from 'react';
import './loading.scss';

export function Loading (props:{
  children?:React.ReactNode;
}) {
  return (
    <div className="square">
      <div className="loading">
        <div className="spinner">
          <svg className="circular" viewBox="25 25 50 50">
            <circle className="path" cx="50" cy="50" r="20" fill="none" />
          </svg>
        </div>
      </div>
      {props.children}
    </div>
  );
}