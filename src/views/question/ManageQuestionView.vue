<template>
  <div id="manageQuestionView">
    <div class="search-content">
      <h2>筛选条件</h2>
      <a-form :model="searchParams" layout="inline" style="min-width: 240px">
        <a-form-item field="title" label="题目标题" show-colon>
          <a-input
            v-model="searchParams.title"
            placeholder="请输入题目标题"
            style="
              width: 200px;
              background-color: white;
              border: 1px solid var(--color-neutral-4);
            "
            allow-clear
          ></a-input>
        </a-form-item>
        <a-form-item field="tag" label="标签" style="min-width: 240px">
          <a-input-tag
            v-model="searchParams.tags"
            placeholder="请输入标签"
            style="
              width: 200px;
              background-color: white;
              border: 1px solid var(--color-neutral-4);
            "
            allow-clear
          ></a-input-tag>
        </a-form-item>
        <a-form-item field="questionId" label="创建用户ID" show-colon>
          <a-input-number
            style="
              width: 200px;
              background-color: white;
              border: 1px solid var(--color-neutral-4);
            "
            v-model="searchParams.userId"
            placeholder="请输入创建用户ID"
            :hide-button="true"
            allow-clear
          ></a-input-number>
        </a-form-item>
        <a-form-item>
          <a-checkbox
            v-model="searchParams.includeHiddenQuestions"
            :default-checked="searchParams.includeHiddenQuestions"
          >
            包含隐藏题目
          </a-checkbox>
        </a-form-item>

        <a-button
          class="custom-button"
          @click="doSearch"
          type="primary"
          style="background-color: rgb(var(--arcoblue-3))"
        >
          <icon-search style="margin-right: 3px" />
          搜索
        </a-button>
        <a-button
          class="custom-button"
          @click="doClean"
          type="primary"
          style="background-color: var(--color-neutral-6)"
        >
          <icon-eraser style="margin-right: 3px" />
          重置
        </a-button>
      </a-form>
    </div>
    <div class="main-content">
      <a-table
        :columns="columns"
        :data="dataList"
        :stripe="true"
        :hoverable="false"
        @page-change="doPageChange"
        @page-size-change="doPageSizeChange"
        :pagination="{
          pageSize: searchParams.pageSize,
          pageSizeOptions: [5, 10, 15, 20],
          current: searchParams.current,
          total: total,
          showTotal: true,
          showPageSize: true,
          showJumper: true,
          simple: true,
        }"
      >
        <template #optional="{ record }">
          <a-popconfirm
            :content="`你确认要${record.isHidden === 1 ? '显示' : '隐藏'}吗？`"
            type="warning"
            @ok="doHideQuestion(record)"
          >
            <span style="height: 100%; line-height: 100%">
              <a-button size="mini" type="text"
                >{{ record.isHidden === 1 ? "显示" : "隐藏" }}
              </a-button>
            </span>
          </a-popconfirm>

          <a-popconfirm
            content="你确认要删除吗？"
            type="warning"
            @ok="doDelete(record)"
          >
            <a-button size="mini" type="text">
              <img alt="删除" src="../../assets/delete.svg" />
            </a-button>
          </a-popconfirm>
        </template>
        <template #tags="{ record }">
          <a-tag
            v-for="(tag, index) of record.tags"
            :key="index"
            style="margin-right: 6px"
            color="purple"
            >{{ tag }}
          </a-tag>
        </template>
        <template #problem="{ record }">
          <a @click="doUpdate(record)" class="custom-link">
            {{ record.id }}&nbsp;&nbsp;{{ record.title }}
          </a>
          <span v-if="record.isHidden" style="color: lightgray">(隐藏)</span>
        </template>
        <template #acceptRate="{ record }">
          {{
            (record.submitNum != 0
              ? (record.acceptedNum / record.submitNum) * 100
              : 0
            ).toFixed(2)
          }}% [{{ record.acceptedNum }}/{{ record.submitNum }}]
        </template>
        <template #createTime="{ record }">
          {{ moment(record.createTime).format("YYYY/MM/DD HH:mm") }}
        </template>
        <template #memory="{ record }">
          <div v-if="record.judgeConfig.memoryLimit != null">
            <!-- 默认KB为单位-->
            {{ record.judgeConfig.memoryLimit }} KiB
          </div>
          <div v-else>-</div>
        </template>
        <template #time="{ record }">
          <span v-if="record.judgeConfig && record.judgeConfig.timeLimit">
            {{ record.judgeConfig.timeLimit }} ms
          </span>
          <span v-else> - </span>
        </template>
      </a-table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import {
  Question,
  QuestionControllerService,
  QuestionEditRequest,
  QuestionQueryRequest,
  QuestionVO,
} from "../../../generated";
import { Message, TableColumnData } from "@arco-design/web-vue";
import { useRouter } from "vue-router";
import moment from "moment/moment";

const dataList = ref<QuestionVO[]>([]);
const total = ref(1);
const router = useRouter();
const hiddenRequest = ref<QuestionEditRequest>({
  id: undefined,
  isHidden: undefined,
});
const searchParams = ref<QuestionQueryRequest>({
  title: "",
  userId: undefined,
  tags: [],
  isWithRelatedData: true,
  includeHiddenQuestions: true,
  pageSize: 5,
  current: 1,
});
onMounted(() => {
  loadData();
});
const loadData = async () => {
  const res = await QuestionControllerService.listQuestionVoByPageUsingPost(
    searchParams.value
  );
  if (res.code === 0) {
    dataList.value = res.data.records;
    total.value = res.data.total;
  } else {
    Message.error("获取题目列表失败, " + res.message);
  }
};

