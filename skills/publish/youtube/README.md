# YouTube Skills

YouTube 自动化技能包，**仅 sau（social-auto-upload）单路径**。

## 子技能

| 技能 | 说明 |
|------|------|
| [yt-auth](skills/yt-auth/SKILL.md) | sau 登录 / check |
| [yt-publish](skills/yt-publish/SKILL.md) | sau 上传发布 |
| [yt-create](skills/yt-create/SKILL.md) | TTS + 视频合成 |
| [yt-pipeline](skills/yt-pipeline/SKILL.md) | 全流程 |

## 安装

```powershell
npm run overseas:install
cd tool/social-auto-upload
copy conf.example.py conf.py
# 国内编辑 conf.py: YT_PROXY = "http://127.0.0.1:7890"
```

## 使用

```powershell
$env:OVERSEAS_ALLOW_AUTOMATION = "true"   # 仅人工 login 时需要
npm run youtube:login                      # 一次性登录
npm run youtube:publish -- --video "D:/abs/video.mp4" --title "Title"
npm run youtube:pipeline
```

登录态唯一路径：`tool/social-auto-upload/cookies/youtube_default.json`

详见 [references/publishing.md](references/publishing.md)。
