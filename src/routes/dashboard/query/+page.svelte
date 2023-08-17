<script lang="ts">
  import AuthCheck from "$lib/components/AuthCheck.svelte";
  import { user, storage, db, userData } from "$lib/firebase";
  import { doc, getDoc } from "firebase/firestore";

  export let form;
  async function bruh() {
    const data = await getDoc(doc(db, "users", $user!.uid));
  }
</script>

<h2 class="card-title">Pick a topic to query your docs for</h2>

<AuthCheck>
  <form class="max-w-screen-md w-full" method="POST">
    <div class="form-control w-full max-w-xs my-10 mx-auto text-center">
      <input name="queryTopic" type="text" class="input" />
      <select name="file">
        {#if $userData}
          {#each $userData.files as file}
            <option value={file.name}>{file.name}</option>
          {/each}
        {/if}
      </select>
      <button class="btn btn-info" type="submit">Submit</button>
      {#if $user}
        <input type="hidden" name="uid" value={$user.uid} />
      {/if}
    </div>
  </form>
</AuthCheck>

{#if form}
  <div class="card">
    <h2 class="card-title">Results</h2>
    <div class="card-body">
      <p>{form.message}</p>
    </div>
  </div>
{/if}
