<script lang="ts">
  function signOut() {
    const token = gapi.client.getToken();
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token);
      gapi.client.setToken("");
    }
  }
</script>

<button on:click={signOut}>Sign Out</button>

<div
  id="g_id_onload"
  data-client_id="asdf"
  data-context="signin"
  data-callback="qwer"
  data-auto_select="true"
  data-close_on_tap_outside="false"
  data-itp_support="true"
></div>
