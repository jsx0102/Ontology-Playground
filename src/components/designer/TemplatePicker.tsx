import { designerTemplates } from '../../data/designerTemplates';
import { useDesignerStore } from '../../store/designerStore';

export function TemplatePicker() {
  const loadDraft = useDesignerStore((s) => s.loadDraft);

  return (
    <div className="template-picker">
      <div className="template-picker-header">
        <h3>从模板开始</h3>
        <p>选择一个领域快速上手，或手动添加实体。</p>
      </div>
      <div className="template-picker-grid">
        {designerTemplates.map((t) => (
          <button
            key={t.id}
            className="template-card"
            onClick={() => loadDraft(t.ontology)}
          >
            <span className="template-card-icon">{t.icon}</span>
            <span className="template-card-label">{t.label}</span>
            <span className="template-card-desc">{t.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
