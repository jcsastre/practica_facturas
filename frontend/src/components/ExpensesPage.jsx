import { useState, useEffect } from 'react';

export function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [period, setPeriod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [expenses, period, startDate, endDate]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://fdp-n8n.odyw27.easypanel.host/webhook';
    const apiUrl = `${apiBase}/api/received-invoices`;
      
      const res = await fetch(apiUrl);
      const data = await res.json();
      
      let list = [];
      const extract = (obj) => {
        if (!obj) return [];
        if (Array.isArray(obj)) {
          if (obj.length === 1 && Array.isArray(obj[0])) return extract(obj[0]);
          return obj.map(item => (item && item.json) ? (Array.isArray(item.json.data) ? item.json.data : item.json) : item).flat();
        }
        if (typeof obj === 'object') {
          if (Array.isArray(obj.data)) return obj.data;
          if (obj.json && Array.isArray(obj.json)) return obj.json;
          return [obj];
        }
        return [];
      };

      list = extract(data);
      list = list.filter(item => item && typeof item === 'object' && (item.id || item.invoice_number));
      
      // Ordenar por fecha desc
      list.sort((a, b) => new Date(b.issue_date || 0) - new Date(a.issue_date || 0));
      
      setExpenses(list);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...expenses];
    
    if (period !== 'all') {
      const now = new Date();
      let filterStart;
      
      switch(period) {
        case 'month':
          filterStart = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          filterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        case 'year':
          filterStart = new Date(now.getFullYear(), 0, 1);
          break;
        case 'custom':
          if (startDate || endDate) {
            filtered = filtered.filter(inv => {
              if (!inv.issue_date) return false;
              const d = new Date(inv.issue_date);
              return (!startDate || d >= new Date(startDate)) && (!endDate || d <= new Date(endDate));
            });
          }
          setFilteredExpenses(filtered);
          setCurrentPage(1);
          return;
      }
      
      if (filterStart) {
        filtered = filtered.filter(inv => inv.issue_date && new Date(inv.issue_date) >= filterStart);
      }
    }
    
    setFilteredExpenses(filtered);
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

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const currentItems = filteredExpenses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div className="text-center p-8">Cargando gastos...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>Gastos</h2>
            <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0' }}>Control de facturas recibidas y proveedores</p>
          </div>
          <div className="card" style={{ padding: '0.5rem 1rem', background: 'rgba(236, 72, 153, 0.1)', color: '#f472b6' }}>
            {filteredExpenses.length} Gastos
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'end' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Periodo</label>
            <select className="btn" value={period} onChange={(e) => setPeriod(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <option value="all">Todos los gastos</option>
              <option value="month">Este mes</option>
              <option value="quarter">Este trimestre</option>
              <option value="year">Este año</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
          {period === 'custom' && (
            <>
              <div style={{ flex: '1', minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Desde</label>
                <input type="date" className="btn" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div style={{ flex: '1', minWidth: '150px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Hasta</label>
                <input type="date" className="btn" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
            </>
          )}
        </div>
      </header>

      {filteredExpenses.length === 0 ? (
        <div className="card glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3>No hay gastos registrados</h3>
          <p>Sube facturas de proveedores para verlas aquí.</p>
        </div>
      ) : (
        <>
          <div className="grid">
            <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr', padding: '1rem', fontWeight: 'bold', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <div>Referencia</div>
              <div>Proveedor</div>
              <div>Fecha</div>
              <div style={{ textAlign: 'right' }}>Importe</div>
              <div style={{ textAlign: 'center' }}>Estado</div>
            </div>
            {currentItems.map((inv) => (
              <div key={inv.id} className="card glass-panel" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 1fr 1fr', gap: '1rem', alignItems: 'center', padding: '1rem', borderLeft: '4px solid #ec4899' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{inv.invoice_number}</div>

                </div>
                <div>
                   <div style={{ fontWeight: '500' }}>{inv.entity_name}</div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inv.entity_nif}</div>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>{new Date(inv.issue_date).toLocaleDateString('es-ES')}</div>
                <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem', color: '#f472b6' }}>
                  -{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', useGrouping: true }).format(Number(inv.total_amount || 0))}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', background: `${getStatusColor(inv.status)}20`, color: getStatusColor(inv.status), border: `1px solid ${getStatusColor(inv.status)}40` }}>
                    {inv.status?.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>←</button>
              <span style={{ color: 'var(--text-muted)' }}>Página {currentPage} de {totalPages}</span>
              <button className="btn" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>→</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
