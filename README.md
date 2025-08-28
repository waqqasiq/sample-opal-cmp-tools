## Opal Tool SDK Library

A TypeScript library and Express server for building and exposing Optimizely CMP tools via auto-generated HTTP endpoints and a discovery API, powered by `@optimizely-opal/opal-tools-sdk`.

---

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

---

## Build project

1. Build for production:
   ```
   npm run build
   ```

2. Start the production server:
   ```
   npm start
   ```

---

## Local Development with ngrok

For local development and testing with Opal Tools, you’ll need to expose your local server using ngrok to create a publicly accessible tunnel.

### Setup ngrok

1. **Install ngrok**  
   Download from [https://ngrok.com/download](https://ngrok.com/download)

2. **Create ngrok account and authenticate**
   ```
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

3. **Start ngrok tunnel**  
   In a separate terminal, expose your local server (default port is 8000):
   ```
   ngrok http 8000
   ```

4. **Use the ngrok URL**  
   Copy the `https://` forwarding URL from ngrok output (e.g., `https://abc123.ngrok.io`).  
   Use this URL when configuring your Opal Tools integration.

---

## Register your CMP tools with Opal

Once your application is running and exposed via ngrok, register your tools with Optimizely Opal.

### Step-by-step Registration

1. **Copy the ngrok HTTPS link**  
   From your ngrok terminal output, copy the `https://` forwarding URL.

2. **Navigate to Opal Tools Registry**  
   - Go to [Optimizely Opal](https://opal.optimizely.com/)  
   - In the Opal interface, navigate to the [Tools Registry](https://opal.optimizely.com/tools) page  
   - Click **Add Tool Registry**

3. **Configure Tool Registry**
   - **Registry URL:** `<your-ngrok-https-url>/discovery`
   - **Name:** Give your tool registry a descriptive name (e.g., "CMP Tools - Local Dev")
   - **Description:** Optional description of your tools
   - **Authentication:** Configure if your tools require specific authentication

4. **Save and Verify**
   - Click Save to register your tools
   - Opal will attempt to discover tools from your endpoint
   - Verify that your CMP tools (e.g., `get_cmp_root_folders`, `get_cmp_fields`, etc.) appear in the registry

---

## Tool Discovery

When you register your ngrok URL, Opal will automatically discover available tools by calling your application's `/discovery` endpoint. The Opal Tools SDK handles this automatically.

Your registered tools will appear with:

- Tool Name: `get_cmp_root_folders`, `get_cmp_fields`, `get_cmp_all_folders`, `get_cmp_folder_and_its_children`, etc.

---

## Testing Your Registered Tools

- Navigate to Opal Chat or Workflows
- Invoke your tool by typing commands like:
  ```
  get cmp root folders from CMP platform
  ```
- Verify results are returned correctly

---

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