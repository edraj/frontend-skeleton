function consecutivePermissionSearch(
  permissions: any,
  space: string,
  resourceType: string
) {
  const scopedPermissionsKeys = [];
  const permissionsKeys = Object.keys(permissions);
  for (const permissionsKey of permissionsKeys) {
    let regex;
    if (permissionsKey.startsWith("__all_spaces__")) {
      regex = new RegExp(`.*:.*:${resourceType}`, "gi");
    } else {
      regex = new RegExp(`${space}:.*:${resourceType}`, "gi");
    }
    const found: any = permissionsKey.match(regex);
    if (found) {
      scopedPermissionsKeys.push(...found);
    }
  }
  return scopedPermissionsKeys;
}

function editToUpdate(str: string | null): string {
  return str === "edit" ? "update" : String(str);
}

export default function checkAccess(
  action: string,
  space: string,
  subpath: string,
  resourceType: string
): boolean {
  const permissions = JSON.parse(localStorage.getItem("permissions"));

  if (permissions === null || Object.keys(permissions).length === 0) {
    return false;
  }

  const subpaths = subpath.split("/");
  if (subpaths[0] != "/") {
    subpaths.push("/");
  }
  let itemSubpath = subpath;
  const scopedPermissionsKeys = consecutivePermissionSearch(
    permissions,
    space,
    resourceType
  );

  if (subpath.startsWith("/")) {
    itemSubpath = subpath.slice(1);
  }

  for (const _subpath of subpaths) {
    for (const scopedPermissionsKey of scopedPermissionsKeys) {
      let key;
      if (scopedPermissionsKey.includes("__all_subpaths__")) {
        if (scopedPermissionsKey.endsWith(resourceType)) {
          return permissions[scopedPermissionsKey]["allowed_actions"]?.includes(
            editToUpdate(action)
          );
        }
      } else {
        key = `${space}:${_subpath}:${resourceType}`;
      }

      if (scopedPermissionsKey.includes(key)) {
        if (
          permissions[key] &&
          permissions[key]["allowed_actions"]?.includes(editToUpdate(action))
        ) {
          return true;
        }

        break;
      }
      const key2 = `${space}:${itemSubpath}:${resourceType}`;
      if (scopedPermissionsKey.includes(key2)) {
        if (
          permissions[key2] &&
          permissions[key2]["allowed_actions"]?.includes(editToUpdate(action))
        ) {
          return true;
        }
        break;
      }
    }
  }

  return false;
}
