# LinkedIn 公司主页（预留）

当前 **仅支持个人号**（官方 API + `w_member_social`）。

## 个人号 vs 公司主页

| 项 | 个人号（已接） | 公司主页（预留） |
|----|----------------|------------------|
| OAuth 权限 | `w_member_social` | `w_organization_social` |
| author URN | `urn:li:person:{id}` | `urn:li:organization:{id}` |
| npm | `linkedin:publish` | 未来 `linkedin:publish-company` |

## 后续接入公司号时

1. LinkedIn 应用开通 Organization 相关产品与权限
2. OAuth 增加 `w_organization_social`
3. Posts API `author` 改为公司 URN
4. `user-profile.md` 配置公司 Page ID

在此之前请勿设 `LINKEDIN_ACCOUNT_TYPE=company`。
