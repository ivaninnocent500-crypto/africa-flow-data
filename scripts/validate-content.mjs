import fs from "node:fs";
import path from "node:path";
// Change: Import the 2020 version of Ajv directly
import Ajv from "ajv/dist/2020.js"; 
import addFormats from "ajv-formats";

// The initialization remains the same
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const root = process.cwd();

const schemaMap = {
  accommodations: "schemas/accommodation.schema.json",
  itineraries: "schemas/itinerary.schema.json"
};

function getJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.join(dir, f));
}

let hasErrors = false;

for (const [folder, schemaPath] of Object.entries(schemaMap)) {
  const absSchemaPath = path.join(root, schemaPath);
  const schema = JSON.parse(fs.readFileSync(absSchemaPath, "utf8"));
  
  // Now ajv.compile will recognize "https://json-schema.org/draft/2020-12/schema"
  const validate = ajv.compile(schema);
  const files = getJsonFiles(path.join(root, "content", folder));

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    const valid = validate(data);

    if (!valid) {
      hasErrors = true;
      console.error(`\nValidation failed: ${file}`);
      console.error(validate.errors);
    } else {
      console.log(`Valid: ${file}`);
    }
  }
}

if (hasErrors) process.exit(1);
console.log("All content files passed validation.");
