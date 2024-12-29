<template>
  <div id="questionSubmitDetailView">
    <div class="main-content">
      <a-card class="main-content1">
        <template #title>
          <div style="padding-top: 15px; font-size: 20px">
            <div
              v-if="form?.score == 100"
              style="color: #17c617; margin-bottom: 10px"
            >
              <icon-check />
              {{ form?.score }} {{ mainInfo?.message }}
            </div>
            <div v-else style="color: red; margin-bottom: 10px">
              <icon-close />
              {{ form?.score }} {{ mainInfo?.message }}
            </div>
          </div>
        </template>
        <div v-if="mainInfo?.detail" class="main-detail">
          {{ mainInfo.detail }}
        </div>
        <a-table
          v-if="subInfoList && subInfoList.length > 0"
          :columns="columns"
          :data="subInfoList"
          :bordered="{
            wrapper: false,
            cell: false,
            headerCell: false,
            bodyCell: false,
          }"
          :pagination="false"
          :stripe="true"
          :hoverable="false"
        >
          <template #message="{ record }">
            <div style="display: flex">
              <div
                v-if="record.message == 'Accepted'"
                style="color: #17c617; margin-right: 10px"
              >
                <icon-check />
                {{ record.message }}
              </div>
              <div v-else style="color: red; margin-right: 10px">
                <icon-close />
                {{ record.message }}
              </div>
              <div>
                {{ record.detail }}
              </div>
            </div>
          </template>
          <template #score="{ record }">
            <div v-if="record.message == 'Accepted'" style="color: #17c617">
              {{ record.score }}
            </div>
            <div v-else style="color: red">
              {{ record.score }}
            </div>
          </template>
          <template #time="{ record }">
            <span v-if="record.time != null"> {{ record.time }} ms </span>
          </template>
          <template #memory="{ record }">
            <div v-if="record.memory != null && record.memory < 1024">
              <!-- 默认KB为单位-->
              {{ record.memory }} KiB
            </div>
            <div v-else-if="record.memory != null">
              <!-- 超过了1024KB才会转化成MB-->
              {{ (record.memory / 1024).toFixed(2) }} MiB
            </div>
          </template>
        </a-table>
      </a-card>
      <div class="main-content2">
        <div class="code-title">代码</div>
        <div style="margin: 0 15px">
          <CodeViewer :code="form?.code" :language="form?.language" />
        </div>
      </div>
    </div>
    <div class="side-content">
      <div class="side-title">信息</div>
      <div>
        <a-row class="custom-row">
          <a-col flex="100px" class="custom-col">
            <div>递交者</div>
          </a-col>
          <a-col flex="auto">
            <div class="custom-col" style="display: flex">
              <a-avatar shape="circle">
                <template v-if="form.userVO?.userAvatar"
                  ><img alt="avatar" :src="form.userVO.userAvatar"
                /></template>
                <template v-else>
                  <img alt="avatar" src="@/assets/default_avatar.svg" />
                </template>
              </a-avatar>
              <div style="margin-left: 8px">{{ form.userVO?.userName }}</div>
            </div>
          </a-col>
        </a-row>
        <a-row class="custom-row">
          <a-col flex="100px" class="custom-col">
            <div>题目</div>
          </a-col>
          <a-col flex="auto" class="custom-col">
            <a :href="`/question/list/${form.questionId}`" class="custom-link">
              <span style="font-weight: 600">P{{ form.questionId }}</span>
              &nbsp;&nbsp;{{ form.questionVO?.title }}
            </a>
          </a-col>
        </a-row>
        <a-row class="custom-row">
          <a-col flex="100px" class="custom-col">
            <div>语言</div>
          </a-col>
          <a-col flex="auto" class="custom-col">
            <div>{{ formatLanguage(form?.language || "") }}</div>
          </a-col>
        </a-row>
        <a-row class="custom-row">
          <a-col flex="100px" class="custom-col">
            <div>代码长度</div>
          </a-col>
          <a-col flex="auto" class="custom-col">
            <div>{{ codeByteLength }} Bytes</div>
          </a-col>
        </a-row>
        <a-row class="custom-row">
          <a-col flex="100px" class="custom-col">
            <div>递交时间</div>
          </a-col>
          <a-col flex="auto" class="custom-col">
            <div>
              {{ moment(form.createTime).format("YYYY-MM-DD HH:mm:ss") }}
            </div>
          </a-col>
        </a-row>
        <a-row class="custom-row">
          <a-col flex="100px" class="custom-col">
            <div>评测时间</div>
          </a-col>
          <a-col flex="auto" class="custom-col">
            <div>
              {{ moment(form.updateTime).format("YYYY-MM-DD HH:mm:ss") }}
            </div>
          </a-col>
        </a-row>
        <a-row class="custom-row">
          <a-col flex="100px" class="custom-col">
            <div>分数</div>
          </a-col>
          <a-col flex="auto" class="custom-col">
            <div>{{ form.score }}</div>
          </a-col>
        </a-row>
        <a-row class="custom-row" v-if="mainInfo?.time">
          <a-col flex="100px" class="custom-col">
            <div>峰值耗时</div>
          </a-col>
          <a-col flex="auto" class="custom-col">
            <div>{{ mainInfo?.time }} ms</div>
          </a-col>
        </a-row>
        <a-row class="custom-row" v-if="mainInfo?.memory">
          <a-col flex="100px" class="custom-col">
            <div>峰值内存</div>
          </a-col>
          <a-col flex="auto" class="custom-col">
            <div v-if="mainInfo?.memory < 1024">
              <!-- 默认KB为单位-->
              {{ mainInfo?.memory }} KiB
            </div>
            <div v-else>
              <!-- 超过了1024KB才会转化成MB-->
              {{ (mainInfo?.memory / 1024).toFixed(2) }} MiB
            </div>
          </a-col>
        </a-row>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import moment from "moment";
