import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { GenerateGreenCardDto } from './dto/generate-green-card.dto';
import { SustainabilityService } from './sustainability.service';

const FARM_CONTEXT =
  'Sin finca en contexto: enviá x-farm-id o reiniciá sesión con una finca válida.';

@Controller('sustainability')
@UseGuards(JwtAuthGuard)
export class SustainabilityController {
  private readonly logger = new Logger(SustainabilityController.name);

  constructor(private readonly sustainabilityService: SustainabilityService) {}

  private farmIdOrThrow(user: CurrentUserPayload): string {
    if (!user.farmId) {
      throw new BadRequestException(FARM_CONTEXT);
    }
    return user.farmId;
  }

  @Get('score/:cropCycleId')
  async getCycleScore(
    @Param('cropCycleId', ParseUUIDPipe) cropCycleId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const farmId = this.farmIdOrThrow(user);
    this.logger.log(`GET sustainability/score cropCycleId=${cropCycleId} farmId=${farmId}`);
    return this.sustainabilityService.getCycleCarbonScore(cropCycleId, farmId);
  }

  @Get('green-score/:cropCycleId')
  async getGreenScore(
    @Param('cropCycleId', ParseUUIDPipe) cropCycleId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const farmId = this.farmIdOrThrow(user);
    this.logger.log(
      `GET sustainability/green-score cropCycleId=${cropCycleId} farmId=${farmId}`,
    );
    return this.sustainabilityService.calculateGreenScore(farmId, cropCycleId);
  }

  @Get('farm-carbon')
  async getFarmCarbon(@CurrentUser() user: CurrentUserPayload) {
    const farmId = this.farmIdOrThrow(user);
    this.logger.log(`GET sustainability/farm-carbon farmId=${farmId}`);
    return this.sustainabilityService.getFarmCarbonTotal(farmId);
  }

  @Get('fuel-movements/:cropCycleId')
  async listCropCycleFuelMovements(
    @Param('cropCycleId', ParseUUIDPipe) cropCycleId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const farmId = this.farmIdOrThrow(user);
    this.logger.log(
      `GET sustainability/fuel-movements cropCycleId=${cropCycleId} farmId=${farmId}`,
    );
    return this.sustainabilityService.listCropCycleFuelMovements(cropCycleId, farmId);
  }

  @Post('pdf')
  async greenCardPdf(
    @Body() dto: GenerateGreenCardDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<StreamableFile> {
    const farmId = this.farmIdOrThrow(user);
    this.logger.log(
      `POST sustainability/pdf cropCycleId=${dto.cropCycleId} farmId=${farmId}`,
    );
    const buffer = await this.sustainabilityService.generateGreenCardPdf(
      dto.cropCycleId,
      farmId,
    );
    const shortId = dto.cropCycleId.replace(/-/g, '').slice(0, 8);
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="green-card-${shortId}.pdf"`,
    });
  }
}
