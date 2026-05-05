import { format } from "date-fns";
import type { TimelineItem } from "@/contexts/TimelineContext";

export interface DadosPDF {
  clinicaNome: string;
  pacienteNome: string;
  pacienteCpf?: string;
  pacienteIdade?: number | null;
  pacienteTelefone?: string;
  pacienteEndereco?: string;
  profissional: string;
  data: string;
  tipo?: string;
  servico?: string;
  timeline: TimelineItem[];
  mostrarEndereco?: boolean;
  dadosPaciente?: boolean;
}

export function typeLabel(type: string): string {
  switch (type) {
    case "note": return "Evolução Clínica";
    case "prescription": return "Prescrição";
    case "attachment": return "Anexo";
    case "status": return "Status";
    case "receita": return "Receita";
    default: return "Registro";
  }
}

export function gerarConteudoImpressao(dados: DadosPDF): string {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Prontuário - ${dados.pacienteNome}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.5; }
        .header { border-bottom: 2px solid #0066cc; padding-bottom: 10px; margin-bottom: 20px; }
        .header h1 { color: #0066cc; margin: 0; font-size: 24px; }
        .header p { color: #666; margin: 5px 0; font-size: 14px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #0066cc; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px; }
        .timeline-item { border-left: 3px solid #e0e0e0; padding: 10px 15px; margin: 15px 0; page-break-inside: avoid; }
        .timeline-item h4 { margin: 0 0 5px 0; color: #555; font-size: 14px; }
        .timeline-item p { margin: 5px 0; font-size: 14px; white-space: pre-wrap; }
        .timeline-item small { color: #777; font-size: 12px; }
        .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 10px; font-size: 12px; color: #999; text-align: center; }
        @media print { 
          body { padding: 20px; }
          .header { border-bottom: 2px solid #333; }
          .header h1, .section h2 { color: #333; }
        }
      </style>
    </head>
    <body>
      <!-- Cabeçalho -->
      <div class="header">
        <h1>${dados.clinicaNome}</h1>
        <p>Prontuário de Atendimento | ${dados.profissional}</p>
        <p>Gerado em: ${dados.data}</p>
      </div>

      <!-- Dados do paciente -->
      ${dados.dadosPaciente !== false ? `
        <div class="section">
          <h2>Dados do Paciente</h2>
          <p><strong>Nome:</strong> ${dados.pacienteNome}</p>
          ${dados.pacienteCpf ? `<p><strong>CPF:</strong> ${dados.pacienteCpf}</p>` : ''}
          ${dados.pacienteIdade != null ? `<p><strong>Idade:</strong> ${dados.pacienteIdade} anos</p>` : ''}
          ${dados.pacienteTelefone ? `<p><strong>Telefone:</strong> ${dados.pacienteTelefone}</p>` : ''}
          ${dados.mostrarEndereco && dados.pacienteEndereco ? `<p><strong>Endereço:</strong> ${dados.pacienteEndereco}</p>` : ''}
        </div>
      ` : ''}

      <!-- Timeline filtrada -->
      <div class="section">
        <h2>Registros Clínicos</h2>
        ${dados.timeline.length > 0 ? dados.timeline.map(item => `
          <div class="timeline-item">
            <h4>${item.createdAt ? format(new Date(item.createdAt), 'dd/MM/yyyy HH:mm') : '--'} - ${typeLabel(item.type)}</h4>
            <p>${item.content || ''}</p>
            <small>Registrado por: ${item.createdBy}</small>
          </div>
        `).join('') : '<p>Nenhum registro encontrado.</p>'}
      </div>

      <!-- Rodapé -->
      <div class="footer">
        <p>Documento gerado eletronicamente por Hub Agendamentos</p>
      </div>
    </body>
    </html>
  `;
  
  return html;
}

export function gerarPDFContent(dados: DadosPDF): string {
  // Mantém a versão texto para quem prefere raw TXT
  const lines: string[] = [];
  lines.push(`=== ${dados.clinicaNome} ===`);
  lines.push("");
  lines.push(`Paciente: ${dados.pacienteNome}`);
  if (dados.pacienteCpf) lines.push(`CPF: ${dados.pacienteCpf}`);
  if (dados.pacienteIdade != null) lines.push(`Idade: ${dados.pacienteIdade} anos`);
  if (dados.pacienteTelefone) lines.push(`Telefone: ${dados.pacienteTelefone}`);
  lines.push("");
  lines.push(`Profissional: ${dados.profissional}`);
  lines.push(`Data: ${dados.data}`);
  lines.push("");
  lines.push("--- TIMELINE ---");
  lines.push("");

  dados.timeline.forEach((item) => {
    const date = item.createdAt ? format(new Date(item.createdAt), "dd/MM/yyyy HH:mm") : "--";
    lines.push(`[${date}] ${typeLabel(item.type)} - ${item.createdBy}`);
    if (item.content) lines.push(`  ${item.content}`);
    lines.push("");
  });

  lines.push(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`);
  return lines.join("\n");
}

export function compartilharOuBaixar(dados: DadosPDF) {
  const content = gerarPDFContent(dados);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  if (navigator.share) {
    const file = new File([blob], "prontuario.txt", { type: "text/plain" });
    navigator.share({ title: "Prontuário", files: [file] }).catch(() => {
      downloadFile(url, "prontuario.txt");
    });
  } else {
    downloadFile(url, "prontuario.txt");
  }
}

export function downloadFile(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}