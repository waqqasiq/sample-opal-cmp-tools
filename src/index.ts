import express from 'express';
import { ParameterType, ToolsService, tool } from '@optimizely-opal/opal-tools-sdk';
import { getRootFolders, getAllFolders, getFolderWithChildren } from './folders';
import { getAllFields } from './fields';

const app = express();
const PORT = process.env.PORT || 8000;
app.use(express.json());

new ToolsService(app);

// Common routes
app.get('/', async (_req, res) => {
  res.send('Hello, TypeScript with Express!!');
});

app.get('/_status', async (_req, res) => {
  console.log('All Ok! App Running...');
  res.status(200).send('All Ok! App Running...');
});

interface FolderParameters {
  folder_id: string;
}

// Tools class
class Tools {
  @tool({
    name: 'get_cmp_root_folders',
    description: 'Fetches root-level folders from CMP library',
    parameters: [], // no parameters needed for root folders
    authRequirements: {
      provider: 'OptiID',
      scopeBundle: 'scheme',
      required: true
    }
  })
  async getCmpRootFolders(_body: any, authData?: any) {
    try {

      const provider = authData?.provider || '';
      const token = authData?.credentials?.access_token || '';

      console.log('Auth Provider:', provider);
      console.log('Auth Token:', token ? 'Token received' : 'No token');
      console.log('token ', token);

      const folders = await getRootFolders(authData);
      return { folders };
    } catch (error: any) {
      console.error('Error fetching CMP root folders:', error.message);
      throw new Error('Failed to fetch CMP root folders');
    }
  }
  @tool({
    name: 'get_cmp_fields',
    description: 'Fetch all CMP fields with pagination',
    parameters: [],
    authRequirements: {
      provider: 'OptiID',
      scopeBundle: 'scheme',
      required: true
    }
  })
  async getCmpFields(_body: any, authData?: any) {
    try {

      const provider = authData?.provider || '';
      const token = authData?.credentials?.access_token || '';

      console.log('Auth Provider:', provider);
      console.log('Auth Token:', token ? 'Token received' : 'No token');
      console.log('token ', token);

      const fields = await getAllFields(authData);
      return { fields };
    }
    catch (error: any) {
      console.error('Error fetching CMP fields:', error.message);
      throw new Error('Failed to fetch CMP fields');
    }
  }
  @tool({
    name: 'get_cmp_all_folders',
    description: 'Fetch all CMP folders including nested children',
    parameters: [],
    authRequirements: {
      provider: 'OptiID',
      scopeBundle: 'scheme',
      required: true
    }
  })
  async getCmpAllFolders(_body: any, authData?: any) {
    try {

      const provider = authData?.provider || '';
      const token = authData?.credentials?.access_token || '';

      console.log('Auth Provider:', provider);
      console.log('Auth Token:', token ? 'Token received' : 'No token');
      console.log('token ', token);

      const folders = await getAllFolders(authData);
      return { folders };
    } catch (error: any) {
      console.error('Error fetching all CMP folders:', error.message);
      throw new Error('Failed to fetch all CMP folders');
    }
  }
  
  @tool({
    name: 'get_cmp_folder_and_its_children',
    description: 'Fetch a CMP folder by ID including all nested child folders',
    parameters: [
      {
        name: "folder_id",
        type: ParameterType.String,
        description: "The CMP folder ID to fetch",
        required: true,
      }
    ],
    authRequirements: {
      provider: 'OptiID',
      scopeBundle: 'scheme',
      required: true
    }
  })
  async getCmpFolderAndItsChildren(body: any, authData?: any) {
    try {
      const params = body.parameters as FolderParameters;
      const folder = await getFolderWithChildren(params.folder_id, authData);
      return { folder };
    } catch (error: any) {
      console.error("Error fetching CMP folder with children:", error.message);
      throw new Error("Failed to fetch CMP folder with children");
    }
  }
}

new Tools();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
