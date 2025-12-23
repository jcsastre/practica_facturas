import { useState, useEffect } from 'react'
import { UploadPage } from './components/UploadPage'
import { InvoicesPage } from './components/InvoicesPage'
import { ExpensesPage } from './components/ExpensesPage'
import { Dashboard } from './components/Dashboard'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="container animate-fade-in">
      <header className="header">
        <div>
          <h1 className="title">Sistema de Gestión</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>Facturas, Gastos e IA</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-nav'}`} onClick={() => setActiveTab('dashboard')}>
            Dashboard
          </button>
          <button className={`btn ${activeTab === 'upload' ? 'btn-primary' : 'btn-nav'}`} onClick={() => setActiveTab('upload')}>
            Subir Factura
          </button>
          <button className={`btn ${activeTab === 'invoices' ? 'btn-primary' : 'btn-nav'}`} onClick={() => setActiveTab('invoices')}>
            Ingresos
          </button>
          <button className={`btn ${activeTab === 'expenses' ? 'btn-primary' : 'btn-nav'}`} onClick={() => setActiveTab('expenses')}>
            Gastos
          </button>
        </div>
      </header>
      
      <main className="grid">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'upload' && <UploadPage />}
        {activeTab === 'invoices' && <InvoicesPage />}
        {activeTab === 'expenses' && <ExpensesPage />}
      </main>
    </div>
  )
}

export default App
