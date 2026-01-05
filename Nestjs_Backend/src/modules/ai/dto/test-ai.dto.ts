import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { AiTone } from '../ai.service'; 

export class TestAiDto {
  @ApiProperty({ example: 'EasyPost App', description: 'What are you selling?' })
  @IsString()
  product: string;

  @ApiProperty({ enum: AiTone, example: 'CAMFRANGLAIS' })
  @IsEnum(AiTone)
  tone: AiTone;
}