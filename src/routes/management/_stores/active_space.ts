import { writable } from "svelte/store";

// const default_space = {
//   space_name: "management",
//   backend: "https://api.dmart.cc",
//   languages: { en: "English" },
//   description: "Example of using the platform",
//   displayname: "Demo space",
//   shortname: "management",
// };

const default_space : string = "personal";
let local : string = localStorage.getItem("active_space") || default_space;

const { subscribe, set } = writable(local);

function customSet(spacename: string) {
  set(spacename);
  localStorage.setItem("active_space", spacename);
  local = spacename;
}

export const active_space = {
  set: (value : string) => customSet(value),
  subscribe,
  reset: () => customSet(default_space),
};
