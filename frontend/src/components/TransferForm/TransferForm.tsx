import React, { useState } from 'react';
import { Account, TransferRequest } from '../../types/bank';
import {
  Send,
  ArrowRightLeft,
  DollarSign,
  FileText,
  AlertTriangle,
  ArrowUpDown,
  Calculator,
  Tag,
  Check
} from 'lucide-react';
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

  const quickAmounts = [50000, 100000, 250000, 500000];
  const quickConcepts = [
    'Matrícula TdeA',
    'Pago arriendo',
    'Honorarios',
    'Servicios públicos',
    'Préstamo familiar',
    'Ahorro programado',
  ];

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const numAmount = parseFloat(amount) || 0;
  const currentBalance = selectedSourceAccount ? selectedSourceAccount.balance : 0;
  const remainingBalance = currentBalance - numAmount;
  const hasInsufficientFunds = selectedSourceAccount ? numAmount > currentBalance : false;

  const handleSwapAccounts = () => {
    if (sourceAccountNumber && destinationAccountNumber) {
      const temp = sourceAccountNumber;
      onSourceChange(destinationAccountNumber);
      onDestinationChange(temp);
    }
  };

  const handlePercentageClick = (pct: number) => {
    if (selectedSourceAccount) {
      const calc = Math.floor((selectedSourceAccount.balance * pct) / 100);
      setAmount(calc > 0 ? calc.toString() : '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!sourceAccountNumber.trim()) {
      setLocalError('Por favor selecciona una cuenta de origen.');
      return;
    }

    if (!destinationAccountNumber.trim()) {
      setLocalError('Por favor selecciona una cuenta de destino.');
      return;
    }

    if (sourceAccountNumber.trim() === destinationAccountNumber.trim()) {
      setLocalError('La cuenta de origen y de destino no pueden ser la misma.');
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      setLocalError('El monto de la transferencia debe ser mayor a $0.');
      return;
    }

    if (hasInsufficientFunds) {
      setLocalError(
        `Fondos insuficientes. El saldo disponible es de ${formatCOP(currentBalance)}.`
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
          <p className="card-subheading">Traslado inmediato de fondos con generación de código QR</p>
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
            Cuenta de Origen (Débito) <span className="req">*</span>
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
                {acc.accountHolder} ({acc.accountNumber}) — Saldo: {formatCOP(acc.balance)}
              </option>
            ))}
          </select>
        </div>

        {/* Account Swap Interactive Button */}
        <div className="swap-button-row">
          <button
            type="button"
            className="swap-btn"
            onClick={handleSwapAccounts}
            title="Intercambiar cuenta de origen y destino"
            disabled={loading || !sourceAccountNumber || !destinationAccountNumber}
          >
            <ArrowUpDown size={15} />
            <span>Invertir Origen / Destino</span>
          </button>
        </div>

        {/* Destination Account */}
        <div className="form-group">
          <label htmlFor="destinationAccount" className="form-label">
            Cuenta de Destino (Crédito) <span className="req">*</span>
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

        {/* Amount Input */}
        <div className="form-group">
          <div className="amount-label-row">
            <label htmlFor="transferAmount" className="form-label">
              Monto a Transferir (COP) <span className="req">*</span>
            </label>
            {selectedSourceAccount && (
              <span className="max-avail-text">
                Disponible: <strong>{formatCOP(currentBalance)}</strong>
              </span>
            )}
          </div>

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
              className={`form-input ${hasInsufficientFunds ? 'input-error' : ''}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Quick Amounts & Percentage Tags */}
          <div className="quick-amount-row">
            <div className="quick-tags-group">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="q-tag-btn"
                  onClick={() => setAmount(q.toString())}
                  disabled={loading}
                >
                  +${q / 1000}k
                </button>
              ))}
            </div>

            {selectedSourceAccount && (
              <div className="pct-tags-group">
                <button
                  type="button"
                  className="pct-btn"
                  onClick={() => handlePercentageClick(25)}
                  disabled={loading}
                >
                  25%
                </button>
                <button
                  type="button"
                  className="pct-btn"
                  onClick={() => handlePercentageClick(50)}
                  disabled={loading}
                >
                  50%
                </button>
                <button
                  type="button"
                  className="pct-btn max"
                  onClick={() => handlePercentageClick(100)}
                  disabled={loading}
                >
                  Max (Todo)
                </button>
              </div>
            )}
          </div>

          {/* Live Balance Impact Simulator */}
          {selectedSourceAccount && numAmount > 0 && (
            <div className={`balance-simulator ${hasInsufficientFunds ? 'danger' : 'success'}`}>
              <div className="sim-header">
                <Calculator size={13} />
                <span>Simulación de Impacto en Saldo</span>
              </div>
              <div className="sim-row">
                <span>Saldo actual:</span>
                <span className="mono">{formatCOP(currentBalance)}</span>
              </div>
              <div className="sim-row debit">
                <span>Monto a debitar:</span>
                <span className="mono">- {formatCOP(numAmount)}</span>
              </div>
              <div className="sim-row total">
                <span>Saldo estimado tras envío:</span>
                <span className={`mono font-bold ${hasInsufficientFunds ? 'text-red' : 'text-green'}`}>
                  {formatCOP(remainingBalance)}
                </span>
              </div>
              {hasInsufficientFunds && (
                <div className="sim-warning">
                  ⚠️ El monto supera los fondos disponibles en la cuenta.
                </div>
              )}
            </div>
          )}
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
              placeholder="Ej: Pago arriendo, Matrícula TdeA..."
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Predefined Category Chips */}
          <div className="concept-chips-row">
            <span className="chips-hint">
              <Tag size={12} />
              Sugeridos:
            </span>
            {quickConcepts.map((c) => (
              <button
                key={c}
                type="button"
                className={`concept-chip ${description === c ? 'selected' : ''}`}
                onClick={() => setDescription(c)}
                disabled={loading}
              >
                {description === c && <Check size={11} />}
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Action Button */}
        <button
          type="submit"
          className="submit-transfer-btn"
          disabled={loading || hasInsufficientFunds || !sourceAccountNumber || !destinationAccountNumber}
        >
          {loading ? (
            <span className="spinner-text">Generando comprobante y código QR...</span>
          ) : (
            <>
              <Send size={18} />
              <span>
                {numAmount > 0
                  ? `Transferir ${formatCOP(numAmount)} y Generar QR`
                  : 'Ejecutar Traslado y Generar QR'}
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
