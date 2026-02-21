import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultTemplateWorkflows = [
  {
    name: 'Ciclo básico - Cosecha y empaque',
    description: 'Plantilla con tareas: preparación, cosecha y empaque. Cada nodo se convierte en una tarea del Kanban.',
    isTemplate: true,
    farmId: null as string | null,
    nodes: [
      { id: 'start', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Inicio' } },
      { id: 'preparacion', type: 'task', position: { x: 250, y: 150 }, data: { label: 'Preparación del lote', title: 'Preparación', description: 'Revisar condiciones del lote antes de cosecha' } },
      { id: 'cosecha', type: 'task', position: { x: 250, y: 250 }, data: { label: 'Cosecha', title: 'Cosecha', description: 'Ejecutar cosecha según protocolo' } },
      { id: 'empaque', type: 'task', position: { x: 250, y: 350 }, data: { label: 'Empaque', title: 'Empaque', description: 'Empacar y etiquetar producto' } },
      { id: 'end', type: 'end', position: { x: 250, y: 450 }, data: { label: 'Fin' } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'preparacion', type: 'default' },
      { id: 'e2', source: 'preparacion', target: 'cosecha', type: 'default' },
      { id: 'e3', source: 'cosecha', target: 'empaque', type: 'default' },
      { id: 'e4', source: 'empaque', target: 'end', type: 'default' },
    ],
  },
  {
    name: 'Control fitosanitario simple',
    description: 'Plantilla: monitoreo → decisión → aplicación. Incluye nodo de condición.',
    isTemplate: true,
    farmId: null as string | null,
    nodes: [
      { id: 'start', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Inicio' } },
      { id: 'monitoreo', type: 'task', position: { x: 250, y: 150 }, data: { label: 'Monitoreo de plagas', title: 'Monitoreo', description: 'Inspección del cultivo' } },
      { id: 'decision', type: 'condition', position: { x: 250, y: 250 }, data: { question: '¿Requiere tratamiento?', options: ['Sí', 'No'] } },
      { id: 'aplicacion', type: 'task', position: { x: 150, y: 350 }, data: { label: 'Aplicación fitosanitaria', title: 'Aplicación', description: 'Aplicar si es necesario' } },
      { id: 'registro', type: 'task', position: { x: 250, y: 450 }, data: { label: 'Registro', title: 'Registro', description: 'Documentar resultado' } },
      { id: 'end', type: 'end', position: { x: 250, y: 550 }, data: { label: 'Fin' } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'monitoreo', type: 'default' },
      { id: 'e2', source: 'monitoreo', target: 'decision', type: 'default' },
      { id: 'e3', source: 'decision', target: 'aplicacion', label: 'Sí', type: 'conditional' },
      { id: 'e4', source: 'decision', target: 'registro', label: 'No', type: 'conditional' },
      { id: 'e5', source: 'aplicacion', target: 'registro', type: 'default' },
      { id: 'e6', source: 'registro', target: 'end', type: 'default' },
    ],
  },
];

async function main() {
  const existing = await prisma.workflow.count({
    where: { isTemplate: true, farmId: null },
    take: 1,
  });
  if (existing > 0) {
    return;
  }
  for (const w of defaultTemplateWorkflows) {
    await prisma.workflow.create({
      data: {
        name: w.name,
        description: w.description,
        isTemplate: w.isTemplate,
        farmId: w.farmId,
        nodes: w.nodes as object,
        edges: w.edges as object,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
