import React, { useState } from 'react';
import { Account, TransferRequest } from '../../types/bank';
import { Send, ArrowRightLeft, DollarSign, FileText, AlertTriangle } from 'lucide-react';
import './TransferForm.css';

interface TransferFormProps {
  accounts: Account[];
  sourceAccountNumber: string;
  destinationAccountNumber: string;
  onSourceChange: (val: string) => void;
  onDestinationChange: (val: string) => void;
  onSubmitTransfer: (payload: TransferRequest) => Promise<void>;
  loading: boolean;
}

export const TransferForm: React.FC<TransferFormProps> = ({
  accounts,
  sourceAccountNumber,
  destinationAccountNumber,
  onSourceChange,
  onDestinationChange,
  onSubmitTransfer,
  loading,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);

  const selectedSourceAccount = accounts.find((a) => a.accountNumber === sourceAccountNumber);

  const quickAmounts = [50000, 100000, 250000, 500000, 1000000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!sourceAccountNumber.trim()) {
      setLocalError('Por favor selecciona una cuenta de origen.');
      return;
    }

    if (!destinationAccountNumber.trim()) {
      setLocalError('Por favor indica o selecciona la cuenta de destino.');
      return;
    }

    if (sourceAccountNumber.trim() === destinationAccountNumber.trim()) {
      setLocalError('La cuenta de origen y de destino no pueden ser la misma.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setLocalError('El monto de la transferencia debe ser mayor a $0.');
      return;
    }

    if (selectedSourceAccount && numAmount > selectedSourceAccount.balance) {
      setLocalError(
        `Fondos insuficientes. El saldo disponible es de $${selectedSourceAccount.balance.toLocaleString('es-CO')} COP.`
      );
      return;
    }

    if (!description.trim()) {
      setLocalError('El concepto o descripción de la transferencia es obligatorio.');
      return;
    }

    await onSubmitTransfer({
      sourceAccountNumber: sourceAccountNumber.trim(),
      destinationAccountNumber: destinationAccountNumber.trim(),
      amount: numAmount,
      description: description.trim(),
    });

    // Reset amount and description upon successful dispatch
    setAmount('');
    setDescription('');
  };

  return (
    <div className="transfer-card">
      <div className="card-header-styled">
        <div className="header-icon-wrap">
          <ArrowRightLeft size={20} />
        </div>
        <div>
          <h3 className="card-heading">Nueva Transferencia</h3>
          <p className="card-subheading">Envía dinero de forma inmediata entre cuentas bancarias</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-body">
        {localError && (
          <div className="form-validation-alert">
            <AlertTriangle size={18} />
            <span>{localError}</span>
          </div>
        )}

        {/* Source Account */}
        <div className="form-group">
          <label htmlFor="sourceAccount" className="form-label">
            Cuenta de Origen <span className="req">*</span>
          </label>
          <select
            id="sourceAccount"
            className="form-select"
            value={sourceAccountNumber}
            onChange={(e) => onSourceChange(e.target.value)}
            disabled={loading}
          >
            <option value="">-- Selecciona cuenta de origen --</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.accountNumber}>
                {acc.accountHolder} ({acc.accountNumber}) - Saldo: $
                {acc.balance.toLocaleString('es-CO')} COP
              </option>
            ))}
          </select>
        </div>

        {/* Destination Account */}
        <div className="form-group">
          <label htmlFor="destinationAccount" className="form-label">
            Cuenta de Destino <span className="req">*</span>
          </label>
          <select
            id="destinationAccount"
            className="form-select"
            value={destinationAccountNumber}
            onChange={(e) => onDestinationChange(e.target.value)}
            disabled={loading}
          >
            <option value="">-- Selecciona cuenta de destino --</option>
            {accounts
              .filter((acc) => acc.accountNumber !== sourceAccountNumber)
              .map((acc) => (
                <option key={acc.id} value={acc.accountNumber}>
                  {acc.accountHolder} ({acc.accountNumber})
                </option>
              ))}
          </select>
        </div>

        {/* Amount */}
        <div className="form-group">
          <label htmlFor="transferAmount" className="form-label">
            Monto a Transferir (COP) <span className="req">*</span>
          </label>
          <div className="input-with-icon">
            <span className="input-icon-box">
              <DollarSign size={16} />
            </span>
            <input
              id="transferAmount"
              type="number"
              step="1000"
              min="1"
              placeholder="Ej: 150000"
              className="form-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="quick-amount-tags">
            {quickAmounts.map((q) => (
              <button
                key={q}
                type="button"
                className="q-tag-btn"
                onClick={() => setAmount(q.toString())}
                disabled={loading}
              >
                +${(q / 1000).toLocaleString('es-CO')}k
              </button>
            ))}
          </div>
        </div>

        {/* Concept / Description */}
        <div className="form-group">
          <label htmlFor="transferDesc" className="form-label">
            Concepto / Referencia <span className="req">*</span>
          </label>
          <div className="input-with-icon">
            <span className="input-icon-box">
              <FileText size={16} />
            </span>
            <input
              id="transferDesc"
              type="text"
              maxLength={100}
              placeholder="Ej: Pago arriendo, Honorarios, Cuota universitaria..."
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <button type="submit" className="submit-transfer-btn" disabled={loading}>
          {loading ? (
            <span className="spinner-text">Procesando transferencia...</span>
          ) : (
            <>
              <Send size={18} />
              <span>Ejecutar Traslado y Generar QR</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
