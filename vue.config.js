const path = require("path");
function resolve(dir) {
  return path.join(__dirname, dir); //path.join(__dirname)设置绝对路径
}
module.exports = {
  // publicPath: process.env.VUE_APP_PUBLIC_PATH,
  productionSourceMap: false,
  css: {
    loaderOptions: {
      css: {},
      postcss: {
        plugins: [
          require("postcss-px2rem")({
            remUnit: 37.5,
          }),
        ],
      },
    },
  },
  chainWebpack: (config) => {
    config.resolve.alias
      .set("@", resolve("./src"))
      .set("views", resolve("./src/views"))
      .set("components", resolve("./src/components"))
      .set("utils", resolve("./src/utils"))
      .set("views", resolve("./src/views"))
      .set("api", resolve("src/api"))
      .set("img", resolve("src/assets/img"));
    config.optimization.splitChunks({
      chunks: "all",
      maxInitialRequests: Infinity,
      minSize: 300000, // 依赖包超过300000bit将被单独打包
      automaticNameDelimiter: "-",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1];
            return `chunk.${packageName.replace("@", "")}`;
          },
          priority: 10,
        },
      },
    });
  },
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === "production") {
      config.mode = "production";
    }
  },
  devServer: {
    host: "0.0.0.0",
    port: "8082",
  },
};
