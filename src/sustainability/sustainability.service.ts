import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createHmac } from 'node:crypto';
import * as QRCode from 'qrcode';
import { CropCyclesService } from '../crop-cycles/crop-cycles.service';
import { PrismaService } from '../prisma/prisma.service';

/* pdfmake + vfs (CommonJS) — 0.3.x: vfs_fonts exporta el mapa directo; getBuffer() es Promise (sin callback). */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfMake = require('pdfmake/build/pdfmake.js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfFonts = require('pdfmake/build/vfs_fonts.js');
pdfMake.vfs = pdfFonts;

/**
 * kg CO₂e por litro de combustible (factor por defecto tipo gasoil), cuando `supplies.carbon_factor` ≤ 0.
 * Convención app: `stock.quantity` (SupplyStockMovement) para insumos FUEL se interpreta como **litros** enteros.
 */
const DEFAULT_FUEL_CARBON_FACTOR = 2.68;

const GREEN = '#20DE99';
const PURPLE = '#A641FA';

export interface CycleCarbonScoreDto {
  cropCycleId: string;
  /** Suma de quantity × factor (kg CO₂e). quantity en L → factor en kg CO₂e/L. */
  totalKgCo2e: number;
  /** Litros salientes registrados (suma de quantity). */
  totalFuelLiters: number;
  movementCount: number;
}

export interface FarmCarbonTotalDto {
  totalKgCo2e: number;
  totalFuelLiters: number;
  movementCount: number;
  cropCyclesWithFuel: number;
}

export interface CropCycleFuelMovementRowDto {
  id: string;
  supplyId: string;
  supplyName: string;
  quantity: number;
  /** yyyy-mm-dd */
  date: string;
}

/** Solo OUTGOING + supply.type FUEL (no entradas/compras). */
const FUEL_OUTGOING_WHERE_SQL = Prisma.sql`
  s.type = 'OUTGOING'
  AND sup.type = 'FUEL'
`;

export interface GreenScoreDto {
  cropCycleId: string;
  farmId: string;
  /** Riego estimado (m³ desde calendarios) × 1000. */
  irrigationLitersEstimated: number;
  /** L/kg si hay rendimiento en kg (ciclos tradicionales); si no, null. */
  waterFootprintLPerKg: number | null;
  /** L/ha si hay superficie; respaldo ante yield 0 / ausente. */
  waterFootprintLPerHa: number | null;
  /** Madre-planta: L por unidad propagada si aplica. */
  waterFootprintLPerPropagatedUnit: number | null;
  waterNote: string;
  carbonFootprintKgCo2e: number;
  fuelLitersOutgoing: number;
  fuelMovementCount: number;
  timestamp: Date;
  status: 'VERIFIED' | 'PARTIAL';
}

@Injectable()
export class SustainabilityService {
  private readonly logger = new Logger(SustainabilityService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cropCyclesService: CropCyclesService,
  ) {}

  private async assertCropCycleInFarm(cropCycleId: string, farmId: string) {
    const cycle = await this.prisma.cropCycle.findFirst({
      where: { id: cropCycleId, plot: { field: { farmId } } },
    });
    if (!cycle) {
      throw new NotFoundException('Crop cycle not found for this farm');
    }
  }

  /**
   * Huella de carbono del ciclo: movimientos `stock` OUTGOING cuyo insumo es `supplies.type = 'FUEL'`.
   * No incluye INCOMING ni otros tipos de insumo.
   */
  async getCycleCarbonScore(
    cropCycleId: string,
    farmId: string,
  ): Promise<CycleCarbonScoreDto> {
    await this.assertCropCycleInFarm(cropCycleId, farmId);

    const rows = await this.prisma.$queryRaw<
      Array<{
        total_kg_co2e: number;
        total_liters: bigint;
        movement_count: bigint;
      }>
    >(Prisma.sql`
      SELECT
        COALESCE(
          SUM(
            s.quantity::double precision * CASE
              WHEN sup.carbon_factor IS NOT NULL AND sup.carbon_factor > 0
              THEN sup.carbon_factor::double precision
              ELSE ${DEFAULT_FUEL_CARBON_FACTOR}::double precision
            END
          ),
          0
        )::double precision AS total_kg_co2e,
        COALESCE(SUM(s.quantity), 0)::bigint AS total_liters,
        COUNT(*)::bigint AS movement_count
      FROM stock s
      INNER JOIN supplies sup ON sup.id = s.product_id
      WHERE s.crop_cycle_id = ${cropCycleId}
        AND s.farm_id = ${farmId}
        AND ${FUEL_OUTGOING_WHERE_SQL}
    `);

    const row = rows[0] ?? {
      total_kg_co2e: 0,
      total_liters: 0n,
      movement_count: 0n,
    };

    return {
      cropCycleId,
      totalKgCo2e: Math.round(Number(row.total_kg_co2e) * 1000) / 1000,
      totalFuelLiters: Number(row.total_liters),
      movementCount: Number(row.movement_count),
    };
  }

  /** Salidas FUEL vinculadas al ciclo (para UI de registro / corrección). */
  async listCropCycleFuelMovements(
    cropCycleId: string,
    farmId: string,
  ): Promise<CropCycleFuelMovementRowDto[]> {
    await this.assertCropCycleInFarm(cropCycleId, farmId);
    const rows = await this.prisma.supplyStockMovement.findMany({
      where: {
        farmId,
        cropCycleId,
        type: 'OUTGOING',
        supply: { type: 'FUEL' },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      include: { supply: { select: { id: true, name: true } } },
    });
    return rows.map((r) => ({
      id: r.id,
      supplyId: r.productId,
      supplyName: r.supply.name,
      quantity: r.quantity,
      date: r.date.toISOString().slice(0, 10),
    }));
  }

  /**
   * Totales de finca en SQL (sin cargar miles de filas en memoria).
   */
  async getFarmCarbonTotal(farmId: string): Promise<FarmCarbonTotalDto> {
    const rows = await this.prisma.$queryRaw<
      Array<{
        total_kg_co2e: number;
        total_liters: bigint;
        movement_count: bigint;
        cycles_with_fuel: bigint;
      }>
    >(Prisma.sql`
      SELECT
        COALESCE(
          SUM(
            s.quantity::double precision * CASE
              WHEN sup.carbon_factor IS NOT NULL AND sup.carbon_factor > 0
              THEN sup.carbon_factor::double precision
              ELSE ${DEFAULT_FUEL_CARBON_FACTOR}::double precision
            END
          ),
          0
        )::double precision AS total_kg_co2e,
        COALESCE(SUM(s.quantity), 0)::bigint AS total_liters,
        COUNT(*)::bigint AS movement_count,
        COUNT(DISTINCT s.crop_cycle_id)::bigint AS cycles_with_fuel
      FROM stock s
      INNER JOIN supplies sup ON sup.id = s.product_id
      WHERE s.farm_id = ${farmId}
        AND ${FUEL_OUTGOING_WHERE_SQL}
    `);

    const row = rows[0] ?? {
      total_kg_co2e: 0,
      total_liters: 0n,
      movement_count: 0n,
      cycles_with_fuel: 0n,
    };

    return {
      totalKgCo2e: Math.round(Number(row.total_kg_co2e) * 1000) / 1000,
      totalFuelLiters: Number(row.total_liters),
      movementCount: Number(row.movement_count),
      cropCyclesWithFuel: Number(row.cycles_with_fuel),
    };
  }

  /**
   * Orquesta carbono (combustible OUTGOING FUEL) + huella hídrica de riego (misma lógica de volumen
   * que CropCyclesService: waterVolume m³ o duration min × flowRate L/h) con denominador seguro.
   */
  async calculateGreenScore(
    farmId: string,
    cropCycleId: string,
  ): Promise<GreenScoreDto> {
    await this.assertCropCycleInFarm(cropCycleId, farmId);

    const carbon = await this.getCycleCarbonScore(cropCycleId, farmId);
    const water = await this.cropCyclesService.getWaterFootprint(
      cropCycleId,
      farmId,
    );

    const irrigationLiters = Math.max(0, (water.irrigationM3 ?? 0) * 1000);
    const irrigationLitersRounded =
      Math.round(irrigationLiters * 1000) / 1000;

    let waterFootprintLPerKg: number | null = null;
    let waterFootprintLPerHa: number | null = null;
    let waterFootprintLPerPropagatedUnit: number | null = null;
    let waterNote: string;

    const areaHa = water.areaHa;
    const yieldKg = water.yieldKg;
    const propagatedUnits = water.propagatedUnits;
    const productionType = water.productionType ?? 'traditional';

    if (
      productionType === 'traditional' &&
      yieldKg != null &&
      yieldKg > 0 &&
      irrigationLiters >= 0
    ) {
      waterFootprintLPerKg =
        Math.round((irrigationLiters / yieldKg) * 10000) / 10000;
      waterNote =
        'L/kg (riego programado en ventana del ciclo ÷ rendimiento kg, estimado o real).';
    } else if (
      propagatedUnits != null &&
      propagatedUnits > 0 &&
      irrigationLiters >= 0
    ) {
      waterFootprintLPerPropagatedUnit =
        Math.round((irrigationLiters / propagatedUnits) * 10000) / 10000;
      waterNote =
        'L/unidad propagada (madre-planta): riego ÷ unidades estimadas o cosecha en units.';
    } else if (areaHa != null && areaHa > 0 && irrigationLiters >= 0) {
      waterFootprintLPerHa =
        Math.round((irrigationLiters / areaHa) * 1000) / 1000;
      waterNote =
        'L/ha: sin kg de rendimiento válidos para ratio por kg; se usa superficie del ciclo/lote.';
    } else {
      waterNote =
        'Sin rendimiento (kg), superficie (ha) ni unidades propagadas para ratio; volumen de riego mostrado en litros.';
    }

    const hasSignal =
      carbon.movementCount > 0 ||
      irrigationLiters > 0 ||
      (water.totalM3 ?? 0) > 0;

    return {
      cropCycleId,
      farmId,
      irrigationLitersEstimated: irrigationLitersRounded,
      waterFootprintLPerKg,
      waterFootprintLPerHa,
      waterFootprintLPerPropagatedUnit,
      waterNote,
      carbonFootprintKgCo2e: carbon.totalKgCo2e,
      fuelLitersOutgoing: carbon.totalFuelLiters,
      fuelMovementCount: carbon.movementCount,
      timestamp: new Date(),
      status: hasSignal ? 'VERIFIED' : 'PARTIAL',
    };
  }

  /**
   * HMAC-SHA256 sobre payload canónico (JSON estable) + secreto.
   * Loguea el string exacto que entra al HMAC (sin el secreto).
   */
  private greenCardHmacDigest(parts: {
    cropCycleId: string;
    totalKgCo2e: number;
    issuedAtIso: string;
    irrigationLiters: number;
  }): string {
    const secret =
      process.env.GREEN_CARD_HMAC_SECRET ?? process.env.JWT_SECRET ?? '';
    if (!secret) {
      this.logger.warn(
        'GREEN_CARD_HMAC_SECRET / JWT_SECRET no definidos: sello PDF con clave solo-desarrollo.',
      );
    }
    const key = secret || 'dev-green-card-insecure';
    const canonical = JSON.stringify({
      cropCycleId: parts.cropCycleId,
      totalKgCo2e: parts.totalKgCo2e,
      issuedAtIso: parts.issuedAtIso,
      irrigationLiters: parts.irrigationLiters,
    });
    this.logger.log(`Green card HMAC canonical payload: ${canonical}`);
    return createHmac('sha256', key).update(canonical).digest('hex');
  }

  async generateGreenCardPdf(
    cropCycleId: string,
    farmId: string,
  ): Promise<Buffer> {
    await this.assertCropCycleInFarm(cropCycleId, farmId);

    const cycle = await this.prisma.cropCycle.findFirst({
      where: { id: cropCycleId, plot: { field: { farmId } } },
      include: {
        crop: { select: { product: true } },
        plot: {
          select: {
            name: true,
            field: { select: { name: true, farm: { select: { name: true } } } },
          },
        },
      },
    });
    if (!cycle) {
      throw new NotFoundException('Crop cycle not found for this farm');
    }

    const green = await this.calculateGreenScore(farmId, cropCycleId);
    const water = await this.cropCyclesService.getWaterFootprint(
      cropCycleId,
      farmId,
    );

    const farmName = cycle.plot?.field?.farm?.name ?? '—';
    const fieldName = cycle.plot?.field?.name ?? '—';
    const plotName = cycle.plot?.name ?? '—';
    const cropLabel = cycle.crop?.product ?? '—';

    const issuedAt = new Date().toISOString().slice(0, 10);
    const issuedAtIso = new Date().toISOString();
    const digest = this.greenCardHmacDigest({
      cropCycleId,
      totalKgCo2e: green.carbonFootprintKgCo2e,
      issuedAtIso,
      irrigationLiters: green.irrigationLitersEstimated,
    });

    const baseUrl =
      process.env.FRONTEND_URL?.replace(/\/$/, '') || 'https://cropai.es';
    const verifyUrl = `${baseUrl}/green-card/${cropCycleId}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 160,
      errorCorrectionLevel: 'M',
    });
    const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, '');

    const waterLine =
      water.totalM3 != null && Number.isFinite(water.totalM3)
        ? `${Math.round(water.totalM3 * 1000) / 1000} m³ total (riego + lluvia, modelo Crop AI)`
        : '0 m³ (sin volúmenes registrados)';

    const wfRows: string[] = [];
    if (green.waterFootprintLPerKg != null) {
      wfRows.push(
        `Huella hídrica (riego): ${green.waterFootprintLPerKg.toLocaleString()} L/kg — ${green.waterNote}`,
      );
    } else if (green.waterFootprintLPerHa != null) {
      wfRows.push(
        `Huella hídrica (riego): ${green.waterFootprintLPerHa.toLocaleString()} L/ha — ${green.waterNote}`,
      );
    } else if (green.waterFootprintLPerPropagatedUnit != null) {
      wfRows.push(
        `Huella hídrica (riego): ${green.waterFootprintLPerPropagatedUnit.toLocaleString()} L/unidad — ${green.waterNote}`,
      );
    } else {
      wfRows.push(
        `Riego estimado: ${green.irrigationLitersEstimated.toLocaleString()} L (${green.waterNote})`,
      );
    }

    const wfExtra =
      water.waterFootprintM3perKg != null &&
      Number.isFinite(water.waterFootprintM3perKg)
        ? `Huella agua total (m³/kg): ${(Math.round(water.waterFootprintM3perKg * 10000) / 10000).toLocaleString()}`
        : water.waterM3PerHa != null && Number.isFinite(water.waterM3PerHa)
          ? `Agua total (m³/ha): ${(Math.round(water.waterM3PerHa * 1000) / 1000).toLocaleString()}`
          : null;

    const docDefinition = {
      pageSize: 'A4' as const,
      pageMargins: [48, 56, 48, 56] as [number, number, number, number],
      defaultStyle: { font: 'Roboto', fontSize: 10, color: '#333333' },
      content: [
        {
          columns: [
            {
              width: '*',
              stack: [
                {
                  text: 'Crop AI',
                  fontSize: 22,
                  bold: true,
                  color: GREEN,
                },
                {
                  text: 'Green Card · Sostenibilidad',
                  fontSize: 14,
                  bold: true,
                  margin: [0, 4, 0, 0],
                },
              ],
            },
            {
              width: 100,
              image: `data:image/png;base64,${qrBase64}`,
              alignment: 'right' as const,
            },
          ],
          margin: [0, 0, 0, 20],
        },
        {
          canvas: [
            {
              type: 'line' as const,
              x1: 0,
              y1: 0,
              x2: 515,
              y2: 0,
              lineWidth: 1,
              lineColor: PURPLE,
            },
          ],
          margin: [0, 0, 0, 16],
        },
        {
          text: 'REPORTE DE SOSTENIBILIDAD',
          style: 'h1',
          margin: [0, 0, 0, 6],
        },
        {
          text: `Fecha de emisión: ${issuedAt}`,
          alignment: 'right' as const,
          margin: [0, 0, 0, 16],
        },
        {
          text: 'Datos del ciclo',
          style: 'h2',
          margin: [0, 0, 0, 8],
        },
        {
          table: {
            widths: [140, '*'],
            body: [
              ['Finca', farmName],
              ['Campo / lote', `${fieldName} · ${plotName}`],
              ['Cultivo', cropLabel],
              ['ID ciclo', cropCycleId],
            ],
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 20],
        },
        {
          text: 'Métricas',
          style: 'h2',
          margin: [0, 0, 0, 8],
        },
        {
          table: {
            widths: ['*', '*'],
            body: [
              ['Métrica', 'Valor'],
              [
                'Huella de carbono (combustible, OUTGOING FUEL)',
                `${green.carbonFootprintKgCo2e.toLocaleString()} kg CO₂e`,
              ],
              [
                'Combustible registrado (litros)',
                `${green.fuelLitersOutgoing.toLocaleString()} L · ${green.fuelMovementCount} movimiento(s)`,
              ],
              ['Volumen hídrico total (modelo ciclo)', waterLine],
              ...wfRows.map((text) => ['Detalle riego / ratio', text] as [string, string]),
            ],
          },
          margin: [0, 0, 0, 12],
        },
        ...(wfExtra
          ? [
              {
                text: wfExtra,
                margin: [0, 0, 0, 12] as [number, number, number, number],
              },
            ]
          : []),
        {
          text: 'Este documento resume datos registrados en Crop AI. No sustituye auditorías externas.',
          italics: true,
          color: '#666666',
          margin: [0, 12, 0, 0],
        },
        {
          text: 'Validado por Crop AI — QR: URL de referencia del ciclo.',
          bold: true,
          color: GREEN,
          margin: [0, 16, 0, 8],
        },
        {
          text: `Sello digital (HMAC-SHA256, hex): ${digest}`,
          fontSize: 8,
          color: '#444444',
          margin: [0, 0, 0, 4],
        },
        {
          text: 'Verificación: recalcular HMAC sobre el JSON { cropCycleId, totalKgCo2e, issuedAtIso, irrigationLiters } con el secreto del servidor.',
          fontSize: 7,
          color: '#888888',
        },
      ],
      styles: {
        h1: { fontSize: 16, bold: true },
        h2: { fontSize: 12, bold: true, color: '#111111' },
      },
    };

    const gen = pdfMake.createPdf(docDefinition);
    return (await gen.getBuffer()) as Buffer;
  }
}
