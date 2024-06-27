import { ApiProperty }                                      from "@nestjs/swagger";

export class CompanyUserInviteQueryDto {

  // @ApiProperty({
  //   description: 'The uuid of the invite',
  //   type: String,
  // })
  // id?: string;

  @ApiProperty({
    description: 'The email of the user to be invited',
    type: String,
  })
  email?: string;

  @ApiProperty({
    description: 'The user has joined the company or not',
    type: Boolean,
  })
  joined?: boolean;
}