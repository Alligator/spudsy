import * as React from 'react';
import { BitsyPalette, BitsyTile, BitsySprite, BitsyItem } from '../bitsy-parser';
import Tabs from '../atoms/Tabs';
import TileList from './TileList';

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

  handleDeleteTile: (tile: BitsyTile) => void,
  handleDeleteSprite: (sprite: BitsySprite) => void,
  handleDeleteItem: (item: BitsyItem) => void,
};

class ThingsEditor extends React.PureComponent<Props, {}> {
  renderTiles() {
    return (
      <TileList
        items={this.props.tiles}
        bgColour={this.props.palette.bg}
        fgColour={this.props.palette.tile}
        selectedId={this.props.selectedTileId}
        handleClick={(item) => { this.props.handleSelectTile(item as BitsyTile); }}
        handleDelete={(item) => { this.props.handleDeleteTile(item as BitsyTile); }}
      />
    );
  }

  renderSprites() {
    return (
      <TileList
        items={this.props.sprites}
        bgColour={this.props.palette.bg}
        fgColour={this.props.palette.sprite}
        selectedId={this.props.selectedSpriteId}
        handleClick={(item) => { this.props.handleSelectSprite(item as BitsySprite); }}
        handleDelete={(item) => { this.props.handleDeleteSprite(item as BitsySprite); }}
      />
    );
  }

  renderItems() {
    return (
      <TileList
        items={this.props.items}
        bgColour={this.props.palette.bg}
        fgColour={this.props.palette.sprite}
        selectedId={this.props.selectedItemId}
        handleClick={(item) => { this.props.handleSelectItem(item as BitsyItem); }}
        handleDelete={(item) => { this.props.handleDeleteItem(item as BitsyItem); }}
      />
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