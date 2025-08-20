import axios from 'axios';
import { CMP_BASE_URL } from './config';
import { getHeaderValues } from './auth';

export interface IFolder {
  id: string;
  name: string;
  parent_folder_id?: string | null;
  [key: string]: any;
}

export const getRootFolders = async (): Promise<IFolder[]> => {
  const headers = await getHeaderValues();
  const pageSize = 100;
  let offset = 0;
  let allFolders: IFolder[] = [];

  while (true) {
    const url = `${CMP_BASE_URL}/v3/folders?offset=${offset}&page_size=${pageSize}`;
    const res = await axios.get(url, { headers });

    const folders: IFolder[] = res.data?.data || [];
    allFolders = allFolders.concat(folders);

    if (folders.length < pageSize) {
      // means this was the last page
      break;
    }

    offset += pageSize;
  }

  // root folders have parent_folder_id === null
  const rootFolders = allFolders.filter(
    (folder: IFolder) => folder.parent_folder_id === null
  );

  return rootFolders;
};
