import { motion } from 'framer-motion';
import { X, MousePointer, Target, MessageSquare, Link2, Lightbulb, Command } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-content"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 700 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 600 }}>如何使用 Ontology Playground（预览版）</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="feature-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <MousePointer size={20} color="var(--ms-blue)" />
              <span className="feature-title" style={{ marginBottom: 0 }}>探索关系图</span>
            </div>
            <p className="feature-text">
              点击任意<strong>实体类型</strong>（彩色节点）可查看其属性、关系和数据绑定。
              点击<strong>关系连线</strong>可查看实体之间的关联。使用左下角的控件进行缩放和重置布局。
            </p>
          </div>

          <div className="feature-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Target size={20} color="var(--ms-purple)" />
              <span className="feature-title" style={{ marginBottom: 0 }}>完成任务</span>
            </div>
            <p className="feature-text">
              从左侧面板选择一个任务，开始引导式学习之旅。按照指引点击指定的实体或关系。
              完成所有步骤即可赢取<strong>徽章</strong>和<strong>积分</strong>！
            </p>
          </div>

          <div className="feature-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <MessageSquare size={20} color="var(--ms-yellow)" />
              <span className="feature-title" style={{ marginBottom: 0 }}>用自然语言提问</span>
            </div>
            <p className="feature-text">
              使用右下角的查询工作台提问，例如“Show me Gold tier customers”（显示金牌级客户）或
              “Which products come from Ethiopia?”（哪些产品来自埃塞俄比亚？）。关系图会高亮显示相关的实体和关系。
            </p>
          </div>

          <div className="feature-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Link2 size={20} color="var(--ms-green)" />
              <span className="feature-title" style={{ marginBottom: 0 }}>查看数据绑定</span>
            </div>
            <p className="feature-text">
              选中某个实体类型后，检查器会展示本体属性如何映射到数据湖仓中的真实数据源，
              包括湖仓表和语义模型。
            </p>
          </div>

          <div style={{ 
            padding: 16, 
            background: 'rgba(0, 120, 212, 0.1)', 
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12
          }}>
            <Lightbulb size={20} color="var(--ms-blue)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ color: 'var(--ms-blue)' }}>关于 Microsoft Fabric IQ 本体</strong>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                本体是业务中共享的、机器可理解的词汇表。它定义了实体类型（如客户、产品）、
                实体类型的属性以及它们之间的关系。本演示使用虚构的“Fourth Coffee”公司来阐释这些概念。
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Command size={20} color="var(--ms-blue)" />
              <span className="feature-title" style={{ marginBottom: 0 }}>键盘快捷键</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
              <kbd className="help-kbd">⌘K</kbd><span>打开命令面板</span>
              <kbd className="help-kbd">?</kbd><span>打开本帮助对话框</span>
              <kbd className="help-kbd">Esc</kbd><span>关闭任意对话框</span>
              <kbd className="help-kbd">↑ ↓</kbd><span>在面板结果中导航</span>
              <kbd className="help-kbd">↵</kbd><span>选择面板命令</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button className="btn btn-primary" onClick={onClose}>
            知道了！
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
