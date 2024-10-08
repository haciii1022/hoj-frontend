<template>
  <div id="scanQuestionView">
    <a-row :gutter="[24, 24]">
      <a-col :md="12" :xs="24">
        <a-tabs default-active-key="question">
          <a-tab-pane key="question" title="题目">
            <a-card v-if="question" :title="question.title">
              <div>
                <a-descriptions
                  title="判题条件"
                  :column="{ xs: 1, md: 2, lg: 3 }"
                >
                  <a-descriptions-item label="时间限制">
                    {{ question.judgeConfig?.timeLimit ?? 0 }} MS
                  </a-descriptions-item>
                  <a-descriptions-item label="空间限制">
                    {{ question.judgeConfig?.memoryLimit ?? 0 }} KB
                  </a-descriptions-item>
                  <a-descriptions-item label="堆栈限制">
                    {{ question.judgeConfig?.stackLimit ?? 0 }}
                  </a-descriptions-item>
                </a-descriptions>
              </div>
              <MdViewer :value="question.content ?? ''" />
              <template #extra>
                <a-space warp>
                  <a-tag v-for="(tag, index) of question.tags" :key="index"
                    >{{ tag }}
                  </a-tag>
                </a-space>
              </template>
            </a-card>
          </a-tab-pane>
          <a-tab-pane key="comment" title="评论区">
            Content of Tab Panel 2
          </a-tab-pane>
          <a-tab-pane key="answer">
            <template #title>题解</template>
            Content of Tab Panel 3
          </a-tab-pane>
        </a-tabs>
      </a-col>
      <a-col :md="12" :xs="24">
        <a-form :model="form" layout="inline">
          <a-form-item
            field="language"
            label="编程语言"
            style="min-width: 240px"
          >
            <a-select v-model="form.language" placeholder="选择编程语言">
              <a-option>java</a-option>
              <a-option>python</a-option>
              <a-option>cpp</a-option>
              <a-option>go</a-option>
            </a-select>
          </a-form-item>
        </a-form>
        <CodeEditor
          :value="form.code"
          :language="form.language"
          :handle-change="changeCode"
        />
        <a-divider size:0 />
        <a-button type="primary" style="min-width: 200px" @click="doSubmit"
          >提交代码
        </a-button>
      </a-col>
    </a-row>
  </div>
</template>
<script setup lang="ts">
import { ref, withDefaults, defineProps, onMounted } from "vue";
import {
  QuestionControllerService,
  QuestionSubmitAddRequest,
  QuestionVO,
} from "../../../generated";
import { Message } from "@arco-design/web-vue";
import CodeEditor from "@/components/CodeEditor.vue";
import MdViewer from "@/components/MdViewer.vue";
import MdEditor from "@/components/MdEditor.vue";

interface Props {
  id: number;
}

const props = withDefaults(defineProps<Props>(), {
  id: () => 0,
});
const question = ref<QuestionVO>();
const form = ref<QuestionSubmitAddRequest>({
  language: "java",
  code: "",
  questionId: props.id,
});
const loadData = async () => {
  const res = await QuestionControllerService.getQuestionVoByIdUsingGet(
    props.id
  );
  if (res.code === 0) {
    question.value = res.data;
  } else {
    Message.error("加载失败， " + res.message);
  }
};
const changeCode = (v: string) => {
  form.value.code = v;
};
/**
 * 提交代码
 */
const doSubmit = async () => {
  const res = await QuestionControllerService.doQuestionSubmitUsingPost(
    form.value
  );
  if (res.code === 0) {
    Message.error("成功， " + res.data);
  } else {
    Message.error("加载失败， " + res.message);
  }
};
onMounted(() => {
  loadData();
});
</script>

<style scoped>
#scanQuestionView {
  width: auto;
}
</style>
