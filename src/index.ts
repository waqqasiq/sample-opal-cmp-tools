import express from 'express';
import { ParameterType, ToolsService, tool } from '@optimizely-opal/opal-tools-sdk';
import { getRootFolders, getAllFolders, getFolderWithChildren, patchImageFolder, getTaskDetailsFromCMP } from './folders';
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

// Tools class
class Tools {
  @tool({
    name: 'get_cmp_root_folders',
    description: 'Fetches root-level folders from CMP library',
    parameters: [], // no parameters needed for root folders
    authRequirements: {
      provider: 'OptiID',
      scopeBundle: 'default',
      required: true
    }
  })
  async getCmpRootFolders(_body: any, authData?: any) {
    try {
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
      scopeBundle: 'default',
      required: true
    }
  })
  async getCmpFields(_body: any, authData?: any) {
    try {
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
      scopeBundle: 'default',
      required: true
    }
  })
  async getCmpAllFolders(_body: any, authData?: any) {
    try {
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
      scopeBundle: 'default',
      required: true
    }
  })
  async getCmpFolderAndItsChildren(body: any, authData?: any) {
    try {
      console.log("DEBUG body:", body);

      const folderId = body.folder_id;

      if (!folderId) {
        throw new Error("Missing required parameter: folder_id");
      }

      const folder = await getFolderWithChildren(folderId, authData);
      return { folder };
    } catch (error: any) {
      console.error("Error fetching CMP folder with children:", error.message);
      throw new Error("Failed to fetch CMP folder with children");
    }
  }

  @tool({
    name: 'update_asset_folder_location',
    description: 'Update the folder location of an asset in CMP',
    parameters: [
      {
        name: "asset_id",
        type: ParameterType.String,
        description: "The asset in CMP library",
        required: true,
      },
      {
        name: "folder_id",
        type: ParameterType.String,
        description: "The folder ID to move the asset to",
        required: true,
      }
    ],
    authRequirements: {
      provider: 'OptiID',
      scopeBundle: 'default',
      required: true
    }
  })
  async patchImageFolderLocation(body: any, authData?: any) {
    try {
      console.log("DEBUG body:", body);
      console.log("DEBUG auth:", authData);

      if (!body) {
        throw new Error("Missing required parameter: id (image id)");
      }
      if (!body?.folder_id) {
        throw new Error("Missing required parameter: folder_id");
      }

      const updatedImage = await patchImageFolder(body.asset_id, body.folder_id, authData);
      return { image: updatedImage };

    } catch (error: any) {
      console.error("Error patching CMP image folder:", error.message);
      throw new Error("Failed to patch CMP image folder");
    }
  }

  @tool({
    name: 'get_task_brief',
    description: 'Get Details of the Task Brief from CMP',
    parameters: [
      {
        name: "task_id",
        type: ParameterType.String,
        description: "The task ID in CMP",
        required: true,
      }
    ],
    authRequirements: {
      provider: 'OptiID',
      scopeBundle: 'default',
      required: true
    }
  })
  async getTaskBriefDetails(body: any, authData?: any) {
    try {
      console.log("DEBUG body:", body);
      console.log("DEBUG auth:", authData);

      if (!body?.task_id) {
      throw new Error("Missing required parameter: task_id");
    }

      const brief = await getTaskDetailsFromCMP(body.task_id, authData);
      return { brief };

    } catch (error: any) {
      console.error("Error fetching CMP task brief:", error.message);
      throw new Error("Failed to fetch CMP task brief");
    }
  }
}

new Tools();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
