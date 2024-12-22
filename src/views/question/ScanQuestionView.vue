<template>
  <div id="scanQuestionView">
    <a-row :gutter="[24, 24]">
      <a-col :span="12" class="custom-scroll">
        <a-tabs default-active-key="question">
          <a-tab-pane key="question" title="题目">
            <a-card v-if="question">
              <template #title>
                {{ question.title }}
                <span v-if="question.isHidden" style="color: lightgray"
                  >(隐藏)</span
                >
              </template>
              <div>
                <a-descriptions
                  title="判题条件"
                  :column="{ xs: 1, md: 2, lg: 3 }"
                >
                  <a-descriptions-item label="时间限制">
                    {{ question.judgeConfig?.timeLimit ?? 0 }} ms
                  </a-descriptions-item>
                  <a-descriptions-item label="空间限制">
                    {{ question.judgeConfig?.memoryLimit ?? 0 }} KiB
                  </a-descriptions-item>
                  <!--                  <a-descriptions-item label="堆栈限制">-->
                  <!--                    {{ question.judgeConfig?.stackLimit ?? 0 }}-->
                  <!--                  </a-descriptions-item>-->
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
              <a-select
                v-model="form.language"
                placeholder="选择编程语言"
                style="border: 1px solid var(--color-neutral-4); width: 150px"
              >
                <a-option label="Java" value="java" />
                <a-option label="Python" value="python" />
                <a-option label="C++" value="cpp" />
                <a-option label="Golang" value="go" />
              </a-select>
            </a-form-item>
            <a-tooltip
              content="请通过代码实现题目，过程中的输入输出处理方式请参考题目输入输出描述"
              position="tr"
            >
              <a-form-item label="ACM模式" />
            </a-tooltip>
          </a-form>
          <CodeEditor
            :value="form.code"
            :language="form.language"
            :handle-change="changeCode"
          />
        </div>
        <div class="custom-scroll3">
          <a-spin
            :loading="loading"
            tip="已提交，正在查询结果..."
            style="width: 49vw"
          >
            <a-space />
            <div style="display: flex">
              <a-button
                type="primary"
                style="min-width: 150px; margin: 0 20px"
                @click="doSubmit"
                >提交代码
              </a-button>
              <div v-if="questionSubmitVO?.length > 0">
                <a-table
                  :columns="columns"
                  :data="questionSubmitVO"
                  :pagination="false"
                  row-height="50"
                >
                  <template #info="{ record }">
                    <a-tag
                      v-if="record.judgeInfoList[0]?.message == 'Accepted'"
                      color="green"
                    >
                      {{ record.judgeInfoList[0].message }}
                    </a-tag>
                    <a-tag
                      v-else-if="
                        record.judgeInfoList[0]?.message == 'Compile Error'
                      "
                      color="orange"
                    >
                      {{ record.judgeInfoList[0].message }}
                    </a-tag>
                    <a-tag
                      v-else-if="
                        record.judgeInfoList[0]?.message == 'System Error'
                      "
                      color="blue"
                    >
                      {{ record.judgeInfoList[0].message }}
                    </a-tag>
                    <a-tag v-else color="red">
                      {{ record.judgeInfoList[0]?.message }}
                    </a-tag>
                  </template>
                  <template #memory="{ record }">
                    <div
                      v-if="
                        record.judgeInfoList[0]?.memory != null &&
                        record.judgeInfoList[0]?.memory < 1024
                      "
                    >
                      <!-- 默认KB为单位-->
                      {{ record.judgeInfoList[0]!!.memory }} KB
                    </div>
                    <div v-else-if="record.judgeInfoList[0]?.memory != null">
                      <!-- 超过了1024KB才会转化成MB-->
                      {{ (record.judgeInfoList[0].memory / 1024).toFixed(2) }}
                      MB
                    </div>
                  </template>
                  <template #time="{ record }">
                    <div v-if="record.judgeInfoList[0]?.time != null">
                      {{ record.judgeInfoList[0].time }} ms
                    </div>
                  </template>
                </a-table>
              </div>
            </div>
          </a-spin>
        </div>
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

interface Props {
  id: number;
}

const props = withDefaults(defineProps<Props>(), {
  id: () => 0,
});
const question = ref<QuestionVO>();
const questionSubmitVO = ref<Array<QuestionSubmitVO>>([]);
const loading = ref(false);
const form = ref<QuestionSubmitAddRequest>({
  language: "java",
  code: "",
  questionId: props.id,
});
const columns = [
  {
    title: "判题结果",
    slotName: "info",
  },
  {
    title: "消耗时间",
    slotName: "time",
  },
  {
    title: "消耗内存",
    slotName: "memory",
  },
];
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
      const res =
        await QuestionControllerService.getQuestionSubmitVoByIdUsingGet(id);
      submitVO = res.data as QuestionSubmitVO;
      if (submitVO == null || submitVO.status === 0 || submitVO.status === 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 等待300毫秒
      }
    } while (
      submitVO == null ||
      submitVO.status === 0 ||
      submitVO.status === 1
    );
    loading.value = false;
    questionSubmitVO.value[0] = submitVO;
    console.log("submitVO: " + JSON.stringify(submitVO));
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
  height: 15vh; /* 根据需要调整高度 */
  width: 100%;
  display: flex;
  overflow: auto;
}
</style>
