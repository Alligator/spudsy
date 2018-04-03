import * as React from 'react';
import * as colours from '../colours';

type Props = {
  htmlFor?: string,
  label: React.ReactNode,
  style?: React.CSSProperties,
};

const FormGroup: React.StatelessComponent<Props> = (props) => {
  return (
    <div
      style={Object.assign(
        {},
        {
          display: 'flex',
          flexDirection: 'column',
          margin: '10px 10px 10px 0',
        },
        props.style,
      )}
    >
      <label
        htmlFor={props.htmlFor}
        style={{ fontSize: '8pt', color: colours.fg1 }}
      >
        {props.label}
      </label>
      {props.children}
    </div>
  );
};

export default FormGroup;