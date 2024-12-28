<template>
  <a-card :bordered="false" class="rounded-card">
    <!-- 标题 -->
    <div class="chart-title">统计</div>
    <div class="info-container">
      <div class="summary">
        <div>
          <span class="label">常用语言：</span>
          <span class="value">{{
            formatLanguage(data.mostUsedLanguage || "")
          }}</span>
        </div>
        <div>
          <span class="label">最大分段：</span>
          <span class="value"
            >{{ data.maxSegment }} ({{ maxPercentage }}%)</span
          >
        </div>
        <div>
          <span class="label">最小分段：</span>
          <span class="value"
            >{{ data.minSegment }} ({{ minPercentage }}%)</span
          >
        </div>
        <div>
          <span class="label">平均分：</span>
          <span class="value">{{ data.averageScore }}</span>
        </div>
      </div>
      <!-- 图表容器 -->
      <div ref="chart" class="chart-container"></div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  watch,
  computed,
  withDefaults,
  defineProps,
} from "vue";
import * as echarts from "echarts";
import { QuestionControllerService } from "../../generated";

// 定义 Props
interface Props {
  questionId: number;
}

const props = withDefaults(defineProps<Props>(), {
  questionId: 0,
});

// 定义类型
type BackendData = {
  scoreDistribution: Record<string, number>;
  maxSegment: string;
  minSegment: string;
  averageScore: number;
  mostUsedLanguage: string;
};

// 后端数据
const backendData = ref<BackendData>({
  scoreDistribution: {},
  maxSegment: "",
  minSegment: "",
  averageScore: 0,
  mostUsedLanguage: "",
});
const languageMap: Record<string, string> = {
  cpp: "C++",
  java: "Java",
  python: "Python",
  golang: "Golang",
  // 添加其他语言
};
const formatLanguage = (lang: string) => {
  return languageMap[lang] || lang;
};
// 计算图表数据
const chartData = computed(() =>
  Object.entries(backendData.value.scoreDistribution).map(([name, value]) => {
    let color = "#FF6B6B"; // 默认红色
    if (name === "21-40") color = "#FBAE6E";
    if (name === "41-60") color = "#FFDD7D";
    if (name === "61-80") color = "#A3E27E";
    if (name === "81-100") color = "#17C617";
    return { value, name, itemStyle: { color } };
  })
);
const minPercentage = ref<string>();
const maxPercentage = ref<string>();
// 计算最大和最小分段的百分比
const calcMaxPercentage = () => {
  maxPercentage.value = (
    (backendData.value.scoreDistribution[backendData.value.maxSegment] /
      Object.values(backendData.value.scoreDistribution).reduce(
        (sum, v) => sum + Number(v),
        0
      )) *
    100
  ).toFixed(2);
};
const calcMinPercentage = () => {
  minPercentage.value = (
    (backendData.value.scoreDistribution[backendData.value.minSegment] /
      Object.values(backendData.value.scoreDistribution).reduce(
        (sum, v) => sum + Number(v),
        0
      )) *
    100
  ).toFixed(2);
};
// Chart 容器
const chart = ref<HTMLDivElement | null>(null);

// 加载数据
const loadData = async () => {
  if (props.questionId <= 0) return;
  try {
    const res = await QuestionControllerService.getQuestionScoreDataUsingGet(
      props.questionId
    );
    backendData.value = res as any; // 根据实际类型调整
    console.log("backendData.value: " + JSON.stringify(backendData.value));
    calcMinPercentage();
    calcMaxPercentage();
    initChart();
  } catch (error) {
    console.error("数据加载失败", error);
  }
};

// 初始化图表
const initChart = () => {
  if (!chart.value) return;
  const myChart = echarts.init(chart.value);
  const option = {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    series: [
      {
        type: "pie",
        radius: ["0%", "70%"],
        center: ["50%", "50%"],
        data: chartData.value,
        label: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };
  myChart.setOption(option);
};

// 初始化和监听 Props
onMounted(() => {
  loadData();
});
watch(
  () => props.questionId,
  (newQuestionId) => {
    loadData();
  },
  { immediate: true }
);

// 数据解构
const data = computed(() => backendData.value);
</script>

<style scoped>
.rounded-card {
  border-radius: 12px;
  background-color: transparent;
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.chart-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
  margin-left: 3px;
  text-align: left;
}

.info-container {
  display: flex;
  justify-content: space-between;
}

.summary {
  width: 45%;
  font-size: 14px;
  font-weight: 500;
  color: #4a4a4a;
  line-height: 1.8;
  padding: 3px;
  border-right: 1px solid #eaeaea;
}

.chart-container {
  width: 50%;
  height: 200px;
  margin: 0;
  display: flex;
  justify-content: center;
  line-height: 1.8;
  align-items: center;
}

:deep(.arco-card-body) {
  padding: 8px 16px;
  width: 100%;
}

.summary div {
  display: flex;
  flex-direction: column;
  margin-bottom: 4px;
}

.label {
  font-weight: bold;
  margin-bottom: 2px;
}

.value {
  font-size: 12px;
  color: #666;
}
</style>
