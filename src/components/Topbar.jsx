import { DesktopMenus } from "./DesktopMenus.jsx";
import { version as appVersion } from "../../package.json";
import { cancelVideoProxy, clearVideoProxyCache, getVideoProxyMode, getVideoProxyRecord, getVideoProxyRevision, subscribeVideoProxy, setVideoProxyMode } from "../lib/videoProxy.js";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowClockwise,
  BookOpen,
  Bug,
  CheckCircle,
  Copy,
  CornersOut,
  FrameCorners,
  Cursor,
  Gauge,
  Info,
  Keyboard,
  Link,
  LinkBreak,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  Scissors,
  SelectionAll,
  SpeakerHigh,
  StopCircle,
  Trash,
  ArrowsHorizontal,
  ArrowsInLineHorizontal,
  ArrowCounterClockwise,
  CaretDown,
  CircleNotch,
  Database,
  FileArrowDown,
  FileArrowUp,
  FilePlus,
  FilmSlate,
  FloppyDisk,
  FolderOpen,
  Images,
  MusicNotes,
  Package,
  GearSix,
  ListBullets,
  Pause,
  Play,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "@phosphor-icons/react";

import { RATIO_OPTIONS } from "../config/editor.js";
import { LocalProjectNameDialog } from "./LocalProjectNameDialog.jsx";
import { hostText } from "../i18nHost.js";
import { APP_LANGUAGES, saveLanguagePreference } from "../i18n.js";
import { loadCustomVocabularyText, saveCustomVocabularyText } from "../lib/customVocabulary.js";
import { PROJECT_TEMPLATES } from "../lib/projectTemplates.js";
import { AI_CHAT_PROMPT_TYPES, buildAiChatPrompt } from "../lib/aiChatPrompts.js";
import { EXPORT_QUEUE_PRESETS } from "../lib/exportQueue.js";
import { getPrimaryShortcutModifier, releasePointerActivatedFocus } from "../lib/editorShortcuts.js";
import { formatStorageBytes, inspectModelCache } from "../lib/modelCacheInspection.js";
import { ExportSettingsPanel } from "./ExportSettingsPanel.jsx";
import { IconButton, Popover } from "./ui.jsx";


