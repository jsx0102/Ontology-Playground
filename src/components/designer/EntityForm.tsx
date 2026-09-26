import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, GripVertical, Key } from 'lucide-react';
import { useDesignerStore, ENTITY_COLORS, ENTITY_ICONS, fabricIQNameError } from '../../store/designerStore';
import type { Property } from '../../data/ontology';

const PROPERTY_TYPES: Property['type'][] = [
  'string', 'integer', 'decimal', 'double', 'date', 'datetime', 'boolean', 'enum',
];

export function EntityForm() {
  const {
    ontology,
    selectedEntityId,
    addEntity,
    updateEntity,
    removeEntity,
    selectEntity,
    addProperty,
    updateProperty,
    removeProperty,
    moveProperty,
  } = useDesignerStore();

  const [expandedEntities, setExpandedEntities] = useState<Set<string>>(new Set());
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // When an entity is selected externally (e.g. graph click), expand and scroll to it
  useEffect(() => {
    if (selectedEntityId && !expandedEntities.has(selectedEntityId)) {
      setExpandedEntities((prev) => new Set(prev).add(selectedEntityId));
    }
    if (selectedEntityId) {
      // Delay scroll slightly so the card expands first
      requestAnimationFrame(() => {
        cardRefs.current.get(selectedEntityId)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }, [selectedEntityId]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleExpand = (id: string) => {
    setExpandedEntities((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddEntity = () => {
    addEntity();
    // Auto-expand the new entity (prepended at index 0)
    const latest = useDesignerStore.getState().ontology.entityTypes;
    if (latest.length > 0) {
      const newId = latest[0].id;
      setExpandedEntities((prev) => new Set(prev).add(newId));
    }
  };

  return (
    <div className="designer-entity-list">
      <div className="designer-section-header">
        <h3>实体类型（{ontology.entityTypes.length}）</h3>
        <button className="designer-add-btn" onClick={handleAddEntity} title="添加实体类型">
          <Plus size={14} /> 添加
        </button>
      </div>

      {ontology.entityTypes.length === 0 && (
        <div className="designer-empty">还没有实体类型。点击"添加"来创建一个。</div>
      )}

      {ontology.entityTypes.map((entity) => {
        const isExpanded = expandedEntities.has(entity.id);
        const isSelected = selectedEntityId === entity.id;

        return (
          <div
            key={entity.id}
            ref={(el) => { if (el) cardRefs.current.set(entity.id, el); else cardRefs.current.delete(entity.id); }}
            className={`designer-entity-card ${isSelected ? 'selected' : ''}`}
          >
            {/* Header row */}
            <div
              className="designer-entity-header"
              onClick={() => {
                selectEntity(entity.id);
                toggleExpand(entity.id);
              }}
            >
              <button className="designer-expand-btn" aria-label={isExpanded ? '折叠' : '展开'}>
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              <span
                className="designer-entity-icon"
                style={{ backgroundColor: entity.color + '30', color: entity.color }}
              >
                {entity.icon}
              </span>
              <span className="designer-entity-name">{entity.name || '未命名'}</span>
              <span className="designer-entity-badge">{entity.properties.length} 个属性</span>
              <button
                className="designer-delete-btn"
                onClick={(e) => { e.stopPropagation(); removeEntity(entity.id); }}
                title="删除实体"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Expanded editor */}
            {isExpanded && (
              <div className="designer-entity-body">
                {/* Name */}
                <label className="designer-field">
                  <span>名称</span>
                  <input
                    type="text"
                    value={entity.name}
                    onChange={(e) => updateEntity(entity.id, { name: e.target.value })}
                    placeholder="实体名称"
                  />
                  {entity.name && fabricIQNameError('实体类型', entity.name) && (
                    <span className="designer-field-hint error">{fabricIQNameError('实体类型', entity.name)}</span>
                  )}
                </label>

                {/* Description */}
                <label className="designer-field">
                  <span>描述</span>
                  <textarea
                    rows={2}
                    value={entity.description}
                    onChange={(e) => updateEntity(entity.id, { description: e.target.value })}
                    placeholder="这个实体代表什么？"
                  />
                </label>

                {/* Icon picker */}
                <div className="designer-field">
                  <span>图标</span>
                  <div className="designer-icon-grid">
                    {ENTITY_ICONS.map((icon) => (
                      <button
                        key={icon}
                        className={`designer-icon-btn ${entity.icon === icon ? 'active' : ''}`}
                        onClick={() => updateEntity(entity.id, { icon })}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color picker */}
                <div className="designer-field">
                  <span>颜色</span>
                  <div className="designer-color-grid">
                    {ENTITY_COLORS.map((color) => (
                      <button
                        key={color}
                        className={`designer-color-btn ${entity.color === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateEntity(entity.id, { color })}
                        aria-label={`颜色 ${color}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Properties */}
                <div className="designer-field">
                  <div className="designer-section-header">
                    <span>属性（{entity.properties.length}）</span>
                    <button
                      className="designer-add-btn small"
                      onClick={() => addProperty(entity.id)}
                    >
                      <Plus size={12} /> 添加
                    </button>
                  </div>

                  <div className="designer-property-list">
                    {entity.properties.map((prop, idx) => {
                      const propNameErr = prop.name ? fabricIQNameError('属性', prop.name) : null;
                      const idTypeErr = prop.isIdentifier && prop.type !== 'string' && prop.type !== 'integer'
                        ? `标识符必须是 string 或 integer（当前为 ${prop.type}）。`
                        : null;
                      return (
                      <div key={idx}>
                      <div className="designer-property-row">
                        <span
                          className="designer-grip"
                          title="拖拽以调整顺序"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', String(idx));
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const fromIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                            if (!isNaN(fromIdx) && fromIdx !== idx) {
                              moveProperty(entity.id, fromIdx, idx);
                            }
                          }}
                        >
                          <GripVertical size={12} />
                        </span>
                        <input
                          className="designer-prop-name"
                          type="text"
                          value={prop.name}
                          onChange={(e) => updateProperty(entity.id, idx, { name: e.target.value })}
                          placeholder="属性名"
                        />
                        <select
                          className="designer-prop-type"
                          value={prop.type}
                          onChange={(e) =>
                            updateProperty(entity.id, idx, { type: e.target.value as Property['type'] })
                          }
                        >
                          {PROPERTY_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <button
                          className={`designer-id-btn ${prop.isIdentifier ? 'active' : ''} ${idTypeErr ? 'warning' : ''}`}
                          onClick={() => updateProperty(entity.id, idx, { isIdentifier: !prop.isIdentifier })}
                          title={idTypeErr || (prop.isIdentifier ? '取消标识符' : '设为标识符')}
                        >
                          <Key size={12} />
                        </button>
                        <button
                          className="designer-delete-btn small"
                          onClick={() => removeProperty(entity.id, idx)}
                          title="删除属性"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      {(propNameErr || idTypeErr) && (
                        <span className="designer-field-hint error">{propNameErr || idTypeErr}</span>
                      )}
                      </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
