# 毛线库存管理系统

## 项目结构

```
yarn-server/
  server.js          # Node.js Express 后端
  public/index.html  # 前端页面
  data/data.json     # 数据存储（自动创建）
  import_excel.py    # Excel导入脚本
```

## 本地运行

```bash
npm install
node server.js
# 打开 http://localhost:3000
```

## 部署到 Render.com（免费）

### 第一步：注册 GitHub
1. 打开 https://github.com 注册账号
2. 创建新仓库，把 yarn-server 整个文件夹上传

### 第二步：部署到 Render
1. 打开 https://render.com 用 GitHub 账号登录
2. 点 "New" → "Web Service"
3. 选择你的 GitHub 仓库
4. 配置：
   - Name: yarn-inventory（或任意名字）
   - Runtime: Node
   - Build Command: npm install
   - Start Command: node server.js
5. 点 "Create Web Service"
6. 等待部署完成，得到网址如 `https://yarn-inventory.onrender.com`

### 第三步：导入 Excel 历史数据

1. 修改 `import_excel.py` 中的 `API` 变量为你的 Render 网址
2. 运行: `python import_excel.py`
3. 会生成 `import_data.json` 和 `导入问题清单.txt`
4. 审核问题清单后，运行: `curl -X POST https://你的网址/api/import -H "Content-Type: application/json" -d @import_data.json`
5. 刷新页面查看导入结果

## 注意事项
- Render 免费版 15 分钟无人访问会休眠，下次打开需要 3-5 秒唤醒
- 定期在页面上方点「备份」按钮下载数据备份
