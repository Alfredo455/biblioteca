import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateBookDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() author: string;
  @IsInt() @Min(1) copies: number;
}
