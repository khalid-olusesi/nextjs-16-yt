import z from "zod";

export const signUpSchema = z.object({
  name: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8).max(30),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(30),
});
// here conatins the inof we expect from the user, which includes name email and password, the stringb identifies it as a string, and the min and max indicates the minimum and maximum number of charcaters to be inputed
