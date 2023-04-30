import axios from "axios";
import { website } from "../config.js";
axios.defaults.withCredentials = true;

export enum Status {
  success = "success",
  failed = "failed",
}

type Error = {
  type: string;
  code: number;
  message: string;
  info: any;
};

export type ApiResponseRecord = {
  resource_type: string;
  shortname: string;
  branch_name?: string;
  subpath: string;
  attributes: Record<string, any>;
};

export type ApiResponse = {
  status: Status;
  error: Error;
  records: Array<ApiResponseRecord>;
};

type Translation = {
  ar: string;
  en: string;
  kd: string;
};

enum UserType {
  web = "web",
  mobile = "mobile",
  bot = "bot",
}

type LoginResponseRecord = ApiResponseRecord & {
  attributes: {
    access_token: string;
    type: UserType;
    displayname: Translation;
  };
};

// type LoginResponse = ApiResponse  & { records : Array<LoginResponseRecord> };

type Permission = {
  allowed_actions: Array<ActionType>;
  conditions: Array<string>;
  restricted_fields: Array<any>;
  allowed_fields_values: Map<string, any>;
};

enum Language {
  arabic = "arabic",
  english = "engligh",
  kurdish = "kurdish",
  french = "french",
  turkish = "turkish",
}

type ProfileResponseRecord = ApiResponseRecord & {
  attributes: {
    email: string;
    displayname: Translation;
    type: string;
    language: Language;
    is_email_verified: boolean;
    is_msisdn_verified: boolean;
    force_password_change: boolean;
    permissions: Record<string, Permission>;
  };
};

export enum ActionType {
  query = "query",
  view = "view",
  update = "update",
  create = "create",
  delete = "delete",
  attach = "attach",
  move = "move",
  progress_ticket = "progress_ticket",
}

export type ProfileResponse = ApiResponse & {
  records: Array<ProfileResponseRecord>;
};

let headers: { [key: string]: string } = {
  "Content-type": "application/json",
  //"Authorization": ""
};

export enum QueryType {
  search = "search",
  subpath = "subpath",
  events = "events",
  history = "history",
  tags = "tags",
  spaces = "spaces",
  counters = "counters",
  reports = "reports",
}

export enum SortyType {
  ascending = "ascending",
  descending = "descending",
}

// enum NotificationPriority {
//   high = "high",
//   medium = "medium",
//   low = "low"
// };

export type QueryRequest = {
  type: QueryType;
  space_name: string;
  subpath: string;
  filter_types?: Array<ResourceType>;
  filter_schema_names?: Array<string>;
  filter_shortnames?: Array<string>;
  search: string;
  from_date?: string;
  to_date?: string;
  sort_by?: string;
  sort_type?: SortyType;
  retrieve_json_payload?: boolean;
  retrieve_attachments?: boolean;
  validate_schema?: boolean;
  jq_filter?: string;
  exact_subpath?: boolean;
  limit?: number;
  offset?: number;
};

export enum RequestType {
  create = "create",
  update = "update",
  replace = "replace",
  delete = "delete",
  move = "move",
}

export enum ResourceAttachementType {
  json = "json",
  comment = "comment",
  media = "media",
  relationship = "relationship",
  alteration = "alteration",
}

export enum ResourceType {
  user = "user",
  group = "group",
  folder = "folder",
  schema = "schema",
  content = "content",
  acl = "acl",
  comment = "comment",
  media = "media",
  locator = "locator",
  relationship = "relationship",
  alteration = "alteration",
  history = "history",
  space = "space",
  branch = "branch",
  permission = "permission",
  role = "role",
  ticket = "ticket",
  json = "json",
  plugin_wrapper = "plugin_wrapper",
  notification = "notification",
}

export enum ContentType {
  text = "text",
  markdown = "markdown",
  json = "json",
  image = "image",
  python = "python",
  pdf = "pdf",
  audio = "audio",
}

type Payload = {
  content_type: ContentType;
  schema_shortname: string;
  checksum: string;
  body: string | Record<string, any>;
  last_validated: string;
  validation_status: "valid" | "invalid";
};

export type ResponseEntry = {
  uuid: string;
  shortname: string;
  subpath: string;
  is_active: boolean;
  displayname: Translation;
  description: Translation;
  tags: Set<string>;
  created_at: string;
  updated_at: string;
  owner_shortname: string;
  payload: Payload;
  attachments?: Object;
};

export type ResponseRecord = {
  resource_type: ResourceType;
  uuid: string;
  shortname: string;
  subpath: string;
  attributes: {
    is_active: boolean;
    displayname: Translation;
    description: Translation;
    tags: Set<string>;
    created_at: string;
    updated_at: string;
    owner_shortname: string;
    payload: Payload;
  };
};

export type ActionResponse = ApiResponse & {
  records: Array<
    ResponseRecord & {
      attachments: {
        media: Array<ResponseRecord>;
        json: Array<ResponseRecord>;
      };
    }
  >;
};

type ActionRequestRecord = {
  resource_type: ResourceType;
  uuid?: string;
  shortname: string;
  subpath: string;
  attributes: Record<string, any>;
  attachments?: Record<ResourceType, Array<any>>;
};

export type ActionRequest = {
  space_name: string;
  request_type: RequestType;
  records: Array<ActionRequestRecord>;
};

