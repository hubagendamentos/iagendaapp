import { format } from "date-fns";
import type { TimelineItem } from "@/contexts/TimelineContext";

interface DadosPDF {
  clinicaNome: string;
  pacienteNome: string;
  pacienteCpf?: string;
  pacienteIdade?: number | null;
  pacienteTelefone?: string;
  profissional: string;
  data: string;
  tipo?: string;
  servico?: string;
  timeline: TimelineItem[];
}

function typeLabel(type: string): string {
  switch (type) {
    case "note": return "Evolução Clínica";
    case "prescription": return "Prescrição";
    case "attachment": return "Anexo";
    case "status": return "Status";
    default: return "Registro";
  }
}

export function gerarPDFContent(dados: DadosPDF): string {
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
  if (dados.tipo) lines.push(`Tipo: ${dados.tipo}`);
  if (dados.servico) lines.push(`Serviço: ${dados.servico}`);
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
      downloadFile(url);
    });
  } else {
    downloadFile(url);
  }
}

function downloadFile(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = "prontuario.txt";
  a.click();
  URL.revokeObjectURL(url);
}