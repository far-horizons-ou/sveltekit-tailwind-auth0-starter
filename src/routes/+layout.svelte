<script lang="ts">
	import '../app.css';
  import { LayoutLoad, LayoutData } from './$types';
  // Load the user's session
  export function load({ cookies }: LayoutLoad) {
    const userCookie = cookies.user;
    if (!userCookie) {
      return {};
    }
  return {
    user: JSON.parse(userCookie) 
  };
}
export let data: LayoutData;
</script>

{#if data.user}
  <p>Welcome back, {data.user.name}!</p>
{:else}
  <p>Not logged in</p>
{/if}

<slot />
