export class UpdateCardDto {
  readonly position?: number;
  readonly title?: string;
  readonly description?: string;
  readonly labels?: string[];
  readonly dueDate?: Date;
}
