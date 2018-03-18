import * as React from 'react';
import * as colours from '../colours';

type Props = {
  htmlFor?: string,
  label: React.ReactNode,
};

const FormGroup: React.StatelessComponent<Props> = (props) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginRight: '10px' }}>
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