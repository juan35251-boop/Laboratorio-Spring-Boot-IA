import React, { useState } from 'react';
import { TransferResponse } from '../../types/bank';
import {
  History,
  Search,
  QrCode,
  RefreshCw,
  FileText,
  Download,
  ExternalLink,
  Check,
  Copy,
  X,
  ArrowRight
} from 'lucide-react';
import './TransactionHistory.css';

interface TransactionHistoryProps {
  transactions: TransferResponse[];
  onSelectTransaction: (transaction: TransferResponse) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  onSelectTransaction,
  onRefresh,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'today' | 'high' | 'bank'>('all');
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCopyRef = (ref: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const handleExportCsv = () => {
    if (transactions.length === 0) return;

    const headers = [
      'Referencia',
      'Fecha',
      'Banco',
      'Cuenta_Origen',
      'Titular_Origen',
      'Cuenta_Destino',
      'Titular_Destino',
      'Monto_COP',
      'Concepto',
      'Estado',
      'Enlace_Comprobante_PDF',
    ];

    const rows = transactions.map((t) => [
      `"${t.transactionReference}"`,
      `"${new Date(t.timestamp).toISOString()}"`,
      `"${t.bankName || 'Banco TdeA'}"`,
      `"${t.sourceAccountNumber}"`,
      `"${t.sourceAccountHolder}"`,
      `"${t.destinationAccountNumber}"`,
      `"${t.destinationAccountHolder}"`,
      t.amount,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${t.status}"`,
      `"${t.voucherUrl || ''}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Historial_Transferencias_Banco_TdeA_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter application
  const filtered = transactions.filter((t) => {
    // 1. Search term check
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      const bank = (t.bankName || 'Banco TdeA').toLowerCase();
      const isGenericBankSearch =
        'banco'.includes(term) || 'tdea'.includes(term) || 'banco tdea'.includes(term);

      const matchesSearch =
        isGenericBankSearch ||
        bank.includes(term) ||
        t.transactionReference.toLowerCase().includes(term) ||
        t.sourceAccountNumber.toLowerCase().includes(term) ||
        t.sourceAccountHolder.toLowerCase().includes(term) ||
        t.destinationAccountNumber.toLowerCase().includes(term) ||
        t.destinationAccountHolder.toLowerCase().includes(term) ||
        (t.description && t.description.toLowerCase().includes(term)) ||
        t.amount.toString().includes(term) ||
        formatCOP(t.amount).toLowerCase().includes(term) ||
        t.status.toLowerCase().includes(term);

      if (!matchesSearch) return false;
    }

    // 2. Filter mode check
    if (filterMode === 'today') {
      const txDate = new Date(t.timestamp).toDateString();
      const today = new Date().toDateString();
      return txDate === today;
    }
    if (filterMode === 'high') {
      return t.amount >= 200000;
    }
    if (filterMode === 'bank') {
      return (t.bankName || 'Banco TdeA').toLowerCase().includes('tdea');
    }

    return true;
  });

  return (
    <div className="history-card">
      <div className="history-header">
        <div className="header-left">
          <div className="history-icon-box">
            <History size={20} />
          </div>
          <div>
            <h3 className="history-title">Histórico de Transacciones Auditado</h3>
            <p className="history-subtitle">
              Registro inmutable de traslados con comprobantes y códigos QR codificados
            </p>
          </div>
        </div>

        <div className="header-right">
          <div className="search-box">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por referencia, cuenta, titular o banco..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchTerm('')}
              >
                <X size={13} />
              </button>
            )}
          </div>

          <button
            type="button"
            className="csv-export-btn"
            onClick={handleExportCsv}
            title="Exportar auditoría a CSV / Excel"
            disabled={transactions.length === 0}
          >
            <Download size={14} />
            <span>CSV</span>
          </button>

          <button
            type="button"
            className="refresh-btn"
            onClick={onRefresh}
            title="Recargar histórico"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="history-filter-bar">
        <div className="filter-chips">
          <button
            type="button"
            className={`filter-chip ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => setFilterMode('all')}
          >
            Todas ({transactions.length})
          </button>
          <button
            type="button"
            className={`filter-chip ${filterMode === 'today' ? 'active' : ''}`}
            onClick={() => setFilterMode('today')}
          >
            Hoy
          </button>
          <button
            type="button"
            className={`filter-chip ${filterMode === 'high' ? 'active' : ''}`}
            onClick={() => setFilterMode('high')}
          >
            &gt; $200k COP
          </button>
          <button
            type="button"
            className={`filter-chip ${filterMode === 'bank' ? 'active' : ''}`}
            onClick={() => setFilterMode('bank')}
          >
            Banco TdeA
          </button>
        </div>

        <span className="results-counter">
          Mostrando <strong>{filtered.length}</strong> de {transactions.length}
        </span>
      </div>

      {/* Table Wrapper */}
      <div className="table-wrapper">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <FileText size={40} className="empty-icon" />
            <h4 className="empty-title">No hay transacciones registradas</h4>
            <p className="empty-desc">
              {searchTerm || filterMode !== 'all'
                ? 'No se encontraron movimientos con los filtros aplicados.'
                : 'Realiza tu primera transferencia usando el formulario.'}
            </p>
          </div>
        ) : (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Referencia</th>
                <th>Fecha y Hora</th>
                <th>Trayectoria (Origen → Destino)</th>
                <th>Monto</th>
                <th>Concepto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="history-row" onClick={() => onSelectTransaction(t)}>
                  <td>
                    <div className="ref-cell">
                      <span className="reference-tag">{t.transactionReference}</span>
                      <button
                        type="button"
                        className="cell-copy-btn"
                        onClick={(e) => handleCopyRef(t.transactionReference, e)}
                        title="Copiar referencia"
                      >
                        {copiedRef === t.transactionReference ? (
                          <Check size={11} />
                        ) : (
                          <Copy size={11} />
                        )}
                      </button>
                    </div>
                  </td>
                  <td>
                    <span className="timestamp-text">
                      {new Date(t.timestamp).toLocaleDateString('es-CO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </td>
                  <td>
                    <div className="route-cell">
                      <span className="route-acc origin" title={t.sourceAccountHolder}>
                        {t.sourceAccountHolder}
                      </span>
                      <ArrowRight size={12} className="route-arrow-icon" />
                      <span className="route-acc dest" title={t.destinationAccountHolder}>
                        {t.destinationAccountHolder}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="amount-cell">{formatCOP(t.amount)}</span>
                  </td>
                  <td>
                    <span className="desc-cell" title={t.description || 'Traslado entre cuentas'}>
                      {t.description || 'Traslado entre cuentas'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${t.status.toLowerCase()}`}>
                      {t.status === 'SUCCESS' ? 'APROBADA' : t.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons-cell" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="qr-view-btn"
                        onClick={() => onSelectTransaction(t)}
                        title="Ver comprobante y código QR"
                      >
                        <QrCode size={13} />
                        <span>Ver QR</span>
                      </button>
                      {t.voucherUrl && (
                        <a
                          href={t.voucherUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pdf-quick-link"
                          title="Abrir comprobante digital (PDF)"
                        >
                          <ExternalLink size={13} />
                          <span>PDF</span>
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
