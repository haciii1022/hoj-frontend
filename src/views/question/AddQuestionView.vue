<template>
  <div id="addQuestionView">
    <h2>新增题目</h2>
    <a-form :model="form" label-align="left">
      <a-form-item field="answer" tooltip="请输入答案" label="答案">
        <MdEditor :value="form.answer" :handle-change="onAnswerChange" />
      </a-form-item>
      <a-form-item field="content" tooltip="请输入内容" label="内容">
        <MdEditor :value="form.content" :handle-change="onContentChange" />
      </a-form-item>
      <a-form-item field="data.tags" tooltip="请输入标签" label="标签">
        <a-input-tag v-model="form.tags" placeholder="请输入标签" allow-clear />
      </a-form-item>
      <a-form-item field="data.title" tooltip="请输入标题" label="标题">
        <a-input v-model="form.title" placeholder="请输入标题" allow-clear />
      </a-form-item>
      <a-form-item label="判题配置" :content-flex="false" :merge-props="false">
        <a-space direction="vertical" style="min-width: 640px">
          <a-form-item field="data.judgeConfig.timeLimit" label="时间限制">
            <a-input-number
              v-model="form.judgeConfig.timeLimit"
              placeholder="请输入时间限制"
              mode="button"
              :min="0"
              size="large"
            />
          </a-form-item>
          <a-form-item field="data.judgeConfig.memoryLimit" label="内存限制">
            <a-input-number
              v-model="form.judgeConfig.memoryLimit"
              placeholder="请输内存限制"
              mode="button"
              :min="0"
              size="large"
            />
          </a-form-item>
          <a-form-item field="data.judgeConfig.stackLimit" label="堆栈限制">
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
          <a-button type="primary" @click="doSubmit">提交</a-button>
        </div>
      </a-form-item>
    </a-form>
    {{ form }}
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import MdEditor from "@/components/MdEditor.vue";
import { QuestionControllerService } from "../../../generated";
import { Message } from "@arco-design/web-vue";
import { useRoute, useRouter } from "vue-router";

let form = ref({
  answer: "$a \\times b$",
  content: "",
  tags: [],
  title: "",
  judgeConfig: {
    timeLimit: 0,
    memoryLimit: 0,
    stackLimit: 0,
  },
  judgeCase: [
    {
      input: "",
      output: "",
    },
  ],
});
const router = useRouter();
const route = useRoute();
//如果页面地址包含 update. 则为更新页面
const updatePage = route.path.includes("update");

const lodaData = async () => {
  let id = route.query.id;
  if (!id) {
    return;
  }
  const res = await QuestionControllerService.getQuestionByIdUsingGet(
    id as any
  );
  if (res.code === 0) {
    form.value = res.data as any;
    if (res.data?.judgeConfig == null) {
      form.value.judgeConfig = {
        timeLimit: 1000,
        memoryLimit: 1000,
        stackLimit: 1000,
      };
    } else {
      // TODO 后续可以改成后端处理好返回给前端  下面的方法也是一致
      form.value.judgeConfig = JSON.parse(res.data.judgeConfig);
    }
    if (res.data?.judgeCase == null) {
      form.value.judgeCase = [
        {
          input: "",
          output: "",
        },
      ];
    } else {
      form.value.judgeCase = JSON.parse(res.data.judgeCase);
    }
    if (res.data?.tags != null) {
      form.value.tags = JSON.parse(res.data.tags);
    }
    console.log("data " + JSON.stringify(res.data));
    console.log("form " + JSON.stringify(form.value));
  } else {
    Message.error("获取数据失败");
  }
};
onMounted(() => {
  lodaData();
});
const handleAdd = () => {
  form.value.judgeCase?.push({
    input: "",
    output: "",
  });
};
const handleDelete = (index: number) => {
  form.value.judgeCase?.splice(index, 1);
};

const onAnswerChange = (v: string) => {
  form.value.answer = v;
};

const onContentChange = (v: string) => {
  form.value.content = v;
};

const doSubmit = async () => {
  console.log(JSON.stringify(form));
  if (updatePage) {
    const res = await QuestionControllerService.updateQuestionUsingPost(
      form.value
    );
    if (res.code === 0) {
      Message.success("题目更新成功");
      setTimeout(() => {
        window.location.reload(); // 刷新页面
        router.push({
          path: "/question/add",
          replace: true,
        });
      }, 1000); // 延迟1秒
    } else {
      Message.error("更新失败, " + res.message);
    }
  } else {
    const res = await QuestionControllerService.addQuestionUsingPost(
      form.value
    );
    if (res.code === 0) {
      Message.success("题目创建成功");
      setTimeout(() => {
        window.location.reload(); // 刷新页面
        router.push({
          path: "/question/add",
          replace: true,
        });
      }, 1000); // 延迟1秒
    } else {
      Message.error("创建失败, " + res.message);
    }
  }
};
</script>

<style scoped>
#addQuestionView {
  padding-left: 100px;
}
</style>
