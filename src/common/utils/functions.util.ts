import { StorageService } from '@modules/firebase/services/storage.service';
import { IImage }         from '@modules/news/interfaces/news.interface';

export const loadImagesFromStorage = async (storageService: StorageService, object: any | any[], field: string): Promise<void> => {
  if (Array.isArray(object)) {
    for (const item of object) {
      if (item[field]) {
        if (item[field] instanceof Object && (item[field] as IImage).filepath)
          item[field].file = (await storageService.getSignedUrl((item[field] as IImage).filepath));
        else
          item[field] = (await storageService.getSignedUrl(item[field]));
      }
    }
  } else {
    if (object[field]) {
      if (object[field] instanceof Object && (object[field] as IImage).filepath)
        object[field].file = (await storageService.getSignedUrl((object[field] as IImage).filepath));
      else
        object[field] = (await storageService.getSignedUrl(object[field]));
    }
  }
};