import { defineProps, onMounted, ref, withDefaults } from "vue";
import {
  JudgeInfo,
  QuestionControllerService,
  QuestionSubmitVO,
} from "../../../generated";
import { TableColumnData } from "@arco-design/web-vue";
import CodeViewer from "@/components/CodeViewer.vue";

const form = ref<QuestionSubmitVO>({});
const mainInfo = ref<JudgeInfo>();
const subInfoList = ref<JudgeInfo[]>();
const codeByteLength = ref(0);
const languageMap: Record<string, string> = {
  cpp: "C++",
  java: "Java",
  python: "Python",
  golang: "Golang",
  // 添加其他语言
};
const columns = [
  {
    title: "序号", // 新添加的列标题
    // 使用 render 来自定义单元格渲染
    render: (data: { record: any; column: any; rowIndex: number }) => {
      return `#${data.rowIndex + 1}`;
    },
    width: 50,
    bodyCellStyle: (record: JudgeInfo) => {
      const borderColor = record.message === "Accepted" ? "#17c617" : "red";
      return {
        borderLeft: `2px solid ${borderColor}`,
      };
    },
  },
  {
    title: "状态",
    slotName: "message",
    width: 300,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: "分数",
    slotName: "score",
    width: 40,
    align: "right",
  },
  {
    title: "耗时",
    slotName: "time",
    width: 70,
  },
  {
    title: "内存占用",
    slotName: "memory",
    width: 70,
  },
] as TableColumnData[];

interface Props {
  id: number;
}

