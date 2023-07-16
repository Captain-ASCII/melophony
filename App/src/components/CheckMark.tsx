import React from 'react'

import Icon from './Icon';

export default function CheckMark({ isChecked, result } : { isChecked: boolean; result: boolean }): JSX.Element {
  if (isChecked) {
    return (
      <svg className={`checkmarkBase checkmark ${result ? "success" : "error"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
        <circle className={`checkmarkCircle ${result ? "success" : "error"}`} cx="26" cy="26" r="25" fill="none"/>
        <path className="checkmarkCheck" fill="none" d={result ? "M14.1 27.2l7.1 7.2 16.7-16.8" : "M 17 17 l 17 17 M 17 34 l 17 -17"} />
      </svg>
    )
  }
  return <div className="checkmarkBase notChecked" ><Icon icon="stopwatch" size="2x" /></div>
}

