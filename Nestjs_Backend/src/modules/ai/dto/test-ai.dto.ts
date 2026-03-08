import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AiTone, AiLength } from '../ai.service';

export class TestAiDto {
  @ApiProperty({
    example: 'EazyPost App',
    description: 'What are you selling?',
  })
  @IsString()
  product: string;

  @ApiProperty({ enum: AiTone, example: 'CAMFRANGLAIS' })
  @IsEnum(AiTone)
  tone: AiTone;

  @ApiProperty({ enum: AiLength, example: 'MEDIUM', required: false })
  @IsEnum(AiLength)
  @IsOptional()
  length?: AiLength;
}