export function Topbar({
  proxySource = "",
  proxyPlaybackSrc = "",
  desktopActions = {},
  hostService = null,
  completeProject = null,
  t,
  compactRail,
  setCompactRail,
  lastSaved,
  undo,
  redo,
  ratio,
  ratioId,
  showRatioMenu,
  setShowRatioMenu,
  setRatioId,
  notify,
  isPlaying,
  handlePlayToggle,
  imageSrc,
  exporting,
  handleExportVideo,
  showExportMenu,
  setShowExportMenu,
  exportSettings,
  setExportSettings,
  timelineDuration,
  showSettings,
  setShowSettings,
  activeLanguage,
  setUiLanguage,
  captionsEnabled,
  setCaptionsEnabled,
  trackVisibility,
  toggleTrackVisibility,
  showFileMenu,
  setShowFileMenu,
  handleNewProject,
  handleExportProject,
  handleImportProject,
  handleImportStoryboardText,
  handleImportStoryboardFile,
  handleApplyTemplate,
  exportQueue,
  exportQueueRunning,
  addExportQueueItem,
  removeExportQueueItem,
  clearExportQueue,
  runExportQueue,
  projectFileInputRef,
}) {
  useSyncExternalStore(subscribeVideoProxy, getVideoProxyRevision);
  const proxyMode = getVideoProxyMode();
  const proxyRecord = getVideoProxyRecord(proxySource);
  const proxyPending = ["queued", "preparing"].includes(proxyRecord?.state);
  const [showProxyCache, setShowProxyCache] = useState(false);
  const [clearingProxyCache, setClearingProxyCache] = useState(false);
  const proxyCacheAnchor = useRef(null);
  const [activeMenu, setActiveMenu] = useState("");
  const [shortcutRequest, setShortcutRequest] = useState(0);
  const fileAnchorRef = useRef(null);
  const fileKeyboardOpen = useRef(false);
  useLayoutEffect(() => {
    if (!showFileMenu || !fileKeyboardOpen.current) return;
    fileAnchorRef.current?.querySelector(".file-menu-action:not(:disabled)")?.focus();
    fileKeyboardOpen.current = false;
  }, [showFileMenu]);
  const shortcutGuideRef = useRef(null);
  const ht = (key) => hostText(activeLanguage, key);
  const [namingProject, setNamingProject] = useState(false);
  const exportAnchorRef = useRef(null);
  const ratioAnchorRef = useRef(null);
  const settingsAnchorRef = useRef(null);
  const modelCacheControlRef = useRef(null);
  const [modelCacheInspection, setModelCacheInspection] = useState({ state: "idle", result: null });
  const [showStoryboardDialog, setShowStoryboardDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showAiChatDialog, setShowAiChatDialog] = useState(false);
  const [showExportQueueDialog, setShowExportQueueDialog] = useState(false);
  const [exportQueuePreset, setExportQueuePreset] = useState("mp4-1080");
  const [aiChatType, setAiChatType] = useState("script");
  const [aiChatTopic, setAiChatTopic] = useState("");
  const [aiChatResult, setAiChatResult] = useState("");
  const [storyboardText, setStoryboardText] = useState("");
  const [storyboardSeconds, setStoryboardSeconds] = useState(10);
  const [customVocabText, setCustomVocabText] = useState(() => loadCustomVocabularyText());
  const storyboardFileInputRef = useRef(null);
  const shortcutModifier = getPrimaryShortcutModifier();
  const shortcutRows = [
    ["markersAdd", "M"],
    ["markersTitle", "Shift+M"],
    ["shortcutPlayPause", "Space"],
    ["shortcutSplit", `${shortcutModifier}+B`],
    ["shortcutDuplicate", `${shortcutModifier}+D`],
    ["shortcutDelete", "Delete / Backspace"],
    ["shortcutUndo", `${shortcutModifier}+Z`],
    ["shortcutRedo", `${shortcutModifier}+Shift+Z`],
    ["shortcutZoomOut", "−"],
    ["shortcutZoomIn", "+"],
    ["shortcutFitTimeline", "Shift+Z"],
    ["shortcutSelectLeft", "["],
    ["shortcutSelectRight", "]"],
  ];
  const checkModelCache = async () => {
    setModelCacheInspection({ state: "checking", result: null });
    try {
      const result = await inspectModelCache();
      setModelCacheInspection({ state: "ready", result });
    } catch {
      setModelCacheInspection({ state: "unavailable", result: null });
    }
  };
  const modelCacheResult = modelCacheInspection.result;
  const modelCacheSummary = modelCacheResult?.entryCount > 0
    ? t("modelCacheFound")
      .replace("{groups}", String(modelCacheResult.cacheCount))
      .replace("{files}", String(modelCacheResult.entryCount))
    : t("modelCacheEmpty");
  const modelCacheStorage = modelCacheResult?.usage != null
    ? t("modelCacheStorage")
      .replace("{usage}", formatStorageBytes(modelCacheResult.usage))
      .replace("{quota}", modelCacheResult.quota ? formatStorageBytes(modelCacheResult.quota) : "—")
    : "";
  useEffect(() => {
    if (!showSettings || modelCacheInspection.state === "idle") return undefined;
    const frame = window.requestAnimationFrame(() => {
      modelCacheControlRef.current?.scrollIntoView({ block: "nearest" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [modelCacheInspection.state, showSettings]);

  useLayoutEffect(() => {
    if (showProxyCache) document.querySelector(".proxy-cache-popover .popover-close")?.focus();
  }, [showProxyCache]);
  const closeProxyCache = () => {
    const containedFocus = document.querySelector(".proxy-cache-popover")?.contains(document.activeElement);
    setShowProxyCache(false);
    if (containedFocus) proxyCacheAnchor.current?.parentElement?.querySelector(".is-compact-view [data-editor-menu-trigger]")?.focus();
  };
  const closeDesktopMenu = () => setActiveMenu("");
  const openMenu = (id) => {
    setActiveMenu(id === "file" ? "" : id);
    setShowFileMenu(id === "file");
    setShowSettings(false); setShowRatioMenu(false); setShowExportMenu(false); setShowProxyCache(false);
  };
  const timelineCommand = command => window.dispatchEvent(new CustomEvent("editor-timeline-command", { detail: command }));
  const menuIcons = {
    undo: ArrowCounterClockwise, redo: ArrowClockwise, desktopDuplicate: Copy, desktopDelete: Trash,
    desktopSelectAll: SelectionAll, desktopSplit: Scissors, desktopTrim: ArrowsInLineHorizontal,
    desktopSlip: ArrowsHorizontal, desktopSlide: Cursor, desktopSpeed: Gauge, desktopSeparate: SpeakerHigh,
    desktopLink: Link, desktopUnlink: LinkBreak, desktopZoomIn: MagnifyingGlassPlus, desktopZoomOut: MagnifyingGlassMinus,
    desktopFit: FrameCorners, desktopFullscreen: CornersOut, proxyAuto: Gauge, proxyOriginal: FilmSlate,
    proxyCacheManage: Database, proxyCancel: StopCircle, desktopGuide: BookOpen, desktopShortcuts: Keyboard,
    desktopFeedback: Bug, desktopAbout: Info,
  };
  const item = (key, run, disabled = false, shortcut = "") => ({ key, run, disabled, shortcut, icon: menuIcons[key] });
  const proxySourceLabel = proxySource
    ? t("proxyUsing").replace("{source}", t(proxyPlaybackSrc && proxyPlaybackSrc !== proxySource ? "proxyVideo" : "proxyOriginal"))
    : t("proxyNoVideo");
  const menus = [
    { id: "edit", label: t("desktopEdit"), items: [
      item("undo", undo, false, `${shortcutModifier}+Z`), item("redo", redo, false, `${shortcutModifier}+Shift+Z`), null,
      item("desktopDuplicate", desktopActions.duplicate, !desktopActions.hasSelection || desktopActions.selectionLocked, `${shortcutModifier}+D`),
      item("desktopDelete", desktopActions.delete, !desktopActions.hasSelection || desktopActions.selectionLocked, "Delete"),
      item("desktopSelectAll", () => timelineCommand("select-all"), !desktopActions.hasClips),
    ] },
    { id: "clip", label: t("desktopClip"), items: [
      item("desktopSplit", desktopActions.split, !desktopActions.canSplit, `${shortcutModifier}+B`),
      item("desktopTrim", () => timelineCommand("trim"), !desktopActions.canMainEdit),
      item("desktopSlip", () => timelineCommand("slip"), !desktopActions.canMainEdit),
      item("desktopSlide", () => timelineCommand("slide"), !desktopActions.canMainEdit),
      item("desktopSpeed", desktopActions.speed, !desktopActions.canSpeedEdit), null,
      item("desktopSeparate", () => timelineCommand("separate-audio"), !desktopActions.canVideoEdit), null,
      item("desktopLink", () => timelineCommand("link-captions"), !desktopActions.canLink),
      item("desktopUnlink", () => timelineCommand("unlink-captions"), !desktopActions.canUnlink),
    ] },
    { id: "view", label: t("desktopView"), items: [
      { key: "desktopTimelineGroup", kind: "heading" },
      item("desktopZoomIn", () => timelineCommand("zoom-in"), false, "+"),
      item("desktopZoomOut", () => timelineCommand("zoom-out"), false, "−"),
      item("desktopFit", () => timelineCommand("zoom-fit"), false, "Shift+Z"), null,
      { key: "proxyMode", kind: "heading" },
      { ...item("proxyAuto", () => setVideoProxyMode("auto")), checked: proxyMode === "auto" },
      { ...item("proxyOriginal", () => setVideoProxyMode("original")), checked: proxyMode === "original" },
      { key: "proxyStatus", kind: "status", spinning: proxyPending, icon: proxyPending ? CircleNotch : CheckCircle, text: proxySourceLabel,
        detail: proxyPending ? `${t("proxyPreparing")} ${Math.round((proxyRecord.progress || 0) * 100)}%` : proxySource && proxyRecord?.state === "ready" ? t("proxyReady") : "" },
      ...(proxyPending ? [item("proxyCancel", () => cancelVideoProxy(proxySource))] : []), null,
      item("proxyCacheManage", () => setShowProxyCache(true)),
      item("desktopFullscreen", () => window.dispatchEvent(new CustomEvent("editor-preview-command", { detail: "fullscreen" })), !imageSrc),
      { key: "proxyExportHint", kind: "note" },
    ] },
    { id: "help", label: t("desktopHelp"), items: [
      { key: "desktopGuide", icon: BookOpen, href: "/how-it-works/", external: true },
      item("desktopShortcuts", () => { setShowSettings(true); setShortcutRequest(value => value + 1); }),
      { key: "desktopAbout", icon: Info, href: "/features/", external: true },
    ] },
  ];
  useEffect(() => {
    if (!showSettings || !shortcutRequest) return;
    const frame = requestAnimationFrame(() => { shortcutGuideRef.current?.scrollIntoView({ block: "nearest" }); shortcutGuideRef.current?.focus(); setShortcutRequest(0); });
    return () => cancelAnimationFrame(frame);
  }, [showSettings, shortcutRequest]);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1280px)");
    const resized = () => { if (!query.matches) setActiveMenu(""); };
    query.addEventListener("change", resized);
    return () => query.removeEventListener("change", resized);
  }, []);

  return (
    <header className="topbar">
      {namingProject && completeProject ? <LocalProjectNameDialog language={activeLanguage}
        onClose={() => setNamingProject(false)} onSave={name => { setNamingProject(false); void completeProject.save(name); }} /> : null}
      <div className="project-cluster">
        <IconButton label={t("collapseSidebar")} active={compactRail} onClick={() => setCompactRail((v) => !v)}>
          <SlidersHorizontal size={19} />
        </IconButton>
        <div>
          <div className="project-title-row">
            <div className="project-title" title={completeProject?.name || t("projectTitle")}>{completeProject?.name || t("projectTitle")}</div>
            <nav className="editor-main-menu" role="menubar" aria-label={t("desktopMenuBar")} onKeyDown={event => {
              if (event.defaultPrevented) return;
              if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
              const triggers = [...event.currentTarget.querySelectorAll("[data-editor-menu-trigger]")].filter(node => node.getClientRects().length);
              const focusedTrigger = document.activeElement?.closest?.(".menu-anchor")?.querySelector("[data-editor-menu-trigger]") || document.activeElement;
              const index = triggers.indexOf(focusedTrigger);
              if (index < 0) return;
              event.preventDefault();
              const next = triggers[event.key === "Home" ? 0 : event.key === "End" ? triggers.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + triggers.length) % triggers.length];
              next?.focus();
              if ((activeMenu || showFileMenu) && next !== focusedTrigger) { if (next === fileAnchorRef.current?.querySelector("[data-editor-menu-trigger]")) openMenu("file"); else next?.click(); }
            }}>
            <div className="menu-anchor" ref={fileAnchorRef}>
              <button className="project-file-button" type="button" role="menuitem" data-editor-menu-trigger aria-haspopup="menu" aria-expanded={showFileMenu}
                onKeyDown={event => { if (event.key === "ArrowDown") { event.preventDefault(); if (showFileMenu) fileAnchorRef.current?.querySelector(".file-menu-action:not(:disabled)")?.focus(); else { fileKeyboardOpen.current = true; openMenu("file"); } } }}
                onClick={() => { fileKeyboardOpen.current = false; if (showFileMenu) setShowFileMenu(false); else openMenu("file"); }}>
                <span>{t("fileMenu")}</span><CaretDown size={12} weight="bold" aria-hidden="true" />
              </button>
              {showFileMenu ? (
                <Popover anchorRef={fileAnchorRef} className="project-file-popover" closeLabel={t("close")} onClose={() => setShowFileMenu(false)}>
                  <div className="file-menu-card" role="menu" aria-label={t("fileMenu")} onKeyDown={event => {
                    const items = [...event.currentTarget.querySelectorAll('button:not(:disabled), a[href]')];
                    const index = items.indexOf(document.activeElement);
                    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
                      event.preventDefault();
                      items[event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
                    } else if (event.key === "Escape") { setShowFileMenu(false); fileAnchorRef.current?.querySelector("[data-editor-menu-trigger]")?.focus(); }
                    else if (event.key === "Tab") setShowFileMenu(false);
                  }}>
                    <div className="file-menu-heading">
                      <span>{t("projectMenuHeading")}</span>
                      <small>Timeline Studio · v{appVersion}</small>
                    </div>
                    <button role="menuitem" className="file-menu-action file-menu-new" type="button" onClick={() => { setShowFileMenu(false); handleNewProject(); }}>
                      <span className="file-menu-icon"><FilePlus size={17} /></span>
                      <span className="file-menu-copy"><strong>{t("newProject")}</strong><small>{t("newProjectHint")}</small></span>
                    </button>
                    <div className="file-menu-divider" />
                    {completeProject ? <button role="menuitem" className="file-menu-action" type="button"
                      disabled={completeProject.status === "preparing" || completeProject.status === "saving"}
                      onClick={() => { setShowFileMenu(false); void completeProject.open(); }}>
                      <span className="file-menu-icon"><FileArrowUp size={17} /></span>
                      <span className="file-menu-copy"><strong>{ht("open")}</strong></span>
                    </button> : null}
                    {completeProject ? <button role="menuitem" className="file-menu-action" type="button"
                      disabled={completeProject.status === "preparing" || completeProject.status === "saving"}
                      onClick={() => { setShowFileMenu(false); if (completeProject.projectId) void completeProject.save(); else setNamingProject(true); }}>
                      <span className="file-menu-icon"><FloppyDisk size={17} /></span>
                      <span className="file-menu-copy"><strong>{completeProject.projectId && completeProject.status === "error" ? ht("retry") : ht("save")}</strong></span>
                    </button> : null}
                    {completeProject?.name ? <button role="menuitem" className="file-menu-action" type="button"
                      disabled={!completeProject.canClose()}
                      onClick={() => { setShowFileMenu(false); void completeProject.closeProject(); }}>
                      <span className="file-menu-icon"><X size={17} /></span>
                      <span className="file-menu-copy"><strong>{ht("close")}</strong></span>
                    </button> : null}
                    <button role="menuitem" className="file-menu-action" type="button" onClick={() => handleImportProject()}>
                      <span className="file-menu-icon"><FolderOpen size={17} /></span>
                      <span className="file-menu-copy"><strong>{t("importProject")}</strong><small>{t("importProjectHint")}</small></span>
                      <span className="file-menu-format">.timeline</span>
                    </button>
                    <button role="menuitem" className="file-menu-action is-primary" type="button" onClick={handleExportProject}>
                      <span className="file-menu-icon"><Package size={17} /></span>
                      <span className="file-menu-copy"><strong>{t("exportProject")}</strong><small>{t("exportProjectHint")}</small></span>
                      <span className="file-menu-format">.timeline</span>
                    </button>
                    <div className="desktop-file-actions">
                      <div className="file-menu-divider" />
                      <button role="menuitem" className="file-menu-action" type="button" onClick={() => { setShowFileMenu(false); desktopActions.importMedia?.(); }}><span className="file-menu-icon"><Images size={17} /></span><span className="file-menu-copy"><strong>{t("desktopImportMedia")}</strong></span></button>
                      <button role="menuitem" className="file-menu-action" type="button" disabled={!imageSrc || exporting} onClick={() => { setShowFileMenu(false); setShowExportMenu(true); }}><span className="file-menu-icon"><FilmSlate size={17} /></span><span className="file-menu-copy"><strong>{t("exportVideo")}</strong></span></button>
                    </div>
                    <div className="file-menu-divider" />
                    <button className="file-menu-action" type="button" onClick={() => { setShowFileMenu(false); setShowStoryboardDialog(true); }}>
                      <span className="file-menu-icon"><ListBullets size={17} /></span>
                      <span className="file-menu-copy"><strong>{t("importStoryboardScript", "Nhập kịch bản storyboard")}</strong><small>{t("importStoryboardScriptHint", "Dán thoại, 1 dòng = 1 cảnh")}</small></span>
                    </button>
                    <button className="file-menu-action" type="button" onClick={() => { setShowFileMenu(false); setShowTemplateDialog(true); }}>
                      <span className="file-menu-icon"><ListBullets size={17} /></span>
                      <span className="file-menu-copy"><strong>{t("projectTemplates", "Mẫu dựng sẵn")}</strong><small>{t("projectTemplatesHint", "Short, video dài, video bán hàng")}</small></span>
                    </button>
                    <button className="file-menu-action" type="button" onClick={() => { setShowFileMenu(false); setShowAiChatDialog(true); }}>
                      <span className="file-menu-icon"><ListBullets size={17} /></span>
                      <span className="file-menu-copy"><strong>{t("aiChat", "Chat AI — Viết kịch bản")}</strong><small>{t("aiChatHint", "Copy prompt sang chat của AD, dán kết quả lại")}</small></span>
                    </button>
                    <button className="file-menu-action" type="button" onClick={() => { setShowFileMenu(false); setShowExportQueueDialog(true); }}>
                      <span className="file-menu-icon"><FileArrowDown size={17} /></span>
                      <span className="file-menu-copy"><strong>{t("exportQueue", "Hàng đợi xuất")}</strong><small>{t("exportQueueHint", "Xếp nhiều lệnh xuất, xuất 1 lượt")}</small></span>
                    </button>
                    <div className="file-menu-divider" />
                    <button className="file-menu-action" type="button" onClick={() => { setShowFileMenu(false); storyboardFileInputRef.current?.click(); }}>
                      <span className="file-menu-icon"><FileArrowUp size={17} /></span>
                      <span className="file-menu-copy"><strong>{t("importStoryboardFile", "Nhập file JSON storyboard")}</strong><small>{t("importStoryboardFileHint", "File project JSON của web storyboard")}</small></span>
                      <span className="file-menu-format">.json</span>
                    </button>
                    <div className="file-menu-divider" />
                    <nav className="file-menu-resources" aria-label={t("resourceLinks")}>
                      <a href="/features/">{t("resourceFeatures")}</a>
                      <a href="/how-it-works/">{t("resourceGuide")}</a>
                      <a href="/faq/">{t("resourceFaq")}</a>
                      <a href="/privacy/">{t("resourcePrivacy")}</a>
                    </nav>
                  </div>
                </Popover>
              ) : null}
              <input ref={projectFileInputRef} className="project-file-input" type="file" accept="application/zip,.timeline" onChange={(event) => event.target.files?.[0] && handleImportProject(event.target.files[0])} />
              <input ref={storyboardFileInputRef} className="project-file-input" type="file" accept=".json,application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) handleImportStoryboardFile(file); event.target.value = ""; }} />
              {showExportQueueDialog ? (
                <Popover className="project-file-popover storyboard-import-popover" closeLabel={t("close")} onClose={() => setShowExportQueueDialog(false)}>
                  <div className="file-menu-card">
                    <div className="file-menu-heading">
                      <span>{t("exportQueue", "Hàng đợi xuất")}</span>
                    </div>
                    <p><small>{t("exportQueueHelp", "Hàng đợi chỉ xuất timeline hiện tại, mỗi lệnh đổi 1 kiểu xuất. Muốn xuất project khác: mở project đó rồi xuất.")}</small></p>
                    <label>
                      <span>{t("exportQueuePreset", "Kiểu xuất")}</span>
                      <select value={exportQueuePreset} onChange={(event) => setExportQueuePreset(event.target.value)}>
                        {EXPORT_QUEUE_PRESETS.map((preset) => (
                          <option value={preset.id} key={preset.id}>{preset.name}</option>
                        ))}
                      </select>
                    </label>
                    <button
                      className="file-menu-action"
                      type="button"
                      onClick={() => addExportQueueItem(exportQueuePreset)}
                    >
                      <span className="file-menu-copy"><strong>{t("exportQueueAdd", "Thêm vào hàng đợi")}</strong></span>
                    </button>
                    {exportQueue.length === 0 ? (
                      <p><small>{t("exportQueueEmpty", "Hàng đợi trống.")}</small></p>
                    ) : (
                      <div className="export-queue-list">
                        {exportQueue.map((item, index) => (
                          <div className="export-queue-item" key={item.id}>
                            <span>{index + 1}. {item.name}</span>
                            <span>{item.status === "queued" ? t("exportQueueQueued", "Chờ") : item.status === "running" ? t("exportQueueRunning", "Đang xuất…") : item.status === "done" ? t("exportQueueDone", "Xong") : t("exportQueueError", "Lỗi")}</span>
                            <button type="button" disabled={exportQueueRunning} onClick={() => removeExportQueueItem(item.id)}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      className="file-menu-action is-primary"
                      type="button"
                      disabled={exportQueueRunning || exportQueue.length === 0}
                      onClick={() => { void runExportQueue(); }}
                    >
                      <span className="file-menu-copy"><strong>{exportQueueRunning ? t("exportQueueRunning", "Đang xuất…") : t("exportQueueRun", "Xuất tất cả")}</strong></span>
                    </button>
                    <button
                      className="file-menu-action"
                      type="button"
                      disabled={exportQueueRunning || exportQueue.length === 0}
                      onClick={() => clearExportQueue()}
                    >
                      <span className="file-menu-copy"><strong>{t("exportQueueClear", "Xóa hàng đợi")}</strong></span>
                    </button>
                  </div>
                </Popover>
              ) : null}
              {showAiChatDialog ? (
                <Popover className="project-file-popover storyboard-import-popover" closeLabel={t("close")} onClose={() => setShowAiChatDialog(false)}>
                  <div className="file-menu-card">
                    <div className="file-menu-heading">
                      <span>{t("aiChat", "Chat AI — Viết kịch bản")}</span>
                    </div>
                    <p><small>{t("aiChatPrivacy", "App không gửi dữ liệu cho AI. AD copy prompt bên dưới sang chat của AD, rồi dán kết quả vào ô cuối.")}</small></p>
                    <label>
                      <span>{t("aiChatType", "Loại nội dung")}</span>
                      <select value={aiChatType} onChange={(event) => setAiChatType(event.target.value)}>
                        {AI_CHAT_PROMPT_TYPES.map((type) => (
                          <option value={type.id} key={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>{t("aiChatTopic", "Chủ đề / sản phẩm")}</span>
                      <input
                        type="text"
                        value={aiChatTopic}
                        onChange={(event) => setAiChatTopic(event.target.value)}
                        placeholder={t("aiChatTopicPlaceholder", "Ví dụ: Mousse 377+ INVANNCHY")}
                      />
                    </label>
                    <label>
                      <span>{t("aiChatPrompt", "Prompt để copy sang chat")}</span>
                      <textarea
                        className="storyboard-import-textarea"
                        rows={4}
                        readOnly
                        value={buildAiChatPrompt(aiChatType, aiChatTopic)}
                      />
                    </label>
                    <button
                      className="file-menu-action"
                      type="button"
                      onClick={async () => {
                        const prompt = buildAiChatPrompt(aiChatType, aiChatTopic);
                        try {
                          if (navigator.clipboard?.writeText) {
                            await navigator.clipboard.writeText(prompt);
                            notify(t("aiChatCopied", "Đã copy prompt."));
                          } else {
                            throw new Error("no-clipboard");
                          }
                        } catch {
                          notify(t("aiChatCopyFailed", "Không copy được. Hãy bôi đen prompt và bấm Ctrl+C."));
                        }
                      }}
                    >
                      <span className="file-menu-copy"><strong>{t("aiChatCopy", "Copy prompt")}</strong></span>
                    </button>
                    <label>
                      <span>{t("aiChatResult", "Dán kết quả từ chat")}</span>
                      <textarea
                        className="storyboard-import-textarea"
                        rows={6}
                        value={aiChatResult}
                        onChange={(event) => setAiChatResult(event.target.value)}
                        placeholder={t("aiChatResultPlaceholder", "Dán kịch bản chat trả về, mỗi dòng 1 đoạn...")}
                      />
                    </label>
                    <button
                      className="file-menu-action is-primary"
                      type="button"
                      onClick={() => { handleImportStoryboardText(aiChatResult, 10); setShowAiChatDialog(false); setAiChatResult(""); }}
                    >
                      <span className="file-menu-copy"><strong>{t("aiChatApply", "Áp dụng làm kịch bản")}</strong></span>
                    </button>
                  </div>
                </Popover>
              ) : null}
              {showTemplateDialog ? (
                <Popover className="project-file-popover storyboard-import-popover" closeLabel={t("close")} onClose={() => setShowTemplateDialog(false)}>
                  <div className="file-menu-card">
                    <div className="file-menu-heading">
                      <span>{t("projectTemplates", "Mẫu dựng sẵn")}</span>
                    </div>
                    <p><small>{t("projectTemplatesHelp", "Chọn 1 mẫu để tạo kịch bản mẫu. Hãy thay [..] bằng nội dung thật của AD trước khi xuất.")}</small></p>
                    {PROJECT_TEMPLATES.map((template) => (
                      <button
                        className="file-menu-action"
                        type="button"
                        key={template.id}
                        onClick={() => { handleApplyTemplate(template.id); setShowTemplateDialog(false); }}
                      >
                        <span className="file-menu-copy"><strong>{template.name}</strong><small>{template.hint}</small></span>
                      </button>
                    ))}
                  </div>
                </Popover>
              ) : null}
              {showStoryboardDialog ? (
                <Popover className="project-file-popover storyboard-import-popover" closeLabel={t("close")} onClose={() => setShowStoryboardDialog(false)}>
                  <div className="file-menu-card">
                    <div className="file-menu-heading">
                      <span>{t("importStoryboardScript", "Nhập kịch bản storyboard")}</span>
                    </div>
                    <p><small>{t("importStoryboardScriptHelp", "Dán thoại, mỗi dòng là 1 cảnh. Nhập xong sẽ thay thế kịch bản và phụ đề hiện tại (có hỏi xác nhận).")}</small></p>
                    <textarea
                      className="storyboard-import-textarea"
                      rows={8}
                      value={storyboardText}
                      onChange={(event) => setStoryboardText(event.target.value)}
                      placeholder={t("importStoryboardScriptPlaceholder", "Ví dụ:\nBạn muốn làn da sạch thoáng?\nHãy thử ngay Mousse 377+...")}
                    />
                    <label>
                      <span>{t("importStoryboardSceneSeconds", "Thời lượng mỗi cảnh")}</span>
                      <select value={storyboardSeconds} onChange={(event) => setStoryboardSeconds(Number(event.target.value))}>
                        <option value={5}>5 giây</option>
                        <option value={10}>10 giây</option>
                        <option value={20}>20 giây</option>
                      </select>
                    </label>
                    <button
                      className="file-menu-action is-primary"
                      type="button"
                      onClick={() => { handleImportStoryboardText(storyboardText, storyboardSeconds); setShowStoryboardDialog(false); setStoryboardText(""); }}
                    >
                      <span className="file-menu-copy"><strong>{t("importStoryboardConfirm", "Nhập storyboard")}</strong></span>
                    </button>
                  </div>
                </Popover>
              ) : null}
            </div>
            <DesktopMenus menus={menus} activeMenu={activeMenu} onOpen={openMenu} onClose={closeDesktopMenu} t={t} />
              <div className="menu-anchor" ref={proxyCacheAnchor}>
                {showProxyCache ? <Popover portal anchorRef={proxyCacheAnchor} className="proxy-cache-popover" closeLabel={t("close")} onClose={closeProxyCache}>
                  <section className="proxy-cache-panel" aria-label={t("proxyCacheManage")}>
                    <h3><Database size={18} />{t("proxyCacheManage")}</h3>
                    <p>{t("proxyCacheDescription")}</p>
                    <button type="button" className="panel-secondary" disabled={clearingProxyCache} onClick={async () => {
                      setClearingProxyCache(true);
                      try { await clearVideoProxyCache(); closeProxyCache(); }
                      finally { setClearingProxyCache(false); }
                    }}>{clearingProxyCache ? <CircleNotch size={16} className="is-spinning" /> : <Trash size={16} />}{t("proxyClear")}</button>
                  </section>
                </Popover> : null}
              </div>
            </nav>
          </div>
          <div className="autosave" title={completeProject?.error || undefined} role={completeProject ? "status" : undefined}>
            <ShieldCheck size={13} weight="fill" />
            {completeProject ? completeProject.error || (completeProject.status === "opened" ? ht("opened") : completeProject.status === "dirty" ? ht("dirty") : completeProject.status === "preparing" ? ht("preparing") : completeProject.status === "saving"
              ? ht("saving") : completeProject.lastSaved ? `${completeProject.name} · ${ht("saved")} ${new Date(completeProject.lastSaved).toLocaleTimeString()}` : ht("unsaved"))
              : <>{t("autosave")} · {lastSaved}</>}
          </div>
        </div>
      </div>

      <div className="topbar-center">
        <button className="ghost-action" type="button" title={`${t("undo")} · ${shortcutModifier}+Z`} onClick={(event) => { undo(); releasePointerActivatedFocus(event); }}>
          <ArrowCounterClockwise size={16} />
          {t("undo")}
        </button>
        <button className="ghost-action" type="button" title={`${t("redo")} · ${shortcutModifier}+Shift+Z`} onClick={(event) => { redo(); releasePointerActivatedFocus(event); }}>
          <ArrowClockwise size={16} />
          {t("redo")}
        </button>
        <span className="divider" />
        <div className="menu-anchor" ref={ratioAnchorRef}>
          <button
            className="ratio-select"
            type="button"
            onClick={() => setShowRatioMenu((open) => !open)}
          >
            {ratio.label} <CaretDown size={14} />
          </button>
          {showRatioMenu ? (
            <Popover anchorRef={ratioAnchorRef} closeLabel={t("close")} showClose={false} onClose={() => setShowRatioMenu(false)}>
              <div className="menu-list">
                {RATIO_OPTIONS.map((option) => (
                  <button
                    type="button"
                    className={option.id === ratioId ? "is-selected" : ""}
                    key={option.id}
                    onClick={() => {
                      setRatioId(option.id);
                      setShowRatioMenu(false);
                      notify(`画布比例已切换为 ${option.label}`);
                    }}
                  >
                    {option.label}
                    <span>
                      {option.width} x {option.height}
                    </span>
                  </button>
                ))}
              </div>
            </Popover>
          ) : null}
        </div>
      </div>

      <div className="topbar-actions">
        {hostService}

        <button className="preview-button" type="button" title={`${t("shortcutPlayPause")} · Space`} onClick={(event) => { handlePlayToggle(); releasePointerActivatedFocus(event); }}>
          {isPlaying ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
          <span>{t("preview")}</span>
        </button>
        <div className="menu-anchor" ref={exportAnchorRef}>
          <button
            className="export-button"
            type="button"
            aria-expanded={showExportMenu}
            disabled={exporting}
            onClick={() => setShowExportMenu((open) => !open)}
          >
            {exportSettings.mediaType === "audio" ? <MusicNotes size={17} weight="bold" /> : <FilmSlate size={17} weight="bold" />}
            <span className="export-button-label">{exporting ? t("exporting") : t(exportSettings.mediaType === "audio" ? "audioExportTitle" : "exportVideo")}</span>
            {!exporting ? <CaretDown size={13} weight="bold" /> : null}
          </button>
          {showExportMenu ? (
            <Popover anchorRef={exportAnchorRef} className="export-settings-popover" closeLabel={t("close")} onClose={() => setShowExportMenu(false)}>
              <ExportSettingsPanel
                t={t}
                ratio={ratio}
                imageSrc={imageSrc}
                timelineDuration={timelineDuration}
                exportSettings={exportSettings}
                setExportSettings={setExportSettings}
                handleExportVideo={handleExportVideo}
                onClose={() => setShowExportMenu(false)}
              />
            </Popover>
          ) : null}
        </div>
        <div className="menu-anchor" ref={settingsAnchorRef}>
          <IconButton label={t("settings")} active={showSettings} onClick={() => setShowSettings((open) => !open)}>
            <GearSix size={19} />
          </IconButton>
          {showSettings ? (
            <Popover anchorRef={settingsAnchorRef} closeLabel={t("close")} onClose={() => setShowSettings(false)}>
              <div className="settings-panel">
                <strong>{t("exportSettings")}</strong>
                <label>
                  <span>{t("language")}</span>
                  <select
                    value={activeLanguage}
                    onChange={(event) => {
                      const nextLanguage = event.target.value;
                      saveLanguagePreference(nextLanguage);
                      setUiLanguage(nextLanguage);
                    }}
                  >
                    {APP_LANGUAGES.map((language) => (
                      <option value={language.id} key={language.id}>
                        {language.nativeName}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{t("customVocab", "Từ riêng cho phụ đề")}</span>
                  <textarea
                    className="custom-vocab-textarea"
                    rows={4}
                    value={customVocabText}
                    onChange={(event) => { setCustomVocabText(event.target.value); saveCustomVocabularyText(event.target.value); }}
                    placeholder={t("customVocabPlaceholder", "Mỗi dòng 1 quy tắc: sai -> đúng\nVí dụ:\nin van chi -> INVANNCHY")}
                  />
                  <small>{t("customVocabHelp", "Chỉ sửa phụ đề tự động tạo ra, không sửa phụ đề nhập tay.")}</small>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={captionsEnabled}
                    onChange={(event) => setCaptionsEnabled(event.target.checked)}
                  />
                  {t("exportCaptions")}
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={trackVisibility.audio}
                    onChange={() => toggleTrackVisibility("audio")}
                  />
                  {t("enableAudioTrack")}
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={trackVisibility.source}
                    onChange={() => toggleTrackVisibility("source")}
                  />
                  {t("enableSourceTrack")}
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={trackVisibility.music}
                    onChange={() => toggleTrackVisibility("music")}
                  />
                  {t("enableMusicTrack")}
                </label>
                <section ref={shortcutGuideRef} tabIndex={-1} className="shortcut-guide" aria-labelledby="shortcut-guide-title">
                  <div className="shortcut-guide-heading">
                    <strong id="shortcut-guide-title">{t("keyboardShortcuts")}</strong>
                    <span>Timeline Studio</span>
                  </div>
                  <p>{t("keyboardShortcutsHint")}</p>
                  <dl>
                    {shortcutRows.map(([labelKey, shortcut]) => (
                      <div key={labelKey}>
                        <dt>{t(labelKey)}</dt>
                        <dd><kbd>{shortcut}</kbd></dd>
                      </div>
                    ))}
                  </dl>
                </section>
                <div ref={modelCacheControlRef} className="model-cache-control">
                  {modelCacheInspection.state !== "idle" ? (
                    <div className={`model-cache-result is-${modelCacheInspection.state}`} role="status" aria-live="polite">
                      <strong>{modelCacheInspection.state === "checking"
                        ? t("modelCacheChecking")
                        : modelCacheInspection.state === "unavailable"
                          ? t("modelCacheUnavailable")
                          : modelCacheSummary}</strong>
                      {modelCacheInspection.state === "ready" && modelCacheStorage ? <span>{modelCacheStorage}</span> : null}
                    </div>
                  ) : null}
                  <button type="button" disabled={modelCacheInspection.state === "checking"} onClick={checkModelCache}>
                    <span>{modelCacheInspection.state === "checking" ? t("modelCacheChecking") : t("checkModelCache")}</span>
                    {modelCacheInspection.state === "checking" ? <CircleNotch className="is-spinning" size={15} /> : <Database size={15} />}
                  </button>
                </div>
              </div>
            </Popover>
          ) : null}
        </div>
      </div>
    </header>
  );
}
