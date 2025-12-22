import { useState, useEffect } from 'react';

export function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Simulación de datos para demostración (Fake Data)
      const fakeData = {
        stats: {
          total_income: 12540.50,
          total_expenses: 4320.25,
          vat_to_pay: 1725.10
        },
        recent: [
          {
            id: "1",
            type: "income",
            entity_name: "Clínica Salud Integral, S.L.",
            invoice_number: "EMI-2025-001",
            total_amount: 907.50,
            created_at: "2025-01-08T10:00:00Z",
            status: "processed"
          },
          {
            id: "2",
            type: "expense",
            entity_name: "Amazon Web Services",
            invoice_number: "PROV-2025-003",
            total_amount: 254.10,
            created_at: "2025-01-05T15:30:00Z",
            status: "processed"
          },
          {
            id: "3",
            type: "income",
            entity_name: "Tech Solutions S.L.",
            invoice_number: "EMI-2025-002",
            total_amount: 1540.00,
            created_at: "2024-12-28T12:00:00Z",
            status: "processed"
          },
          {
            id: "4",
            type: "expense",
            entity_name: "Google Cloud",
            invoice_number: "GCP-9921",
            total_amount: 120.45,
            created_at: "2024-12-20T09:15:00Z",
            status: "processed"
          }
        ]
      };
      
      // Simulamos un pequeño retraso de red
      await new Promise(resolve => setTimeout(resolve, 500));
      setData(fakeData);
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

  const netProfit = data.stats.total_income - data.stats.total_expenses;

  return (
    <>
      <div className="grid grid-cols-3" style={{ marginBottom: '2.5rem' }}>
        <StatCard 
          title="Ingresos Totales" 
          value={data.stats.total_income.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} 
          trend="Facturación acumulada"
          icon="📈"
          color="var(--success)"
          delay="0s"
        />
        <StatCard 
          title="Gastos Totales" 
          value={data.stats.total_expenses.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} 
          trend="Gastos acumulados"
          icon="📊"
          color="var(--danger)"
          delay="0.1s"
        />
        <StatCard 
          title="IVA a Pagar (Est.)" 
          value={data.stats.vat_to_pay.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} 
          trend="Repercutido - Soportado"
          icon="💰"
          color="var(--warning)"
          delay="0.2s"
        />
      </div>

      {/* Net Profit Banner */}
      <div className="card glass-panel animate-scale-in" style={{ 
        marginBottom: '2rem',
        background: netProfit >= 0 
          ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)'
          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
        border: `1px solid ${netProfit >= 0 ? 'var(--success-glow)' : 'rgba(239, 68, 68, 0.2)'}`,
        padding: '1.5rem',
        textAlign: 'center',
        animationDelay: '0.3s'
      }}>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '500' }}>
          Beneficio Neto
        </div>
        <div style={{ 
          fontSize: '2.5rem', 
          fontWeight: '800', 
          color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)',
          letterSpacing: '-0.02em'
        }}>
          {netProfit.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          {netProfit >= 0 ? '✓ ' : '⚠ '}
          Ingresos {netProfit >= 0 ? 'superiores' : 'inferiores'} a los gastos
        </div>
      </div>

      <div className="card glass-panel animate-slide-in" style={{ padding: '2rem', animationDelay: '0.4s' }}>
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
            {data.recent.length} transacciones
          </div>
        </div>
        
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {data.recent.map((item, index) => (
            <div 
              key={item.id} 
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
                cursor: 'pointer',
                animationDelay: `${0.5 + index * 0.1}s`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.borderColor = 'var(--border-hover)';
                e.currentTarget.style.background = 'var(--bg-surface-elevated)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--bg-surface)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <div style={{ 
                  fontSize: '1.75rem',
                  background: item.type === 'income' 
                    ? 'var(--success-glow)' 
                    : 'rgba(239, 68, 68, 0.15)',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px'
                }}>
                  {item.type === 'income' ? '📈' : '📉'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                    {item.entity_name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span>{item.invoice_number}</span>
                    <span style={{ opacity: 0.5 }}>•</span>
                    <span>{new Date(item.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                  </div>
                </div>
              </div>
              <div style={{ 
                fontWeight: '700', 
                fontSize: '1.1rem',
                color: item.type === 'income' ? 'var(--success)' : 'var(--danger)',
                textAlign: 'right',
                minWidth: '120px'
              }}>
                {item.type === 'income' ? '+' : '−'}{Number(item.total_amount).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
              </div>
            </div>
          ))}
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