const props = withDefaults(defineProps<Props>(), {
  id: () => 0,
});
const calculateBytes = (str: string) => {
  if (!str) return 0; // 如果字符串为空或未定义，返回 0
  const encoder = new TextEncoder();
  const encoded = encoder.encode(str);
  return encoded.length;
};
const formatLanguage = (lang: string) => {
  return languageMap[lang] || lang;
};
const loadData = async () => {
  const res =
    await QuestionControllerService.getQuestionSubmitDetailByIdUsingGet(
      props.id
    );
  console.log("props.id: " + props.id);
  if (res.code === 0) {
    form.value = res.data as any;
    mainInfo.value = res.data?.judgeInfoList?.[0];
    subInfoList.value = res.data?.judgeInfoList?.slice(1) ?? [];
    console.log("form: " + JSON.stringify(form.value));
    codeByteLength.value = calculateBytes(form.value?.code as string);
  }
};
const changeCode = (v: string) => {
  console.log(v);
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
#questionSubmitDetailView {
  display: flex;
  align-items: flex-start; /* 子元素高度由内容决定 */
  width: 90vw;
  margin: 0 auto;
}

:deep(.arco-table-th:first-child),
:deep(.arco-table-td:first-child) {
  border-right: 1px solid rgb(var(--gray-3));
}

:deep(.arco-table-th:nth-child(3)),
:deep(.arco-table-td:nth-child(3)) {
  border-right: 1px solid rgb(var(--gray-3));
}

:deep(.arco-table-th) {
  position: relative;
  height: 50px;
  border-bottom: 1px solid rgb(var(--gray-3));
  background-color: white;
}

:deep(.arco-table-th)::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px; /* 阴影厚度 */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 更深的阴影效果 */
  pointer-events: none; /* 确保不影响交互 */
}

.main-detail {
  background-color: #ededed;
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: flex-start; /* 水平从左开始排列 */
  text-align: left; /* 保证文本从左边开始 */
  min-height: 20px; /* 最小高度，保证单行内容也有空间 */
  margin: 0 auto 10px auto;
  border-radius: 8px; /* 边框弧度 */
  width: 95%;
  padding: 5px 3px 5px 3px;
}

.main-content {
  display: flex;
  flex-direction: column;
  width: 60%;
  margin: 20px 5% 10px 5%;
  height: auto;
  border-radius: 10px; /* 边框弧度 */
}

.main-content1 {
  width: 100%;
  height: auto;
  border-radius: 10px; /* 边框弧度 */
  overflow: hidden;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* 阴影 */
}

.main-content2 {
  width: 100%;
  height: auto;
  border-radius: 10px; /* 边框弧度 */
  overflow: hidden;
  padding-top: 15px;
  margin-top: 20px;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* 阴影 */
}

.side-title {
  font-size: 24px; /* 字体大小 */
  color: #666666; /* 灰色字体 */
  margin-bottom: 15px; /* 下边距 */
  text-align: left; /* 文字左对齐 */
}

.side-content {
  border-radius: 16px; /* 边框弧度 */
  padding: 16px 16px;
  width: 19%;
  margin: 20px 5% 10px 0;
  height: auto;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* 阴影 */
}

:deep(tr.arco-table-tr) {
  height: 40px; /* 默认行高 */
  min-height: 30px; /* 最小高度 */
  max-height: 60px; /* 最大高度 */
}

:deep(.arco-card-header) {
  border-bottom: none;
}

:deep(.arco-card-size-medium .arco-card-body) {
  padding: 0;
  margin: 0;
}

:deep(.arco-avatar-circle) {
  width: 25px;
  height: 25px;
}

.code-title {
  font-size: 18px; /* 字体大小 */
  color: #666666; /* 灰色字体 */
  margin-left: 10px; /* 左边距 */
  font-weight: bold; /* 字体加粗 */
  text-align: left; /* 文字左对齐 */
}

.custom-row {
  margin-bottom: 3px;
}

.custom-col {
  height: 30px;
  line-height: 30px;
}

/* 定义超链接样式 */
.custom-link {
  color: rgb(var(--arcoblue-6)); /* 初始颜色 */
  text-decoration: none; /* 去掉下划线 */
}

.custom-link:hover {
  text-decoration: underline; /* 鼠标悬停时显示下划线 */
  color: rgb(var(--red-5)); /* 悬停颜色 */
}

.custom-link:active {
  color: rgb(var(--arcoblue-7)); /* 点击后的颜色 */
}
</style>
