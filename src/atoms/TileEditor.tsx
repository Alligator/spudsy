import * as React from 'react';
import { BitsyTile } from '../bitsy-parser';
import ImageEditor from './ImageEditor';

type Props = {
  size: number,
  tileCount: number,
  bgColour: string,
  fgColour: string,
  tile: BitsyTile,
  handleChange: (tile: BitsyTile) => void,
  drawGrid?: boolean,
};

type State = {
  changingCellsTo: boolean,
};

class TileEditor extends React.PureComponent<Props, State> {
  public static defaultProps: Partial<Props> = {
    drawGrid: true,
  };

  canvas: HTMLCanvasElement;

  constructor(props: Props) {
    super(props);

    this.state = {
      changingCellsTo: false,
    };

    this.handleEditStart = this.handleEditStart.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleInspect = this.handleInspect.bind(this);
    this.getCellInfo = this.getCellInfo.bind(this);
    this.renderCell = this.renderCell.bind(this);
  }

  get cellSize() {
    return this.props.size / this.props.tileCount;
  }

  handleEditStart(x: number, y: number) {
    const cell = this.props.tile.pixels[x + y * this.props.tileCount];
    this.setState(
      (prevState: State) => ({ changingCellsTo: !cell }),
      () => this.handleEdit(x, y),
    );
  }

  handleEdit(x: number, y: number) {
    const newPixels = this.props.tile.pixels.slice();
    newPixels[x + y * this.props.tileCount] = this.state.changingCellsTo;
    this.props.handleChange(Object.assign({}, this.props.tile, { pixels: newPixels }));
  }

  handleInspect(x: number, y: number) {
    return;
  }

  getCellInfo(x: number, y: number) {
    return null;
  }

  renderCell(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const cell = this.props.tile.pixels[x + y * this.props.tileCount];
    if (cell) {
      ctx.fillStyle = this.props.fgColour;
      ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
    }
  }

  render() {
    return (
      <ImageEditor
        size={this.props.size}
        id={this.props.tile.id}
        tileCount={this.props.tileCount}
        bgColour={this.props.bgColour}
        fgColour={this.props.fgColour}
        renderCell={this.renderCell}
        handleEditStart={this.handleEditStart}
        handleEdit={this.handleEdit}
        handleInspect={this.handleInspect}
        getCellInfo={this.getCellInfo}
      />
    );
  }
}

export default TileEditor;