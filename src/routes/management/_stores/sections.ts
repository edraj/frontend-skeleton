import initial_sections from "./sections.json";
import { writable } from "svelte/store";

let local_sections = initial_sections;

const { subscribe, set } = writable(local_sections);

const sections = {
  set: (value) => set(value),
  subscribe,
  reset: () => set(initial_sections),
};

export default sections;
