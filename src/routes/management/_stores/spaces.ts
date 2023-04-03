import { query as dmart_query, QueryType } from "../../../dmart";
import { signout } from "../../_stores/user";
import { writable } from "svelte/store";

const data = JSON.parse(localStorage.getItem("spaces") || "{}");
const { subscribe, set } = writable(data);

function customSet(spaces: Object) {
  set(spaces);
  localStorage.setItem("spaces", JSON.stringify(spaces));
}

const spaces = {
  set: (value: Object) => customSet(value),
  subscribe,
  reset: () => customSet([]),
};

/**
 *
 * @param spaceName: str
 * @returns list of subpaths of the given space name
 */
const getSpaceSubpaths = async (spaceName : string) => {
  const response = await dmart_query({
    type: QueryType.subpath,
    space_name: spaceName,
    subpath: "/",
    filter_types:["folder"],
    exact_subpath: true,
    retrieve_json_payload: true,
    retrieve_attachments: true,
    search: "",
  });
  if (response.status === "success") {
    response.records.map((record) => {
      if (`/${record.shortname}` !== record.subpath)
        record.subpath += record.shortname;
      return record;
    });
    return response.records;
  } else {
    return null;
  }
};

/**
 * fetch from dmart the spaces.
 * set 'space_managment.spaces' as array (str) of spaces
 */
export const getSpaces = async () => {
  const response = await dmart_query({
    type: QueryType.spaces,
    space_name: "personal",
    subpath: "/",
    retrieve_json_payload: true,
    filter_schema_names: [],
    filter_types: [],
    filter_shortnames: [],
    search: "",
    limit: 100,
    offset: 0,
  });
  if (response.status === "success") {
    const _spaces = await Promise.all(
      response.records.map(async (e) => {
        return {
          type: "folder",
          ...e,
          subpaths: await getSpaceSubpaths(e.shortname),
        };
      })
    );
    spaces.set({
      children: _spaces,
      icon: "house-door",
      name: "dashboard",
    });
    return _spaces;
  } else {
    if (response.error.type === "jwtauth") {
      await signout();
    }
    return false;
  }
};

export default spaces;
