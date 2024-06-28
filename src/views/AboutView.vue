<template>
  <div class="about">
    <CodeEditor :value="value2" :handle-change="onChange2" />
    <MdEditor :value="value" :handle-change="onChange" />
    <h1>This is an about page</h1>
  </div>
</template>
<script setup lang="ts">
import MdEditor from "@/components/MdEditor.vue";
import { ref } from "vue";
import CodeEditor from "@/components/CodeEditor.vue";

const value = ref();
const value2 = ref();

const onChange = (v: string) => {
  console.log("flkajfklajkf" + v);
  value.value = v;
};
const onChange2 = (v: string) => {
  console.log("flkajfklajkf" + v);
  value2.value = v;
};
</script>
<style>
.bytemd-toolbar-icon.bytemd-tippy.bytemd-tippy-right:last-child {
  display: none;
}
</style>