const columns = [
  {
    title: "题目",
    slotName: "problem",
    width: 180,
    ellipsis: true, // 让内容自动截断
    tooltip: true,
  },
  {
    title: "标签",
    slotName: "tags",
    key: "tags",
    width: 300,
    ellipsis: true,
    tooltip: true,
  },
  // {
  //   title: "答案",
  //   dataIndex: "answer",
  //   key: "answer",
  //   ellipsis: true,
  // },
  {
    title: "通过率",
    slotName: "acceptRate",
    width: 150,
    ellipsis: true,
  },
  // {
  //   title: "提交数",
  //   dataIndex: "submitNum",
  //   key: "submitNum",
  //   width: 70,
  //   ellipsis: true,
  // },
  // {
  //   title: "通过数",
  //   dataIndex: "acceptedNum",
  //   key: "acceptedNum",
  //   width: 70,
  //   ellipsis: true,
  // },
  // {
  //   title: "判题用例",
  //   dataIndex: "judgeCase",
  //   key: "judgeCase",
  //   ellipsis: true,
  // },
  {
    title: "时间限制",
    slotName: "time",
    width: 100,
    ellipsis: true,
  },
  {
    title: "内存限制",
    slotName: "memory",
    width: 100,
    ellipsis: true,
  },
  {
    title: "创建用户",
    dataIndex: "userVO.userName",
    width: 100,
    ellipsis: true,
    tooltip: true,
  },
  // {
  //   title: "点赞数",
  //   dataIndex: "thumbNum",
  //   key: "thumbNum",
  // },
  // {
  //   title: "收藏数",
  //   dataIndex: "favourNum",
  //   key: "favourNum",
  // },
  {
    title: "创建时间",
    slotName: "createTime",
    width: 150,
    ellipsis: true,
  },
  // {
  //   title: "更新时间",
  //   dataIndex: "updateTime",
  //   key: "updateTime",
  //   width: 150,
  //   ellipsis: true,
  // },
  // {
  //   title: "是否删除",
  //   dataIndex: "isDelete",
  //   key: "isDelete",
  //   ellipsis: true,
  // },
  {
    title: "操作",
    slotName: "optional",
    width: 150,
    headerCellStyle: {
      paddingLeft: "10px",
    },
  },
] as TableColumnData[];
const doSearch = async () => {
  searchParams.value = {
    ...searchParams.value,
    current: 1,
  };
  // await loadData();
};
const doClean = async () => {
  searchParams.value = {
    ...searchParams.value,
    tags: [],
    title: "",
    current: 1,
    includeHiddenQuestions: true,
  };
  console.log("searchParams.value: ", JSON.stringify(searchParams.value));
  // await loadData();
};
const doDelete = async (question: Question) => {
  console.log("delete:", question);
  const res = await QuestionControllerService.deleteQuestionUsingPost({
    id: question.id,
  });
  if (res.code === 0) {
    Message.success("删除成功");
    await loadData();
  } else {
    Message.error("删除失败," + res.message);
  }
};
const doHideQuestion = async (question: Question) => {
  console.log("hide:", question);
  hiddenRequest.value = {
    id: question.id,
    isHidden: 1 - question.isHidden!,
  };
  console.log("hiddenRequest:", JSON.stringify(hiddenRequest.value));
  const res = await QuestionControllerService.editQuestionUsingPost(
    hiddenRequest.value
  );
  if (res.code === 0) {
    Message.success("操作成功");
    await loadData();
  } else {
    Message.error("操作失败," + res.message);
  }
};
const doUpdate = async (question: Question) => {
  router.push({
    path: "/question/update",
    query: {
      id: question.id,
    },
  });
};
const doPageChange = async (pageNumber: number) => {
  searchParams.value = {
    ...searchParams.value,
    current: pageNumber,
  };
};
const doPageSizeChange = async (pageSize: number) => {
  searchParams.value = {
    ...searchParams.value,
    pageSize: pageSize,
  };
};
/**
 * 监听searchParams变量，改变时触发loadData()
 */
watchEffect(() => {
  loadData();
});
</script>

<style scoped>
#manageQuestionView {
  max-width: 1280px;
  margin: 0 auto;
}

.main-content {
  width: 100%;
  height: auto;
  border-radius: 16px; /* 边框弧度 */
  overflow: hidden;
  background-color: white;
}

.search-content {
  width: calc(100% - 20px);
  height: auto;
  padding-top: 10px;
  padding-left: 20px;
  padding-bottom: 20px;
  border-radius: 16px; /* 边框弧度 */
  overflow: hidden;
  background-color: white;
  margin-bottom: 20px;
}

.custom-button {
  border-radius: 10px; /* 边框弧度 */
  margin-right: 10px;
}

.custom-link {
  color: #333; /* 设置默认颜色，深灰色 */
  text-decoration: none; /* 去除默认下划线 */
  transition: color 0.3s ease, text-decoration 0.3s ease; /* 添加过渡效果，提升用户体验 */
}

.custom-link:hover {
  text-decoration: underline; /* 鼠标悬停时显示下划线 */
  color: #333; /* 保持颜色不变 */
}

:deep(.arco-table-th) {
  position: relative;
  height: 50px;
  background-color: white;
  border-bottom: 1px solid rgb(var(--gray-3));
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

:deep(.arco-table-th:first-child),
:deep(.arco-table-td:first-child) {
  border-right: 1px solid rgb(var(--gray-3));
}

:deep(.arco-table-th:nth-child(5)),
:deep(.arco-table-td:nth-child(5)) {
  border-right: 1px solid rgb(var(--gray-3));
}

:deep(.arco-table-th:nth-child(7)),
:deep(.arco-table-td:nth-child(7)) {
  border-right: 1px solid rgb(var(--gray-3));
}
</style>
