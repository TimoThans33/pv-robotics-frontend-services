<template>
  <article>
    <aside>
      <img
        class="logo" 
        src="/assets/img/prime-vision-logo-no-tag-01.svg"
      >
      <section>
        <h1>Robotic Sorting</h1>
        <!-- Helper text -->
        <!-- <div class="p-mb-3 p-text-center">Please fill in your credentials to continue.</div> -->
        <Message
          v-if="error" 
          severity="error"
        >
          Incorrect username or password.
        </Message>
        <div>
          <InputText
            v-model="username"
            type="text"
            placeholder="Username"
            class="p-mt-3"
            @focus="error = false"
            @keyup.enter="enterUsername"
          />
          <Password
            ref="passref"
            v-model="password"
            :feedback="false"
            placeholder="Password"
            class="p-mb-2"
            @focus="error = false"
            @keyup.enter="authenticate"
          />
          <Button 
            label="Login"
            class="p-button fullwidth"
            @click="authenticate"
          />
          
          <!-- <Button 
            label="Need support?" 
            class="p-button-text font-weight-500"
          /> -->
        </div>
      </section>
    </aside>
    <video
      src="assets/sorting.mp4" 
      autoplay
      loop
      muted
    />
  </article>
</template>


<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { useConfig } from "@/store/config";

import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import Message from "primevue/message";

export default defineComponent({
  components: {
    InputText,
    Password,
    Button,
    Message
  },

  setup(): object {
    const router = useRouter();
    const config = useConfig();

    const username = ref("");
    const password = ref("");

    const error = ref(false);

    const authenticate = async(): Promise<void> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const headers: any = {
        "Access-Control-Allow-Credentials": true
      };

      const response = await fetch(config.state.apis.value.auth, {
        method: "POST",
        body: JSON.stringify({ username: username.value, password: password.value }),
        mode: "cors",
        credentials: "include",
        headers,
      });
      const data = await response.json();

      if (!("access_token" in data)) {
        error.value = true;
        password.value = "";
        return;
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("username", username.value);
      
      router.push("/");
    }

    const passref = ref();
    const enterUsername = () => passref.value.$el.querySelector("input").focus();

    return {
      passref,
      error,
      username,
      password,
      authenticate,
      enterUsername
    };
  },
});
</script>


<style scoped lang="scss">
@import "pv/styles/variables.scss";

article {
  border-top: 5px solid var(--secondary-color);
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: 23vw auto;
  height: 100%;
}

aside {
  padding: $spacer-3;
  display: flex;
  flex-direction: column;
}

img {
  width: 8rem;
}

section {
  padding: $spacer-6;
  margin: auto;
  padding-bottom: 5rem;
  width:100%;
}

h1 {
  font-family: "futura PT";
  font-size: 2.5em;
  margin: 0;
  white-space: nowrap;
}

h1, h2 {
  color: var(--surface-900);
  text-align: center;
}

h2 {
  margin: {
    top: 0;
    bottom: $spacer-4;
  }
  font-size: 0.8em;
  font-weight: normal;
}

section > div {
  display: grid;
  gap: $spacer-2;
}

button {
  margin: auto;
}

.fullwidth {
  width:100%;
}

::v-deep(input), .p-password {
  width: 100%;
}

.font-weight-500 ::v-deep(.p-button-label) {
  font-weight:500;
}

video {
  object-fit: cover;
  height: 100%;
  width: 100%;
}

</style>
