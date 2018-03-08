import * as React from 'react';
import { BitsyTile } from '../bitsy-parser';
import Tile from '../atoms/Tile';
import ListItem from '../atoms/ListItem';
type Props = {
  tiles: Array<BitsyTile>,
  bgColour: string,
  fgColour: string,
  handleClick: (tile: BitsyTile) => void,
  selectedTileId?: number,
};

const TileList = (props: Props) => {
  const sortedTiles = props.tiles.slice().sort((a, b) => {
    const aName = `${a.id} - ${a.name}`;
    const bName = `${b.id} - ${b.name}`;
    return aName.toLowerCase().localeCompare(bName.toLowerCase());
  });

  return (
    <div
      style={{
        height: '410px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {sortedTiles.map((tile: BitsyTile) => (
        <ListItem
          key={tile.id}
          onClick={() => { props.handleClick(tile); }}
          selected={props.selectedTileId === tile.id}
        >
          <Tile
            tile={tile}
            scale={4}
            bgColour={props.bgColour}
            fgColour={props.fgColour}
          />
          <div style={{ marginLeft: '10px' }}>{tile.id} - {tile.name}</div>
        </ListItem>
      ))}
    </div>
  );
};

export default TileList;