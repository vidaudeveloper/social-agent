# 运行前提

## 安装 social-auto-upload

```powershell
cd auto-content-pipeline-skill
npm run overseas:install
cd tool/social-auto-upload
copy conf.example.py conf.py
uv pip install -e .
patchright install chromium
npm run youtube:patch-sau
```

## 验证 sau

```powershell
uv run --directory tool/social-auto-upload sau youtube --help
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `SAU_ROOT` | 默认 `tool/social-auto-upload` |
| `YOUTUBE_ACCOUNT_ID` | sau 账号名，默认 `default` |
| `SAU_HEADED=true` | 有头模式（login 推荐） |
| `OVERSEAS_ALLOW_AUTOMATION=true` | Agent/终端执行 login/check/publish 前须人工开启 |

## 代理（国内必配）

编辑 `tool/social-auto-upload/conf.py`：

```python
YT_PROXY = "http://127.0.0.1:7890"
```

## 登录态

唯一 cookie 文件：

```
tool/social-auto-upload/cookies/youtube_<account>.json
```

登录一次后日常只 `publish`，少跑 `check-login`。
