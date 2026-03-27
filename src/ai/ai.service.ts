import { Injectable, NotFoundException } from '@nestjs/common';
import { Groq } from 'groq-sdk';
import { PrismaService } from '../prisma/prisma.service';

interface LotContext {
  name: string;
  fieldName: string;
  surface: number | null;
}

interface AttendanceContext {
  type: string;
  timestamp: Date;
  teamMemberName: string;
  method: string;
}

interface CropCycleContext {
  cropName: string;
  cycleName: string | null;
  plotName: string;
  status: string;
  plantingDate: Date;
  estimatedHarvestDate: Date | null;
  currentStatus: string;
  season: string;
}

interface TaskContext {
  title: string;
  status: string;
  priority: string | null;
  dueDate: Date | null;
  cropCycleName: string | null;
}

interface SupplyContext {
  name: string;
  category: string | null;
  stockQuantity: number;
  minimumStock: number;
  unit: string | null;
  status: string;
}

interface ProductionStockContext {
  name: string | null;
  cropName: string | null;
  quantity: number;
  unit: string;
  status: string;
  harvestDate: Date | null;
}

interface TransactionContext {
  direction: string;
  amount: string;
  category: string;
  description: string | null;
  occurredAt: Date;
}

interface FarmContextParams {
  farmName: string;
  activeLots: LotContext[];
  latestAttendance: AttendanceContext[];
  cropCycles: CropCycleContext[];
  tasks: TaskContext[];
  supplies: SupplyContext[];
  productionStock: ProductionStockContext[];
  transactions: TransactionContext[];
}

@Injectable()
export class AiService {
  private readonly groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  constructor(private readonly prisma: PrismaService) {}

  private formatFarmContext(p: FarmContextParams): string {
    const sections: string[] = [`Nombre de la finca: ${p.farmName}`];

    // Lotes activos
    sections.push(
      '',
      'Lotes activos:',
      p.activeLots.length > 0
        ? p.activeLots
            .map(
              (l, i) =>
                `${i + 1}. ${l.name} (campo: ${l.fieldName}, superficie: ${l.surface ?? 'N/D'})`,
            )
            .join('\n')
        : 'Sin lotes activos registrados.',
    );

    // Cultivos y ciclos de producción
    sections.push(
      '',
      'Cultivos y Ciclos de Producción Actuales:',
      p.cropCycles.length > 0
        ? p.cropCycles
            .map(
              (c, i) =>
                `${i + 1}. ${c.cropName}${c.cycleName ? ` — ${c.cycleName}` : ''} | Lote: ${c.plotName} | Estado: ${c.status} | Etapa: ${c.currentStatus} | Temporada: ${c.season || 'N/D'} | Inicio: ${c.plantingDate.toISOString().split('T')[0]} | Cosecha est.: ${c.estimatedHarvestDate ? c.estimatedHarvestDate.toISOString().split('T')[0] : 'N/D'}`,
            )
            .join('\n')
        : 'No hay ciclos de producción activos registrados.',
    );

    // Tareas
    sections.push(
      '',
      'Tareas actuales:',
      p.tasks.length > 0
        ? p.tasks
            .map(
              (t, i) =>
                `${i + 1}. ${t.title} | Estado: ${t.status} | Prioridad: ${t.priority ?? 'N/D'} | Vence: ${t.dueDate ? t.dueDate.toISOString().split('T')[0] : 'N/D'}${t.cropCycleName ? ` | Ciclo: ${t.cropCycleName}` : ''}`,
            )
            .join('\n')
        : 'Sin tareas registradas.',
    );

    // Insumos (warehouse / supplies)
    sections.push(
      '',
      'Insumos en almacén:',
      p.supplies.length > 0
        ? p.supplies
            .map(
              (s, i) =>
                `${i + 1}. ${s.name} | Cat: ${s.category ?? 'N/D'} | Stock: ${s.stockQuantity} ${s.unit ?? ''} | Min: ${s.minimumStock} | Estado: ${s.status}`,
            )
            .join('\n')
        : 'Sin insumos registrados.',
    );

    // Stock de producción
    sections.push(
      '',
      'Stock de producción (cosechas/subproductos):',
      p.productionStock.length > 0
        ? p.productionStock
            .map(
              (ps, i) =>
                `${i + 1}. ${ps.name ?? ps.cropName ?? 'Producto'} | Cant: ${ps.quantity} ${ps.unit} | Estado: ${ps.status} | Cosecha: ${ps.harvestDate ? ps.harvestDate.toISOString().split('T')[0] : 'N/D'}`,
            )
            .join('\n')
        : 'Sin stock de producción registrado.',
    );

    // Transacciones financieras
    sections.push(
      '',
      'Últimas transacciones financieras:',
      p.transactions.length > 0
        ? p.transactions
            .map(
              (tx, i) =>
                `${i + 1}. ${tx.direction === 'IN' ? 'Ingreso' : 'Egreso'} $${tx.amount} | ${tx.category}${tx.description ? ` — ${tx.description}` : ''} | Fecha: ${tx.occurredAt.toISOString().split('T')[0]}`,
            )
            .join('\n')
        : 'Sin transacciones registradas.',
    );

    // Asistencia
    sections.push(
      '',
      'Últimas marcaciones de asistencia:',
      p.latestAttendance.length > 0
        ? p.latestAttendance
            .map(
              (a, i) =>
                `${i + 1}. ${a.teamMemberName} - ${a.type} - ${a.timestamp.toISOString()} - ${a.method}`,
            )
            .join('\n')
        : 'Sin marcaciones de asistencia recientes.',
    );

    return sections.join('\n');
  }

