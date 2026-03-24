import { z } from "zod";

const MAX_ENCRYPTED_SIZE = 50_000; // ~50KB

export const createSecretSchema = z.object({
  encryptedData: z
    .string()
    .min(1, "暗号化データは必須です")
    .max(MAX_ENCRYPTED_SIZE, "データサイズが大きすぎます"),
  hasPassword: z.boolean().default(false),
  salt: z.string().optional(),
  ttl: z.enum(["1h", "24h", "7d"]).default("24h"),
});

export type CreateSecretInput = z.infer<typeof createSecretSchema>;
