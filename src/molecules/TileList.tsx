import * as React from 'react';
import { BitsyDrawable } from '../bitsy-parser';
import Tile from '../atoms/Tile';
import ListItem from '../atoms/ListItem';
import ListItemButton from '../atoms/ListItemButton';
import Filterable from '../atoms/Filterable';
import formatId from '../formatId';

class TileFilterable extends Filterable<BitsyDrawable> { }

type Props = {
  items: Array<BitsyDrawable>,
  fgColour: string,
  bgColour: string,
  handleClick: (tile: BitsyDrawable) => void,
  handleDelete: (thing?: BitsyDrawable) => void,
  selectedId?: number,
};

const TileList = (props: Props) => {
  const sortedTiles = props.items.slice().sort((a, b) => {
    const aName = formatId(a);
    const bName = formatId(b);
    return aName.toLowerCase().localeCompare(bName.toLowerCase());
  });

  return (
    <TileFilterable
      items={sortedTiles}
      getKey={tile => formatId(tile)}
      render={tiles => (
        <div
          style={{
            height: '288px',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          {tiles.map((tile) => (
            <ListItem
              key={tile.id}
              onClick={() => { props.handleClick(tile); }}
              selected={props.selectedId === tile.id}
              style={{ display: 'flex', paddingRight: '10px' }}
            >
              <Tile
                tile={tile}
                scale={4}
                bgColour={props.bgColour}
                fgColour={props.fgColour}
                frame={0}
              />
              <div style={{ marginLeft: '10px', flexGrow: 1 }}>
                {formatId(tile)}
              </div>
              <ListItemButton
                onClick={props.handleDelete.bind(null, tile)}
                title="Delete room"
              >
                <i className="fas fa-trash-alt fa-lg" />
              </ListItemButton>
            </ListItem>
          ))}
        </div>
      )}
    />
  );
};

export default TileList;