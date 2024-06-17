export class CreateCardDto {
  readonly boardId: string;
  readonly listId: string;
  readonly position: number;
  readonly title: string;
  readonly description?: string;
  readonly labels?: string[];
  readonly dueDate?: Date;
}
