import * as React from 'react';
import { BitsyPalette, BitsyTile, BitsySprite, BitsyItem } from '../bitsy-parser';
import Tabs from '../atoms/Tabs';
import TileList from './TileList';
import { Button } from '../atoms/Inputs';

type Props = {
  palette: BitsyPalette,
  tiles: Array<BitsyTile>,
  sprites: Array<BitsySprite>,
  items: Array<BitsyItem>,
  selectedTileId?: number,
  selectedSpriteId?: number,
  selectedItemId?: number,

  handleSelectTile: (tile: BitsyTile) => void,
  handleSelectSprite: (sprite: BitsySprite) => void,
  handleSelectItem: (item: BitsyItem) => void,

  handleAddTile: () => void,
  handleAddSprite: () => void,
  handleAddItem: () => void,

  handleDeleteTile: (tile: BitsyTile) => void,
  handleDeleteSprite: (sprite: BitsySprite) => void,
  handleDeleteItem: (item: BitsyItem) => void,
};

class ThingsEditor extends React.PureComponent<Props, {}> {
  renderTiles() {
    return (
      <div>
        <TileList
          items={this.props.tiles}
          keyPrefix="tile"
          bgColour={this.props.palette.bg}
          fgColour={this.props.palette.tile}
          selectedId={this.props.selectedTileId}
          handleClick={(item) => { this.props.handleSelectTile(item as BitsyTile); }}
          handleDelete={(item) => { this.props.handleDeleteTile(item as BitsyTile); }}
        />
        {this.renderAddButton('tile', this.props.handleAddTile)}
      </div>
    );
  }

  renderSprites() {
    return (
      <div>
        <TileList
          items={this.props.sprites}
          keyPrefix="sprite"
          bgColour={this.props.palette.bg}
          fgColour={this.props.palette.sprite}
          selectedId={this.props.selectedSpriteId}
          handleClick={(item) => { this.props.handleSelectSprite(item as BitsySprite); }}
          handleDelete={(item) => { this.props.handleDeleteSprite(item as BitsySprite); }}
        />
        {this.renderAddButton('sprite', this.props.handleAddSprite)}
      </div>
    );
  }

  renderItems() {
    return (
      <div>
        <TileList
          items={this.props.items}
          keyPrefix="item"
          bgColour={this.props.palette.bg}
          fgColour={this.props.palette.sprite}
          selectedId={this.props.selectedItemId}
          handleClick={(item) => { this.props.handleSelectItem(item as BitsyItem); }}
          handleDelete={(item) => { this.props.handleDeleteItem(item as BitsyItem); }}
        />
        {this.renderAddButton('item', this.props.handleAddItem)}
      </div>
    );
  }

  renderAddButton(title: string, onClick: () => void) {
    return (
      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClick}>
          Add new {title}
        </Button>
      </div>
    );
  }

  render() {
    return (
      <Tabs
        tabs={['Tiles', 'Sprites', 'Items']}
        renderTab={(tabName) => {
          switch (tabName) {
            case 'Tiles':
              return this.renderTiles();
            case 'Sprites':
              return this.renderSprites();
            case 'Items':
              return this.renderItems();
            default:
              return null;
          }
        }}
      />
    );
  }
}

export default ThingsEditor;