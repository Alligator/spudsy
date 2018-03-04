import * as React from 'react';
import { SketchPicker, ColorResult, RGBColor } from 'react-color';

type Props = {
  colour: string,
  handleChange: (colour: RGBColor) => void,
};

const ColourPicker = (props: Props) => {
  return (
    <SketchPicker
      width="236px"
      color={props.colour}
      onChangeComplete={(colour: ColorResult) => { props.handleChange(colour.rgb); }}
      presetColors={[ // pico 8 colours
        '#000000', '#1D2B53', '#7E2553', '#008751', '#AB5236',
        '#5F574F', '#C2C3C7', '#FFF1E8', '#FF004D', '#FFA300',
        '#FFEC27', '#00E436', '#29ADFF', '#83769C', '#FF77A8',
        '#FFCCAA',
      ]}
      disableAlpha={true}
    />
  );
};

export default ColourPicker;