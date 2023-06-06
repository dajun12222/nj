#!/bin/sh

# 打包代码
starttime=`date +%s`

dist="./portal"

admin_dist="./packages/admin/dist"
portal_dist="./packages/portal/dist"
mobile_dist="./packages/mobile/dist"

echo "删除缓存dist文件"
rm -rf $admin_dist
rm -rf $portal_dist
rm -rf $mobile_dist
rm -rf portal.zip

#echo "yarn install"
#yarn install

startpackagestime=`date +%s`
echo "打包portal"
yarn run build:portal

endpackagestime=`date +%s`
echo "构建portal用时： "$((endpackagestime-startpackagestime))"s"
startpackagestime=`date +%s`

echo "打包mobile"
yarn run build:mobile
endpackagestime=`date +%s`
echo "构建mobile用时： "$((endpackagestime-startpackagestime))"s"
startpackagestime=`date +%s`

echo "打包admin"
yarn run build:admin
endpackagestime=`date +%s`
echo "构建admin用时： "$((endpackagestime-startpackagestime))"s"

echo "开始拷贝portal代码"
cp -r $portal_dist $dist
echo "开始拷贝mobile代码"
cp -r $mobile_dist $dist"/mobile"
echo "开始拷贝admin代码"
cp -r $admin_dist $dist"/admin"
echo "开始压缩代码"
zip portal.zip -q -r $dist
echo "删除文件"
rm -rf $dist
echo "完成"

endtime=`date +%s`

echo "打包构建总时长： "$((endtime-starttime))"s"
