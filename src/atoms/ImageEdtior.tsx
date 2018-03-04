import * as React from 'react';
import * as tinycolor from 'tinycolor2';
import * as colours from '../colours';
import { BitsyTile } from '../bitsy-parser';

type Props = {
  width: number,
  height: number,
  tileCount: number,
  bgColour: string,
  fgColour: string,
  tile: BitsyTile,
  handleChange: (tile: BitsyTile) => void,
  drawGrid?: boolean,
};

type State = {
  cells: Array<boolean>,
  changingCellsTo: boolean,
  mouseDown: boolean,
  mouseCellX: number,
  mouseCellY: number,
};

class ImageEditor extends React.PureComponent<Props, State> {
  public static defaultProps: Partial<Props> = {
    drawGrid: true,
  };

  canvas: HTMLCanvasElement;
  cellWidth: number;
  cellHeight: number;

  constructor(props: Props) {
    super(props);

    this.state = {
      cells: props.tile.pixels.slice(),
      changingCellsTo: false,
      mouseDown: false,
      mouseCellX: 0,
      mouseCellY: 0,
    };

    this.cellWidth = props.width / props.tileCount;
    this.cellHeight = props.height / props.tileCount;

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.tile.id !== this.props.tile.id) {
      this.setState({ cells: nextProps.tile.pixels.slice() });
    }
  }

  componentDidMount() {
    this.updateCanvas();
  }

  componentDidUpdate() {
    this.updateCanvas();
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

    ctx.save();

    // clear the canvas
    ctx.fillStyle = this.props.bgColour;
    ctx.fillRect(0, 0, this.props.width, this.props.height);

    // draw the filled cells
    ctx.fillStyle = this.props.fgColour;
    for (let x = 0; x < tileCount; x++) {
      for (let y = 0; y < tileCount; y++) {
        const cell = this.state.cells[x + y * tileCount];
        if (cell) {
          ctx.fillRect(x * this.cellWidth, y * this.cellHeight, this.cellWidth, this.cellHeight);
        }
      }
    }

    ctx.translate(0.5, 0.5);

    // draw the grid lines
    ctx.strokeStyle = tinycolor(this.props.bgColour).isDark() ? colours.bg2 : colours.fg2;
    ctx.beginPath();
    for (let x = 1; x < tileCount; x++) {
      ctx.moveTo(x * this.cellWidth, 0);
      ctx.lineTo(x * this.cellWidth, this.props.width);
    }

    for (let y = 1; y < tileCount; y++) {
      ctx.moveTo(0, y * this.cellHeight);
      ctx.lineTo(this.props.height, y * this.cellHeight);
    }
    ctx.stroke();

    ctx.restore();
  }

  getCellCoordsFromPixel(x: number, y: number) {
    const cellX = Math.floor(x / this.cellWidth);
    const cellY = Math.floor(y / this.cellHeight);
    return { x: cellX, y: cellY };
  }

  getCellCoordsFromMouseEvt(evt: React.MouseEvent<HTMLDivElement>) {
    const rect = this.canvas.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const y = evt.clientY - rect.top;
    return this.getCellCoordsFromPixel(x, y);
  }

  cellUpdater(cellX: number, cellY: number) {
    return (prevState: State, props: Props) => {
      const newCells = prevState.cells.slice();
      newCells[cellX + cellY * props.tileCount] = prevState.changingCellsTo;

      return { cells: newCells };
    };
  }

  handleMouseDown(evt: React.MouseEvent<HTMLDivElement>) {
    const coords = this.getCellCoordsFromMouseEvt(evt);
    const cell = this.state.cells[coords.x + coords.y * this.props.tileCount];

    this.setState((prevState: State) => ({ mouseDown: true, changingCellsTo: !cell }));
    this.setState(this.cellUpdater(coords.x, coords.y));
  }

  handleMouseUp(evt: React.MouseEvent<HTMLDivElement>) {
    this.setState((prevState: State) => ({ mouseDown: false }));
    this.props.handleChange(Object.assign({}, this.props.tile, { pixels: this.state.cells.slice() }));
  }

  handleMouseMove(evt: React.MouseEvent<HTMLDivElement>) {
    const coords = this.getCellCoordsFromMouseEvt(evt);
    if (coords.x !== this.state.mouseCellX || coords.y !== this.state.mouseCellY) {
      if (this.state.mouseDown) {
        this.setState(this.cellUpdater(coords.x, coords.y));
      }
      this.setState((prevState: State) => ({ mouseCellX: coords.x, mouseCellY: coords.y }));
    }
  }

  render() {
    return (
      <div
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
        style={{ border: '1px solid black', width: this.props.width, height: this.props.height }}
      >
        <canvas
          ref={(ref: HTMLCanvasElement) => { this.canvas = ref; }}
          width={this.props.width}
          height={this.props.height}
        />
      </div>
    );
  }
}

export default ImageEditor;