import { useState, useEffect } from 'react';

export function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [period, setPeriod] = useState('all'); // 'all', 'month', 'quarter', 'year', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [invoices, period, startDate, endDate]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const apiUrl = 'https://fdp-n8n.odyw27.easypanel.host/webhook/api/issued-invoices';
      console.log('Fetching from:', apiUrl);
      
      const res = await fetch(apiUrl);
      const data = await res.json();
      console.log('Raw data from n8n:', data);
      
      let invoiceList = [];
      
      // Función para extraer facturas de cualquier estructura común en n8n
      const extractInvoices = (obj) => {
        if (!obj) return [];
        
        // Si es un array directo
        if (Array.isArray(obj)) {
          // Caso común en n8n: [[ {...}, {...} ]]
          if (obj.length === 1 && Array.isArray(obj[0])) return extractInvoices(obj[0]);
          
          // Caso n8n items: [{json: {...}}, ...]
          return obj.map(item => {
            if (item && item.json) {
              if (Array.isArray(item.json.data)) return item.json.data;
              if (Array.isArray(item.json)) return item.json;
              return item.json;
            }
            return item;
          }).flat();
        }
        
        // Si es un objeto que contiene el array
        if (typeof obj === 'object') {
          if (Array.isArray(obj.data)) return obj.data;
          if (obj.json && Array.isArray(obj.json)) return obj.json;
          if (obj.json && typeof obj.json === 'object' && Array.isArray(obj.json.data)) return obj.json.data;
          return [obj];
        }
        
        return [];
      };

      invoiceList = extractInvoices(data);
      
      // Limpieza final: solo objetos con datos mínimos
      invoiceList = invoiceList.filter(inv => inv && typeof inv === 'object' && (inv.id || inv.invoice_number));
      
      console.log('Final processed invoice list:', invoiceList);
      
      // Ordenar por fecha descendente
      invoiceList.sort((a, b) => {
        const dateA = a.issue_date ? new Date(a.issue_date) : new Date(0);
        const dateB = b.issue_date ? new Date(b.issue_date) : new Date(0);
        return dateB - dateA;
      });
      
      setInvoices(invoiceList);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    console.log('Applying filters to:', invoices.length, 'invoices. Period:', period);
    let filtered = [...invoices];
    
    if (period !== 'all') {
      const now = new Date();
      let filterStartDate;
      
      switch(period) {
        case 'month':
          filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
          filterStartDate = new Date(now.getFullYear(), quarterMonth, 1);
          break;
        case 'year':
          filterStartDate = new Date(now.getFullYear(), 0, 1);
          break;
        case 'custom':
          if (startDate || endDate) {
            filtered = filtered.filter(inv => {
              if (!inv.issue_date) return false;
              const invDate = new Date(inv.issue_date);
              const isAfterStart = startDate ? invDate >= new Date(startDate) : true;
              const isBeforeEnd = endDate ? invDate <= new Date(endDate) : true;
              return isAfterStart && isBeforeEnd;
            });
          }
          setFilteredInvoices(filtered);
          setCurrentPage(1);
          return;
      }
      
      if (filterStartDate) {
        filtered = filtered.filter(inv => {
          if (!inv.issue_date) return false;
          return new Date(inv.issue_date) >= filterStartDate;
        });
      }
    }
    
    setFilteredInvoices(filtered);
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'processed': return '#4ade80';
      case 'pending': return '#fbbf24';
      case 'error': return '#f87171';
      default: return 'var(--text-muted)';
    }
  };

  // Paginación
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = filteredInvoices.slice(startIndex, endIndex);

  if (loading) {
    return <div className="text-center p-8">Cargando facturas...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>Facturas</h2>
            <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>
              Histórico completo de documentos procesados
            </p>
          </div>
          <div className="card" style={{ padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>
            {filteredInvoices.length} Facturas
          </div>
        </div>

        {/* Filtros */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'end' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Periodo
            </label>
            <select 
              className="btn" 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <option value="all">Todas las facturas</option>
              <option value="month">Este mes</option>
              <option value="quarter">Este trimestre</option>
              <option value="year">Este año</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          {period === 'custom' && (
            <>
              <div style={{ flex: '1', minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Desde
                </label>
                <input 
                  type="date" 
                  className="btn"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
              <div style={{ flex: '1', minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Hasta
                </label>
                <input 
                  type="date" 
                  className="btn"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
            </>
          )}
        </div>
      </header>

      {filteredInvoices.length === 0 ? (
        <div className="card glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3>No hay facturas para el periodo seleccionado</h3>
          <p>Prueba con otro rango de fechas o sube tu primer documento en la pestaña "Subir PDF".</p>
        </div>
      ) : (
        <>
          <div className="grid">
            {/* Header Row */}
            <div className="glass-panel" style={{ 
              display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr', 
              padding: '1rem', fontWeight: 'bold', color: 'var(--text-muted)',
              borderBottom: '1px solid var(--border)', fontSize: '0.9rem'
            }}>
              <div>Referencia</div>
              <div>Cliente / Proveedor</div>
              <div>Fecha</div>
              <div style={{ textAlign: 'right' }}>Importe</div>
              <div style={{ textAlign: 'center' }}>Estado</div>
            </div>

            {currentInvoices.map((inv) => (
              <div key={inv.id} className="card glass-panel" style={{ 
                display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr', gap: '1rem',
                alignItems: 'center', padding: '1rem', transition: 'background 0.2s',
                borderLeft: inv.type === 'expense' ? '4px solid #ec4899' : '4px solid #4ade80'
              }}>
                <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{inv.type === 'expense' ? '📉' : '📈'}</span>
                  <div>
                     <div>{inv.invoice_number}</div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>{inv.category || 'General'}</div>
                  </div>
                </div>
                
                <div>
                  {inv.entity_name ? (
                    <>
                      <div style={{ fontWeight: '500' }}>{inv.entity_name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inv.entity_nif}</div>
                    </>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin asignar</span>
                  )}
                </div>

                <div style={{ color: 'var(--text-muted)' }}>
                  {new Date(inv.issue_date).toLocaleDateString('es-ES')}
                </div>

                <div style={{ 
                  textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem',
                  color: inv.type === 'expense' ? '#f472b6' : '#4ade80'
                }}>
                  {inv.type === 'expense' ? '-' : '+'} 
                  {parseFloat(inv.total_amount).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', borderRadius: '20px', 
                    fontSize: '0.8rem', fontWeight: 'bold',
                    background: `${getStatusColor(inv.status)}20`, 
                    color: getStatusColor(inv.status),
                    border: `1px solid ${getStatusColor(inv.status)}40`
                  }}>
                    {inv.status?.toUpperCase() || 'UNKNOWN'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
              <button 
                className="btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ 
                  padding: '0.5rem 1rem',
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                ← Anterior
              </button>
              
              <span style={{ color: 'var(--text-muted)' }}>
                Página {currentPage} de {totalPages}
              </span>
              
              <button 
                className="btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ 
                  padding: '0.5rem 1rem',
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
