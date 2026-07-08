# 审核报告模板

> 由 `review` 生成，保存至 `$HERMES_ROOT/审核/{日期}_{slug}.md`

---

# 内容审核报告 — {日期}

| 项目 | 值 |
|------|-----|
| 平台 | {display_name} |
| 文稿 | {content_file} |
| 标题 | {title} |
| Slug | {slug} |

## 硬规则检查（lint）

| 检查项 | 级别 | 结果 | 说明 |
|--------|------|------|------|
| {check_id} | {severity} | {pass_fail} | {message} |

## 软规则检查（rubric，Agent 填写）

| 检查项 | 级别 | 结果 | 说明 |
|--------|------|------|------|
| {rubric_id} | {severity} | {pass_fail} | {notes} |

## 汇总

- **error**：{error_count} 项
- **warn**：{warn_count} 项
- **info**：{info_count} 项
- **结论**：{PASS | BLOCK | WARN_ONLY}

## 修复建议

{fix_list}

---

*本报告由 review 自动生成。存在 error 时不应进入发布步骤。*
