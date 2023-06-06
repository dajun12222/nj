
// 时间分析
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin({
    outputFormat: 'human'
});

module.exports = {
    smp,
}
