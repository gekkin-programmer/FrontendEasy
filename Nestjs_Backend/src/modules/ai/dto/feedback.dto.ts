import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AiFeedbackDto {
  @ApiProperty({
    description:
      'The ID of the AI message being rated (returned in chat response)',
  })
  @IsString()
  messageId: string;

  @ApiProperty({ description: 'Rating: 1 (Up) or -1 (Down), or 1-5 scale' })
  @IsInt()
  @Min(-1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Optional text feedback', required: false })
  @IsString()
  @IsOptional()
  comment?: string;
}
