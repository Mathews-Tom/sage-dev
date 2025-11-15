import { z } from 'zod';

export const FileTypeSchema = z.enum(['python', 'typescript', 'javascript', 'unknown']);

export const FeatureSchema = z.enum([
  'auth',
  'api',
  'ui',
  'data',
  'testing',
  'infrastructure',
  'unknown',
]);

export const DomainSchema = z.enum([
  'frontend',
  'backend',
  'infra',
  'shared',
  'unknown',
]);

export const TaskContextSchema = z.object({
  fileType: FileTypeSchema,
  feature: FeatureSchema,
  domain: DomainSchema,
  filePath: z.string(),
  patterns: z.array(z.string()),
});

export type FileType = z.infer<typeof FileTypeSchema>;
export type Feature = z.infer<typeof FeatureSchema>;
export type Domain = z.infer<typeof DomainSchema>;
export type TaskContext = z.infer<typeof TaskContextSchema>;
