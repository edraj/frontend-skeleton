import { getLocaleFromNavigator } from "svelte-i18n";
import { login, logout } from "../../dmart";
import { writable, Writable } from "svelte/store";

enum Locale {
  ar="ar",
  en="en",
};

export interface User {
  signedin: boolean;
  locale: Locale;
  shortname?: string;
  localized_displayname?: string;
  account?: Object;
}

const KEY='user';

const fallback_locale = Locale.ar;
function guess_locale() : Locale {
  const _locale = getLocaleFromNavigator();

  if(_locale && _locale in Locale) {
    return Locale[_locale];
  }

  return fallback_locale;
}

let signedout: User = {signedin: false, locale: guess_locale()};
export let user:Writable<User>;

// Load the user information from store, if it exists
const data = localStorage.getItem(KEY) || JSON.stringify(signedout);
user = writable<User>(JSON.parse(data) || signedout);

export async function signin(username: string, password: string) {
  const response = await login(username, password);
  if (response.status == "success" && response.records.length > 0) {
    const account = response.records[0];
    const _user: User = {signedin: true, locale: Locale.ar, shortname: account.shortname, localized_displayname: account.attributes.displayname.en, account: account};
    user.set(_user);
    localStorage.setItem(KEY, JSON.stringify(_user))
  } else {
    user.set(signedout);
    localStorage.setItem(KEY, JSON.stringify(signedout));
  }
}

export async function signout() {
  logout();
  user.set(signedout);
  // localStorage.removeItem(KEY);
  localStorage.setItem(KEY, JSON.stringify(signedout));
  console.log("Completed signout process");
}

export function switchLocale(locale : Locale) {
  user.update(user => {
    user.locale = locale;
    signedout.locale = locale; // remember the locale value in case we logout
    localStorage.setItem(KEY, JSON.stringify(user));
    return user;
  });
}
