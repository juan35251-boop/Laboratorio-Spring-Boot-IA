import React, { useState } from 'react';
import { TransferResponse } from '../../types/bank';
import { CheckCircle2, Download, Printer, X, QrCode, Copy, Info } from 'lucide-react';
import './ReceiptModal.css';

interface ReceiptModalProps {
  receipt: TransferResponse | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  const [showQrData, setShowQrData] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!receipt) return null;

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
    }).format(val);
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(receipt.transactionReference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = receipt.qrCodeBase64;
    link.download = `QR_${receipt.transactionReference}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="receipt-backdrop" onClick={onClose}>
      <div className="receipt-dialog" onClick={(e) => e.stopPropagation()}>
        <button className="receipt-close-btn" onClick={onClose} aria-label="Cerrar comprobante">
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="receipt-header">
          <div className="success-badge-ring">
            <CheckCircle2 size={36} className="success-check-icon" />
          </div>
          <h2 className="receipt-title">¡Transferencia Exitosa!</h2>
          <p className="receipt-subtitle">Comprobante de operación bancaria en línea</p>
        </div>

        {/* Amount Highlight */}
        <div className="receipt-amount-card">
          <span className="amount-caption">Valor Trasladado</span>
          <span className="amount-number">{formatCOP(receipt.amount)}</span>
          <span className="amount-status-badge">APROBADA • {receipt.status}</span>
        </div>

        {/* Receipt Body Details */}
        <div className="receipt-details-list">
          <div className="detail-row">
            <span className="detail-label">Referencia</span>
            <div className="detail-value-with-copy">
              <span className="mono-text">{receipt.transactionReference}</span>
              <button
                className="copy-mini-btn"
                onClick={handleCopyRef}
                title="Copiar referencia"
              >
                <Copy size={13} />
                {copied && <span className="copied-tooltip">¡Copiado!</span>}
              </button>
            </div>
          </div>

          <div className="detail-row">
            <span className="detail-label">Fecha y Hora</span>
            <span className="detail-value">{new Date(receipt.timestamp).toLocaleString('es-CO')}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Cuenta Origen</span>
            <div className="detail-account-col">
              <span className="detail-account-name">{receipt.sourceAccountHolder}</span>
              <span className="mono-subtext">{receipt.sourceAccountNumber}</span>
            </div>
          </div>

          <div className="detail-row">
            <span className="detail-label">Cuenta Destino</span>
            <div className="detail-account-col">
              <span className="detail-account-name">{receipt.destinationAccountHolder}</span>
              <span className="mono-subtext">{receipt.destinationAccountNumber}</span>
            </div>
          </div>

          <div className="detail-row">
            <span className="detail-label">Concepto</span>
            <span className="detail-value">{receipt.description || 'Traslado entre cuentas'}</span>
          </div>

          {receipt.sourceRemainingBalance !== undefined && receipt.sourceRemainingBalance !== null && (
            <div className="detail-row highlight-balance">
              <span className="detail-label">Nuevo Saldo Origen</span>
              <span className="detail-value mono-text font-bold">
                {formatCOP(receipt.sourceRemainingBalance)}
              </span>
            </div>
          )}
        </div>

        {/* QR Code Section */}
        <div className="receipt-qr-section">
          <div className="qr-badge-title">
            <QrCode size={18} />
            <span>Código QR de Verificación</span>
          </div>
          <p className="qr-hint">
            Escanea este código con cualquier lector o cámara para verificar los datos de la transferencia.
          </p>

          <div className="qr-image-wrapper">
            <img
              src={receipt.qrCodeBase64}
              alt={`QR Code para ${receipt.transactionReference}`}
              className="qr-image"
            />
          </div>

          <div className="qr-actions-row">
            <button type="button" className="qr-tool-btn" onClick={handleDownloadQr}>
              <Download size={14} />
              <span>Descargar QR (PNG)</span>
            </button>
            <button
              type="button"
              className="qr-tool-btn outline"
              onClick={() => setShowQrData(!showQrData)}
            >
              <Info size={14} />
              <span>{showQrData ? 'Ocultar Datos Codificados' : 'Ver Datos Codificados'}</span>
            </button>
          </div>

          {showQrData && (
            <pre className="qr-payload-preview">
              <code>{receipt.qrCodeData}</code>
            </pre>
          )}
        </div>

        {/* Footer Actions */}
        <div className="receipt-footer">
          <button type="button" className="receipt-btn secondary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Imprimir Comprobante</span>
          </button>
          <button type="button" className="receipt-btn primary" onClick={onClose}>
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
};
