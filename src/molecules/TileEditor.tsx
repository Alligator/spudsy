import * as React from 'react';
import { BitsyDrawable } from '../bitsy-parser';
import ImageEditor from '../atoms/ImageEditor';
import ListItem from '../atoms/ListItem';
import Tile from '../atoms/Tile';

type Props = {
  size: number,
  tileCount: number,
  bgColour: string,
  fgColour: string,
  tile: BitsyDrawable,
  handleChange: (tile: BitsyDrawable) => void,
  drawGrid?: boolean,
};

type State = {
  changingCellsTo: boolean,
  selectedFrame: number,
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
      selectedFrame: 0,
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
    const cell = this.props.tile.frames[this.state.selectedFrame][x + y * this.props.tileCount];
    this.setState(
      (prevState: State) => ({ changingCellsTo: !cell }),
      () => this.handleEdit(x, y),
    );
  }

  handleEdit(x: number, y: number) {
    const newFrames = this.props.tile.frames.slice();
    newFrames[this.state.selectedFrame][x + y * this.props.tileCount] = this.state.changingCellsTo;
    this.props.handleChange(Object.assign({}, this.props.tile, { frames: newFrames }));
  }

  handleInspect(x: number, y: number) {
    return;
  }

  getCellInfo(x: number, y: number) {
    return null;
  }

  renderCell(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const cell = this.props.tile.frames[this.state.selectedFrame][x + y * this.props.tileCount];
    if (cell) {
      ctx.fillStyle = this.props.fgColour;
      ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
    }
  }

  render() {
    const { tile } = this.props;
    return (
      <div>
        <ImageEditor
          size={this.props.size}
          tileCount={this.props.tileCount}
          bgColour={this.props.bgColour}
          fgColour={this.props.fgColour}
          renderCell={this.renderCell}
          handleEditStart={this.handleEditStart}
          handleEdit={this.handleEdit}
          handleInspect={this.handleInspect}
          getCellInfo={this.getCellInfo}
        />
        <div style={{ marginTop: '10px' }}>
          {this.props.tile.frames.map((frame, idx) => (
            <ListItem
              key={`${tile.id}-${idx}`}
              onClick={() => { this.setState({ selectedFrame: idx }); }}
              selected={this.state.selectedFrame === idx}
            >
              <Tile
                tile={tile}
                scale={4}
                bgColour={this.props.bgColour}
                fgColour={this.props.fgColour}
                frame={idx}
              />
              <div style={{ marginLeft: '10px' }}>{tile.id} - {tile.name}</div>
            </ListItem>
          ))}
        </div>
      </div>
    );
  }
}

export default TileEditor;