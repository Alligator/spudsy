import * as React from 'react';
import * as colours from '../colours';
import * as tinycolor from 'tinycolor2';
import RadioGroup from './RadioGroup';
import { uniqueId } from 'lodash';

type Props = {
  size: number,
  tileCount: number,
  bgColour: string,
  fgColour: string,
  // handleChange: (tile: BitsyTile) => void,
  renderCell: (ctx: CanvasRenderingContext2D, x: number, y: number) => void,
  handleEdit: (x: number, y: number) => void,
  handleEditStart: (x: number, y: number) => void,
  handleEditEnd: (x: number, y: number) => void,
  handleInspect: (x: number, y: number) => void,
  getCellInfo: (x: number, y: number) => React.ReactNode,
  drawGrid?: boolean,
  canInspect?: boolean,
};

type State = {
  // changingCellsTo: boolean,
  mouseDown: boolean,
  mouseCellX: number,
  mouseCellY: number,
  mode: 'edit' | 'inspect',
};

class ImageEditor extends React.Component<Props, State> {
  public static defaultProps: Partial<Props> = {
    drawGrid: true,
    canInspect: false,
  };

  canvas: HTMLCanvasElement;

  constructor(props: Props) {
    super(props);

    this.state = {
      // changingCellsTo: false,
      mouseDown: false,
      mouseCellX: 0,
      mouseCellY: 0,
      mode: 'edit',
    };

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleModeChange = this.handleModeChange.bind(this);
  }

  shouldComponentUpdate() {
    return true;
  }

  componentDidMount() {
    this.updateCanvas();
  }

  componentDidUpdate() {
    this.updateCanvas();
  }

  get cellSize() {
    return this.props.size / this.props.tileCount;
  }

  updateCanvas() {
    const { tileCount } = this.props;

    if (!this.canvas) {
      return;
    }

    const ctx = this.canvas.getContext('2d');

    if (ctx == null) {
      return;
    }

    ctx.fillStyle = this.props.bgColour;
    ctx.fillRect(0, 0, this.props.size, this.props.size);

    // render the cells
    for (let x = 0; x < tileCount; x++) {
      for (let y = 0; y < tileCount; y++) {
        this.props.renderCell(ctx, x, y);
      }
    }

    // draw the grid lines
    ctx.save();
    ctx.translate(0.5, 0.5);
    if (this.props.drawGrid) {
      const color = tinycolor(this.props.bgColour).isDark() ? 255 : 1;
      ctx.strokeStyle = `rgba(${color}, ${color}, ${color}, 0.3)`;
      ctx.beginPath();
      for (let x = 1; x < tileCount; x++) {
        ctx.moveTo(x * this.cellSize, 0);
        ctx.lineTo(x * this.cellSize, this.props.size);
      }

      for (let y = 1; y < tileCount; y++) {
        ctx.moveTo(0, y * this.cellSize);
        ctx.lineTo(this.props.size, y * this.cellSize);
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  getCellCoordsFromPixel(x: number, y: number) {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return { x: cellX, y: cellY };
  }

  getCellCoordsFromMouseEvt(evt: React.MouseEvent<HTMLDivElement>) {
    const rect = this.canvas.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;
    return this.getCellCoordsFromPixel(x, y);
  }

  handleMouseDown(evt: React.MouseEvent<HTMLDivElement>) {
    const coords = this.getCellCoordsFromMouseEvt(evt);

    if (this.state.mode === 'inspect') {
      this.props.handleInspect(coords.x, coords.y);
      return;
    }

    this.props.handleEditStart(coords.x, coords.y);
    this.setState({
      mouseCellX: coords.x,
      mouseCellY: coords.y,
      mouseDown: true,
    });
  }

  handleMouseUp(evt: React.MouseEvent<HTMLDivElement>) {
    const coords = this.getCellCoordsFromMouseEvt(evt);

    this.props.handleEditEnd(coords.x, coords.y);
    this.setState({
      mouseDown: false,
    });
  }

  handleMouseMove(evt: React.MouseEvent<HTMLDivElement>) {
    const coords = this.getCellCoordsFromMouseEvt(evt);

    if (
      this.state.mouseDown &&
      this.state.mode === 'edit' &&
      (coords.x !== this.state.mouseCellX || coords.y !== this.state.mouseCellY)
    ) {
      this.props.handleEdit(coords.x, coords.y);
    }

    this.setState({
      mouseCellX: coords.x,
      mouseCellY: coords.y,
    });
  }

  handleModeChange(value: 'edit' | 'inspect') {
    this.setState({ mode: value });
  }

  render() {
    return (
      <div
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
        style={{
          width: this.props.size,
          cursor: this.state.mode === 'edit' ? 'pointer' : 'help'
        }}
      >
        <canvas
          ref={(ref: HTMLCanvasElement) => { this.canvas = ref; }}
          width={this.props.size}
          height={this.props.size}
        />
        {this.props.canInspect &&
          <RadioGroup
            items={[
              {
                label: 'Edit',
                value: 'edit',
              },
              {
                label: 'Inspect',
                value: 'inspect',
              },
            ]}
            name={uniqueId()}
            defaultSelected="edit"
            handleSelect={this.handleModeChange}
          />}
        {this.props.canInspect &&
          <div style={{ margin: '10px 0' }}>
            <span style={{ color: colours.fg1 }}>Tile Info: </span>
            {this.props.getCellInfo(this.state.mouseCellX, this.state.mouseCellY)}
          </div>}
      </div>
    );
  }
}

export default ImageEditor;
