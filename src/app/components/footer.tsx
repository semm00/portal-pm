import React from "react";
import { Mail, Instagram, Github, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0b203a] text-white transition-colors duration-300 dark:bg-neutral-950 dark:text-neutral-100 py-8 px-5 sm:px-8 md:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Propaganda */}
        <div className="text-center mb-6">
          <p className="text-lg font-semibold text-white dark:text-neutral-100">
            Tem alguma dúvida ou gostaria de ter um site como esse? Entre em
            contato!
          </p>
        </div>

        {/* Contato rápido */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
          <a
            href="mailto:portalpm.dev@gmail.com"
            className="flex items-center gap-2 hover:text-[#fca311] transition-colors"
            aria-label="Enviar e-mail"
          >
            <Mail className="h-5 w-5" />
            portalpm.dev@gmail.com
          </a>
          <div className="flex gap-4">
            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#fca311] transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/semm00"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#fca311] transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#fca311] transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-white/80 dark:text-neutral-400">
          <p>Este site é um portal independente</p>
          <p>&copy; 2025 Todos os direitos reservados a semm_dev</p>
        </div>
      </div>
    </footer>
  );
}
