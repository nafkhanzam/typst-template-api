# Typst Template API

A simple Express server that generates PDF files from Typst templates.

## Installation

```bash
pnpm install
```

## Running the Server

### Development Mode

```bash
pnpm dev
```

### Production Build

```bash
pnpm build
pnpm start
```

### Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build and run with Docker directly
docker build -t typst-template-api .
docker run -p 3000:3000 -v $(pwd)/templates:/app/templates:ro typst-template-api
```

The server will run on `http://localhost:3000` (or the port specified in `PORT` environment variable).

## API Endpoints

### POST `/`

Generate a PDF from raw Typst content.

**Example:**

```bash
curl -X POST http://localhost:3000 \
  -H "Content-Type: text/plain" \
  -d "= Hello World

This is a simple Typst document." \
  --output output.pdf
```

Or with JSON:

```bash
curl -X POST http://localhost:3000 \
  -H "Content-Type: application/json" \
  -d '{"content":"= My Document\n\nThis is the content."}' \
  --output output.pdf
```

### POST `/template/:templateName`

Generate a PDF from a template with JSON data.

**Template Structure:**
```
/templates/
  /[templateName]/
    main.typ       # Main template file
    data.json      # Default data (optional)
    styles.typ     # Additional files (optional)
    ...
```

**Example:**

```bash
# Use default data from templates/example/data.json
curl -X POST http://localhost:3000/template/example \
  -H "Content-Type: application/json" \
  -d '{}' \
  --output example.pdf

# Override specific fields
curl -X POST http://localhost:3000/template/example \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Custom Document",
    "author": "Jane Doe",
    "content": "This is my custom content that overrides the default."
  }' \
  --output example.pdf

# Partial override (only title and author, content uses default)
curl -X POST http://localhost:3000/template/example \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quick Report",
    "author": "John Smith"
  }' \
  --output report.pdf
```

## Creating Templates

1. Create a directory under `/templates/` with your template name
2. Add a `main.typ` file with your Typst template
3. Optionally add a `data.json` file with default values
4. Reference data in your template using `json("data.json")`

**Example template (`templates/mytemplate/main.typ`):**

```typst
#let data = json("data.json")

= #data.title

Author: #data.author

#data.content
```

**Example data (`templates/mytemplate/data.json`):**

```json
{
  "title": "Default Title",
  "author": "Default Author",
  "content": "Default content here"
}
```

**Usage:**

```bash
curl -X POST http://localhost:3000/template/mytemplate \
  -H "Content-Type: application/json" \
  -d '{"title": "Custom Title"}' \
  --output mytemplate.pdf
```

## How It Works

1. The API reads the default `data.json` from your template directory
2. Merges it with the JSON data from your POST request (POST data overrides defaults)
3. Creates a per-request compiler instance (no race conditions)
4. Overrides `data.json` in the compiler's virtual filesystem
5. Compiles the template and returns the PDF

## Features

- ✅ No race conditions (per-request compiler instances)
- ✅ Virtual filesystem for data override
- ✅ Physical files (imports, images) work normally
- ✅ Default data values with override capability
- ✅ Multiple templates support
