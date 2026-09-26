import { motion } from 'framer-motion';
import { X, Database, Table, BarChart3, Cloud } from 'lucide-react';
import { useAppStore } from '../store/appStore';

interface DataSourcesModalProps {
  onClose: () => void;
}

export function DataSourcesModal({ onClose }: DataSourcesModalProps) {
  const { currentOntology, dataBindings } = useAppStore();
  
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
        style={{ maxWidth: 750, maxHeight: '85vh', overflow: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 600 }}>数据源</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>
              Fourth Coffee 本体如何绑定到数据湖屋（Data Lakehouse）
            </p>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Data lakehouse overview */}
        <div style={{ 
          padding: 20, 
          background: 'linear-gradient(135deg, rgba(0, 120, 212, 0.1), rgba(92, 45, 145, 0.1))',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 16
        }}>
          <div style={{ 
            width: 56, 
            height: 56, 
            background: 'var(--ms-blue)', 
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Cloud size={28} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>数据湖屋（Data Lakehouse）</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              用于分析的统一存储层。本体将实体类型绑定到湖屋表和语义模型。
            </div>
          </div>
        </div>

        {/* Bindings Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {dataBindings.map((binding) => {
            const entity = currentOntology.entityTypes.find(e => e.id === binding.entityTypeId);
            if (!entity) return null;

            const sourceNormalized = binding.source.toLowerCase();
            const isLakehouse = sourceNormalized.includes('lakehouse') || binding.table.startsWith('lakehouse.');
            const isSemanticModel = sourceNormalized.includes('semantic') || binding.table.startsWith('semantic_model.');

            return (
              <div key={binding.entityTypeId} className="binding-card" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                      width: 44, 
                      height: 44, 
                      background: entity.color + '20',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22
                    }}>
                      {entity.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{entity.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                        已映射 {entity.properties.length} 个属性
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 6,
                    padding: '4px 10px',
                    background: isLakehouse ? 'rgba(0, 120, 212, 0.15)' : 'rgba(255, 185, 0, 0.15)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: isLakehouse ? 'var(--ms-blue)' : 'var(--ms-yellow)'
                  }}>
                    {isSemanticModel ? <BarChart3 size={14} /> : <Table size={14} />}
                    {isSemanticModel ? '语义模型' : '湖屋'}
                  </div>
                </div>

                <div style={{ 
                  padding: 12, 
                  background: 'var(--bg-primary)', 
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 12
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Database size={14} color="var(--text-tertiary)" />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>源表：</span>
                  </div>
                  <code style={{ 
                    fontSize: 13, 
                    color: 'var(--ms-cyan)', 
                    fontFamily: 'var(--font-mono)',
                    wordBreak: 'break-all'
                  }}>
                    {binding.table}
                  </code>
                </div>

                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>
                  列映射
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px 12px', fontSize: 13 }}>
                  <div style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>属性</div>
                  <div></div>
                  <div style={{ color: 'var(--text-tertiary)', fontWeight: 600, textAlign: 'right' }}>列</div>
                  {Object.entries(binding.columnMappings).map(([prop, column]) => (
                    <>
                      <div key={`${prop}-prop`} style={{ color: 'var(--text-primary)' }}>{prop}</div>
                      <div key={`${prop}-arrow`} style={{ color: 'var(--text-tertiary)' }}>→</div>
                      <div key={`${prop}-col`} style={{ color: 'var(--ms-cyan)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{column}</div>
                    </>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Unbound entities notice */}
          <div style={{ 
            padding: 16, 
            background: 'var(--bg-tertiary)', 
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>
              <strong>其他实体类型：</strong>Store、Supplier、Shipment
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              本演示仅展示 Customer、Order 和 Product 的数据绑定。
              在实际部署中，所有实体都会绑定到数据平台的数据源。
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button className="btn btn-primary" onClick={onClose}>
            关闭
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
