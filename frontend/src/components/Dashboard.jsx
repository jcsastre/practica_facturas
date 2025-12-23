import { useState, useEffect } from 'react';

export function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (val) => {
    const num = typeof val === 'number' ? val : parseFloat(val || 0);
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      useGrouping: true
    }).format(num);
  };

  const formatNumber = (val) => {
    const num = typeof val === 'number' ? val : parseFloat(val || 0);
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true
    }).format(num);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://fdp-n8n.odyw27.easypanel.host/webhook';
      const apiUrl = `${apiBase}/api/dashboard-stats`;
      const res = await fetch(apiUrl);
      const dashboardData = await res.json();
      
      // Fetch recent activity from existing endpoints to complement the dashboard
      const issuedRes = await fetch(`${apiBase}/api/issued-invoices`);
      const receivedRes = await fetch(`${apiBase}/api/received-invoices`);
      
      const issued = await issuedRes.json();
      const received = await receivedRes.json();

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

      const allRecent = [
        ...extract(issued).map(inv => ({ ...inv, type: 'income' })),
        ...extract(received).map(inv => ({ ...inv, type: 'expense' }))
      ];
      
      allRecent.sort((a, b) => new Date(b.issue_date || 0) - new Date(a.issue_date || 0));

      setData({
        stats: dashboardData.stats,
        quarterly_vat: dashboardData.quarterly_vat,
        recent: allRecent.slice(0, 5)
      });
    } catch (error) {
      console.error('Error dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Cargando métricas...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  
  if (!data) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Error cargando datos</div>;

  const netProfit = data.stats.net_profit;

  return (
    <>
      <div className="grid grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        <StatCard 
          title="Ingresos Totales" 
          value={formatCurrency(data.stats.total_income)} 
          trend="Facturación bruta"
          icon="📈"
          color="var(--success)"
          delay="0s"
        />
        <StatCard 
          title="Gastos Totales" 
          value={formatCurrency(data.stats.total_expenses)} 
          trend="Gastos operativos"
          icon="📊"
          color="var(--danger)"
          delay="0.1s"
        />
        <StatCard 
          title="Beneficio Neto" 
          value={formatCurrency(data.stats.net_profit)} 
          trend="Margen de beneficio"
          icon="💎"
          color="var(--primary)"
          delay="0.2s"
        />
        <StatCard 
          title="IVA a Pagar" 
          value={formatCurrency(data.stats.vat_to_pay)} 
          trend="Saldo IVA global"
          icon="💰"
          color="var(--warning)"
          delay="0.3s"
        />
      </div>

      <div className="grid grid-cols-3" style={{ gap: '2rem', marginBottom: '2rem' }}>
        {/* Quarterly VAT Breakdown */}
        <div className="card glass-panel animate-slide-in col-span-2" style={{ padding: '1.5rem', animationDelay: '0.4s' }}>
          <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: '700' }}>Resumen Trimestral de IVA</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ textAlign: 'left', padding: '1rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Trimestre</th>
                  <th style={{ textAlign: 'right', padding: '1rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>IVA Repercutido</th>
                  <th style={{ textAlign: 'right', padding: '1rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>IVA Soportado</th>
                  <th style={{ textAlign: 'right', padding: '1rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {data.quarterly_vat.map((q) => (
                  <tr key={q.quarter} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: '600' }}>{q.quarter}</td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right', color: 'var(--success)' }}>
                      +{formatNumber(q.income_vat)}€
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right', color: 'var(--danger)' }}>
                      -{formatNumber(q.expense_vat)}€
                    </td>
                    <td style={{ 
                      padding: '1rem 0.5rem', 
                      textAlign: 'right', 
                      fontWeight: '700',
                      color: q.balance >= 0 ? 'var(--warning)' : 'var(--success)'
                    }}>
                      {formatNumber(q.balance)}€
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Net Profit Banner */}
        <div className="card glass-panel animate-scale-in" style={{ 
          background: netProfit >= 0 
            ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
          border: `1px solid ${netProfit >= 0 ? 'var(--success-glow)' : 'rgba(239, 68, 68, 0.2)'}`,
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          textAlign: 'center',
          animationDelay: '0.5s'
        }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '500' }}>
            Estado del Negocio
          </div>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: '800', 
            color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)',
            letterSpacing: '-0.02em',
            marginBottom: '0.5rem'
          }}>
            {netProfit >= 0 ? 'SALDO POSITIVO' : 'SALDO NEGATIVO'}
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            {formatCurrency(netProfit)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
            {netProfit >= 0 
              ? 'Tus ingresos actuales superan los gastos acumulados.' 
              : 'Atención: Los gastos acumulados superan los ingresos.'}
          </div>
        </div>
      </div>

      <div className="card glass-panel animate-slide-in" style={{ padding: '2rem', animationDelay: '0.6s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Actividad Reciente</h3>
          <div style={{ 
            background: 'rgba(99, 102, 241, 0.1)', 
            padding: '0.5rem 1rem', 
            borderRadius: 'var(--radius-md)', 
            fontSize: '0.85rem',
            color: 'var(--primary)',
            fontWeight: '600'
          }}>
            Últimas {data.recent.length} facturas
          </div>
        </div>
        
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {data.recent.length > 0 ? data.recent.map((item, index) => (
            <div 
              key={`${item.type}-${item.id}`} 
              className="animate-fade-in"
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1rem 1.25rem',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                transition: 'all 0.2s ease',
                animationDelay: `${0.7 + index * 0.1}s`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <div style={{ 
                  fontSize: '1.5rem',
                  background: item.type === 'income' 
                    ? 'var(--success-glow)' 
                    : 'rgba(239, 68, 68, 0.15)',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px'
                }}>
                  {item.type === 'income' ? '📈' : '📉'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    {item.entity_name || 'Sin nombre'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span>{item.invoice_number}</span>
                    <span style={{ opacity: 0.5 }}>•</span>
                    <span>{item.issue_date ? new Date(item.issue_date).toLocaleDateString('es-ES') : 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div style={{ 
                fontWeight: '700', 
                fontSize: '1rem',
                color: item.type === 'income' ? 'var(--success)' : 'var(--danger)',
                textAlign: 'right'
              }}>
                {item.type === 'income' ? '+' : '−'}{formatCurrency(item.total_amount)}
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No hay actividad reciente para mostrar.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({ title, value, trend, icon, color, delay }) {
  return (
    <div 
      className="card glass-panel animate-scale-in" 
      style={{ 
        position: 'relative',
        overflow: 'hidden',
        animationDelay: delay
      }}
    >
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '2rem', opacity: 0.3 }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </h3>
      <div style={{ 
        fontSize: '2.25rem', 
        fontWeight: '800', 
        color: color || 'white',
        marginBottom: '0.5rem',
        letterSpacing: '-0.02em',
        lineHeight: 1.1
      }}>
        {value}
      </div>
      <div style={{ 
        color: 'var(--text-muted)', 
        fontSize: '0.8rem', 
        opacity: 0.9,
        fontWeight: '500'
      }}>
        {trend}
      </div>
      
      {/* Decorative gradient bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${color}, transparent)`,
        opacity: 0.6
      }}></div>
    </div>
  );
}
