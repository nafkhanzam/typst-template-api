import express from "express";
import { NodeCompiler } from "@myriaddreamin/typst-ts-node-compiler";
import * as fs from "fs";
import * as path from "path";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.text({ type: "text/plain" }));

const TEMPLATES_DIR = path.join(process.cwd(), "templates");

app.post("/", (req, res) => {
  try {
    const typstContent =
      typeof req.body === "string" ? req.body : req.body.content;

    if (!typstContent) {
      return res
        .status(400)
        .json({ error: "Missing Typst content in request body" });
    }

    const compiler = NodeCompiler.create();
    const pdfBuffer = compiler.pdf({
      mainFileContent: typstContent,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=output.pdf");
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

app.post("/template/:templateName", (req, res) => {
  try {
    const { templateName } = req.params;
    const jsonData = req.body || {};

    if (typeof jsonData !== "object") {
      return res
        .status(400)
        .json({ error: "Request body must be a JSON object" });
    }

    const templateDir = path.join(TEMPLATES_DIR, templateName);
    const templatePath = path.join(templateDir, "main.typ");
    const dataPath = path.join(templateDir, "data.json");

    if (!fs.existsSync(templatePath)) {
      return res
        .status(404)
        .json({ error: `Template '${templateName}' not found` });
    }

    let defaultData: Record<string, any> = {};
    if (fs.existsSync(dataPath)) {
      const dataContent = fs.readFileSync(dataPath, "utf-8");
      defaultData = JSON.parse(dataContent);
    }

    const mergedData = { ...defaultData, ...jsonData };

    // Create a per-request compiler to avoid race conditions
    // Set workspace to the template directory so relative imports work correctly
    const compiler = NodeCompiler.create({
      workspace: templateDir,
    });

    // Override data.json in the compiler's virtual filesystem using mapShadow
    // mapShadow is for non-Typst files (like JSON, images, etc.)
    const dataJsonContent = Buffer.from(
      JSON.stringify(mergedData, null, 2),
      "utf-8"
    );
    compiler.mapShadow(dataPath, dataJsonContent);

    const pdfBuffer = compiler.pdf({
      mainFilePath: templatePath,
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${templateName}_${timestamp}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF from template:", error);
    res.status(500).json({ error: "Failed to generate PDF from template" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
