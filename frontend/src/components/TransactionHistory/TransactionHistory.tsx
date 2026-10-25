import React, { useState } from 'react';
import { TransferResponse } from '../../types/bank';
import { History, Search, QrCode, RefreshCw, FileText, Landmark } from 'lucide-react';
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

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
    }).format(val);
  };

  const filtered = transactions.filter((t) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    const bank = (t.bankName || 'Banco TdeA').toLowerCase();
    const isGenericBankSearch = 'banco'.includes(term) || 'tdea'.includes(term) || 'banco tdea'.includes(term);

    return (
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
      t.status.toLowerCase().includes(term) ||
      (t.status === 'SUCCESS' && 'aprobada'.includes(term))
    );
  });

  return (
    <div className="history-card">
      <div className="history-header">
        <div className="header-left">
          <div className="history-icon-box">
            <History size={20} />
          </div>
          <div>
            <h3 className="history-title">Histórico de Transacciones</h3>
            <p className="history-subtitle">
              Registro auditado de todas las transferencias bancarias realizadas
            </p>
          </div>
        </div>

        <div className="header-right">
          <div className="search-box">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por referencia o cuenta..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

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

      <div className="table-wrapper">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <FileText size={40} className="empty-icon" />
            <h4 className="empty-title">No hay transacciones registradas</h4>
            <p className="empty-desc">
              {searchTerm
                ? 'No se encontraron transferencias con los criterios de búsqueda.'
                : 'Realiza tu primera transferencia usando el formulario superior.'}
            </p>
          </div>
        ) : (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Referencia</th>
                <th>Banco</th>
                <th>Fecha y Hora</th>
                <th>Cuenta Origen</th>
                <th>Cuenta Destino</th>
                <th>Monto</th>
                <th>Concepto</th>
                <th>Estado</th>
                <th>Comprobante / QR</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="history-row">
                  <td>
                    <span className="reference-tag">{t.transactionReference}</span>
                  </td>
                  <td>
                    <span className="bank-badge">
                      <Landmark size={12} />
                      {t.bankName || 'Banco TdeA'}
                    </span>
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
                    <div className="account-cell">
                      <span className="holder-cell-name">{t.sourceAccountHolder}</span>
                      <span className="acc-number-cell">{t.sourceAccountNumber}</span>
                    </div>
                  </td>
                  <td>
                    <div className="account-cell">
                      <span className="holder-cell-name">{t.destinationAccountHolder}</span>
                      <span className="acc-number-cell">{t.destinationAccountNumber}</span>
                    </div>
                  </td>
                  <td>
                    <span className="amount-cell">{formatCOP(t.amount)}</span>
                  </td>
                  <td>
                    <span className="desc-cell" title={t.description || 'Traslado'}>
                      {t.description || 'Traslado entre cuentas'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${t.status.toLowerCase()}`}>
                      {t.status === 'SUCCESS' ? 'APROBADA' : t.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="qr-view-btn"
                      onClick={() => onSelectTransaction(t)}
                      title="Ver comprobante y código QR"
                    >
                      <QrCode size={14} />
                      <span>Ver QR</span>
                    </button>
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