export async function login(shortname: string, password: string) {
  const { data } = await axios.post<
    ApiResponse & { records: Array<LoginResponseRecord> }
  >(website.backend + "/user/login", { shortname, password }, { headers });
  //console.log(JSON.stringify(data, null, 2));
  // FIXME settins Authorization is only needed when the code is running on the server
  /*headers.Authorization = "";
  if (data.status == Status.success && data.records.length > 0) {
    headers.Authorization = "Bearer " + data.records[0].attributes.access_token;
  }*/
  return data;
}

export async function logout() {
  const { data } = await axios.post<ApiResponse>(
    website.backend + "/user/logout",
    {},
    { headers }
  );
  return data;
}

export async function get_profile() {
  const { data } = await axios.get<ProfileResponse>(
    website.backend + "/user/profile",
    {
      headers,
    }
  );
  if (data.status === "success") {
    localStorage.setItem(
      "permissions",
      JSON.stringify(data.records[0].attributes.permissions)
    );
  } else {
    await logout();
  }

  return data;
}

export type ApiQueryResponse = ApiResponse & {
  attributes: { total: number; returned: number };
};

export async function query(query: QueryRequest): Promise<ApiQueryResponse> {
  query.subpath = query.subpath.replace(/\/+/g, "/");
  const { data } = await axios.post<ApiQueryResponse>(
    website.backend + "/managed/query",
    query,
    { headers }
  );
  return data;
}

export async function request(action: ActionRequest) {
  try {
    const { data } = await axios.post<ActionResponse>(
      website.backend + "/managed/request",
      action,
      { headers }
    );
    return data;
  } catch (error) {
    return error.response.data;
  }
}

export async function retrieve_entry(
  resource_type: ResourceType,
  space_name: string,
  subpath: string,
  shortname: string,
  retrieve_json_payload: boolean = false,
  retrieve_attachments: boolean = false
): Promise<ResponseEntry> {
  if (!subpath || subpath == "/") subpath = "__root__";
  const { data } = await axios.get<ResponseEntry>(
    website.backend +
      `/managed/entry/${resource_type}/${space_name}/${subpath}/${shortname}?retrieve_json_payload=${retrieve_json_payload}&retrieve_attachments=${retrieve_attachments}`.replace(
        /\/+/g,
        "/"
      ),
    { headers }
  );
  return data;
}

export async function upload_with_payload(
  space_name: string,
  subpath: string,
  resource_type: ResourceType,
  shortname: string,
  payload_file: string
): Promise<ApiResponse> {
  const request_record = new Blob(
    [
      JSON.stringify({
        resource_type,
        subpath,
        shortname,
        attributes: { is_active: true },
      }),
    ],
    { type: "application/json" }
  );

  const form_data = new FormData();
  form_data.append("space_name", space_name);
  form_data.append("request_record", request_record);
  form_data.append("payload_file", payload_file);

  const headers = { "Content-Type": "multipart/form-data" };

  const { data } = await axios.post<ApiResponse>(
    website.backend + "/managed/resource_with_payload",
    form_data,
    { headers }
  );

  return data;
}

export async function get_spaces(): Promise<ApiResponse> {
  return await query({
    type: QueryType.spaces,
    space_name: "management",
    subpath: "/",
    search: "",
    limit: 100,
  });
}

export async function get_children(
  space_name: string,
  subpath: string,
  limit: number = 10,
  offset: number = 0,
  restrict_types: Array<ResourceType> = []
): Promise<ApiResponse> {
  return await query({
    type: QueryType.search,
    space_name: space_name,
    subpath: subpath,
    filter_types: restrict_types,
    exact_subpath: true,
    search: "",
    limit: limit,
    offset: offset,
  });
}

export function get_attachment_url(
  resource_type: ResourceType,
  space_name: string,
  subpath: string,
  parent_shortname: string,
  shortname: string,
  ext: string
) {
  return (
    website.backend +
    `/managed/payload/${resource_type}/${space_name}/${subpath.replace(
      /\/+$/,
      ""
    )}/${parent_shortname}/${shortname}.${ext}`.replaceAll("..", ".")
  );
}

export async function get_space_health(space_name: string) {
  const { data } = await axios.get<
    ApiQueryResponse & { attributes: { folders_report: Object } }
  >(website.backend + `/managed/health/${space_name}`, { headers });
  return data;
}

export async function get_payload(
  resource_type: string,
  space_name: string,
  subpath: string,
  shortname: string,
  ext: string = ".json"
) {
  const { data } = await axios.get<
    ApiQueryResponse & { attributes: { folders_report: Object } }
  >(
    website.backend +
      `/managed/payload/${resource_type}/${space_name}/${subpath}/${shortname}${ext}`,
    { headers }
  );
  return data;
}

export async function progress_ticket(
  space_name: string,
  subpath: string,
  shortname: string,
  action: string,
  resolution: string,
  comment: string
) {
  try {
    const { data } = await axios.put<
      ApiQueryResponse & { attributes: { folders_report: Object } }
    >(
      website.backend +
        `/managed/progress-ticket/${space_name}/${subpath}/${shortname}/${action}`,
      { resolution, comment },
      { headers }
    );
    return data;
  } catch (error) {
    return error.response.data;
  }
}
