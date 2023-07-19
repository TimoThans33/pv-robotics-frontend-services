<template>
  <nav class="p-shadow-1">
    <div>
      <div class="path">
        <h1 class="futura-book">
          <router-link to="/">
            Autonomous Sorting System
          </router-link>
        </h1>
      </div>
    </div>
    <div class="p-d-flex">

      <router-link 
        to="/" 
        class="link p-ai-center p-d-inline-flex"
      >
        <img 
          class="logo"
          src="../assets/logo-new.png"
        >
      </router-link>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
// import { useRouter } from "vue-router";
// import { useToast } from "primevue/usetoast";


export default defineComponent({
  components: {
    
  },

  props: {
    name: {
      type: String,
      default: "Banner",
    },
  },


});
</script>


<style scoped lang="scss">
@import "~@/pv/styles/variables.scss";

$accent-height: 5px;

nav {
  z-index: 10;
  background: white;
  padding: 0 $spacer-rem;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  height: $nav-height-small;
  justify-content: space-between;
  border: {
    top: $accent-height solid var(--secondary-color);
  }
}

.appnav {
  margin-right: $spacer-3;
  i {
    font-size: 0.4em;
  }
}

.account {
  margin-right: $spacer-3;

  p,
  i {
    margin: 0;
    line-height: 1em;
  }

  i {
    font-size: 0.6em;
    font-weight: normal;
  }
}

.link {
  display: flex;
}

.path {

  padding-bottom: 3px;

  h1:last-of-type a {
    border: none !important;
    
  }

  i {
    font-style: normal;
  }
}

h1 {
  display: inline;
  font-size: 1.4em;
  font-family: "Futura";


  margin: {
    top: 0;
    bottom: 0;
  }

  a {
    color: var(--surface-900);
    text-decoration: none !important;

    &:hover {
      color: var(--primary-color);
    }
  }
}

.logo {
  height:24px;
}

.futura-medium {
  font-family: "Futura PT";
    font-weight: medium;
}

.futura-book {
  font-family: "Futura PT";
    font-weight: 350;
}

.futura-light {
  font-family: "Futura PT";
    font-weight: 100;
}

.futura-heavy {
    font-family: "Futura PT";
    font-weight: 900;
}

</style>
