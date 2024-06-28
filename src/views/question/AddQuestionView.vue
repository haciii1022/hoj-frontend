<template>
  <div id="addQuestionView">
    <h2>新增题目</h2>
    <a-form :model="form" @submit="handleSubmit" label-align="left">
      <a-form-item field="answer" tooltip="请输入答案" label="答案">
        <MdEditor />
      </a-form-item>
      <a-form-item field="content" tooltip="请输入内容" label="内容">
        <MdEditor />
      </a-form-item>
      <a-form-item field="tags" tooltip="请输入标签" label="标签">
        <a-input-tag v-model="form.tags" placeholder="请输入标签" allow-clear />
      </a-form-item>
      <a-form-item field="title" tooltip="请输入标题" label="标题">
        <a-input v-model="form.title" placeholder="请输入标题" allow-clear />
      </a-form-item>
      <a-form-item label="判题配置" :content-flex="false" :merge-props="false">
        <a-space direction="vertical" style="min-width: 640px">
          <a-form-item field="judgeConfig.timeLimit" label="时间限制">
            <a-input-number
              v-model="form.judgeConfig.timeLimit"
              placeholder="请输入时间限制"
              mode="button"
              :min="0"
              size="large"
            />
          </a-form-item>
          <a-form-item field="judgeConfig.memoryLimit" label="内存限制">
            <a-input-number
              v-model="form.judgeConfig.memoryLimit"
              placeholder="请输内存限制"
              mode="button"
              :min="0"
              size="large"
            />
          </a-form-item>
          <a-form-item field="judgeConfig.stackLimit" label="堆栈限制">
            <a-input-number
              v-model="form.judgeConfig.stackLimit"
              placeholder="请输堆栈限制"
              mode="button"
              :min="0"
              size="large"
            />
          </a-form-item>
        </a-space>
      </a-form-item>

      <a-space direction="vertical">
        <a-form-item
          v-for="(judgeCaseItem, index) of form.judgeCase"
          :label="`测试用例 ${index}`"
          :key="index"
          style="min-width: 480px"
        >
          <a-form-item
            :field="`form.judgeCase[${index}].input`"
            :label="`输入用例 ${index}`"
            :key="index"
            style="min-width: 480px"
          >
            <a-input
              v-model="judgeCaseItem.input"
              placeholder="请输入测试输入用例"
            />
          </a-form-item>
          <a-form-item
            :field="`form.judgeCase[${index}].output`"
            :label="`输出用例 ${index}`"
            :key="index"
            style="min-width: 480px"
          >
            <a-input
              v-model="judgeCaseItem.output"
              placeholder="请输入测试输出用例"
            />
          </a-form-item>
          <a-button
            status="danger"
            @click="handleDelete(index)"
            :style="{ marginLeft: '10px' }"
            >删除
          </a-button>
        </a-form-item>
        <div style="margin-top: 26px">
          <a-button type="outline" status="success" @click="handleAdd"
            >新增测试用例
          </a-button>
        </div>
      </a-space>
      <a-form-item>
        <div style="margin-top: 26px">
          <a-button type="primary">提交</a-button>
        </div>
      </a-form-item>
    </a-form>
    {{ form }}
  </div>
</template>
<script setup lang="ts">
import { reactive } from "vue";
import MdEditor from "@/components/MdEditor.vue";

const form = reactive({
  answer: "dp",
  content: "A+B",
  judgeCase: [
    {
      input: "1 3",
      output: "2 4",
    },
  ],
  judgeConfig: {
    memoryLimit: 1000,
    stackLimit: 1000,
    timeLimit: 1000,
  },
  tags: ["暴力", "DP"],
  title: "A+B+C",
});
const handleSubmit = () => {
  console.log(form);
};
const handleAdd = () => {
  form.judgeCase.push({
    input: "",
    output: "",
  });
};
const handleDelete = (index: number) => {
  form.judgeCase.splice(index, 1);
};
</script>

<style scoped>
#addQuestionView {
  padding-left: 100px;
}
</style>
