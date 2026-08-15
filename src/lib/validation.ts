import { z } from "zod";
import { INDIAN_STATES } from "@/lib/indian-states";

export const checkoutSchema = z.object({
  name: z.string().trim().min(1, "Full name is required").max(200),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  whatsappSameAsPhone: z.boolean(),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit WhatsApp number")
    .optional()
    .or(z.literal("")),
  email: z.string().trim().email("Enter a valid email address"),
  pincode: z.string().trim().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  line1: z.string().trim().min(1, "House/street is required").max(300),
  line2: z.string().trim().max(300).optional().or(z.literal("")),
  landmark: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.enum(INDIAN_STATES),
  customerNote: z.string().trim().max(1000).optional().or(z.literal("")),
  quantity: z.number().int().min(1).max(20),
  consent: z.literal(true, "You must agree to receive order updates on WhatsApp and email"),
  // Honeypot — real users never fill this in.
  companyWebsite: z.string().max(0).optional().or(z.literal("")),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
