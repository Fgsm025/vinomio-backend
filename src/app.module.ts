import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { FacilitiesModule } from './facilities/facilities.module';
import { MachineryModule } from './machinery/machinery.module';
import { CropsModule } from './crops/crops.module';
import { AnimalsModule } from './animals/animals.module';
import { WaterSourcesModule } from './water-sources/water-sources.module';
import { ExploitationsModule } from './exploitations/exploitations.module';
import { ProductionUnitsModule } from './production-units/production-units.module';
import { SectorsModule } from './sectors/sectors.module';
import { CropCyclesModule } from './crop-cycles/crop-cycles.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { LivestockGroupsModule } from './livestock-groups/livestock-groups.module';
import { GrazingLocationsModule } from './grazing-locations/grazing-locations.module';
import { IrrigationSchedulesModule } from './irrigation-schedules/irrigation-schedules.module';
import { RainfallEventsModule } from './rainfall-events/rainfall-events.module';
import { TeamMembersModule } from './team-members/team-members.module';
import { TraceabilityModule } from './traceability/traceability.module';
import { PurchasesModule } from './purchases/purchases.module';
import { InvitationsModule } from './invitations/invitations.module';

@Module({
  imports: [
    PrismaModule,
    TasksModule,
    AuthModule,
    FacilitiesModule,
    MachineryModule,
    CropsModule,
    AnimalsModule,
    WaterSourcesModule,
    ExploitationsModule,
    ProductionUnitsModule,
    SectorsModule,
    CropCyclesModule,
    CampaignsModule,
    LivestockGroupsModule,
    GrazingLocationsModule,
    IrrigationSchedulesModule,
    RainfallEventsModule,
    TeamMembersModule,
    TraceabilityModule,
    PurchasesModule,
    InvitationsModule,
  ],
})
export class AppModule {}
