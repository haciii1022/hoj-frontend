<template>
  <div id="manageQuestionView">
    <h2>管理题目</h2>
    <a-table
      :columns="columns"
      :data="dataList"
      @page-change="doPageChange"
      @page-size-change="doPageSizeChange"
      :pagination="{
        pageSize: searchParms.pageSize,
        pageSizeOptions: [5, 10, 15, 20],
        current: searchParms.current,
        total: total,
        showTotal: true,
        showPageSize: true,
        showJumper: true,
      }"
    >
      <template #optional="{ record }">
        <a-space>
          <a-button size="mini" type="text" @click="doUpdate(record)"
            >修改
          </a-button>
          <a-button size="mini" status="danger" @click="doDelete(record)"
            >删除
          </a-button>
        </a-space>
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
      <template #createTime="{ record }">
        {{ moment(record.createTime).format("YYYY/MM/DD HH:mm") }}
      </template>
    </a-table>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
import {
  Question,
  QuestionControllerService,
  QuestionVO,
} from "../../../generated";
import { Message } from "@arco-design/web-vue";
import { useRouter } from "vue-router";
import moment from "moment/moment";

const dataList = ref<QuestionVO[]>([]);
const total = ref(1);
const router = useRouter();
const searchParms = ref({
  pageSize: 5,
  current: 1,
});
onMounted(() => {
  loadData();
});
const loadData = async () => {
  const res = await QuestionControllerService.listQuestionVoByPageUsingPost(
    searchParms.value
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
    title: "Id",
    dataIndex: "id",
    key: "id",
    width: 100,
    ellipsis: true, // 让内容自动截断
  },
  {
    title: "标题",
    dataIndex: "title",
    key: "title",
    width: 100,
    ellipsis: true,
  },
  // {
  //   title: "内容",
  //   dataIndex: "content",
  //   key: "content",
  //   width: 300,
  //   ellipsis: true,
  //   tooltip: true,
  // },
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
    title: "提交数",
    dataIndex: "submitNum",
    key: "submitNum",
    width: 70,
    ellipsis: true,
  },
  {
    title: "通过数",
    dataIndex: "acceptedNum",
    key: "acceptedNum",
    width: 70,
    ellipsis: true,
  },
  // {
  //   title: "判题用例",
  //   dataIndex: "judgeCase",
  //   key: "judgeCase",
  //   ellipsis: true,
  // },
  {
    title: "时间限制",
    dataIndex: "judgeConfig.timeLimit",
    key: "timeLimit",
    width: 100,
    ellipsis: true,
  },
  {
    title: "内存限制",
    dataIndex: "judgeConfig.memoryLimit",
    key: "memoryLimit",
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
    width: 200,
  },
];

const doDelete = async (question: Question) => {
  console.log("delete:", question);
  const res = await QuestionControllerService.deleteQuestionUsingPost({
    id: question.id,
  });
  if (res.code === 0) {
    Message.success("删除成功");
    loadData();
  } else {
    Message.error("删除失败," + res.message);
  }
};

const doUpdate = async (question: Question) => {
  console.log("update:", question);
  router.push({
    path: "/question/update",
    query: {
      id: question.id,
    },
  });
};
const doPageChange = async (pageNumber: number) => {
  searchParms.value = {
    ...searchParms.value,
    current: pageNumber,
  };
};
const doPageSizeChange = async (pageSize: number) => {
  searchParms.value = {
    ...searchParms.value,
    pageSize: pageSize,
  };
};
/**
 * 监听searchParms变量，改变时触发loadData()
 */
watchEffect(() => {
  loadData();
});
</script>

<style scoped>
#manageQuestionView {
  max-width: 85vw;
  margin: 0 auto;
}
</style>
