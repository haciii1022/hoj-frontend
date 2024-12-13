<template>
  <div class="home">
    <img
      alt="Vue logo"
      src="../assets/index-show.jpg"
      :style="{ width: '85vw', height: '85vh', objectFit: 'cover' }"
    />
    <!--    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />-->
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import HelloWorld from "@/components/HelloWorld.vue"; // @ is an alias to /src

export default defineComponent({
  name: "HomeView",
  components: {
    // eslint-disable-next-line vue/no-unused-components
    HelloWorld,
  },
});
</script>
