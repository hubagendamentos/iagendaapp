import { createContext, useContext, useState, type ReactNode } from "react";

export type TimelineItemType = "note" | "prescription" | "attachment" | "status";

export type TimelineItem = {
  id: string;
  patientId: string;
  appointmentId?: string;
  type: TimelineItemType;
  content?: string;
  createdBy: string;
  createdAt: Date;
  statusLabel?: string;
};

interface TimelineContextType {
  timeline: TimelineItem[];
  addTimelineItem: (item: Omit<TimelineItem, "id" | "createdAt">) => void;
  getTimelineByPatient: (patientId: string) => TimelineItem[];
}

const TimelineContext = createContext<TimelineContextType | null>(null);

export const useTimeline = () => {
  const ctx = useContext(TimelineContext);
  if (!ctx) throw new Error("useTimeline must be used within TimelineProvider");
  return ctx;
};

// Initial mock data to show history
const initialTimeline: TimelineItem[] = [
  {
    id: "t1",
    patientId: "1",
    appointmentId: "a-old-1",
    type: "note",
    content: "Paciente relatou melhora significativa das dores após início do tratamento.",
    createdBy: "Dr. João Silva",
    createdAt: new Date("2026-03-20T10:30:00"),
  },
  {
    id: "t2",
    patientId: "1",
    appointmentId: "a-old-1",
    type: "prescription",
    content: "Dipirona 500mg - 1 comp de 6/6h em caso de dor.",
    createdBy: "Dr. João Silva",
    createdAt: new Date("2026-03-20T10:45:00"),
  },
  {
    id: "t3",
    patientId: "2",
    appointmentId: "a-old-2",
    type: "note",
    content: "Paciente iniciou acompanhamento. Histórico de hipertensão familiar.",
    createdBy: "Dra. Maria Santos",
    createdAt: new Date("2026-02-15T09:00:00"),
  }
];

export const TimelineProvider = ({ children }: { children: ReactNode }) => {
  const [timeline, setTimeline] = useState<TimelineItem[]>(initialTimeline);

  const addTimelineItem = (item: Omit<TimelineItem, "id" | "createdAt">) => {
    const newItem: TimelineItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setTimeline((prev) => [newItem, ...prev]);
  };

  const getTimelineByPatient = (patientId: string) => {
    return timeline
      .filter((item) => item.patientId === patientId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  return (
    <TimelineContext.Provider value={{ timeline, addTimelineItem, getTimelineByPatient }}>
      {children}
    </TimelineContext.Provider>
  );
};
