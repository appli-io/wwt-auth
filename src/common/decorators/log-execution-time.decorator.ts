import { SetMetadata } from '@nestjs/common';

export const LogExecutionTime = () => SetMetadata('logExecutionTime', true);
