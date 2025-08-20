import axios from 'axios';
import { CMP_BASE_URL } from './config';
import { getHeaderValues } from './auth';

export interface IFolder {
  id: string;
  name: string;
  parent_folder_id?: string | null;
  path?: string;
  created_at?: string;
  modified_at?: string;
  links?: {
    self: string;
    parent_folder: string | null;
    child_folders: string;
    assets: string;
  };
  children?: IFolder[];
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

/**
 * Fetch folders recursively, including all nested child folders
 */
export const getAllFolders = async (): Promise<IFolder[]> => {
  const headers = await getHeaderValues();
  const pageSize = 100;
  let offset = 0;
  let allFolders: IFolder[] = [];

  // fetch all folders (top-level)
  while (true) {
    const url = `${CMP_BASE_URL}/v3/folders?offset=${offset}&page_size=${pageSize}`;
    const res = await axios.get(url, { headers });

    const folders: IFolder[] = res.data?.data || [];
    allFolders = allFolders.concat(folders);

    if (folders.length < pageSize) break;
    offset += pageSize;
  }

  // Recursively fetch children
  const fetchChildren = async (folder: IFolder) => {
    if (folder.links?.child_folders) {
      const res = await axios.get(folder.links.child_folders, { headers });
      const children: IFolder[] = res.data?.data || [];
      folder.children = children;
      for (const child of children) {
        await fetchChildren(child);
      }
    } else {
      folder.children = [];
    }
  };

  // fetch children for all top-level folders
  for (const folder of allFolders.filter(f => !f.parent_folder_id)) {
    await fetchChildren(folder);
  }

  // return only root folders
  return allFolders.filter(f => !f.parent_folder_id);
};