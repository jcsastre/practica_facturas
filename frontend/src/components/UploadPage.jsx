import { useState } from 'react';

export function UploadPage() {
  const [type, setType] = useState('expense'); // 'expense' or 'income'
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setStatus('idle');
      setErrorMsg('');
    } else if (selectedFile) {
      setErrorMsg('Solo se permiten archivos PDF.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setStatus('idle');
      setErrorMsg('');
    } else if (droppedFile) {
      setErrorMsg('Solo se permiten archivos PDF.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setStatus('uploading');
    setErrorMsg('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://fdp-n8n.odyw27.easypanel.host/webhook';
      const webhookUrl = `${apiBase}/83fa05c6-e044-4abc-89bd-e470ff08b7d1`; 
        
      console.log('Webhook URL:', webhookUrl); 

        const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('N8N Response:', result);

      if (response.ok && result.success !== false) {
        setStatus('success');
        setFile(null);
      } else {
        setStatus('error');
        const msg = result.message || result.errors || 'Error en el procesamiento del documento';
        setErrorMsg(msg);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setStatus('error');
      setErrorMsg('No se pudo conectar con el servidor de procesamiento.');
    }
  };

  return (
    <div className="card glass-panel animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.75rem', fontWeight: '700' }}>Subir Documento</h2>
        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
          Extracción automática de datos con IA
        </p>
      </div>
      
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem', 
        padding: '0.5rem',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)'
      }}>
        <button 
          className={`btn ${type === 'income' ? 'btn-primary' : 'btn-nav'}`}
          onClick={() => setType('income')}
          style={{ flex: 1, transition: 'all 0.2s' }}
        >
          <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>📈</span>
          Ingreso
        </button>
        <button 
          className={`btn ${type === 'expense' ? 'btn-primary' : 'btn-nav'}`}
          onClick={() => setType('expense')}
          style={{ flex: 1, transition: 'all 0.2s' }}
        >
          <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>📉</span>
          Gasto
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div 
          className="upload-zone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: isDragging ? '2px solid var(--primary)' : '2px dashed var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '3rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: isDragging ? 'rgba(79, 70, 229, 0.1)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s',
            transform: isDragging ? 'scale(1.02)' : 'scale(1)',
          }}
          onClick={() => document.getElementById('file-input').click()}
        >
          <input 
            type="file" 
            id="file-input" 
            accept=".pdf"
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
          {file ? (
            <div>
              <p style={{ fontWeight: 'bold', margin: '0 0 0.5rem' }}>{file.name}</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Haz clic o arrastra un PDF aquí</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>Soporta facturas de proveedores y clientes</p>
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={!file || status === 'uploading'}
          style={{ padding: '1rem' }}
        >
          {status === 'uploading' ? 'Procesando con IA...' : 'Subir y Procesar'}
        </button>

        {status === 'success' && (
          <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            ✅ Documento subido y enviado a procesar
          </div>
        )}
        
        {status === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
              ❌ {errorMsg || 'Error al procesar el documento'}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
              Si el error persiste, por favor introduce los datos manualmente en la sección correspondiente.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
