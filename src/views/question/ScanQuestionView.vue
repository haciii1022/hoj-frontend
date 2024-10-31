<template>
  <div id="scanQuestionView">
    <a-row :gutter="[24, 24]">
      <a-col :span="12" class="custom-scroll">
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
      <a-col :span="12" style="height: 89vh">
        <div class="custom-scroll2">
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
        </div>
        <a-spin :loading="loading" tip="已提交，正在查询结果...">
          <div class="custom-scroll3">
            <a-divider size:0 />
            <a-button type="primary" style="min-width: 200px" @click="doSubmit"
              >提交代码
            </a-button>
            <div v-if="questionSubmitVO">
              <a-tag
                v-if="questionSubmitVO.judgeInfo?.message == 'Accepted'"
                color="green"
              >
                {{ questionSubmitVO.judgeInfo.message }}
              </a-tag>
              <a-tag
                v-else-if="
                  questionSubmitVO.judgeInfo?.message == 'Compile Error'
                "
                color="orange"
              >
                {{ questionSubmitVO.judgeInfo.message }}
              </a-tag>
              <a-tag
                v-else-if="
                  questionSubmitVO.judgeInfo?.message == 'System Error'
                "
                color="blue"
              >
                {{ questionSubmitVO.judgeInfo.message }}
              </a-tag>
              <a-tag v-else color="red">
                {{ questionSubmitVO.judgeInfo?.message }}
              </a-tag>
              <div
                v-if="
                  questionSubmitVO.judgeInfo?.memory != null &&
                  questionSubmitVO.judgeInfo?.memory < 1024 * 1024
                "
              >
                <!-- 默认KB为单位-->
                {{ questionSubmitVO.judgeInfo!!.memory / 1024 }} KB
              </div>
              <div v-else-if="questionSubmitVO.judgeInfo?.memory != null">
                <!-- 超过了1024KB才会转化成MB-->
                {{
                  (questionSubmitVO.judgeInfo.memory / (1024 * 1024)).toFixed(2)
                }}
                MB
              </div>
              <div v-if="questionSubmitVO.judgeInfo?.time != null">
                {{ questionSubmitVO.judgeInfo.time }} ms
              </div>
            </div>
          </div>
        </a-spin>
      </a-col>
    </a-row>
  </div>
</template>
<script setup lang="ts">
import { ref, withDefaults, defineProps, onMounted } from "vue";
import {
  QuestionControllerService,
  QuestionSubmitAddRequest,
  QuestionSubmitVO,
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
const questionSubmitVO = ref<QuestionSubmitVO>();
const loading = ref(false);
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
  loading.value = true;
  const res = await QuestionControllerService.doQuestionSubmitUsingPost(
    form.value
  );
  if (res.code === 0) {
    const questionSubmitId = res.data as number;
    getSubmitStatus(questionSubmitId);
    // Message.success("提交成功");
  } else {
    loading.value = false;
    Message.error("提交失败， " + res.message);
  }
};

const getSubmitStatus = async (id: number) => {
  try {
    let submitVO;
    do {
      const res = await QuestionControllerService.getQuestionSubmitByIdUsingGet(
        id
      );
      submitVO = res.data as QuestionSubmitVO;
      if (submitVO == null || submitVO.status === 0 || submitVO.status === 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 等待300毫秒
      }
    } while (
      submitVO == null ||
      submitVO.status === 0 ||
      submitVO.status === 1
    );
    loading.value = false;
    questionSubmitVO.value = submitVO;
  } catch (error) {
    console.error("Failed to get submit status:", error);
    // 处理错误，例如重试或者通知用户
  }
};
onMounted(() => {
  loadData();
});
</script>

<style scoped>
body {
  overflow: hidden;
}

#scanQuestionView {
  overflow: hidden; /* 禁用整个页面的滚动条 */
}

.custom-scroll {
  height: 89vh; /* 根据需要调整高度 */
  overflow: auto;
}

.custom-scroll2 {
  height: 70vh; /* 根据需要调整高度 */
  overflow: hidden;
}

.custom-scroll3 {
  height: 20vh; /* 根据需要调整高度 */
  overflow: auto;
}
</style>
