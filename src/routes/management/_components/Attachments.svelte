<script lang="ts">
  import Icon from "../../_components/Icon.svelte";
  import {
    upload_with_payload,
    request, 
    get_attachment_url,
    RequestType,
    ResourceType
  } from "../../../dmart";
  import { showToast, Level } from "../../../utils/toast";
  import Media from "./Media.svelte";
    import { debug } from "svelte/internal";

  export let attachments;
  export let space_name : string;
  export let subpath : string;
  export let parent_shortname : string;
  // exp rt let forceRefresh;
  let shortname = "auto";

  // function getFileExtension(filename : string) {
  //   var ext = /^.+\.([^.]+)$/.exec(filename);
  //   return ext == null ? "" : ext[1];
  // }


  function getFileExtension(filename) {
    var ext = /^.+\.([^.]+)$/.exec(filename);
    return ext == null ? "" : ext[1];
  }





  async function handleDelete(item) {
    if ( confirm(`Are you sure want to delete ${item.title} attachment`) === false) {
      return;
    }

    const arr = subpath.split("/");
    arr[0] = "";
    const _subpath = arr.join("/");

    const request_dict = {
      space_name,
      request_type: RequestType.delete,
      records: [
        {
          resource_type: ResourceType.media,
          shortname: item.title,
          subpath: `${_subpath}/${parent_shortname}`,
          attributes: {},
        },
      ],
    };
    const response = await request(request_dict);
    if (response.status === "success") {
       showToast(Level.info);
      attachments = attachments.filter((e) => e.title !== item.title);
    } else {
      showToast(Level.warn);
    }
  }

  let payloadFile;
  async function upload() {
    const response = await upload_with_payload(
      space_name,
      subpath + "/" + parent_shortname,
      ResourceType.media,
      shortname,
      payloadFile[0]
    );

    if (response.status === "success") {
      // FIXME await forceRefresh();
    } else {
      showToast(Level.warn)
    }
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="d-flex justify-content-end mx-2 flex-row"
  style="cursor: pointer;"
  on:click={() => {}}
>
  <Icon name="plus-square"  />
</div>

<div class="row mx-auto w-75">
    <div class="d-flex justify-content-center">
      {#each attachments as attachment}
        <hr />
        <div class="row mb-2">
          <a class="col-11" style="font-size: 1.25em;" href={get_attachment_url(attachment.resource_type, space_name, subpath, parent_shortname, attachment.shortname, getFileExtension(attachment.attributes?.payload?.body))}> {attachment.shortname}</a>
          <div class="col-1 d-flex justify-content-between">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
              class="mx-1"
              style="cursor: pointer;"
              on:click={async () => await handleDelete(attachment)}
            >
              <Icon name="trash" color="red" />
            </div>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
              class="mx-1"
              style="cursor: pointer;"
              on:click={() => {/*FIXME*/}}
            >
              <Icon name="eyeglasses" color="grey" />
            </div>
          </div>
        </div>
        <Media content_type={attachment.attributes?.payload?.content_type} displayname={attachment.shortname} url={get_attachment_url(attachment.resource_type, space_name, subpath, parent_shortname, attachment.shortname, getFileExtension(attachment.attributes?.payload?.body))} />
        <hr />
      {/each}
    </div>
</div>
