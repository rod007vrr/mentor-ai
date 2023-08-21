<script lang="ts">
  import { goto } from "$app/navigation";
  import { auth, user } from "$lib/firebase";
  import { redirect } from "@sveltejs/kit";
  import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const user = await signInWithPopup(auth, provider);
    console.log(user);
    goto("/login/username");
  }
</script>

<h2>Sign In</h2>

{#if $user}
  <h2 class="card-title">Welcome, {$user.displayName}</h2>
  <p class="text-center text-success">
    You are logged in, please proceed to pick your username
  </p>
  <button class="btn btn-danger" on:click={() => signOut(auth)}>Sign out</button
  >
{:else}
  <button class="btn btn-primary" on:click={signInWithGoogle}
    >Sign in with Google</button
  >
{/if}
