import { BitsyThing } from './bitsy-parser';

const formatId = (thing: BitsyThing): string => {
  if (typeof thing.name === 'string' && thing.name.length > 0) {
    return `${thing.id} - ${thing.name}`;
  }
  return thing.id.toString();
};

export default formatId;