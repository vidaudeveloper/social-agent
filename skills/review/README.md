# review — 审核层

发布前格式/合规检查，**不执行 publish**。

当前实现：[`../content-reviewer/`](../content-reviewer/)（平级目录，Phase2 再定是否物理迁入本层）。

```powershell
npm run review:lint -- --platform xiaohongshu --file "D:/content/文章/小红书/xxx.md"
npm run review:sync-specs
```
