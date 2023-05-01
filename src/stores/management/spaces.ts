import { writable, get } from 'svelte/store';
import {
  get_spaces,
  ApiResponseRecord,
} from '@/dmart';

let loaded = await get_spaces();
let spaces = writable<Array<ApiResponseRecord>>(loaded.records);

export default {
  subscribe: spaces.subscribe,
  update: (shortname: string, value: ApiResponseRecord) => {
    spaces.update(items => {
      const index = items.findIndex(element => shortname == element.shortname);
      if(index) {
        items[index] = value;
        return items;
      }
    });
  },
  refresh: async () : Promise<Array<ApiResponseRecord>> => {
    loaded = await get_spaces();
    spaces.set(loaded.records);
    return get(spaces)
  },
  get: (shortname: string) : ApiResponseRecord => {
    return get(spaces).find( e => shortname == e.shortname);
  }
} 
