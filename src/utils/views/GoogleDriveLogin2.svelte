<script lang="ts">
  import type { CredentialResponse } from "google-one-tap";

  google.accounts.id.initialize({
    client_id:
      "25459583594-pbqv5n3ppt0gurj3m4qgjfp5ujg9mo5p.apps.googleusercontent.com",
    callback: handleCredentialResponse,
  });
  google.accounts.id.prompt();

  function handleCredentialResponse(response: CredentialResponse) {
    if (response.credential) {
      console.log("Signed in as: " + response.credential);
    } else {
      console.log("Sign-in failed.");
    }
  }

  function signOut() {
    // google.accounts.id.revoke();
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
