import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  region?: string;

  @IsOptional()
  @IsIn(['celsius', 'fahrenheit'])
  temperatureUnit?: 'celsius' | 'fahrenheit';

  @IsOptional()
  @IsIn(['metric', 'us', 'uk'])
  measurementSystem?: 'metric' | 'us' | 'uk';

  /** 0 = Sunday … 6 = Saturday */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  firstDayOfWeek?: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  dateFormat?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  numberFormat?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  listSortOrder?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  language?: string;

  @IsOptional()
  @IsBoolean()
  weatherAlerts?: boolean;

  @IsOptional()
  @IsBoolean()
  taskUpdates?: boolean;

  @IsOptional()
  @IsBoolean()
  systemAnnouncements?: boolean;

  /** FCM registration token; send empty string to clear */
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  fcmToken?: string;

  @IsOptional()
  @IsBoolean()
  emailNotificationsEnabled?: boolean;

  /** Font scale percentage (slider), typically 80–120 */
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(200)
  fontSizeAdjustment?: number;

  @IsOptional()
  @IsString()
  @IsIn(['none', 'deuteranopia', 'protanopia', 'tritanopia', 'grayscale'])
  colorFilter?: string;

  @IsOptional()
  @IsBoolean()
  colorFilterEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  use24HourTime?: boolean;

  @IsOptional()
  @IsBoolean()
  showSeconds?: boolean;
}
