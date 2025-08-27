## Run project

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

> By default, the project runs at [http://localhost:8000](http://localhost:8000) unless a different `PORT` is supplied in your `.env` file.


## Build project

1. Build for production:
   ```
   npm run build
   ```

2. Start the production server:
   ```
   npm start
   ```

## API Endpoints

This project uses `@optimizely-opal/opal-tools-sdk` to automatically generate endpoints for each tool/function and a discovery endpoint.

### Discovery Endpoint

- **`/discovery`**  
  Returns metadata about all available tools/functions, including their names, descriptions, parameters, endpoints, HTTP methods, and authentication requirements.

  Example response:
  ```json
  {
    "functions": [
      {
        "name": "get_cmp_root_folders",
        "description": "Fetches root-level folders from CMP library",
        "parameters": [],
        "endpoint": "/tools/get-cmp-root-folders",
        "http_method": "POST",
        "auth_requirements": [
          {
            "provider": "OptiID",
            "scope_bundle": "default",
            "required": true
          }
        ]
      }
      // ...other functions
    ]
  }
  ```

### Tool Endpoints

Each tool/function is exposed as a separate HTTP endpoint under `/tools/{tool-name}`.  
For example:
- `POST /tools/get-cmp-root-folders`
- `POST /tools/get-cmp-fields`
- `POST /tools/get-cmp-all-folders`
- `POST /tools/get-cmp-folder-and-its-children`

See [src/index.ts](src/index.ts) for tool/function definitions.