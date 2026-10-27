import React, { useState } from 'react';
import { Account } from '../../types/bank';
import {
  ShieldCheck,
  Copy,
  Landmark,
  Radio,
  Eye,
  EyeOff,
  Check,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
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
  const [showFullNumbers, setShowFullNumbers] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const maskAccountNumber = (num: string) => {
    if (showFullNumbers) return num;
    const parts = num.split('-');
    if (parts.length >= 3) {
      return `${parts[0]}-••••-••••-${parts[parts.length - 1]}`;
    }
    return num;
  };

  const handleCopy = (accNumber: string) => {
    onCopyNumber(accNumber);
    setCopiedAccount(accNumber);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  return (
    <section className="accounts-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Cuentas Registradas en el Sistema</h2>
          <p className="section-desc">
            Haz clic en <strong>"Origen"</strong> o <strong>"Destino"</strong> para cargar automáticamente las cuentas en el formulario.
          </p>
        </div>

        <button
          type="button"
          className="toggle-numbers-btn"
          onClick={() => setShowFullNumbers(!showFullNumbers)}
          title="Alternar visibilidad de números de cuenta"
        >
          {showFullNumbers ? <EyeOff size={14} /> : <Eye size={14} />}
          <span>{showFullNumbers ? 'Ocultar Números' : 'Mostrar Números'}</span>
        </button>
      </div>

      <div className="accounts-grid">
        {accounts.map((acc, index) => {
          const isSource = selectedSource === acc.accountNumber;
          const isDest = selectedDestination === acc.accountNumber;

          // Alternate card styles for visual distinction
          const cardVariant = index % 2 === 0 ? 'variant-emerald' : 'variant-dark';

          return (
            <div
              key={acc.id}
              className={`account-card ${cardVariant} ${isSource ? 'active-source' : ''} ${isDest ? 'active-dest' : ''}`}
            >
              {/* Card Selection Ribbons */}
              {isSource && (
                <div className="card-selection-ribbon source">
                  <span>🟢 CUENTA DE ORIGEN</span>
                </div>
              )}
              {isDest && (
                <div className="card-selection-ribbon dest">
                  <span>🔵 CUENTA DE DESTINO</span>
                </div>
              )}

              {/* Card Top Brand & Chip */}
              <div className="account-card-header">
                <div className="card-brand">
                  <Landmark size={15} />
                  <span>{acc.bankName || 'Banco TdeA'}</span>
                </div>
                <div className="card-top-right">
                  <span className={`badge-type ${acc.accountType.toLowerCase()}`}>
                    {acc.accountType === 'SAVINGS' ? 'Ahorros' : 'Corriente'}
                  </span>
                  <Radio size={16} className="contactless-icon" />
                </div>
              </div>

              {/* Chip Simulation */}
              <div className="chip-and-status">
                <div className="smart-chip" />
                <span className="badge-active-status">
                  <ShieldCheck size={12} />
                  {acc.status}
                </span>
              </div>

              {/* Number and Copy */}
              <div className="account-number-block">
                <span className="account-number-masked">{maskAccountNumber(acc.accountNumber)}</span>
                <button
                  type="button"
                  className="card-copy-btn"
                  onClick={() => handleCopy(acc.accountNumber)}
                  title="Copiar número de cuenta"
                >
                  {copiedAccount === acc.accountNumber ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>

              {/* Holder Info & Balance */}
              <div className="card-bottom-info">
                <div className="holder-col">
                  <span className="holder-label">Titular</span>
                  <span className="holder-name">{acc.accountHolder}</span>
                </div>
                <div className="balance-col">
                  <span className="balance-label">Saldo Disponible</span>
                  <span className="balance-amount">{formatCOP(acc.balance)}</span>
                </div>
              </div>

              {/* Selection Action Buttons */}
              <div className="card-action-bar">
                <button
                  type="button"
                  className={`card-select-btn source-btn ${isSource ? 'active' : ''}`}
                  onClick={() => onSelectSource(acc.accountNumber)}
                >
                  <ArrowUpRight size={13} />
                  <span>{isSource ? 'Origen Activo' : 'Usar como Origen'}</span>
                </button>
                <button
                  type="button"
                  className={`card-select-btn dest-btn ${isDest ? 'active' : ''}`}
                  onClick={() => onSelectDestination(acc.accountNumber)}
                >
                  <ArrowDownLeft size={13} />
                  <span>{isDest ? 'Destino Activo' : 'Usar como Destino'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
