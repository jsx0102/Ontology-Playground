import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Cloud, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import {
  createOntology,
  updateOntologyDefinition,
  listOntologies,
  FabricApiError,
  type FabricOntologyResponse,
} from '../lib/fabric';

interface FabricExportModalProps {
  onClose: () => void;
}

type Step = 'credentials' | 'workspace' | 'pushing' | 'done' | 'error';

export function FabricExportModal({ onClose }: FabricExportModalProps) {
  const { currentOntology } = useAppStore();

  const [step, setStep] = useState<Step>('credentials');
  const [token, setToken] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [existingOntologies, setExistingOntologies] = useState<FabricOntologyResponse[]>([]);
  const [selectedOntologyId, setSelectedOntologyId] = useState<string | ''>('');
  const [mode, setMode] = useState<'create' | 'update'>('create');
  const [error, setError] = useState('');
  const [result, setResult] = useState<FabricOntologyResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLoadWorkspace = useCallback(async () => {
    if (!token.trim() || !workspaceId.trim()) {
      setError('必须填写访问令牌和工作区 ID。');
      return;
    }

    // Basic UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(workspaceId.trim())) {
      setError('工作区 ID 必须是有效的 UUID（例如 cfafbeb1-8037-4d0c-896e-a46fb27ff229）。');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const ontologies = await listOntologies(workspaceId.trim(), token.trim());
      setExistingOntologies(ontologies);
      setStep('workspace');
    } catch (err) {
      if (err instanceof FabricApiError) {
        setError(`API 错误（${err.status}）：${err.message}`);
      } else {
        setError(err instanceof Error ? err.message : '连接工作区失败');
      }
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId]);

  const handlePush = useCallback(async () => {
    setStep('pushing');
    setError('');

    try {
      if (mode === 'create') {
        const created = await createOntology(
          workspaceId.trim(),
          token.trim(),
          currentOntology,
        );
        setResult(created);
      } else {
        await updateOntologyDefinition(
          workspaceId.trim(),
          selectedOntologyId,
          token.trim(),
          currentOntology,
        );
        const existing = existingOntologies.find(o => o.id === selectedOntologyId);
        setResult(existing ?? null);
      }
      setStep('done');
    } catch (err) {
      if (err instanceof FabricApiError) {
        setError(`API 错误（${err.status}）：${err.message}`);
      } else {
        setError(err instanceof Error ? err.message : '推送失败');
      }
      setStep('error');
    }
  }, [mode, workspaceId, token, currentOntology, selectedOntologyId, existingOntologies]);

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
        style={{ maxWidth: 550, maxHeight: '85vh', overflow: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36,
              background: 'rgba(0, 120, 212, 0.15)',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Cloud size={20} color="var(--ms-blue)" />
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600 }}>推送到 Microsoft Fabric</h2>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                在你的 Fabric 工作区中创建或更新本体
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Ontology summary */}
        <div style={{
          padding: 12,
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 20,
          fontSize: 13,
        }}>
          <strong>{currentOntology.name}</strong>
          <span style={{ color: 'var(--text-secondary)', marginLeft: 8 }}>
            {currentOntology.entityTypes.length} 个实体类型、{currentOntology.relationships.length} 个关系
          </span>
        </div>

        {/* Error display */}
        {error && (
          <div style={{
            padding: 12,
            background: 'rgba(209, 52, 56, 0.15)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 16,
            display: 'flex', alignItems: 'flex-start', gap: 10,
            color: '#D13438', fontSize: 13,
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Step: Credentials */}
        {step === 'credentials' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                工作区 ID
              </label>
              <input
                type="text"
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
                placeholder="00000000-0000-0000-0000-000000000000"
                spellCheck={false}
                style={{
                  width: '100%', padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: 13, fontFamily: 'var(--font-mono)',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                可在 Fabric 门户 → 工作区设置 → 概述 中找到
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                访问令牌
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="在此粘贴你的 Bearer 令牌"
                spellCheck={false}
                style={{
                  width: '100%', padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: 13, fontFamily: 'var(--font-mono)',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
                具有 <code>Item.ReadWrite.All</code> 权限范围的 Bearer 令牌。
                可从 Fabric REST API 的&quot;试用&quot;页面或通过 MSAL 获取。
              </p>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleLoadWorkspace}
              disabled={loading}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {loading ? <><Loader2 size={14} className="spin" /> 连接中…</> : '连接到工作区'}
            </button>
          </div>
        )}

        {/* Step: Workspace — choose create or update */}
        {step === 'workspace' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                操作
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setMode('create')}
                  style={{
                    flex: 1, padding: '10px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: mode === 'create' ? '2px solid var(--ms-blue)' : '2px solid var(--border-primary)',
                    background: mode === 'create' ? 'rgba(0, 120, 212, 0.1)' : 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  }}
                >
                  新建
                </button>
                <button
                  onClick={() => setMode('update')}
                  disabled={existingOntologies.length === 0}
                  style={{
                    flex: 1, padding: '10px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: mode === 'update' ? '2px solid var(--ms-blue)' : '2px solid var(--border-primary)',
                    background: mode === 'update' ? 'rgba(0, 120, 212, 0.1)' : 'var(--bg-secondary)',
                    color: existingOntologies.length === 0 ? 'var(--text-tertiary)' : 'var(--text-primary)',
                    cursor: existingOntologies.length === 0 ? 'not-allowed' : 'pointer',
                    fontSize: 13, fontWeight: 600,
                  }}
                >
                  更新现有（{existingOntologies.length}）
                </button>
              </div>
            </div>

            {mode === 'update' && existingOntologies.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  选择本体
                </label>
                <select
                  value={selectedOntologyId}
                  onChange={(e) => setSelectedOntologyId(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                  }}
                >
                  <option value="">— 请选择 —</option>
                  {existingOntologies.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.displayName} ({o.id.slice(0, 8)}…)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button
                className="btn btn-secondary"
                onClick={() => { setStep('credentials'); setError(''); }}
                style={{ flex: 1 }}
              >
                上一步
              </button>
              <button
                className="btn btn-primary"
                onClick={handlePush}
                disabled={mode === 'update' && !selectedOntologyId}
                style={{ flex: 2 }}
              >
                {mode === 'create' ? '创建并推送' : '更新定义'}
              </button>
            </div>
          </div>
        )}

        {/* Step: Pushing */}
        {step === 'pushing' && (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <Loader2 size={32} color="var(--ms-blue)" style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: 16, fontSize: 14, color: 'var(--text-secondary)' }}>
              {mode === 'create' ? '正在 Fabric 中创建本体…' : '正在更新本体定义…'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
              Fabric 正在预配资源，可能需要稍等片刻。
            </p>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Step: Done */}
        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle size={40} color="var(--ms-green)" />
            <p style={{ marginTop: 12, fontSize: 16, fontWeight: 600 }}>
              {mode === 'create' ? '本体已创建！' : '定义已更新！'}
            </p>
            {result && (
              <div style={{
                marginTop: 12, padding: 12,
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                fontSize: 13, textAlign: 'left',
              }}>
                <div><strong>名称：</strong> {result.displayName}</div>
                <div><strong>ID：</strong> <code style={{ fontSize: 11 }}>{result.id}</code></div>
                <div><strong>工作区：</strong> <code style={{ fontSize: 11 }}>{result.workspaceId}</code></div>
              </div>
            )}
            <button
              className="btn btn-primary"
              onClick={onClose}
              style={{ marginTop: 20 }}
            >
              完成
            </button>
          </div>
        )}

        {/* Step: Error */}
        {step === 'error' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <AlertCircle size={40} color="#D13438" />
            <p style={{ marginTop: 12, fontSize: 14, color: '#D13438' }}>
              推送失败。请查看上方的错误信息，然后重试。
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20 }}>
              <button
                className="btn btn-secondary"
                onClick={() => { setStep('credentials'); setError(''); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <RefreshCw size={14} />
                重新开始
              </button>
              <button className="btn btn-primary" onClick={onClose}>
                关闭
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
