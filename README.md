# codex tools

[![GitHub stars](https://img.shields.io/github/stars/uchanges/codex-tools?style=flat&color=gold)](https://github.com/uchanges/codex-tools)
[![GitHub downloads](https://img.shields.io/github/downloads/uchanges/codex-tools/total?style=flat&color=blue)](https://github.com/uchanges/codex-tools/releases)
[![GitHub release](https://img.shields.io/github/v/release/uchanges/codex-tools?style=flat)](https://github.com/uchanges/codex-tools/releases)
[![GitHub issues](https://img.shields.io/github/issues/uchanges/codex-tools)](https://github.com/uchanges/codex-tools/issues)

一款基于 [jlcodes99/cockpit-tools](https://github.com/jlcodes99/cockpit-tools) 定制优化的桌面管理工具，聚焦 **Codex**（含内置本地 **Codex API 服务**）与 **Antigravity**（App / IDE / `agy` CLI），提供多账号管理、配额监控、应用多开、定时唤醒与本地网关路由能力。

> 本工具旨在帮助开发者高效管理多个 Codex 与 Antigravity 账号，支持一键切号、配额监控、应用多开隔离及本地 API 聚合服务。

**核心功能**：一键切号 · 多账号管理 · 应用多开 · 配额监控 · Codex API 服务 · 唤醒任务 · 2FA 管理 · 插件联动

**界面语言**：支持 18 种语言（简体中文 · 繁體中文 · English · 日本語 · Deutsch · Español · Français · Italiano · 한국어 · Português · Русский · Türkçe · Polski · Čeština · العربية · Tiếng Việt · Bahasa Indonesia 等）

**支持系统**：macOS · Windows · Linux

---

## 功能概览

### 1. 仪表盘 (Dashboard)

可视化状态总览，集中展示当前各核心平台状态：

- **聚焦核心入口**：同时展示 **Codex**、**Codex API 服务** 与 **Antigravity** 的账号及运行状态
- **配额监控**：实时查看各模型剩余配额与重置时间
- **快捷操作**：一键刷新、一键唤醒与推荐账号切换
- **可视化进度**：直观的进度条展示配额消耗情况

> ![Dashboard Overview](docs/images/dashboard_overview.png)

---

### 2. Codex 账号管理与 API 服务

#### 账号管理与配额

- **多种导入方式**：支持 OAuth 授权、Device Auth、官方客户端临时登录、本机导入、JSON / 文件批量导入，以及回收站恢复
- **配额与套餐识别**：清晰展示 Hourly 与 Weekly 配额状态、重置周期与历史记录，自动识别账号 Plan 类型（Basic、Plus、Team 等）
- **分组、代理与远端同步**：支持分组与标签管理、账号级出口代理（支持按需下载与配置 Mihomo / sing-box 内核），以及通过 SSH 将当前 Codex 账号同步至远端服务器

#### 原生下一步预测（Tab）

- 可在 Codex 增强设置中为本地 API 接入开启，默认关闭
- 使用当前对话的供应商和模型，会额外消耗 API 额度；保存后需通过应用重启目标 Codex 实例生效，详见 [功能说明](docs/codex-native-predictions.md)

#### Codex API 服务（纯 Rust 原生引擎）

- **纯 Rust 原生宿主引擎**：API 服务统一由宿主进程内的 Rust 引擎运行，已移除 Go sidecar 与切换入口，不再依赖 Go 工具链或外部 sidecar；升级时自动迁移旧配置并保留账号池、代理、端口、API Key 与历史记录，实例网关按 profile 隔离
- **多协议兼容**：支持 Responses HTTP/SSE/WebSocket、上下文压缩（`/v1/responses/compact`），以及 Chat Completions、Anthropic（Claude）、Gemini、Ollama 协议兼容
- **多账号池与自动能力兜底**：支持多种账号路由策略、并发限制与配额预留；当当前账号不支持请求所需能力时，自动在当前 Key 已授权账号池内匹配兼容账号（仅针对明确执行前拒绝且历史完整、可安全迁移的请求换号，不重放已输出或状态不明请求；Files、向量库与容器管理接口除外）
- **请求身份对照与上下文续接**：请求记录「详情」可对照客户端原始 `Session-Id`、`Thread-Id` 及每次上游尝试的请求头、账号与传输方式；基于本地 `codex_native_api/identity.sqlite`（实例网关使用各自 profile 目录内的 `native-identity.sqlite`）保存跨账号续接历史缓存（单检查点上限 8 MiB、总计 64 MiB、最多 128 个检查点），原样保留 reasoning、compaction、工具与子 Agent 密文及 `item.id` / `call_id`
- **语音反代与音频转写**：支持 Codex backend 实时语音路由与 `/transcribe` 入口，并提供 `/v1/audio/transcriptions`、`/v1/audio/translations`、`/v1/audio/speech` 及无 `/v1` 别名；请求上限 26 MiB、超时 2 分钟，音频内容不写入请求快照

#### ChatGPT 官方授权绑定

- **独立授权与状态标识**：可在「API 服务 → 管理成员（添加账号）」中主动选择官方通道并完成 OpenAI Sign in with ChatGPT 授权（支持复制授权链接、无痕窗口与手动回调）；未加入服务的账号仅保存授权，列表以「官」标识显示绑定状态，不改动原客户端登录、切号或实例绑定
- **官方优先与本地回退**：选择「官方优先」后优先使用已绑定的官方授权；遇到可安全重试的授权拒绝、通道或连接异常时，先尝试同账号本地 OAuth 通道，再沿用账号池规则；官方通道固定按默认速度发送且禁止生图，已输出内容或状态不明的请求不重放
- **凭据隔离与复用**：两套凭据独立加密保存并自动续期；测智（鹈鹕）和手动/定时唤醒优先使用绑定的官方授权（失效时提示处理而不静默切换）；解除授权或暂停成员仅影响 API 服务，不改客户端登录

#### Claude 模型网关

- **供应商接入**：在 Codex「模型供应商」中选择 Anthropic 协议并填写网关地址与 Key（支持 `x-api-key` 或 Bearer 鉴权，可从剪贴板导入 Claude Code settings 或 Gateway 配置），加入 API 服务后即可纳入模型目录与模型选择器
- **协议适配**：Rust 引擎支持流式回复、客户端工具发现、function/custom/namespace 与 MCP 工具回传、网页搜索结果及引用缓存回放，以及 `/responses/compact` 与会话内压缩；终端与文件编辑等客户端工具仍由 Codex 执行并受其权限控制

> ![Codex Accounts](docs/images/codex_list.png)

#### 2.1 Codex 应用多开

支持多个 Codex 实例并行运行，每个实例绑定不同账号并处理不同项目，互不干扰：

- **独立账号与目录**：每个实例拥有独立的 `CODEX_HOME` 与启动参数
- **会话与配置治理**：支持快速配置、`config.toml` 与模型目录管理、跨实例会话同步 / 导入导出 / 回收站 / 可见性修复，以及终端 CLI 续跑

> ![Codex Instances](docs/images/codex_instances.png)

---

### 3. Antigravity 账号管理与多开

- **统一账号入口**：从账号页打开启动弹框，选择 Antigravity、Antigravity IDE 或官方 CLI（`agy`），支持仅切号或切号后启动（CLI 支持指定工作目录）
- **共享登录**：IDE 2.6 起，默认 IDE、采用系统凭据的 App 与使用 Google 登录的 `agy` 共用登录凭据；旧版 IDE 使用独立的本地 SQLite 登录状态
- **多种导入与 Token 用量**：支持 OAuth 授权、Refresh Token、插件同步，并提供 Token 用量查询与会话统计
- **唤醒任务与验证**：支持基于 Cron 表达式的定时唤醒任务、执行历史查看与批量验证，提前触发配额重置周期

> ![Antigravity IDE Accounts](docs/images/antigravity_list.png)
>
> *(唤醒任务)*
> ![Wakeup Tasks](docs/images/wakeup_detail.png)

#### 3.1 Antigravity 应用多开

在同一多开页面内分别管理 App 和 IDE 实例，并可启动对应桌面端或终端 CLI：

- **独立账号（旧版 IDE）**：使用独立 SQLite 登录状态的旧版 IDE 可为各实例绑定不同账号并行运行
- **目录与参数隔离**：IDE 2.6 起采用共享登录，独立实例目录用于隔离项目与本地设置，支持自定义实例目录与启动参数

> ![Antigravity IDE Instances](docs/images/antigravity_instances.png)

---

### 4. 通用设置与实用工具

- **个性化与界面**：支持明暗主题切换、18 种语言、界面缩放、减少动态效果及各平台自动刷新间隔
- **平台专项设置**：统一管理 Codex 与 Antigravity 的应用路径、CLI 路径、OpenCode 联动与配额预警阈值
- **实用工具集**：提供本地加密 2FA/MFA 保险库、定时自动备份与 WebDAV 同步、桌面悬浮配额卡片以及日志查看器

> ![Settings](docs/images/settings_page.png)

---

## 安全性与隐私（简明版）

- **本地桌面工具**：无需注册账号，也不依赖自建云端存储你的账号列表。
- **数据主要保存在本机**：
  - `~/.cockpit_tools`：账号数据、公共配置、日志、备份与实例配置；开发环境使用 `~/.cockpit_tools_dev`，可通过 `COCKPIT_TOOLS_DATA_DIR` 自定义目录。
  - `~/.antigravity_cockpit` 兼容入口：已有安装会在后台自动为 `~/.antigravity_cockpit` / `~/.antigravity_cockpit_dev` 建立新名称的兼容入口（Unix 符号链接 / Windows 目录联接），无需手动迁移；无法建立链接时继续使用旧目录。
  - `instances/<平台>`：受管实例默认位于公共数据目录下的 `instances/<平台>`（Windows 部分平台实例位于 `%APPDATA%\.cockpit_tools\instances\<平台>`），自定义目录保持原样。
  - `~/.codex`：Codex 官方当前登录 `auth.json` 与配置文件目录。
  - `mfa_vault.sqlite`：已保存的 2FA 密钥与记录在应用数据目录中加密保存，加密材料存放在私有密钥文件内。
  - `com.jlcodes.cockpit-tools`：系统应用数据目录下保留的宿主 WebView 状态等数据（历史 `com.antigravity.cockpit-tools` 目录仅用于旧数据兼容导入）。
- **WebSocket 默认仅本机访问**：监听 `127.0.0.1`，默认端口 `19528`，可在设置中关闭或更改端口。
- **什么时候会联网**：仅在 OAuth 登录、Token 刷新、配额查询、代理检测、WebDAV 同步与版本更新检查等场景发起请求；本地 API 服务仅处理发送至本地网关的请求。
- **macOS 隐私权限弹窗说明**：在 `codex tools` 中启动 Codex/agent 后，若子进程执行的命令访问桌面、文稿、下载或照片等受保护目录，macOS 可能会将权限弹窗归因到宿主应用 `codex tools`。这不等同于主程序主动扫描这些目录，是否允许请依据当前任务与执行命令自行判断。
- **实用安全建议**：
  1. 不使用插件联动时，可在设置中关闭 WebSocket 服务。
  2. 不要将用户数据目录直接打包分享，导出或备份前注意保管敏感凭据。
  3. 开启 API 服务局域网绑定（`0.0.0.0`）时，请妥善保管并定期轮换 API Key。

### WebSocket 账号切换 API

`request.switch_account` 支持明确选择 Antigravity 客户端。未传 `runtime_target` 或传 `"antigravity_ide"` 时选择 IDE；IDE 2.6 起使用共享凭据，启用切号启动时通过重启加载新账号，旧版 IDE 继续沿用原有无感切号设置。

切换 Antigravity 桌面版及使用同一系统凭据的 `agy` CLI，可发送：

```json
{"type":"request.switch_account","payload":{"account_id":"<account-id>","request_id":"x","runtime_target":"antigravity","launch_on_switch":false}}
```

- `runtime_target: "antigravity"`：2.0 及以上版本写入系统凭据并同步 `~/.gemini/jetski-standalone-oauth-token`（保留 `id_token`，Unix 权限 `0600`）及已初始化的 `agy` 会话；旧版桌面 App 写入本地 SQLite 登录状态。仅当凭据与回退文件写入成功后才更新当前账号与默认实例绑定。
- `launch_on_switch`：仅用于 `"antigravity"`，默认 `false`（不重启客户端）；显式传 `true` 时执行关闭、写入并重启流程。IDE 请求不要传该字段。
- `request_id`：可选，传入后返回对应的 `response.success` 或 `response.error`。常见错误码包括 `WS_SWITCH_TARGET_INVALID`、`WS_SWITCH_LAUNCH_POLICY_INVALID`、`ANTIGRAVITY_SWITCH_BUSY`、`ANTIGRAVITY_SWITCH_PREPARATION_TIMEOUT` 与 `ANTIGRAVITY_SWITCH_STATE_SAVE_FAILED`。

---

## 设置项说明

如果你希望快速上手、稳定使用，可优先参考下表推荐值。

### 通用设置

| 设置项 | 作用说明 | 推荐值 | 调整建议 |
| --- | --- | --- | --- |
| 显示语言 | 更改界面文字语言 | 常用语言 | 需要切换界面语言时调整 |
| 应用主题 | 更改亮色/暗色外观 | 跟随系统 | 长时间夜间使用可固定深色 |
| 窗口关闭行为 | 点击主窗口关闭按钮后的动作 | 每次询问 | 想后台常驻托盘可选“最小化到托盘” |
| Antigravity 自动刷新配额 | 后台定时更新 Antigravity 配额 | 5~10 分钟 | 账号多、需要实时刷新可调至 2 分钟 |
| Codex 自动刷新配额 | 后台定时更新 Codex 配额 | 5~10 分钟 | 同上 |
| 数据目录 | 保存账号与配置文件的目录 | 默认即可 | 仅用于迁移、备份或排查问题 |
| Antigravity / Codex / OpenCode 启动路径 | 指定应用可执行文件位置 | 留空（自动检测） | 自动检测失败或自定义安装路径时指定 |
| 切换 Codex 时自动重启 OpenCode | 切换 Codex 后自动同步 OpenCode 账号 | 按需开启 | 频繁切号且依赖 OpenCode 同步时开启 |

补充说明：
- 自动刷新间隔越短，接口请求越频繁；若注重稳定性，可适当调大间隔。
- 启用“配额重置唤醒”相关任务时，部分刷新间隔会有界面提示的最小值限制。

### 网络服务设置

| 设置项 | 作用说明 | 推荐值 | 注意事项 |
| --- | --- | --- | --- |
| WebSocket 服务 | 用于本机插件或外部工具实时通信 | 不用插件联动时关闭 | 仅监听本机 `127.0.0.1` |
| 首选端口 | WebSocket 监听端口 | 默认 `19528` | 端口冲突时可修改，保存后需重启应用 |
| 当前运行端口 | 实际绑定的端口 | 只读查看 | 配置端口被占用时会自动回退其它可用端口 |

### 推荐配置组合

1. **稳定省心**：自动刷新 10 分钟 + WebSocket 关闭（不用插件时）+ 应用路径保持默认。
2. **高频切号**：自动刷新 2~5 分钟 + 需要联动时开启 WebSocket + 按需开启 OpenCode 联动。
3. **安全优先**：WebSocket 关闭 + 不共享用户数据目录 + 定期清理不再使用的账号与备份。

---

## 安装指南 (Installation)

本仓库打包与自动更新说明详见 [打包与更新说明](docs/fork-builds.md)。

### 正式发布包（GitHub Releases）

前往 [GitHub Releases](https://github.com/uchanges/codex-tools/releases) 下载对应系统的正式安装包（支持本仓库独立签名自动更新，不回退到上游源项目）：

- **Windows x64**：`.msi`（推荐）或 `-setup.exe`
- **Linux x64**：`.deb`（Debian/Ubuntu）或 `.AppImage`
- **macOS**：正式签名与公证包需发布流程配置 `APPLE_*` 证书与公证密钥；未配置时可使用下方预览包

### 开发预览包（Package main）

`main` 分支每次推送均会触发 GitHub Actions **Package main** 构建，可在对应运行详情页的 **Artifacts** 中下载（保留 14 天）：

- **Windows x64**：MSI / NSIS 安装包
- **macOS Apple Silicon**：`.dmg`
- **Linux x64**：`.deb` / `.AppImage`

> **Linux 系统要求说明**：Ubuntu 20.04 软件源缺少 `libwebkit2gtk-4.1-0` 且系统 glibc 为 2.31（当前 x64 AppImage 需要 glibc 2.34），无法直接安装 `.deb` 或运行 AppImage。建议使用 Ubuntu 24.04 LTS，源码编译请参见 [Ubuntu 24.04 编译指南](docs/build-wsl2-ubuntu24.md)。

### 常见问题排查 (Troubleshooting)

#### Windows：Codex 反复提示“Windows 设置未完成”？

若报错包含 `helper_sandbox_lock_failed` 且 `.sandbox-bin` 目录访问被拒绝，请参阅 [Codex Windows 沙箱临时恢复说明](docs/codex-windows-sandbox-recovery.md)。恢复工具默认只读，修复前会保留回滚备份。

#### macOS 提示“应用已损坏，无法打开”？

请确认安装包来源为本仓库的 [GitHub Releases](https://github.com/uchanges/codex-tools/releases)（需已配置签名与公证）或官方构建的 **Package main** Artifacts；未经过 Apple 签名与公证的本地构建或预览 DMG 可能会被系统 Gatekeeper 拦截。排查问题时请保留版本信息、芯片架构与完整提示内容。

---

## 开发与构建

### 前置要求

- Node.js v18+（CI 环境使用 Node 22）
- npm v9+
- Rust 工具链（Tauri 2 运行与构建环境）

### 常用命令

```bash
# 安装前端依赖
npm install

# 启动开发模式
npm run tauri dev

# 构建安装包
npm run tauri build

# 运行前端与 Rust 测试
npm test
npm run test:rust
```

### 命令行 (`cockpit-cli`)

可从源码运行内置 CLI 工具管理本地 Codex 账号，支持 `--json` 输出结构化结果：

```bash
cargo run --locked --package cockpit-cli -- list codex --json
cargo run --locked --package cockpit-cli -- switch codex "你的账号ID" --json
```

---

## 致谢

- 上游项目：[jlcodes99/cockpit-tools](https://github.com/jlcodes99/cockpit-tools)（本项目基于其源码定制）
- Antigravity 账号切号逻辑参考：[Antigravity-Manager](https://github.com/lbjlaq/Antigravity-Manager)
- Codex API 服务协议、Responses WebSocket 状态安全、canonical token accounting v2、Multi-Agent V2 兼容，以及账号池错误分类与状态恢复边界参考：[router-for-me/CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI)（MIT）
- 第三方供应商预设、模型映射与会话 JSONL 用量汇总方向参考：[CC Switch](https://github.com/farion1231/cc-switch)
- Codex 账号代理内核支持：[Mihomo](https://github.com/MetaCubeX/mihomo) 与 [sing-box](https://github.com/SagerNet/sing-box)（独立进程运行，内核由用户按需下载或导入，不内置于安装包）

感谢以上开源项目作者的贡献！

---

## 许可证

本项目遵循 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans) 许可协议（署名-非商业性使用-相同方式共享）。

- **允许**：个人学习、研究、非商业场景下的使用与修改（需保留署名并遵循同协议分享要求）。
- **不允许**：任何未获授权的商业使用（含企业内部商业目的、对外商业服务、付费产品集成、二次分发售卖等）。
- **商业授权**：如需商业使用，请联系原项目作者获取单独书面商业授权。

---

## 免责声明

本项目仅供个人学习和研究使用。使用本项目即表示您同意：

- 未获得书面商业授权前，不将本项目用于任何商业用途
- 自行承担使用本项目的所有风险和责任
- 遵守相关服务条款和法律法规

项目作者对因使用本项目而产生的任何直接或间接损失不承担责任。
