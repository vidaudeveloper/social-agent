# src/scenes

业务镜头编排放这里（或继续改 `components/scenes` 的通用积木参数）。

新增 scene 时：

```ts
import { PromoLayout, theme, slamIn } from '../kit';
```

禁止在本目录重新定义 theme / 全局背景色板。
