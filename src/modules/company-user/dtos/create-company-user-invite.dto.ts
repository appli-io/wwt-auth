import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length } from "class-validator";

export class CreateCompanyUserInviteDto {

  @ApiProperty({
    description: 'The email of the user to be invited',
    type: String,
  })
  @IsEmail()
  @Length(1, 255)
  public email!: string;

  @ApiProperty({
    description: 'The message to be sent to the user',
    type: String,
  })
  @IsString()
  @Length(1)
  public message!: string;

}