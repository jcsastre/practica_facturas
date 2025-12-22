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

  if (loading) return <div className="p-8 text-center">Cargando métricas...</div>;
  if (!data) return <div className="p-8 text-center">Error cargando datos</div>;

  return (
    <>
      <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
        <StatCard 
            title="Ingresos Totales" 
            value={data.stats.total_income.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} 
            trend="Facturación acumulada"
            color="var(--primary)"
        />
        <StatCard 
            title="Gastos Totales" 
            value={data.stats.total_expenses.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} 
            trend="Gastos acumulados"
            color="#ec4899"
        />
        <StatCard 
            title="IVA a Pagar (Est.)" 
            value={data.stats.vat_to_pay.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} 
            trend="Repercutido - Soportado"
            color="#f59e0b"
        />
      </div>

      <div className="card glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Actividad Reciente</h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
        {data.recent.map(item => (
            <div key={item.id} style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{item.type === 'income' ? '📈' : '📉'}</span>
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{item.entity_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.invoice_number}</div>
                    </div>
                </div>
                <div style={{ fontWeight: 'bold', color: item.type === 'income' ? '#4ade80' : '#f472b6' }}>
                    {Number(item.total_amount).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                </div>
            </div>
        ))}
        </div>
      </div>
    </>
  );
}

function StatCard({ title, value, trend, color }) {
  return (
    <div className="card glass-panel">
      <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>{title}</h3>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: color || 'white' }}>{value}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.8 }}>{trend}</div>
    </div>
  )
}
