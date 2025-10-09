import axios, { isAxiosError } from 'axios';
import { CMP_BASE_URL } from './config';
import { AuthData } from './types/auth';

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

function generateNumericId() {
  let id = '';
  for (let i = 0; i < 10; i++) {
    id += Math.floor(Math.random() * 10); // digits 0-9
  }
  return id;
}


export const getRootFolders = async (authData: AuthData): Promise<IFolder[]> => {
  // const headers = await getHeaderValues();
  const headers = {
    "Accept": `application/json`,
    "x-auth-token-type": 'opti-id',
    "Authorization": `${authData.credentials.token_type} ${authData.credentials.access_token}`,
    "Accept-Encoding": `gzip`,
    'x-request-id': `${generateNumericId()}`,
    'x-org-sso-id': `${authData.credentials.org_sso_id}`
  }

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
export const getAllFolders = async (authData: AuthData): Promise<IFolder[]> => {
  // const headers = await getHeaderValues();

  const headers = {
    'Accept': 'application/json',
    "x-auth-token-type": 'opti-id',
    'Authorization': authData.credentials.token_type + ' ' + authData.credentials.access_token,
    'Accept-Encoding': 'gzip',
    'x-request-id': generateNumericId(),
    'x-org-sso-id': authData.credentials.org_sso_id
  }

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

export const getFolderWithChildren = async (folderId: string, authData: AuthData): Promise<IFolder> => {
  // const headers = await getHeaderValues();

  const headers = {
    'Accept': 'application/json',
    "x-auth-token-type": 'opti-id',
    'Authorization': authData.credentials.token_type + ' ' + authData.credentials.access_token,
    'Accept-Encoding': 'gzip',
    'x-request-id': generateNumericId(),
    'x-org-sso-id': authData.credentials.org_sso_id
  }

  // fetch the base folder
  const url = `${CMP_BASE_URL}/v3/folders/${folderId}`;
  const res = await axios.get(url, { headers });
  const folder: IFolder = res.data;
  folder.children = [];

  // recursive helper to populate children
  const fetchChildren = async (parent: IFolder) => {
    if (parent.links?.child_folders) {
      const childRes = await axios.get(parent.links.child_folders, { headers });
      const children: IFolder[] = childRes.data?.data || [];
      parent.children = children;
      for (const child of children) {
        await fetchChildren(child);
      }
    }
  };

  await fetchChildren(folder);

  return folder;
};

// helper to PATCH CMP image and update folder_id
export const patchImageFolder = async (
  imageId: string,
  folderId: string,
  authData: AuthData
) => {
  try {
    const headers = {
      Accept: "application/json",
      "x-auth-token-type": "opti-id",
      Authorization: authData.credentials.token_type + " " + authData.credentials.access_token,
      "Accept-Encoding": "gzip",
      "x-request-id": generateNumericId(),
      "x-org-sso-id": authData.credentials.org_sso_id,
      "Content-Type": "application/json"
    };

    const url = `${CMP_BASE_URL}/v3/images/${imageId}`;
    const payload = { folder_id: folderId };

    const res = await axios.patch(url, payload, { headers });
    return res.data;
  } catch (error: any) {
    console.error(`Failed to patch image ${imageId} to folder ${folderId}:`, error.message);
    throw error; // rethrow so caller still handles it
  }
};

// helper to get task brief details from  CMP
export const getTaskDetailsFromCMP = async (
  taskId: string,
  authData: AuthData
) => {
  try {
    const headers = {
      Accept: "application/json",
      "x-auth-token-type": "opti-id",
      Authorization: `${authData.credentials.token_type} ${authData.credentials.access_token}`,
      "Accept-Encoding": "gzip",
      "x-request-id": generateNumericId(),
      "x-org-sso-id": authData.credentials.org_sso_id,
    };

    const url = `${CMP_BASE_URL}/v3/tasks/${taskId}/brief`;

    const res = await axios.get(url, { headers });
    return res.data;

  } catch (error: any) {
    // Handle 404 gracefully
    if (isAxiosError(error) && error.response && error.response.status === 404) {
      console.warn(`Task ${taskId} has no brief`);
      return {};
    }

    console.error(`Failed to get task ${taskId}`, error.message);
    throw error;
  }
};
