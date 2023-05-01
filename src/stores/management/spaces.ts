import { writable, get } from 'svelte/store';
import {
  get_spaces,
  ApiResponse,
  ApiResponseRecord,
  // Status,
} from '@/dmart';

let loaded: ApiResponse; //  = {records: [], status: Status.failed};

let spaces = writable<Array<ApiResponseRecord>>();

get_spaces().then( (data) => {
  loaded = data
  spaces.set(loaded.records);
} );

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
    const loaded_spaces = get(spaces);
    if (loaded_spaces) return loaded_spaces.find( e => shortname == e.shortname);
  }
} 
