import express from 'express';
import axios from 'axios';
import xlsx from 'xlsx';
import { ParameterType, ToolsService, tool } from '@optimizely-opal/opal-tools-sdk';
import { getRootFolders, getAllFolders, getFolderWithChildren, patchImageFolder, getTaskDetailsFromCMP, getAssetDownloadUrlFromCMP } from './folders';
import { getAllFields } from './fields';

const app = express();

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

      if (Object.keys(brief).length === 0) {
        return { message: "No brief available for this task." };
      }

      return { brief };

    } catch (error: any) {
      console.error("Error fetching CMP task brief:", error.message);
      throw new Error("Failed to fetch CMP task brief");
    }
  }
  @tool({
    name: 'validate_assets',
    description: 'Validate asset URLs listed in a DAM Excel file before migration',
    parameters: [
      {
        name: 'asset_id',
        type: ParameterType.String,
        description: 'DAM asset ID of the Excel file containing public URLs',
        required: true,
      },
      {
        name: 'url_column',
        type: ParameterType.String,
        description: 'Column name in the Excel file that contains public asset URLs',
        required: true,
      }
    ],
    authRequirements: {
      provider: 'OptiID',
      scopeBundle: 'default',
      required: true
    }
  })
  async validateAssets(body: any, authData?: any) {
    try {
      const { asset_id, url_column } = body;
      const MAX_STREAM_SIZE = 20 * 1024 * 1024; // 20MB

      if (!asset_id || !url_column) {
        throw new Error('asset_id and url_column are required');
      }

      console.log('[validate_assets] Starting validation', body);

      // 1. Get Excel download URL
      const downloadUrl = await getAssetDownloadUrlFromCMP(asset_id, authData);

      // 2. Download Excel
      const excelRes = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(excelRes.data);

      // 3. Parse Excel
      const workbook = xlsx.read(buffer, { cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json<Record<string, any>>(sheet, { raw: false });

      const seen = new Map<string, string>();
      const results: any[] = [];

      for (const row of rows) {
        const rawUrl = row[url_column];

        if (typeof rawUrl !== 'string' || !rawUrl.startsWith('http')) {
          continue;
        }

        const asset_url = rawUrl;
        const filename = decodeURIComponent(
          new URL(asset_url).pathname.split('/').pop() || 'unknown'
        );

        let size: number | null = null;
        let type = '';

        try {
          const head = await axios.head(asset_url);
          size = head.headers['content-length']
            ? Number(head.headers['content-length'])
            : null;
          type = head.headers['content-type'] || '';
        } catch {
          // fallback ignored for now
        }

        let status: 'VALID' | 'INVALID' = 'VALID';
        const reasons: string[] = [];

        if (filename.length > 100) {
          status = 'INVALID';
          reasons.push('FILENAME_TOO_LONG');
        }

        if (!size) {
          status = 'INVALID';
          reasons.push('UNKNOWN_FILE_SIZE');
        } else if (size === 0) {
          status = 'INVALID';
          reasons.push('ZERO_BYTE_FILE');
        } else if (size > MAX_STREAM_SIZE) {
          status = 'INVALID';
          reasons.push('FILE_TOO_LARGE');
        }

        const dupKey = `${filename}-${size}`;
        if (seen.has(dupKey)) {
          status = 'INVALID';
          reasons.push('DUPLICATE');
        } else {
          seen.set(dupKey, asset_url);
        }

        results.push({
          asset_url,
          filename,
          filename_length: filename.length,
          size_bytes: size,
          content_type: type,
          status,
          validation_reasons: reasons.join('|')
        });
      }

      const summary = {
        total_assets: results.length,
        valid_assets: results.filter((r) => r.status === 'VALID').length,
        invalid_assets: results.filter((r) => r.status === 'INVALID').length
      };

      console.log('[validate_assets] Completed', summary);

      return {
        status: 'SUCCESS',
        summary,
        results
      };

    } catch (error: any) {
      console.error('[validate_assets] Failed', error.message);
      throw new Error(`validate_assets failed: ${error.message}`);
    }
  }

}

new Tools();

const PORT = Number(process.env.PORT);

if (!PORT) {
  throw new Error('PORT environment variable is required');
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on ${PORT}`);
});
