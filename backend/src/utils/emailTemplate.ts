import handlebars from "handlebars";
import fs from "fs";
import path from "path";

const TEMPLATES_DIR = path.join(__dirname, "../templates/emails");

const templateCache: Record<string, HandlebarsTemplateDelegate> = {};

const loadTemplate = (templateName: string): HandlebarsTemplateDelegate => {
  if (templateCache[templateName]) {
    return templateCache[templateName];
  }
  const templatePath = path.join(TEMPLATES_DIR, `${templateName}.hbs`);
  
  // Tambahkan log debugging untuk Vercel
  if (!fs.existsSync(templatePath)) {
    console.error("❌ TEMPLATE NOT FOUND AT:", templatePath);
  }

  const templateContent = fs.readFileSync(templatePath, "utf-8");
  templateCache[templateName] = handlebars.compile(templateContent);
  return templateCache[templateName];
};

export const renderTemplate = (
  templateName: string,
  data: Record<string, any>
): string => {
  const template = loadTemplate(templateName);
  return template(data);
};