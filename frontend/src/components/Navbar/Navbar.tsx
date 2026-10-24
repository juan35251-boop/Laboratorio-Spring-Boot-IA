import React from 'react';
import { Landmark, FileCode } from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
  backendOnline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ backendOnline }) => {
  return (
    <header className="bank-navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="logo-icon-box">
            <Landmark size={24} className="brand-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Banco TdeA</span>
            <span className="brand-subtitle">Módulo de Transferencias Bancarias & QR</span>
          </div>
        </div>

        <div className="navbar-actions">
          <div className={`status-pill ${backendOnline ? 'online' : 'offline'}`}>
            <span className="status-dot"></span>
            <span>{backendOnline ? 'Backend Online (8080)' : 'Desconectado'}</span>
          </div>

          <a
            href="http://localhost:8080/swagger-ui.html"
            target="_blank"
            rel="noopener noreferrer"
            className="swagger-btn"
            title="Abrir documentación Swagger OpenAPI"
          >
            <FileCode size={16} />
            <span>Swagger API</span>
          </a>
        </div>
      </div>
    </header>
  );
};
