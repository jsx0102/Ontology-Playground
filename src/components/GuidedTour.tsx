import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';

interface TourStep {
  target: string;        // CSS selector for the element to spotlight
  title: string;
  description: string;
  placement: 'bottom' | 'top' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: '.header',
    title: '导航与操作',
    description: '使用顶部工具栏访问本体目录、设计器、学习文章、导入/导出等功能。随时按 ⌘K 打开命令面板。',
    placement: 'bottom',
  },
  {
    target: '.graph-container',
    title: '本体关系图',
    description: '这是以交互式关系图呈现的本体。点击实体节点或关系连线即可查看详情。',
    placement: 'bottom',
  },
  {
    target: '.quest-panel',
    title: '任务',
    description: '完成引导式任务，逐步学习本体概念，沿途赢取徽章和积分！',
    placement: 'right',
  },
  {
    target: '.right-sidebar',
    title: '检查器与查询',
    description: '选中一个实体即可查看其属性和数据绑定。使用底部的查询栏用自然语言提问。',
    placement: 'left',
  },
  {
    target: '.header-actions [data-tooltip="设计器"]',
    title: '本体设计器',
    description: '从零构建自己的本体，或从模板开始。可导出为 RDF，或提交到社区本体目录。',
    placement: 'bottom',
  },
];

const STORAGE_KEY = 'ontology-quest-tour-dismissed';

interface GuidedTourProps {
  /** Called when the tour is fully dismissed (skip/finish) */
  onComplete: () => void;
}

/** Check if a DOM element is visible (has non-zero dimensions) */
function isElementVisible(selector: string): boolean {
  const el = document.querySelector(selector);
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

export function GuidedTour({ onComplete }: GuidedTourProps) {
  const [visibleSteps, setVisibleSteps] = useState<TourStep[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const dismiss = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch { /* noop */ }
    onComplete();
  }, [onComplete]);

  // Filter steps to only those whose target element is visible.
  // On mobile (≤900px), panels like .quest-panel and .right-sidebar are
  // display:none, so they get filtered out. If no steps are visible
  // (e.g. very small screen), auto-dismiss the tour.
  useEffect(() => {
    const visible = tourSteps.filter(s => isElementVisible(s.target));
    if (visible.length === 0) {
      dismiss();
      return;
    }
    setVisibleSteps(visible);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const current = visibleSteps[stepIdx];

  // Measure the target element
  const measure = useCallback(() => {
    if (!current) return;
    const el = document.querySelector(current.target);
    if (el) {
      setRect(el.getBoundingClientRect());
    }
  }, [current]);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [measure]);

  const next = () => {
    if (stepIdx < visibleSteps.length - 1) {
      setStepIdx(s => s + 1);
    } else {
      dismiss();
    }
  };

  const prev = () => {
    if (stepIdx > 0) setStepIdx(s => s - 1);
  };

  // Nothing to show yet (steps still being filtered, or will auto-dismiss)
  if (!current) return null;

  // Compute tooltip position, clamped within the viewport
  const tooltipStyle = (): React.CSSProperties => {
    if (!rect) return { opacity: 0 };
    const pad = 16;
    const margin = 12; // minimum distance from viewport edges
    const base: React.CSSProperties = { position: 'fixed' };

    const clampLeft = (left: number, maxW: number) =>
      Math.max(margin, Math.min(left, window.innerWidth - maxW - margin));

    const clampTop = (top: number) =>
      Math.max(margin, Math.min(top, window.innerHeight - 200));

    switch (current.placement) {
      case 'bottom': {
        const maxW = Math.min(360, rect.width);
        return { ...base, top: clampTop(rect.bottom + pad), left: clampLeft(rect.left, maxW), maxWidth: maxW };
      }
      case 'top': {
        const maxW = Math.min(360, rect.width);
        const top = rect.top - pad - 200; // estimate ~200px tooltip height
        return { ...base, top: Math.max(margin, top), left: clampLeft(rect.left, maxW), maxWidth: maxW };
      }
      case 'right':
        return { ...base, top: clampTop(rect.top), left: Math.min(rect.right + pad, window.innerWidth - 320 - margin), maxWidth: 320 };
      case 'left':
        return { ...base, top: clampTop(rect.top), right: Math.max(margin, window.innerWidth - rect.left + pad), maxWidth: 320 };
    }
  };

  // Spotlight clip-path: full viewport with a rectangular hole
  const clipPath = rect
    ? `polygon(
        0% 0%, 0% 100%, ${rect.left}px 100%, ${rect.left}px ${rect.top}px,
        ${rect.right}px ${rect.top}px, ${rect.right}px ${rect.bottom}px,
        ${rect.left}px ${rect.bottom}px, ${rect.left}px 100%, 100% 100%, 100% 0%
      )`
    : undefined;

  return (
    <AnimatePresence>
      <motion.div
        className="tour-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ clipPath }}
      />
      <motion.div
        className="tour-tooltip"
        key={stepIdx}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        style={tooltipStyle()}
      >
        <div className="tour-tooltip-header">
          <span className="tour-tooltip-step">{stepIdx + 1}/{visibleSteps.length}</span>
          <button className="tour-tooltip-close" onClick={dismiss} aria-label="关闭引导">
            <X size={16} />
          </button>
        </div>
        <h4 className="tour-tooltip-title">{current.title}</h4>
        <p className="tour-tooltip-desc">{current.description}</p>
        <div className="tour-tooltip-actions">
          {stepIdx > 0 && (
            <button className="tour-btn tour-btn-secondary" onClick={prev}>
              <ChevronLeft size={14} /> 上一步
            </button>
          )}
          <button className="tour-btn tour-btn-primary" onClick={next}>
            {stepIdx < visibleSteps.length - 1 ? (
              <>下一步 <ChevronRight size={14} /></>
            ) : (
              '开始使用！'
            )}
          </button>
        </div>
        <button className="tour-skip" onClick={dismiss}>
          跳过引导 · 不再显示
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

/** Returns true if the user previously dismissed the tour */
export function isTourDismissed(): boolean {
  try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
}