  async getChatResponse(userMessage: string, farmId: string): Promise<string> {
    const farm = await this.prisma.farm.findUnique({
      where: { id: farmId },
      select: { id: true, name: true },
    });

    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    const [
      activeLotsRaw,
      cropCyclesRaw,
      tasksRaw,
      suppliesRaw,
      productionStockRaw,
      transactionsRaw,
      attendanceRaw,
    ] = await Promise.all([
      // Lotes activos
      this.prisma.plot.findMany({
        where: { field: { farmId, isActive: true } },
        select: {
          name: true,
          surface: true,
          field: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),

      // Ciclos de producción activos con cultivo y lote
      this.prisma.cropCycle.findMany({
        where: { crop: { farmId }, status: 'active' },
        select: {
          name: true,
          status: true,
          currentStatus: true,
          season: true,
          plantingDate: true,
          estimatedHarvestDate: true,
          crop: { select: { product: true, nameOrDescription: true } },
          plot: { select: { name: true } },
        },
        orderBy: { plantingDate: 'desc' },
        take: 20,
      }),

      // Tareas pendientes / en progreso
      this.prisma.task.findMany({
        where: { farmId, status: { in: ['todo', 'in_progress'] } },
        select: {
          title: true,
          status: true,
          priority: true,
          dueDate: true,
          cropCycleName: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 15,
      }),

      // Insumos
      this.prisma.supply.findMany({
        where: { farmId },
        select: {
          name: true,
          category: true,
          stockQuantity: true,
          minimumStock: true,
          unit: true,
          status: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      }),

      // Stock de producción
      this.prisma.productionStock.findMany({
        where: { farmId },
        select: {
          name: true,
          quantity: true,
          unit: true,
          status: true,
          harvestDate: true,
          crop: { select: { product: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 15,
      }),

      // Transacciones financieras recientes
      this.prisma.farmTransaction.findMany({
        where: { farmId },
        select: {
          direction: true,
          amount: true,
          category: true,
          description: true,
          occurredAt: true,
        },
        orderBy: { occurredAt: 'desc' },
        take: 15,
      }),

      // Asistencia
      this.prisma.attendance.findMany({
        where: { farmId },
        select: {
          type: true,
          timestamp: true,
          method: true,
          teamMember: { select: { name: true } },
        },
        orderBy: { timestamp: 'desc' },
        take: 10,
      }),
    ]);

    const prismaContext = this.formatFarmContext({
      farmName: farm.name,

      activeLots: activeLotsRaw.map((p) => ({
        name: p.name,
        fieldName: p.field.name,
        surface: p.surface,
      })),

      cropCycles: cropCyclesRaw.map((c) => ({
        cropName: c.crop.nameOrDescription || c.crop.product,
        cycleName: c.name,
        plotName: c.plot.name,
        status: c.status,
        plantingDate: c.plantingDate,
        estimatedHarvestDate: c.estimatedHarvestDate,
        currentStatus: c.currentStatus,
        season: c.season,
      })),

      tasks: tasksRaw.map((t) => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        cropCycleName: t.cropCycleName,
      })),

      supplies: suppliesRaw.map((s) => ({
        name: s.name,
        category: s.category,
        stockQuantity: s.stockQuantity,
        minimumStock: s.minimumStock,
        unit: s.unit,
        status: s.status,
      })),

      productionStock: productionStockRaw.map((ps) => ({
        name: ps.name,
        cropName: ps.crop?.product ?? null,
        quantity: ps.quantity,
        unit: ps.unit,
        status: ps.status,
        harvestDate: ps.harvestDate,
      })),

      transactions: transactionsRaw.map((tx) => ({
        direction: tx.direction,
        amount: tx.amount.toString(),
        category: tx.category,
        description: tx.description,
        occurredAt: tx.occurredAt,
      })),

      latestAttendance: attendanceRaw.map((a) => ({
        type: a.type,
        timestamp: a.timestamp,
        teamMemberName: a.teamMember.name,
        method: a.method,
      })),
    });

    const systemPrompt = [
      'Eres el asistente inteligente oficial de Cropai, una plataforma avanzada de gestión agrícola.',
      'Tenés acceso en tiempo real a los datos de producción, insumos, stock, finanzas, tareas y asistencia de la finca del usuario.',
      'Podés responder preguntas sobre qué se está plantando, desde cuándo, en qué lote, el estado de los ciclos de producción, niveles de stock, insumos disponibles y movimientos financieros.',
      'Respondé siempre en el idioma en que el usuario te escriba. Sé preciso, conciso y útil.',
      '',
      'Datos actuales de la finca:',
      prismaContext,
    ].join('\n');

    const completion = await this.groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });

    return completion.choices[0]?.message?.content ?? '';
  }
}
