import * as React from 'react';
import { TextArea } from '../atoms/Inputs';

type Props = {
  dialog: Array<string>,
};

class DialogEditor extends React.PureComponent<Props, {}> {
  render() {
    return (
      <TextArea
        style={{
          width: '100%',
          height: '256px',
        }}
        value={this.props.dialog.join('\n')}
      />
    );
  }
}

export default DialogEditor;