<script lang="ts">
  import { user, userData } from "$lib/firebase";
</script>

{#if $user}
  {#if $userData}
    <slot />
  {:else}
    <p class="text-error">
      You must pick a username before you can view this page.
      <a class="btn btn-primary" href="/login/username">Pick username</a>
    </p>
  {/if}
{:else}
  <p class="text-error">
    You must be signed in to view this page.
    <a class="btn btn-primary" href="/login">Sign in</a>
  </p>
{/if}
