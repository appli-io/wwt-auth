import { Global, Module, Provider } from '@nestjs/common';
import { ConfigService }            from '@nestjs/config';

import { MikroOrmModule } from '@mikro-orm/nestjs';
import * as admin         from 'firebase-admin';

import { StorageService } from './services/storage.service';
import { FileEntity }     from './entities/file.entity';

const FIREBASE_PROVIDER_KEY = 'FIREBASE_APP';

const firebaseProvider: Provider = {
  provide: FIREBASE_PROVIDER_KEY,
  inject: [ ConfigService ],
  useFactory: (configService: ConfigService) => {
    const {storage, ...firebaseConfig} = configService.get('firebase');
    return admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
      storageBucket: storage.bucket
    });
  }
};

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([ FileEntity ])
  ],
  providers: [
    firebaseProvider,
    StorageService
  ],
  exports: [
    StorageService
  ]
})
export class FirebaseModule {

}
