<template>
  <div id="questionListView">
    <div class="search-content">
      <h2>筛选条件</h2>
      <a-form :model="searchParams" layout="inline" style="min-width: 240px">
        <a-form-item field="title" label="题目标题" show-colon>
          <a-input
            v-model="searchParams.title"
            placeholder="请输入题目标题"
            style="
              width: 240px;
              background-color: white;
              border: 1px solid var(--color-neutral-4);
            "
            allow-clear
          ></a-input>
        </a-form-item>
        <a-form-item
          field="tag"
          label="标签"
          style="min-width: 240px"
          show-colon
        >
          <a-input-tag
            v-model="searchParams.tags"
            placeholder="请输入标签"
            style="
              width: 240px;
              background-color: white;
              border: 1px solid var(--color-neutral-4);
            "
            allow-clear
          ></a-input-tag>
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
        :bordered="{
          wrapper: false,
          cell: false,
          headerCell: false,
          bodyCell: false,
        }"
        :pagination="{
          simple: true,
          pageSize: searchParams.pageSize,
          pageSizeOptions: [5, 10, 15, 20],
          current: searchParams.current,
          total: total,
          showTotal: true,
          showPageSize: true,
          showJumper: true,
        }"
      >
        <template #status="{ record }">
          <div style="display: flex">
            <div v-if="record.historicalScore == 100" style="color: #17c617">
              <icon-check />
              {{ record.historicalScore }}&nbsp;Solved
            </div>
            <div v-else-if="record.historicalScore >= 0" style="color: red">
              <icon-close />
              {{ record.historicalScore }}&nbsp;Attempted
            </div>
          </div>
        </template>
        <template #problem="{ record }">
          <a :href="`/question/list/${record.id}`" class="custom-link">
            <span style="font-weight: 600">P{{ record.id }}</span>
            &nbsp;&nbsp;{{ record.title }}
          </a>
          <span v-if="record.isHidden" style="color: lightgray">(隐藏)</span>
        </template>
        <template #tags="{ record }">
          <a-tag
            v-for="(tag, index) of record.tags"
            :key="index"
            style="margin-left: 6px"
            color="purple"
            >{{ tag }}
          </a-tag>
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
          {{ moment(record.createTime).format("YYYY-MM-DD") }}
        </template>
        <template #optional="{ record }">
          <a-space>
            <a-button type="primary" @click="doQuestionPage(record)"
              >详情
            </a-button>
          </a-space>
        </template>
      </a-table>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import {
  QuestionControllerService,
  QuestionQueryRequest,
  QuestionVO,
} from "../../../generated";
import { Message, TableColumnData } from "@arco-design/web-vue";
import { useRouter } from "vue-router";
import moment from "moment";
import ACCESS_ENUM from "@/access/accessEnum";

const dataList = ref([] as QuestionVO[]);
const total = ref(1);
const router = useRouter();
const searchParams = ref<QuestionQueryRequest>({
  title: "",
  tags: [],
  isWithRelatedData: true,
  includeHiddenQuestions: false,
  pageSize: 5,
  current: 1,
});
onMounted(() => {
  const loginUser = JSON.parse(localStorage.getItem("loginUser") as string);
  if (loginUser && (loginUser.userRole as string) == ACCESS_ENUM.ADMIN) {
    searchParams.value.includeHiddenQuestions = true;
  }
  loadData();
});
const loadData = async () => {
  console.log("searchParams.value: " + JSON.stringify(searchParams.value));
  const res = await QuestionControllerService.listQuestionVoByPageUsingPost(
    searchParams.value
  );
  if (res.code === 0) {
    dataList.value = res.data.records;
    total.value = res.data.total;
    console.log("dataList.value: " + JSON.stringify(dataList.value));
  } else {
    Message.error("获取题目列表失败, " + res.message);
  }
};

const columns = [
  {
    title: "状态", // 新添加的列标题
    slotName: "status",
    width: 150,
    bodyCellStyle: (record: QuestionVO) => {
      let borderColor = null;
      if (record?.historicalScore != -1) {
        borderColor = record.historicalScore === 100 ? "#17c617" : "red";
      }
      return {
        borderLeft: `2px solid ${borderColor}`,
      };
    },
  },
  {
    title: "题目",
    slotName: "problem",
  },
  {
    title: "标签",
    slotName: "tags",
    align: "right",
  },
  {
    title: "通过率",
    slotName: "acceptRate",
  },
  {
    title: "创建时间",
    slotName: "createTime",
  },
  // {
  //   title: "操作",
  //   slotName: "optional",
  // },
] as TableColumnData[];

/**
 * 题目详情页面，去做题
 * @param question
 */
const doQuestionPage = async (question: QuestionVO) => {
  await router.push({
    path: `/question/list/${question.id}`,
  });
};
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
  };
  console.log("searchParams.value: ", JSON.stringify(searchParams.value));
  // await loadData();
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
#questionListView {
  max-width: 1280px;
  margin: 0 auto;
}

.main-content {
  width: 100%;
  height: auto;
  border-radius: 16px; /* 边框弧度 */
  overflow: hidden;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* 阴影 */
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
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* 阴影 */
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

:deep(.arco-table-th:nth-child(3)),
:deep(.arco-table-td:nth-child(3)) {
  border-right: 1px solid rgb(var(--gray-3));
}
</style>
