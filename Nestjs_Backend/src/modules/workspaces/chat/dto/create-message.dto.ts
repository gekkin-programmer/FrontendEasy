import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export enum MessageType {
  TEXT = 'TEXT',
  AUDIO = 'AUDIO',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
}

// ------------------------------------
// 1. Channel DTO (Name & Description)
// ------------------------------------
export class CreateChannelDto {
  @ApiProperty({ example: 'marketing-team', description: 'Channel name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Discussions about ads', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

// ------------------------------------
// 2. Message DTO (Content & Media)
// ------------------------------------
export class CreateMessageDto {
  @ApiProperty({ example: 'Hello team!', required: false })
  @IsOptional()
  @IsString()
  content?: string; // Optional because Audio might have no text

  @ApiProperty({ enum: MessageType, example: 'TEXT' })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @ApiProperty({
    example: 'https://res.cloudinary.com/.../voice.mp3',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  attachmentUrl?: string;
}
