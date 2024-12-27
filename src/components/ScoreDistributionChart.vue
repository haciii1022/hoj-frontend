<template>
  <a-card :bordered="false" class="rounded-card">
    <!-- 标题 -->
    <div class="chart-title">统计</div>
    <div class="info-container">
      <div class="summary">
        <div>
          <span class="label">常用语言：</span>
          <span class="value">C++</span>
        </div>
        <div>
          <span class="label">最大分段：</span>
          <span class="value">81-100分 (30%)</span>
        </div>
        <div>
          <span class="label">最小分段：</span>
          <span class="value">0-20分 (10%)</span>
        </div>
        <div>
          <span class="label">平均分：</span>
          <span class="value">55.3</span>
        </div>
      </div>
      <!-- 图表容器 -->
      <div ref="chart" class="chart-container"></div>
    </div>
  </a-card>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import * as echarts from "echarts";

export default defineComponent({
  name: "ScoreDistributionCard",
  setup() {
    const chart = ref<HTMLDivElement | null>(null);

    const scoreDistribution = [
      { value: 40, name: "0-20分", itemStyle: { color: "red" } }, // 亮红色
      { value: 60, name: "21-40分", itemStyle: { color: "#fbae6e" } }, // 亮橙色
      { value: 80, name: "41-60分", itemStyle: { color: "yellow" } }, // 亮黄色
      { value: 100, name: "61-80分", itemStyle: { color: "#A3E27E" } }, // 明亮的浅绿色
      { value: 120, name: "81-100分", itemStyle: { color: "#17C617" } }, // 明亮绿色
    ];

    const initChart = () => {
      if (!chart.value) return;

      const myChart = echarts.init(chart.value);
      const option = {
        tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
        series: [
          {
            type: "pie",
            radius: ["0%", "70%"], // 设置内外半径，外半径设置为70%，让饼图更大
            center: ["50%", "50%"], // 让饼图略微向下偏移，视觉更居中
            data: scoreDistribution,
            label: { show: false }, // 隐藏标签
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

    onMounted(() => {
      initChart();
    });

    return { chart };
  },
});
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
  width: 45%; /* 左侧占 35% */
  font-size: 14px; /* 字体大小稍微增大 */
  font-weight: 500; /* 字体加粗以突出内容 */
  color: #4a4a4a; /* 使用柔和的深灰色 */
  line-height: 1.8; /* 增加行间距，改善视觉效果 */
  padding: 3px; /* 添加内边距，使内容不显得拥挤 */
  border-right: 1px solid #eaeaea; /* 在右侧添加细线分割 */
}

.chart-container {
  width: 50%;
  height: 200px; /* 高度设置更高以匹配饼图大小 */
  margin: 0;
  display: flex;
  justify-content: center;
  line-height: 1.8; /* 增加行高，改善间距 */
  align-items: center;
}

:deep(.arco-card-body) {
  padding: 8px 16px;
  width: 100%;
}

.summary div {
  display: flex;
  flex-direction: column; /* 每个字段换行 */
  margin-bottom: 4px; /* 字段之间的间距 */
}

.label {
  font-weight: bold; /* 加粗标签部分 */
  margin-bottom: 2px; /* 标签与值之间的间距 */
}

.value {
  font-size: 12px; /* 数值部分字体略小 */
  color: #666; /* 柔和的灰色 */
}
</style>
