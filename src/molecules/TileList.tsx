import * as React from 'react';
import { BitsyDrawable } from '../bitsy-parser';
import Tile from '../atoms/Tile';
import ListItem from '../atoms/ListItem';
import Filterable from '../atoms/Filterable';

class TileFilterable extends Filterable<BitsyDrawable> {}

type Props = {
  items: Array<BitsyDrawable>,
  fgColour: string,
  bgColour: string,
  handleClick: (tile: BitsyDrawable) => void,
  selectedId?: number,
};

const TileList = (props: Props) => {
  const sortedTiles = props.items.slice().sort((a, b) => {
    const aName = `${a.id} - ${a.name}`;
    const bName = `${b.id} - ${b.name}`;
    return aName.toLowerCase().localeCompare(bName.toLowerCase());
  });

  return (
    <div
      style={{
        height: '288px',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      <TileFilterable
        items={sortedTiles}
        getKey={tile => `${tile.id} - ${tile.name}`}
        render={tiles => tiles.map((tile) => (
          <ListItem
            key={tile.id}
            onClick={() => { props.handleClick(tile); }}
            selected={props.selectedId === tile.id}
          >
            <Tile
              tile={tile}
              scale={4}
              bgColour={props.bgColour}
              fgColour={props.fgColour}
              frame={0}
            />
            <div style={{ marginLeft: '10px' }}>{tile.id} - {tile.name}</div>
          </ListItem>
        ))}
      />
    </div>
  );
};

export default TileList;