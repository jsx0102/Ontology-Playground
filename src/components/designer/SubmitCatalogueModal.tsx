import { useState } from 'react';
import { X, Github, ExternalLink, Download, Check } from 'lucide-react';
import { useDesignerStore } from '../../store/designerStore';
import { serializeToRDF } from '../../lib/rdf/serializer';

interface SubmitCatalogueModalProps {
  onClose: () => void;
}

const REPO_URL = 'https://github.com/microsoft/Ontology-Playground';

export function SubmitCatalogueModal({ onClose }: SubmitCatalogueModalProps) {
  const ontology = useDesignerStore((s) => s.ontology);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadRdf = () => {
    const rdf = serializeToRDF(ontology, []);
    const slug = ontology.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'ontology';
    const blob = new Blob([rdf], { type: 'application/rdf+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}.rdf`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  const handleDownloadMetadata = () => {
    const metadata = {
      name: ontology.name,
      description: ontology.description,
      icon: '📦',
      category: 'other',
      tags: [],
      author: '',
    };
    const blob = new Blob([JSON.stringify(metadata, null, 2) + '\n'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'metadata.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content submit-catalogue-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={18} /></button>
        <h2 className="modal-title">
          <Github size={20} /> 提交到本体目录
        </h2>

        <div className="submit-step">
          <p className="submit-description">
            与社区分享你的本体！下载下方文件，然后在{' '}
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
              Ontology Playground 仓库 <ExternalLink size={12} />
            </a>{' '}
            上发起 Pull Request。
          </p>

          <div className="submit-instructions">
            <h3>如何提交</h3>
            <ol>
              <li>在下方下载你的本体 RDF 和 metadata 文件。</li>
              <li>
                <a href={`${REPO_URL}/fork`} target="_blank" rel="noopener noreferrer">
                  Fork 本仓库 <ExternalLink size={12} />
                </a>
              </li>
              <li>
                将文件添加到{' '}
                <code>catalogue/community/你的用户名/</code> 目录下
              </li>
              <li>编辑 <code>metadata.json</code> — 填写你的姓名、类别和标签。</li>
              <li>向 <code>main</code> 分支发起 Pull Request。</li>
            </ol>
          </div>

          <div className="submit-download-actions">
            <button className="designer-action-btn primary" onClick={handleDownloadRdf}>
              <Download size={14} /> 下载 RDF
              {downloaded && <Check size={14} style={{ marginLeft: 4 }} />}
            </button>
            <button className="designer-action-btn secondary" onClick={handleDownloadMetadata}>
              <Download size={14} /> 下载 metadata.json
            </button>
          </div>

          <div className="submit-form-actions">
            <button className="designer-action-btn secondary" onClick={onClose}>关闭</button>
          </div>
        </div>
      </div>
    </div>
  );
}
