<script context="module" lang="ts">
  import { writable } from "svelte/store";
  export const isLoading = writable(false);
</script>

<script>
  let isVisible = false;
  isLoading.subscribe((v) => {
    isVisible = v;
  });
</script>

{#if isVisible}
  <div class="progress-bar-wrapper fixed-top">
    <div class="progress-bar">
      <div class="progress-bar-value" />
    </div>
  </div>
{/if}

<style>
  .progress-bar-wrapper {
    z-index: 1050;
    width: 100%;
    margin: auto;
  }

  .progress-bar {
    height: 4px;
    background-color: rgba(5, 114, 206, 0.2);
    width: 100%;
    overflow: hidden;
  }

  .progress-bar-value {
    width: 100%;
    height: 100%;
    background-color: rgb(5, 114, 206);
    animation: indeterminateAnimation 1s infinite linear;
    transform-origin: 0% 50%;
  }

  @keyframes indeterminateAnimation {
    0% {
      transform: translateX(0) scaleX(0);
    }
    40% {
      transform: translateX(0) scaleX(0.4);
    }
    100% {
      transform: translateX(100%) scaleX(0.5);
    }
  }
</style>
