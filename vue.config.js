const { defineConfig } = require("@vue/cli-service");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: "0.0.0.0", // 允许通过网络 IP 访问
    port: 8080, // 指定端口（默认 8080）
    allowedHosts: "all", // 允许所有主机访问
    open: false, // 自动打开浏览器
    compress: true, // 启用 gzip 压缩
  },
  chainWebpack(config) {
    config.plugin("monaco").use(new MonacoWebpackPlugin());
  },
});
