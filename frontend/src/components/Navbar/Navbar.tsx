import React from 'react';
import { Landmark, FileCode, Database, Shield } from 'lucide-react';
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
            <div className="brand-title-row">
              <span className="brand-title">Banco TdeA</span>
              <span className="institution-pill">
                <Shield size={10} />
                Tecnológico de Antioquia
              </span>
            </div>
            <span className="brand-subtitle">
              Sistema Transaccional de Traslado de Fondos & Códigos QR
            </span>
          </div>
        </div>

        <div className="navbar-actions">
          <div className={`status-pill ${backendOnline ? 'online' : 'offline'}`}>
            <span className="status-dot"></span>
            <span>{backendOnline ? 'API Spring Boot Activa' : 'Desconectado'}</span>
          </div>

          <a
            href="http://localhost:8080/swagger-ui.html"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar-btn swagger"
            title="Abrir documentación interactiva OpenAPI"
          >
            <FileCode size={15} />
            <span>Swagger UI</span>
          </a>

          <a
            href="http://localhost:8080/h2-console"
            target="_blank"
            rel="noopener noreferrer"
            className="navbar-btn h2"
            title="Abrir consola de base de datos H2"
          >
            <Database size={15} />
            <span>H2 Console</span>
          </a>
        </div>
      </div>
    </header>
  );
};
