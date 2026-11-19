# codex tools 打包与更新

本仓库 `uchanges/codex-tools` 使用两条独立的 GitHub Actions 流程：

- **常规推送**：`main` 的每次推送触发 **Package main**。安装包在运行详情的 **Artifacts** 中下载，保留 14 天。支持 Windows x64（MSI/NSIS）、macOS Apple Silicon（DMG）和 Linux x64（DEB/AppImage）。预览包不会发布到 Releases，也不会进入内置更新通道。
- **正式发布**：按项目发布流程同步应用版本、更新日志，再推送与应用版本一致的 `vX.Y.Z` 标签。工作流先生成草稿，构建并验证通过后再发布，Windows 和 Linux 会生成经过 Tauri 更新签名的安装包。macOS 的正式包需要配置发布工作流中的 `APPLE_*` 证书与公证密钥；未配置时只提供 macOS 预览包。

内置更新只从本仓库最新正式发布的 `latest-<target>.json` 或 `latest.json` 查找更新，并校验本仓库独立的签名公钥，不回退到源项目。私钥和密码分别保存在仓库 Actions secrets 的 `TAURI_SIGNING_PRIVATE_KEY` 和 `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`，切勿提交到 Git。源项目的旧客户端不会自动切换，首次迁移请手动安装本仓库的版本。
