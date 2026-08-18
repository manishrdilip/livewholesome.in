import { z } from "zod";
import { INDIAN_STATES } from "@/lib/indian-states";
import { normalizePhone, PHONE_REGEX } from "@/lib/phone";

const phoneSchema = z
  .string()
  .trim()
  .transform(normalizePhone)
  .refine((v) => PHONE_REGEX.test(v), "Enter a valid phone number with country code, e.g. +91 98765 43210");

const optionalPhoneSchema = z
  .string()
  .trim()
  .transform(normalizePhone)
  .refine((v) => v === "" || PHONE_REGEX.test(v), "Enter a valid WhatsApp number with country code");

export const checkoutSchema = z.object({
  name: z.string().trim().min(1, "Full name is required").max(200),
  phone: phoneSchema,
  whatsappSameAsPhone: z.boolean(),
  whatsappNumber: optionalPhoneSchema,
  email: z.string().trim().email("Enter a valid email address"),
  pincode: z.string().trim().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  line1: z.string().trim().min(1, "House/street is required").max(300),
  line2: z.string().trim().max(300).optional().or(z.literal("")),
  landmark: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.enum(INDIAN_STATES),
  customerNote: z.string().trim().max(1000).optional().or(z.literal("")),
  quantity: z.number().int().min(1).max(20),
  isSubscription: z.boolean().optional(),
  consent: z.literal(true, "You must agree to receive order updates on WhatsApp and email"),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  // Honeypot — real users never fill this in.
  companyWebsite: z.string().max(0).optional().or(z.literal("")),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const trackOrderSchema = z.object({
  orderNumber: z.string().trim().min(1, "Order number is required").max(30),
  phone: phoneSchema,
});
export type TrackOrderInput = z.infer<typeof trackOrderSchema>;

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Full name is required").max(200),
  phone: phoneSchema,
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const savedAddressSchema = z.object({
  label: z.string().trim().max(50).optional().or(z.literal("")),
  pincode: z.string().trim().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  line1: z.string().trim().min(1, "House/street is required").max(300),
  line2: z.string().trim().max(300).optional().or(z.literal("")),
  landmark: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.enum(INDIAN_STATES),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});
export type SavedAddressInput = z.infer<typeof savedAddressSchema>;

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().max(2000).optional().or(z.literal("")),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

export const earlyTesterReviewSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  contact: z.string().trim().min(5, "Enter a phone number or email").max(200),
  fullness: z.coerce.number().int().min(0).max(100),
  body: z.string().trim().min(1, "Please share a few words").max(2000),
  // Honeypot — real users never fill this in.
  companyWebsite: z.string().max(0).optional().or(z.literal("")),
});
export type EarlyTesterReviewInput = z.infer<typeof earlyTesterReviewSchema>;
