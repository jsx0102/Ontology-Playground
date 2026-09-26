import { useState, useEffect } from 'react';
import { Download, AlertTriangle, CheckCircle, Upload, Github, FilePlus, Undo2, Redo2 } from 'lucide-react';
import { useDesignerStore } from '../../store/designerStore';
import type { ValidationError } from '../../store/designerStore';
import { useAppStore } from '../../store/appStore';
import { serializeToRDF } from '../../lib/rdf/serializer';
import { navigate } from '../../lib/router';
import { SubmitCatalogueModal } from './SubmitCatalogueModal';

/**
 * Toolbar buttons — rendered in the designer topbar.
 */
export function DesignerToolbar() {
  const { ontology, validate, resetDraft, undo, redo, _past, _future } = useDesignerStore();
  const loadOntology = useAppStore((s) => s.loadOntology);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const canUndo = _past.length > 0;
  const canRedo = _future.length > 0;

  const handleValidate = () => {
    validate();
  };

  const handleExportRDF = () => {
    const errors = validate();
    // Allow download even with validation errors (user sees warnings in sidebar)
    try {
      const rdf = serializeToRDF(ontology, []);
      const blob = new Blob([rdf], { type: 'application/rdf+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const suffix = errors.length > 0 ? '-draft' : '';
      a.download = `${ontology.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'ontology'}${suffix}.rdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // serialization failed — validation errors are shown in sidebar
    }
  };

  const handleLoadInPlayground = () => {
    const errors = validate();
    if (errors.length > 0) return;
    loadOntology(ontology, []);
    navigate({ page: 'home' });
  };

  const handleNewOntology = () => {
    resetDraft();
  };

  const handleSubmitToCatalogue = () => {
    const errors = validate();
    if (errors.length > 0) return;
    setShowSubmitModal(true);
  };

  return (
    <>
      <div className="designer-toolbar">
        <button className="designer-toolbar-btn" onClick={undo} disabled={!canUndo} title="撤销 (Ctrl+Z)">
          <Undo2 size={14} />
        </button>
        <button className="designer-toolbar-btn" onClick={redo} disabled={!canRedo} title="重做 (Ctrl+Shift+Z)">
          <Redo2 size={14} />
        </button>
        <div className="designer-toolbar-sep" />
        <button className="designer-toolbar-btn" onClick={handleNewOntology} title="新建本体">
          <FilePlus size={14} /> 新建
        </button>
        <button className="designer-toolbar-btn" onClick={handleValidate} title="校验本体">
          <CheckCircle size={14} /> 校验
        </button>
        <div className="designer-toolbar-sep" />
        <button className="designer-toolbar-btn" onClick={handleExportRDF} title="导出 RDF">
          <Download size={14} /> 导出 RDF
        </button>
        <button className="designer-toolbar-btn" onClick={handleLoadInPlayground} title="在演练场中加载">
          <Upload size={14} /> 加载到演练场
        </button>
        <button className="designer-toolbar-btn submit" onClick={handleSubmitToCatalogue} title="提交到社区本体目录">
          <Github size={14} /> 提交到本体目录
        </button>
      </div>

      {showSubmitModal && (
        <SubmitCatalogueModal onClose={() => setShowSubmitModal(false)} />
      )}
    </>
  );
}

/**
 * Validation feedback — rendered in the sidebar.
 */
export function DesignerValidation() {
  const validationErrors = useDesignerStore((s) => s.validationErrors);
  const lastValidatedAt = useDesignerStore((s) => s._lastValidatedAt);
  const [showSuccess, setShowSuccess] = useState(false);

  // Show success banner for 3 seconds when validation runs with 0 errors
  useEffect(() => {
    if (lastValidatedAt > 0 && validationErrors.length === 0) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
    setShowSuccess(false);
  }, [lastValidatedAt, validationErrors.length]);

  if (validationErrors.length === 0) {
    if (!showSuccess) return null;
    return (
      <div className="designer-validation-success">
        <div className="designer-validation-header" style={{ color: 'var(--ms-green, #16c60c)' }}>
          <CheckCircle size={14} /> 未发现问题
        </div>
      </div>
    );
  }

  return (
    <div className="designer-validation-errors">
      <div className="designer-validation-header">
        <AlertTriangle size={14} /> {validationErrors.length} 个待修复的问题
      </div>
      <ul>
        {validationErrors.map((err, i) => (
          <li key={i}>
            <ErrorItem error={err} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ErrorItem({ error }: { error: ValidationError }) {
  const selectEntity = useDesignerStore((s) => s.selectEntity);
  const selectRelationship = useDesignerStore((s) => s.selectRelationship);

  const handleClick = () => {
    if (error.entityId) {
      selectEntity(error.entityId);
    } else if (error.relationshipId) {
      selectRelationship(error.relationshipId);
    }
  };

  const isClickable = error.entityId || error.relationshipId;

  return (
    <span
      className={isClickable ? 'designer-error-link' : ''}
      onClick={isClickable ? handleClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter') handleClick(); } : undefined}
    >
      {error.message}
    </span>
  );
}
