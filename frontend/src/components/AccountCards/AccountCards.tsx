import React from 'react';
import { Account } from '../../types/bank';
import { ShieldCheck, Copy } from 'lucide-react';
import './AccountCards.css';

interface AccountCardsProps {
  accounts: Account[];
  selectedSource: string;
  selectedDestination: string;
  onSelectSource: (accountNumber: string) => void;
  onSelectDestination: (accountNumber: string) => void;
  onCopyNumber: (accountNumber: string) => void;
}

export const AccountCards: React.FC<AccountCardsProps> = ({
  accounts,
  selectedSource,
  selectedDestination,
  onSelectSource,
  onSelectDestination,
  onCopyNumber,
}) => {
  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
    }).format(val);
  };

  return (
    <section className="accounts-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Cuentas Registradas</h2>
          <p className="section-desc">
            Consulta el saldo disponible y selecciona cuentas para operar transferencias inmediatas.
          </p>
        </div>
      </div>

      <div className="accounts-grid">
        {accounts.map((acc) => {
          const isSource = selectedSource === acc.accountNumber;
          const isDest = selectedDestination === acc.accountNumber;

          return (
            <div
              key={acc.id}
              className={`account-card ${isSource ? 'active-source' : ''} ${isDest ? 'active-dest' : ''}`}
            >
              <div className="account-card-header">
                <span className={`badge-type ${acc.accountType.toLowerCase()}`}>
                  {acc.accountType === 'SAVINGS' ? 'Ahorros' : 'Corriente'}
                </span>
                <span className={`badge-status ${acc.status.toLowerCase()}`}>
                  <ShieldCheck size={12} />
                  {acc.status}
                </span>
              </div>

              <div className="account-holder-info">
                <h3 className="holder-name">{acc.accountHolder}</h3>
                <div className="number-row">
                  <span className="account-number-text">{acc.accountNumber}</span>
                  <button
                    className="copy-btn"
                    title="Copiar número de cuenta"
                    onClick={() => onCopyNumber(acc.accountNumber)}
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>

              <div className="balance-box">
                <span className="balance-label">Saldo Disponible</span>
                <span className="balance-amount">{formatCOP(acc.balance)}</span>
              </div>

              <div className="card-actions">
                <button
                  type="button"
                  className={`quick-select-btn ${isSource ? 'selected' : ''}`}
                  onClick={() => onSelectSource(acc.accountNumber)}
                >
                  {isSource ? '✓ Origen' : 'Usar como Origen'}
                </button>
                <button
                  type="button"
                  className={`quick-select-btn dest ${isDest ? 'selected' : ''}`}
                  onClick={() => onSelectDestination(acc.accountNumber)}
                >
                  {isDest ? '✓ Destino' : 'Destino'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
